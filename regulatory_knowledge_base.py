"""
Regulatory Knowledge Base
Provides quick access to FDA/FTC guidelines, common scenarios, and best practices
"""

from typing import Dict, List, Any
import json

# Comprehensive FDA/FTC Knowledge Base
REGULATORY_KNOWLEDGE = {
    "medical_device_advertising": {
        "title": "Medical Device Advertising Guidelines",
        "summary": "FDA regulates medical device promotion to ensure claims are truthful, not misleading, and substantiated.",
        "key_points": [
            "All promotional claims must be supported by substantial evidence or adequate and well-controlled studies",
            "Device labeling and advertising must not be false or misleading",
            "Off-label promotion is prohibited",
            "Material facts must be disclosed when necessary to prevent misleading claims",
            "Comparative claims require head-to-head evidence"
        ],
        "citations": [
            {
                "title": "FDA Medical Device Promotion",
                "url": "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/medical-device-promotion-advertising"
            },
            {
                "title": "FDA Guidance on Advertising and Promotion",
                "url": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/medical-devices"
            }
        ],
        "common_violations": [
            "Unsubstantiated superiority claims",
            "Omission of risk information",
            "Overstating benefits",
            "Using outdated or selective data"
        ]
    },
    "health_claims_substantiation": {
        "title": "FTC Health Claims Substantiation",
        "summary": "FTC requires advertisers to have competent and reliable scientific evidence before making health claims.",
        "key_points": [
            "Claims must be supported before dissemination",
            "Evidence must be relevant to the specific claim made",
            "Testimonials must reflect typical consumer experience",
            "Material connections must be disclosed",
            "Disclaimers must be clear and conspicuous"
        ],
        "citations": [
            {
                "title": "FTC Health Products Compliance",
                "url": "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance"
            },
            {
                "title": "FTC Advertising Substantiation",
                "url": "https://www.ftc.gov/legal-library/browse/federal-register-notices/advertising-substantiation-policy-statement"
            }
        ],
        "common_violations": [
            "Making absolute claims without proper substantiation",
            "Using misleading testimonials",
            "Burying disclaimers in fine print",
            "Implying endorsement without disclosure"
        ]
    },
    "labeling_requirements": {
        "title": "Medical Device Labeling Requirements",
        "summary": "Device labels must include adequate directions for use and warnings about potential hazards.",
        "key_points": [
            "Labels must contain all information necessary for safe and effective use",
            "Intended use must be clearly stated",
            "Contraindications and warnings must be prominently displayed",
            "Instructions for use must be clear and comprehensive",
            "All claims must align with FDA-cleared indications"
        ],
        "citations": [
            {
                "title": "FDA Device Labeling",
                "url": "https://www.fda.gov/medical-devices/overview-device-regulation/device-labeling"
            }
        ],
        "common_violations": [
            "Missing warnings or precautions",
            "Inadequate instructions for use",
            "Claims exceeding cleared indications",
            "Failure to update labels with new safety information"
        ]
    },
    "deceptive_advertising": {
        "title": "FTC Deceptive Advertising Standards",
        "summary": "An advertisement is deceptive if it contains a misrepresentation or omission likely to mislead consumers acting reasonably.",
        "key_points": [
            "Representations must be truthful and non-misleading",
            "Material information cannot be omitted",
            "Net impression matters - overall message must not deceive",
            "Visual and audio elements are considered alongside text",
            "Silence can be deceptive if it omits material facts"
        ],
        "citations": [
            {
                "title": "FTC Deception Policy",
                "url": "https://www.ftc.gov/legal-library/browse/ftc-policy-statement-deception"
            }
        ],
        "common_violations": [
            "Cherry-picking data to support claims",
            "Using ambiguous language to create false impressions",
            "Hiding material limitations in fine print",
            "Making implied claims without support"
        ]
    }
}

# Common compliance scenarios with guidance
COMPLIANCE_SCENARIOS = {
    "superlative_claims": {
        "scenario": "Using words like 'best,' 'most effective,' or 'superior'",
        "issue": "Superlative claims require robust comparative evidence",
        "guidance": "Either remove superlatives or qualify them with specific, evidence-based descriptors",
        "example_problematic": "The best IOL for cataract surgery",
        "example_compliant": "A trifocal IOL designed to provide clear vision at multiple distances",
        "regulatory_basis": "FDA Medical Device Promotion, FTC Substantiation Requirements",
        "citations": ["medical_device_advertising", "health_claims_substantiation"]
    },
    "absolute_outcome_claims": {
        "scenario": "Promising guaranteed, perfect, or 100% results",
        "issue": "Absolute claims suggest no variability in outcomes, which is unrealistic for medical devices",
        "guidance": "Use conditional language and include disclaimers about individual variability",
        "example_problematic": "Guarantees perfect vision at all distances",
        "example_compliant": "May improve vision at near, intermediate, and distance ranges. Results may vary; consult your eye care professional",
        "regulatory_basis": "FDA Labeling Requirements, FTC Deception Standards",
        "citations": ["labeling_requirements", "deceptive_advertising"]
    },
    "missing_disclaimers": {
        "scenario": "Making benefit claims without limitations or warnings",
        "issue": "Material limitations must be disclosed to prevent misleading consumers",
        "guidance": "Add clear disclaimers about patient suitability, potential risks, and variability in results",
        "example_problematic": "Enjoy clear vision without glasses",
        "example_compliant": "May reduce dependence on glasses for many daily activities. Results vary; consult your doctor to determine if you're a suitable candidate",
        "regulatory_basis": "FDA Labeling Requirements",
        "citations": ["labeling_requirements"]
    },
    "testimonials_without_substantiation": {
        "scenario": "Using patient testimonials or endorsements",
        "issue": "Testimonials must reflect typical experience and cannot make unsubstantiated claims",
        "guidance": "Include disclaimers that results may vary and ensure claims are supported by data",
        "example_problematic": "\"This lens changed my life! I'll never need glasses again!\"",
        "example_compliant": "\"I'm very satisfied with my vision after surgery.\" *Individual results may vary. Not all patients achieve complete freedom from glasses.*",
        "regulatory_basis": "FTC Testimonial Guidelines",
        "citations": ["health_claims_substantiation"]
    },
    "off_label_promotion": {
        "scenario": "Promoting uses not included in FDA clearance",
        "issue": "Promoting off-label uses is prohibited without prior FDA clearance",
        "guidance": "Restrict all promotional claims to FDA-cleared indications only",
        "example_problematic": "Also effective for treating presbyopia in younger patients (if not cleared for this use)",
        "example_compliant": "Indicated for the treatment of presbyopia in adults following cataract surgery (if this is the cleared indication)",
        "regulatory_basis": "FDA Medical Device Promotion",
        "citations": ["medical_device_advertising"]
    }
}

# Best practices for compliance
COMPLIANCE_BEST_PRACTICES = {
    "claim_development": [
        "Base all claims on substantial clinical evidence",
        "Ensure claims match FDA-cleared indications",
        "Use specific, measurable language instead of superlatives",
        "Include appropriate disclaimers and limitations",
        "Have MLR review before publication"
    ],
    "visual_content": [
        "Ensure images accurately represent typical results",
        "Don't selectively show only best outcomes",
        "Include disclaimers with visual representations",
        "Avoid creating false impressions through image manipulation",
        "Label any simulated or enhanced images clearly"
    ],
    "comparative_claims": [
        "Use head-to-head clinical trial data when available",
        "Specify the comparator product clearly",
        "Disclose any limitations in the comparison",
        "Ensure apples-to-apples comparisons",
        "Consider using 'designed to' or 'intended to' language"
    ],
    "risk_communication": [
        "Provide fair balance between risks and benefits",
        "Use clear, understandable language",
        "Make risk information as prominent as benefit claims",
        "Update materials when new safety information emerges",
        "Direct consumers to complete prescribing information"
    ],
    "digital_marketing": [
        "Ensure disclosures are visible on all screen sizes",
        "Place disclaimers near related claims",
        "Don't hide important information behind click-throughs",
        "Apply same standards to social media posts",
        "Monitor user-generated content for compliance"
    ]
}

def search_knowledge_base(query: str) -> List[Dict[str, Any]]:
    """
    Search the regulatory knowledge base for relevant information
    
    Args:
        query: Search query (e.g., "superlative claims", "disclaimers")
        
    Returns:
        List of relevant knowledge base entries
    """
    query_lower = query.lower()
    results = []
    
    # Search regulatory knowledge
    for key, content in REGULATORY_KNOWLEDGE.items():
        if (query_lower in content['title'].lower() or 
            query_lower in content['summary'].lower() or
            any(query_lower in point.lower() for point in content['key_points'])):
            results.append({
                "type": "regulatory_guideline",
                "key": key,
                "content": content
            })
    
    # Search scenarios
    for key, content in COMPLIANCE_SCENARIOS.items():
        if (query_lower in content['scenario'].lower() or 
            query_lower in content['issue'].lower() or
            query_lower in content['guidance'].lower()):
            results.append({
                "type": "compliance_scenario",
                "key": key,
                "content": content
            })
    
    # Search best practices
    for category, practices in COMPLIANCE_BEST_PRACTICES.items():
        if query_lower in category.lower() or any(query_lower in practice.lower() for practice in practices):
            results.append({
                "type": "best_practice",
                "category": category,
                "practices": practices
            })
    
    return results

def get_scenario_guidance(scenario_type: str) -> Dict[str, Any]:
    """
    Get detailed guidance for a specific compliance scenario
    
    Args:
        scenario_type: Type of scenario (e.g., 'superlative_claims')
        
    Returns:
        Scenario guidance dictionary
    """
    return COMPLIANCE_SCENARIOS.get(scenario_type, {})

def get_regulatory_topic(topic: str) -> Dict[str, Any]:
    """
    Get detailed information about a regulatory topic
    
    Args:
        topic: Topic key (e.g., 'medical_device_advertising')
        
    Returns:
        Topic information dictionary
    """
    return REGULATORY_KNOWLEDGE.get(topic, {})

def format_knowledge_base_response(query: str, results: List[Dict[str, Any]]) -> str:
    """
    Format knowledge base search results into a readable response
    
    Args:
        query: Original search query
        results: Search results from search_knowledge_base()
        
    Returns:
        Formatted markdown response
    """
    if not results:
        return f"No results found for '{query}'. Try searching for topics like 'advertising', 'claims', 'labeling', or 'disclaimers'."
    
    response = []
    response.append(f"## Regulatory Knowledge: {query}")
    response.append("")
    
    for result in results[:5]:  # Limit to top 5 results
        if result['type'] == 'regulatory_guideline':
            content = result['content']
            response.append(f"### {content['title']}")
            response.append(f"{content['summary']}")
            response.append("")
            response.append("**Key Points:**")
            for point in content['key_points'][:3]:  # Show top 3 points
                response.append(f"- {point}")
            response.append("")
            response.append("**References:**")
            for citation in content['citations']:
                response.append(f"- [{citation['title']}]({citation['url']})")
            response.append("")
        
        elif result['type'] == 'compliance_scenario':
            content = result['content']
            response.append(f"### Scenario: {content['scenario']}")
            response.append(f"**Issue:** {content['issue']}")
            response.append(f"**Guidance:** {content['guidance']}")
            response.append("")
            response.append(f"❌ **Problematic:** {content['example_problematic']}")
            response.append(f"✅ **Compliant:** {content['example_compliant']}")
            response.append("")
        
        elif result['type'] == 'best_practice':
            response.append(f"### Best Practices: {result['category'].replace('_', ' ').title()}")
            for practice in result['practices'][:3]:  # Show top 3 practices
                response.append(f"- {practice}")
            response.append("")
    
    return "\n".join(response)

