"""
Document Comparison Module
Enables side-by-side comparison of marketing materials for compliance analysis
"""

import json
from typing import Dict, List, Any
from difflib import SequenceMatcher, unified_diff
import re

def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculate similarity ratio between two texts
    
    Args:
        text1: First text
        text2: Second text
        
    Returns:
        Similarity ratio (0.0 to 1.0)
    """
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

def identify_text_differences(text1: str, text2: str) -> List[Dict[str, Any]]:
    """
    Identify specific differences between two texts
    
    Args:
        text1: Original text
        text2: Modified text
        
    Returns:
        List of differences with line numbers and change types
    """
    lines1 = text1.splitlines()
    lines2 = text2.splitlines()
    
    diff = list(unified_diff(lines1, lines2, lineterm=''))
    
    differences = []
    line_num = 0
    
    for line in diff:
        if line.startswith('---') or line.startswith('+++') or line.startswith('@@'):
            continue
        
        if line.startswith('-'):
            differences.append({
                "type": "removed",
                "line": line_num,
                "content": line[1:].strip(),
                "change_type": "deletion"
            })
        elif line.startswith('+'):
            differences.append({
                "type": "added",
                "line": line_num,
                "content": line[1:].strip(),
                "change_type": "addition"
            })
        
        line_num += 1
    
    return differences

def extract_claims_from_text(text: str) -> List[str]:
    """
    Extract potential marketing claims from text
    
    Args:
        text: Marketing text
        
    Returns:
        List of extracted claims
    """
    # Split by periods and filter out short sentences
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
    
    # Filter for sentences that look like claims (contain product-related keywords)
    claim_keywords = ['lens', 'iol', 'vision', 'clarity', 'comfort', 'provides', 'delivers', 'offers', 'improves']
    
    claims = []
    for sentence in sentences:
        if any(keyword in sentence.lower() for keyword in claim_keywords):
            claims.append(sentence)
    
    return claims

def compare_claims(claims1: List[str], claims2: List[str]) -> Dict[str, List[str]]:
    """
    Compare claims between two documents
    
    Args:
        claims1: Claims from document 1
        claims2: Claims from document 2
        
    Returns:
        Dictionary with common, unique_to_doc1, and unique_to_doc2 claims
    """
    # Normalize claims for comparison
    normalized1 = [c.lower().strip() for c in claims1]
    normalized2 = [c.lower().strip() for c in claims2]
    
    common = []
    unique_to_doc1 = []
    unique_to_doc2 = list(claims2)
    
    for i, claim1 in enumerate(claims1):
        found_match = False
        for j, claim2 in enumerate(claims2):
            similarity = calculate_text_similarity(claim1, claim2)
            if similarity > 0.85:  # 85% similarity threshold
                common.append({
                    "doc1": claim1,
                    "doc2": claim2,
                    "similarity": round(similarity * 100, 1)
                })
                if claim2 in unique_to_doc2:
                    unique_to_doc2.remove(claim2)
                found_match = True
                break
        
        if not found_match:
            unique_to_doc1.append(claim1)
    
    return {
        "common": common,
        "unique_to_doc1": unique_to_doc1,
        "unique_to_doc2": unique_to_doc2
    }

def analyze_compliance_differences(
    analysis1: Dict[str, Any],
    analysis2: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compare compliance analysis results between two documents
    
    Args:
        analysis1: Compliance analysis for document 1
        analysis2: Compliance analysis for document 2
        
    Returns:
        Comparison report highlighting compliance differences
    """
    comparison = {
        "overall_comparison": {
            "doc1_issues_count": len(analysis1.get('issues', [])),
            "doc2_issues_count": len(analysis2.get('issues', [])),
            "doc1_approved_claims": len([c for c in analysis1.get('approved_claims', []) if c != "No approved claims found."]),
            "doc2_approved_claims": len([c for c in analysis2.get('approved_claims', []) if c != "No approved claims found."])
        },
        "issue_comparison": {
            "common_issues": [],
            "doc1_only_issues": [],
            "doc2_only_issues": [],
            "improved_areas": [],
            "regressed_areas": []
        },
        "claim_comparison": {
            "common_approved": [],
            "doc1_only": [],
            "doc2_only": []
        }
    }
    
    # Compare issues
    issues1_types = [issue.get('issue', '') for issue in analysis1.get('issues', [])]
    issues2_types = [issue.get('issue', '') for issue in analysis2.get('issues', [])]
    
    for issue_type in set(issues1_types + issues2_types):
        if issue_type in issues1_types and issue_type in issues2_types:
            comparison["issue_comparison"]["common_issues"].append(issue_type)
        elif issue_type in issues1_types:
            comparison["issue_comparison"]["improved_areas"].append(issue_type)
        elif issue_type in issues2_types:
            comparison["issue_comparison"]["regressed_areas"].append(issue_type)
    
    # Compare approved claims
    claims1 = set(analysis1.get('approved_claims', []))
    claims2 = set(analysis2.get('approved_claims', []))
    
    comparison["claim_comparison"]["common_approved"] = list(claims1 & claims2)
    comparison["claim_comparison"]["doc1_only"] = list(claims1 - claims2)
    comparison["claim_comparison"]["doc2_only"] = list(claims2 - claims1)
    
    # Determine overall assessment
    if len(issues2_types) < len(issues1_types):
        comparison["overall_assessment"] = "Document 2 shows improvement in compliance"
    elif len(issues2_types) > len(issues1_types):
        comparison["overall_assessment"] = "Document 1 is more compliant"
    else:
        comparison["overall_assessment"] = "Both documents have similar compliance levels"
    
    return comparison

def format_comparison_report(
    doc1_name: str,
    doc2_name: str,
    text_similarity: float,
    claim_comparison: Dict[str, Any],
    compliance_comparison: Dict[str, Any]
) -> str:
    """
    Format a comprehensive comparison report
    
    Args:
        doc1_name: Name of document 1
        doc2_name: Name of document 2
        text_similarity: Overall text similarity score
        claim_comparison: Results from compare_claims()
        compliance_comparison: Results from analyze_compliance_differences()
        
    Returns:
        Formatted markdown report
    """
    report = []
    
    report.append(f"## Document Comparison: {doc1_name} vs {doc2_name}")
    report.append("")
    
    report.append(f"### Overall Similarity: {round(text_similarity * 100, 1)}%")
    report.append("")
    
    # Compliance comparison
    report.append("### Compliance Overview")
    report.append(f"- **{doc1_name}**: {compliance_comparison['overall_comparison']['doc1_issues_count']} issues, {compliance_comparison['overall_comparison']['doc1_approved_claims']} approved claims")
    report.append(f"- **{doc2_name}**: {compliance_comparison['overall_comparison']['doc2_issues_count']} issues, {compliance_comparison['overall_comparison']['doc2_approved_claims']} approved claims")
    report.append(f"- **Assessment**: {compliance_comparison['overall_assessment']}")
    report.append("")
    
    # Issue comparison
    if compliance_comparison['issue_comparison']['improved_areas']:
        report.append("### ✅ Issues Resolved in Document 2:")
        for issue in compliance_comparison['issue_comparison']['improved_areas']:
            report.append(f"- {issue.replace('_', ' ').title()}")
        report.append("")
    
    if compliance_comparison['issue_comparison']['regressed_areas']:
        report.append("### ⚠️ New Issues in Document 2:")
        for issue in compliance_comparison['issue_comparison']['regressed_areas']:
            report.append(f"- {issue.replace('_', ' ').title()}")
        report.append("")
    
    if compliance_comparison['issue_comparison']['common_issues']:
        report.append("### 🔄 Persistent Issues:")
        for issue in compliance_comparison['issue_comparison']['common_issues']:
            report.append(f"- {issue.replace('_', ' ').title()}")
        report.append("")
    
    # Claim comparison
    if claim_comparison['common']:
        report.append(f"### Common Claims ({len(claim_comparison['common'])}):")
        for idx, claim_pair in enumerate(claim_comparison['common'][:5], 1):  # Show top 5
            report.append(f"{idx}. {claim_pair['doc1']} (Similarity: {claim_pair['similarity']}%)")
        if len(claim_comparison['common']) > 5:
            report.append(f"... and {len(claim_comparison['common']) - 5} more")
        report.append("")
    
    if claim_comparison['unique_to_doc1']:
        report.append(f"### Unique to {doc1_name}:")
        for claim in claim_comparison['unique_to_doc1'][:3]:  # Show top 3
            report.append(f"- {claim}")
        if len(claim_comparison['unique_to_doc1']) > 3:
            report.append(f"... and {len(claim_comparison['unique_to_doc1']) - 3} more")
        report.append("")
    
    if claim_comparison['unique_to_doc2']:
        report.append(f"### Unique to {doc2_name}:")
        for claim in claim_comparison['unique_to_doc2'][:3]:  # Show top 3
            report.append(f"- {claim}")
        if len(claim_comparison['unique_to_doc2']) > 3:
            report.append(f"... and {len(claim_comparison['unique_to_doc2']) - 3} more")
        report.append("")
    
    # Recommendations
    report.append("### Recommendations:")
    if compliance_comparison['issue_comparison']['improved_areas']:
        report.append(f"- Document 2 successfully addresses {len(compliance_comparison['issue_comparison']['improved_areas'])} compliance issues from Document 1")
    if compliance_comparison['issue_comparison']['regressed_areas']:
        report.append(f"- Review and address {len(compliance_comparison['issue_comparison']['regressed_areas'])} new compliance issues in Document 2")
    if not compliance_comparison['issue_comparison']['improved_areas'] and not compliance_comparison['issue_comparison']['regressed_areas']:
        report.append("- Both documents have similar compliance profiles; continue monitoring")
    
    return "\n".join(report)

