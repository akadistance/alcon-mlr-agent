import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Download, Copy } from 'lucide-react';
import './ComprehensiveReview.css';

const ComprehensiveReview = ({ analysisData, material_text }) => {
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!analysisData) {
    return <div className="comprehensive-review">No analysis data available</div>;
  }

  const {
    compliant_count = 0,
    critical_issues_count = 0,
    warning_count = 0,
    audience_type = 'unknown',
    audience_confidence = 0,
    product_detected = '',
    issues = [],
    compliant_claims = []
  } = analysisData;

  // Determine compliance status
  const getComplianceStatus = () => {
    if (critical_issues_count === 0 && warning_count === 0) {
      return { status: '✅ APPROVED', color: 'approved', icon: CheckCircle };
    } else if (critical_issues_count === 0) {
      return { status: '⚠️ APPROVED WITH REVISIONS', color: 'warning', icon: AlertTriangle };
    } else {
      return { status: '❌ REQUIRES REVISION', color: 'critical', icon: AlertTriangle };
    }
  };

  const complianceStatus = getComplianceStatus();
  const StatusIcon = complianceStatus.icon;

  // Group issues by category
  const groupedIssues = issues.reduce((acc, issue) => {
    const category = issue.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(issue);
    return acc;
  }, {});

  const handleCopyAnalysis = () => {
    const analysisText = `
MLR COMPLIANCE REVIEW SUMMARY
============================

Status: ${complianceStatus.status}
Product: ${product_detected || 'Not detected'}
Audience: ${audience_type} (${(audience_confidence * 100).toFixed(0)}% confidence)

FINDINGS:
- Approved Claims: ${compliant_count}
- Critical Issues: ${critical_issues_count}
- Warnings: ${warning_count}

${Object.entries(groupedIssues).map(([category, categoryIssues]) => `
${category}:
${categoryIssues.map(issue => `
  • ${issue.issue_type}
    Location: ${issue.location}
    Issue: ${issue.description}
    Fix: ${issue.suggestion}
`).join('')}
`).join('')}
    `;
    
    navigator.clipboard.writeText(analysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      complianceStatus: complianceStatus.status,
      product: product_detected,
      audience: audience_type,
      audienceConfidence: audience_confidence,
      summary: {
        approved_claims: compliant_count,
        critical_issues: critical_issues_count,
        warnings: warning_count
      },
      issues: issues,
      compliant_claims: compliant_claims,
      material_length: material_text?.length || 0
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute('download', `MLR-Review-${new Date().toISOString().slice(0, 10)}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="comprehensive-review">
      {/* Header with Status */}
      <div className={`review-header ${complianceStatus.color}`}>
        <div className="status-section">
          <StatusIcon size={32} className="status-icon" />
          <div className="status-text">
            <h2>{complianceStatus.status}</h2>
            {product_detected && (
              <p className="product-info">Product: {product_detected}</p>
            )}
            {audience_type !== 'unknown' && (
              <p className="audience-info">
                Audience: <strong>{audience_type.charAt(0).toUpperCase() + audience_type.slice(1)}</strong> ({(audience_confidence * 100).toFixed(0)}% confidence)
              </p>
            )}
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="copy-btn" 
            onClick={handleCopyAnalysis}
            title="Copy analysis to clipboard"
          >
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button 
            className="download-btn" 
            onClick={handleDownloadReport}
            title="Download as JSON"
          >
            <Download size={18} />
            Download
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-box approved">
          <div className="stat-value">{compliant_count}</div>
          <div className="stat-label">Approved Claims</div>
        </div>
        <div className="stat-box critical">
          <div className="stat-value">{critical_issues_count}</div>
          <div className="stat-label">Critical Issues</div>
        </div>
        <div className="stat-box warning">
          <div className="stat-value">{warning_count}</div>
          <div className="stat-label">Warnings</div>
        </div>
        <div className="stat-box total">
          <div className="stat-value">{issues.length}</div>
          <div className="stat-label">Total Issues</div>
        </div>
      </div>

      {/* Issues by Category */}
      <div className="issues-section">
        <h3 className="section-title">📋 Compliance Issues by Category</h3>
        
        {Object.keys(groupedIssues).length > 0 ? (
          <div className="issues-container">
            {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
              <div key={category} className="category-section">
                <h4 className="category-title">
                  {category}
                  <span className="issue-count">{categoryIssues.length}</span>
                </h4>
                
                <div className="issues-table-wrapper">
                  <table className="issues-table">
                    <thead>
                      <tr>
                        <th>Issue Type</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th>Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryIssues.map((issue, idx) => (
                        <tr 
                          key={idx}
                          className={`severity-${issue.severity}`}
                          onClick={() => setExpandedIssue(expandedIssue === `${category}-${idx}` ? null : `${category}-${idx}`)}
                        >
                          <td className="issue-type">{issue.issue_type.replace(/_/g, ' ').toUpperCase()}</td>
                          <td className="location">{issue.location}</td>
                          <td className="description">
                            <span className="snippet">{issue.description.substring(0, 60)}</span>
                            {issue.description.length > 60 && '...'}
                          </td>
                          <td className="severity">
                            <span className={`badge badge-${issue.severity}`}>
                              {issue.severity.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Expanded Details */}
                {expandedIssue && expandedIssue.startsWith(category) && (
                  <div className="expanded-details">
                    {(() => {
                      const idxStr = expandedIssue.split('-')[1];
                      const idx = parseInt(idxStr);
                      const issue = categoryIssues[idx];
                      return (
                        <div className="detail-box">
                          <div className="detail-section">
                            <h5>Problem</h5>
                            <p>{issue.description}</p>
                          </div>
                          
                          <div className="detail-section">
                            <h5>Text Snippet</h5>
                            <div className="snippet-box">"{issue.snippet}"</div>
                          </div>

                          <div className="detail-section">
                            <h5>💡 Suggestion</h5>
                            <p className="suggestion">{issue.suggestion}</p>
                          </div>

                          {issue.reference && (
                            <div className="detail-section">
                              <h5>Reference</h5>
                              <a href={issue.reference} target="_blank" rel="noopener noreferrer" className="reference-link">
                                View FDA/FTC Guidance →
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-issues">
            <CheckCircle size={48} />
            <p>No compliance issues detected! ✅</p>
          </div>
        )}
      </div>

      {/* Compliant Claims */}
      {compliant_claims && compliant_claims.length > 0 && (
        <div className="compliant-section">
          <h3 className="section-title">✅ Approved Claims</h3>
          <div className="claims-list">
            {compliant_claims.map((claim, idx) => (
              <div key={idx} className="claim-item">
                <CheckCircle size={16} className="claim-icon" />
                <p>{claim}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3 className="section-title">🎯 Next Steps</h3>
        <ul className="recommendations-list">
          {critical_issues_count > 0 && (
            <li><strong>Priority:</strong> Fix {critical_issues_count} critical issue(s) before proceeding</li>
          )}
          {warning_count > 0 && (
            <li><strong>Review:</strong> Address {warning_count} warning(s) for improved compliance</li>
          )}
          {audience_type === 'unknown' && (
            <li><strong>Clarity:</strong> Clarify target audience (patient or professional)</li>
          )}
          {critical_issues_count === 0 && warning_count === 0 && (
            <li><strong>Status:</strong> Material is compliant. Submit for formal MLR review.</li>
          )}
          <li><strong>Action:</strong> Use suggestions above to update your material</li>
          <li><strong>Verification:</strong> Re-analyze after making changes to confirm compliance</li>
        </ul>
      </div>
    </div>
  );
};

export default ComprehensiveReview;
