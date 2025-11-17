"""
Regulatory Citations and Reference Management
Provides actual FDA/FTC links with section anchors for compliance claims
"""

import re
from typing import List, Dict, Any

# Real FDA/FTC regulatory references with DIRECT links to specific guidance documents
REGULATORY_REFERENCES = {
    "fda_medical_device_promotion": {
        "title": "Medical Device Advertising and Promotion - FDA",
        "url": "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/medical-device-promotion-advertising",
        "short_citation": "FDA Medical Device Promotion",
        "section_id": "medical-device-promotion-advertising",
        "section_detail": "Overview section"
    },
    "fda_misbranding_guidance": {
        "title": "FDA Guidance on Medical Device Misbranding",
        "url": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-and-fda-staff-medical-device-label-requirements",
        "short_citation": "FDA Misbranding Guidance",
        "section_id": "label-requirements",
        "section_detail": "Section IV: Labeling Requirements"
    },
    "fda_intended_use_guidance": {
        "title": "FDA Guidance on Intended Use in Device Labeling",
        "url": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/how-study-and-market-your-medical-device",
        "short_citation": "FDA Intended Use Guidance",
        "section_id": "intended-use",
        "section_detail": "Section on Indications for Use"
    },
    "ftc_health_claims": {
        "title": "FTC Health Products Compliance Guidance",
        "url": "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance",
        "short_citation": "FTC Health Products Compliance",
        "section_id": "health-products-compliance",
        "section_detail": "Full guidance document"
    },
    "ftc_advertising_substantiation": {
        "title": "FTC Policy Statement on Advertising Substantiation",
        "url": "https://www.ftc.gov/legal-library/browse/federal-register-notices/advertising-substantiation-policy-statement",
        "short_citation": "FTC Substantiation Policy",
        "section_id": "substantiation-policy",
        "section_detail": "Policy Statement"
    },
    "ftc_substantiation_guide": {
        "title": "Advertising Substantiation: What Advertisers Should Know",
        "url": "https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business",
        "short_citation": "FTC Substantiation Guide",
        "section_id": "advertising-faqs",
        "section_detail": "Section on Substantiation"
    },
    "fda_labeling_requirements": {
        "title": "FDA Device Labeling Guidance",
        "url": "https://www.fda.gov/medical-devices/overview-device-regulation/device-labeling",
        "short_citation": "FDA Labeling Requirements",
        "section_id": "device-labeling",
        "section_detail": "Labeling Requirements Overview"
    },
    "fda_label_requirements_detailed": {
        "title": "Medical Device Labeling Regulations (21 CFR Part 801)",
        "url": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?CFRPart=801",
        "short_citation": "21 CFR Part 801",
        "section_id": "cfr-part-801",
        "section_detail": "Federal Regulations"
    },
    "fda_510k_premarket": {
        "title": "FDA Premarket Notification 510(k) Guidance",
        "url": "https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/premarket-notification-510k",
        "short_citation": "FDA 510(k) Guidance",
        "section_id": "510k-guidance",
        "section_detail": "510(k) Overview"
    },
    "ftc_deceptive_advertising": {
        "title": "FTC Policy Statement on Deception (Appended to Cliffdale Associates)",
        "url": "https://www.ftc.gov/legal-library/browse/ftc-policy-statement-deception",
        "short_citation": "FTC Deception Policy Statement",
        "section_id": "deception-policy",
        "section_detail": "Policy Statement (1983)"
    },
    "ftc_endorsement_guides": {
        "title": "FTC Endorsement Guides (16 CFR Part 255)",
        "url": "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255",
        "short_citation": "FTC Endorsement Guides",
        "section_id": "cfr-part-255",
        "section_detail": "16 CFR Part 255"
    },
    "fda_clinical_trials": {
        "title": "Clinical Trials and Medical Devices - FDA",
        "url": "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/clinical-trials-medical-devices",
        "short_citation": "FDA Clinical Trials Guidance",
        "section_id": "clinical-trials",
        "section_detail": "Clinical Trials Overview"
    },
    "fda_promotional_materials": {
        "title": "Promotional Materials Submitted to FDA (Draft Guidance)",
        "url": "https://www.fda.gov/media/72379/download",
        "short_citation": "FDA Promotional Materials Guidance",
        "section_id": "promotional-materials",
        "section_detail": "Draft Guidance Document (PDF)"
    },
    "ftc_faqs_advertisers": {
        "title": "Advertising FAQs: A Guide for Small Business",
        "url": "https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business",
        "short_citation": "FTC Advertising FAQs",
        "section_id": "advertising-faqs",
        "section_detail": "Complete FAQ Guide"
    }
}

# Issue-specific citations mapping - maps to SPECIFIC guidance documents
ISSUE_CITATIONS = {
    "unsubstantiated_superlatives": [
        "ftc_health_claims",
        "ftc_advertising_substantiation",
        "ftc_substantiation_guide"
    ],
    "overpromising_outcomes": [
        "ftc_deceptive_advertising",
        "fda_medical_device_promotion",
        "fda_misbranding_guidance"
    ],
    "missing_disclaimers": [
        "fda_labeling_requirements",
        "fda_label_requirements_detailed",
        "fda_medical_device_promotion"
    ],
    "vague_testimonial": [
        "ftc_endorsement_guides",
        "ftc_health_claims",
        "ftc_advertising_substantiation"
    ],
    "incomplete_disclosure": [
        "fda_labeling_requirements",
        "fda_intended_use_guidance",
        "fda_misbranding_guidance"
    ],
    "missing_safety_information": [
        "fda_labeling_requirements",
        "fda_label_requirements_detailed",
        "fda_510k_premarket"
    ],
    "false_comparison": [
        "ftc_advertising_substantiation",
        "ftc_deceptive_advertising",
        "ftc_substantiation_guide"
    ],
    "misleading_imagery": [
        "fda_promotional_materials",
        "fda_medical_device_promotion",
        "ftc_deceptive_advertising"
    ],
    "off_label_promotion": [
        "fda_intended_use_guidance",
        "fda_medical_device_promotion",
        "fda_misbranding_guidance"
    ]
}

# Approved claim citations
APPROVED_CLAIM_CITATIONS = {
    "clareon_panoptix": [
        {
            "title": "FDA 510(k) Clearance - Clareon PanOptix",
            "url": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm",
            "short_citation": "FDA 510(k) Database",
            "note": "Search device name for specific clearance details"
        },
        {
            "title": "Clinical Study Data - Trifocal IOLs",
            "url": "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/clinical-trials-medical-devices",
            "short_citation": "FDA Clinical Trials Database"
        }
    ],
    "total_30": [
        {
            "title": "FDA 510(k) Clearance - Contact Lenses",
            "url": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm",
            "short_citation": "FDA 510(k) Database",
            "note": "Search device name for specific clearance details"
        }
    ]
}

def get_citation_for_issue(issue_type: str) -> List[Dict[str, str]]:
    """
    Get regulatory citations for a specific compliance issue
    
    Args:
        issue_type: Type of compliance issue (e.g., 'unsubstantiated_superlatives')
        
    Returns:
        List of citation dictionaries with title, url, and short_citation
    """
    citation_keys = ISSUE_CITATIONS.get(issue_type, ["fda_medical_device_promotion"])
    citations = []
    
    for key in citation_keys:
        if key in REGULATORY_REFERENCES:
            ref = REGULATORY_REFERENCES[key]
            citations.append({
                "title": ref["title"],
                "url": ref["url"],
                "short_citation": ref["short_citation"],
                "number": len(citations) + 1
            })
    
    return citations

def get_citation_for_approved_claim(product_name: str) -> List[Dict[str, str]]:
    """
    Get regulatory citations for approved claims
    
    Args:
        product_name: Product name (e.g., 'Clareon PanOptix')
        
    Returns:
        List of citation dictionaries
    """
    # Normalize product name
    normalized = product_name.lower().replace(" ", "_").replace("®", "")
    
    if "panoptix" in normalized or "clareon" in normalized:
        return APPROVED_CLAIM_CITATIONS.get("clareon_panoptix", [])
    elif "total" in normalized and "30" in normalized:
        return APPROVED_CLAIM_CITATIONS.get("total_30", [])
    
    # Default fallback
    return [{
        "title": "FDA Medical Device Database",
        "url": "https://www.fda.gov/medical-devices",
        "short_citation": "FDA Medical Devices"
    }]

def format_citation_for_agent(citations: List[Dict[str, str]]) -> str:
    """
    Format citations for inclusion in agent response
    
    Args:
        citations: List of citation dictionaries
        
    Returns:
        Formatted citation string
    """
    if not citations:
        return ""
    
    formatted = []
    for i, citation in enumerate(citations, 1):
        formatted.append(f"[{i}] {citation['short_citation']} 🔗: {citation['url']}")
    
    return "\n".join(formatted)

def extract_citations_from_text(text: str) -> List[str]:
    """
    Extract citation numbers from text (e.g., [1], [2])
    
    Args:
        text: Text containing citation references
        
    Returns:
        List of citation numbers found
    """
    pattern = r'\[(\d+)\]'
    matches = re.findall(pattern, text)
    return matches

def add_citations_to_response(response: str, citations: Dict[int, Dict[str, str]]) -> Dict[str, Any]:
    """
    Add citations metadata to response for frontend rendering
    
    Args:
        response: Agent response text
        citations: Dictionary mapping citation numbers to citation info
        
    Returns:
        Dictionary with response and citations
    """
    return {
        "text": response,
        "citations": citations,
        "has_citations": len(citations) > 0
    }

# Pre-built citation sets for common scenarios
COMMON_CITATION_SETS = {
    "general_compliance": [
        REGULATORY_REFERENCES["fda_medical_device_promotion"],
        REGULATORY_REFERENCES["ftc_health_claims"]
    ],
    "advertising_claims": [
        REGULATORY_REFERENCES["ftc_advertising_substantiation"],
        REGULATORY_REFERENCES["ftc_deceptive_advertising"],
        REGULATORY_REFERENCES["fda_medical_device_promotion"]
    ],
    "product_labeling": [
        REGULATORY_REFERENCES["fda_labeling_requirements"],
        REGULATORY_REFERENCES["fda_label_requirements_detailed"]
    ],
    "clinical_claims": [
        REGULATORY_REFERENCES["fda_clinical_trials"],
        REGULATORY_REFERENCES["fda_510k_premarket"]
    ]
}

def get_citation_set(category: str) -> List[Dict[str, str]]:
    """
    Get a pre-built set of citations for a category
    
    Args:
        category: Citation category (e.g., 'general_compliance')
        
    Returns:
        List of citation dictionaries
    """
    citations = COMMON_CITATION_SETS.get(category, [])
    return [
        {
            "title": cit["title"],
            "url": cit["url"],
            "short_citation": cit["short_citation"],
            "number": i + 1
        }
        for i, cit in enumerate(citations)
    ]

