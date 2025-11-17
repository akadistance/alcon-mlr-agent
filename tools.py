from langchain_core.tools import StructuredTool
from pydantic import BaseModel
import re
from docx import Document
from approved_claims import PRODUCTS, FDA_FTC_GUIDELINES
from comprehensive_analyzer import run_comprehensive_analysis

class ComplianceAnalysisArgs(BaseModel):
    text: str
    product: str

class ComprehensiveAnalysisArgs(BaseModel):
    material_text: str
    product_name: str = None

class SaveFeedbackArgs(BaseModel):
    feedback: str
    filename: str

def read_docx(file_path: str) -> str:
    """Reads text from a Word document."""
    try:
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        return text
    except Exception as e:
        return f"Error reading Word document: {str(e)}"

def analyze_compliance(text: str, product: str) -> dict:
    """Analyzes promotional text for compliance with approved claims and FDA/FTC guidelines."""
    if product not in PRODUCTS:
        return {"error": f"Unknown product: {product}"}
    
    approved_claims = PRODUCTS[product]["approved_claims"]
    issues = []
    approved = []
    disclaimer_present = any("consult" in text.lower() or "results may vary" in text.lower() for _ in text.split())

    # Check for approved claims
    for claim in approved_claims:
        if claim.lower() in text.lower():
            approved.append(claim)
    
    # Check for guideline violations
    for issue_type, details in FDA_FTC_GUIDELINES.items():
        if issue_type == "missing_disclaimers" and not disclaimer_present:
            issues.append({
                "issue": issue_type,
                "description": details["description"],
                "suggestion": details["suggestion"],
                "reference": details["reference"]
            })
        elif details["patterns"]:  # Only check patterns for issues with defined regex
            for pattern in details["patterns"]:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    issues.append({
                        "issue": issue_type,
                        "description": f"{details['description']} Found: {', '.join(matches)}",
                        "suggestion": details["suggestion"],
                        "reference": details["reference"]
                    })

    return {
        "summary": f"Analysis of promotional text for {product}.",
        "approved_claims": approved if approved else ["No approved claims found."],
        "issues": issues if issues else [],
        "disclaimer_present": disclaimer_present,
        "tools_used": ["compliance_analysis"]
    }

compliance_tool = StructuredTool.from_function(
    func=analyze_compliance,
    name="compliance_analysis",
    description="Analyzes promotional text for compliance with approved claims and FDA/FTC guidelines for a specified product.",
    args_schema=ComplianceAnalysisArgs
)

def save_to_txt(feedback: str, filename: str) -> str:
    """Saves feedback to a text file with a timestamp."""
    from datetime import datetime
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted_text = (
            f"--- Compliance Feedback ---\n"
            f"Timestamp: {timestamp}\n\n"
            f"{feedback}\n\n"
        )
        with open(filename, "w", encoding="utf-8") as f:
            f.write(formatted_text)
        return f"Feedback successfully saved to {filename}"
    except Exception as e:
        return f"Error writing to {filename}: {str(e)}"

save_tool = StructuredTool.from_function(
    func=save_to_txt,
    name="save_feedback_to_file",
    description="Saves compliance feedback to a text file. Requires 'feedback' (content) and 'filename' (file name).",
    args_schema=SaveFeedbackArgs
)

def comprehensive_compliance_analysis(material_text: str, product_name: str = None) -> dict:
    """
    Performs comprehensive MLR compliance analysis on promotional materials.
    Analyzes claims, disclaimers, regulatory language, consistency, tone, and audience.
    Returns structured results with table format and summary.
    """
    try:
        # Run comprehensive analysis
        analysis_result = run_comprehensive_analysis(material_text, product_name)
        
        return {
            "status": "success",
            "formatted_table": analysis_result["formatted_table"],
            "compliance_summary": analysis_result["compliance_summary"],
            "summary_report": analysis_result["summary_report"],
            "compliant_claims": analysis_result["compliant_claims"],
            "issues": analysis_result["issues"],
            "audience_type": analysis_result["audience_type"],
            "audience_confidence": analysis_result["audience_confidence"],
            "product_detected": analysis_result["product_detected"],
            "compliant_count": analysis_result["compliant_count"],
            "critical_issues_count": analysis_result["critical_issues_count"],
            "warning_count": analysis_result["warning_count"],
            "tools_used": ["comprehensive_compliance_analysis"]
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "tools_used": ["comprehensive_compliance_analysis"]
        }

comprehensive_tool = StructuredTool.from_function(
    func=comprehensive_compliance_analysis,
    name="comprehensive_compliance_analysis",
    description="Performs exhaustive MLR compliance analysis on promotional materials. Analyzes claims (validation, references), disclaimers (presence, placement), regulatory language (absolute statements, superlatives), consistency (product names, data), tone & audience (auto-detection, appropriateness). Returns structured table format with all issues and compliance summary.",
    args_schema=ComprehensiveAnalysisArgs
)