"""
Comprehensive MLR Analysis Module
Performs exhaustive line-by-line compliance analysis on marketing materials
for any Alcon product advertisement, brochure, or promotional content.

Developer: EyeQ MLR Team
Purpose: Pre-screening analysis to reduce agency revision cycles
"""

import re
from typing import List, Dict, Any, Tuple, Set
from dataclasses import dataclass, field
from approved_claims import PRODUCTS, FDA_FTC_GUIDELINES
from regulatory_citations import REGULATORY_REFERENCES, ISSUE_CITATIONS

# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class AnalysisIssue:
    """Represents a single compliance issue"""
    category: str  # Claims, Disclaimers, Regulatory Language, Consistency, Tone
    issue_type: str  # Specific issue type
    issue_description: str  # What's wrong
    location: str  # Where in text (line/section reference)
    text_snippet: str  # The problematic text
    suggestion: str  # How to fix it
    severity: str  # "critical", "warning", "info"
    reference_url: str = ""  # FDA/FTC reference if applicable

@dataclass
class ComprehensiveAnalysisResult:
    """Complete analysis result"""
    compliant_claims: List[str] = field(default_factory=list)
    issues: List[AnalysisIssue] = field(default_factory=list)
    audience_type: str = "unknown"  # "patient", "professional", "mixed", "unknown"
    audience_confidence: float = 0.0  # 0.0-1.0 confidence score
    material_summary: str = ""
    product_detected: str = ""  # Which Alcon product if identified


# ============================================================================
# 1. CLAIM VALIDATION ANALYZER
# ============================================================================

def extract_claims(text: str) -> List[Tuple[str, int, str]]:
    """
    Extract ALL potential claims from text - exhaustive analysis.
    Catches: benefits, comparatives, absolute language, negation, statistics.
    Returns: List of (claim_text, line_number, context)
    """
    claims = []
    lines = text.split('\n')
    
    # Comprehensive patterns that indicate claimable statements
    claim_indicators = [
        # Marketing/benefit claims
        r'provides|delivers|improves|reduces|enhances|offers|shows|demonstrates',
        r'clinically|proven|helps|enables|allows|supports|promotes|maintains|achieves',
        r'results|effective|capable|designed|made|formulated|treatment|solution|benefit|advantage|feature',
        # Comparative language (critical!)
        r'better|superior|vs\.|versus|compared to|leading|breakthrough|innovation',
        # Absolute language (critical!)
        r'\b(?:perfect|guaranteed|always|never|100%|completely|totally|eliminates|cures|solves)\b',
        # Qualitative claims
        r'comfort|ease|gentle|soft|smooth|quality|premium|ultimate|exceptional|luxury',
        # Quantitative/statistical
        r'\d+%|\d+\s*(?:years?|months?|days?)|n=\d+',
        # Negation claims (critical!)
        r'\bno longer\b|\bno need\b|\bwithout\b|\bovercome\b|\bno compromise\b|\bno risk\b',
        # Superlatives (critical!)
        r'\bfirst\b|\bonly\b|\bfirst-and-only\b|\bunique\b|\blast\b',
    ]
    
    claim_pattern = r'(?:' + '|'.join(claim_indicators) + r')'
    
    for line_num, line in enumerate(lines, 1):
        line_stripped = line.strip()
        
        # Skip very short lines, headers, reference sections, footnotes
        if len(line_stripped) < 15:
            continue
        if re.match(r'^#+\s|^References?:|^Footnotes?:|^\*{1,2}|^[0-9]+\.\s*(?:https?://|In a clinical|Internal|Surface)', line_stripped):
            continue
        
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', line_stripped)
        
        for sentence in sentences:
            sentence_stripped = sentence.strip()
            
            if len(sentence_stripped) > 15:
                # Check if sentence contains ANY claimable language
                if re.search(claim_pattern, sentence_stripped, re.IGNORECASE):
                    claims.append((sentence_stripped, line_num, line_stripped))
    
    return claims


def validate_claim_references(text: str, claims: List[Tuple[str, int, str]]) -> List[AnalysisIssue]:
    """
    Check if claims have supporting references [1], [2], etc. or superscript numbers.
    ONLY flag if document appears unreferenced AND claim is making specific assertions.
    """
    issues = []
    
    # First, determine if this is a referenced document at all
    text_lower = text.lower()
    
    # Count reference indicators throughout document
    all_bracket_refs = re.findall(r'\[(\d+)\]', text)
    all_superscript_refs = re.findall(r'[¹²³⁴⁵⁶⁷⁸⁹⁰]', text)
    
    # Check for reference section
    has_reference_section = bool(re.search(
        r'(?:references|citations|sources):\s*\n',
        text,
        re.IGNORECASE
    ))
    
    # Check for common data source mentions
    has_data_sources = bool(re.search(
        r'(?:alcon data on file|clinical study|in a clinical|based on|data from|study showed)',
        text,
        re.IGNORECASE
    ))
    
    # Determine if document is properly referenced
    is_referenced_document = (
        len(all_bracket_refs) >= 3 or  # Has 3+ [N] references
        len(all_superscript_refs) >= 3 or  # Has 3+ superscript refs
        has_reference_section or  # Has References: section
        has_data_sources  # Mentions data sources inline
    )
    
    # If document is clearly referenced, trust the referencing system
    if is_referenced_document:
        # Only check for OBVIOUS missing refs on HIGH-RISK claims
        high_risk_patterns = [
            r'\b(?:guaranteed|perfect|100%|always|never|eliminates|cures)\b',
            r'\b(?:best|only|first|superior|leading)\b',
        ]
        
        for claim_text, line_num, context in claims:
            # Check if this is a high-risk claim
            is_high_risk = any(
                re.search(pattern, claim_text, re.IGNORECASE)
                for pattern in high_risk_patterns
            )
            
            if not is_high_risk:
                continue  # Skip normal claims in referenced documents
            
            # Check if high-risk claim has a reference
            has_ref = bool(re.search(r'[¹²³⁴⁵⁶⁷⁸⁹⁰]|\[\d+\]', claim_text))
            has_inline_source = bool(re.search(
                r'(?:clinical|study|data|evidence|proven|research)',
                claim_text,
                re.IGNORECASE
            ))
            
            if not has_ref and not has_inline_source:
                issues.append(AnalysisIssue(
                    category="Claim Validation",
                    issue_type="unsupported_claim",
                    issue_description="High-risk claim (absolute/superlative language) lacks reference",
                    location=f"Line {line_num}",
                    text_snippet=claim_text[:200],
                    suggestion="Add reference [#] or clinical study citation to support this strong claim",
                    severity="critical",
                    reference_url=REGULATORY_REFERENCES.get("ftc_advertising_substantiation", {}).get("url", "")
                ))
    
    else:
        # Document appears to have NO reference system - flag major claims
        for claim_text, line_num, context in claims:
            # Skip very general statements
            if len(claim_text) < 30:
                continue
            
            # Skip if it's just descriptive (not making assertions)
            descriptive_patterns = [
                r'^(?:the|this|these|it|product)',  # Starts with article/pronoun
                r'(?:may|can|might|could|designed to)',  # Already qualified
            ]
            
            is_descriptive = any(
                re.search(pattern, claim_text, re.IGNORECASE)
                for pattern in descriptive_patterns
            )
            
            if is_descriptive:
                continue
            
            # This is an unreferenced document making claims - flag it
            issues.append(AnalysisIssue(
                category="Claim Validation",
                issue_type="unsupported_claim",
                issue_description="Claim appears in material with no reference system",
                location=f"Line {line_num}",
                text_snippet=claim_text[:200],
                suggestion="Add supporting references or clinical data sources throughout material",
                severity="critical",
                reference_url=REGULATORY_REFERENCES.get("ftc_advertising_substantiation", {}).get("url", "")
            ))
    
    return issues


def validate_against_approved_claims(text: str, product_name: str = None) -> Tuple[List[str], List[AnalysisIssue]]:
    """
    Check if claims match approved claims for the product.
    Uses flexible matching to find approved claims even with slight variations.
    Returns: (compliant_claims, issues)
    """
    compliant_claims = []
    issues = []
    
    # Detect product if not provided
    if not product_name:
        # Try direct match first
        for product in PRODUCTS.keys():
            if product.lower() in text.lower():
                product_name = product
                break
        
        # Try aliases if not found
        if not product_name:
            product_aliases = {
                "total30": "Total 30 Contact Lens",
                "total 30": "Total 30 Contact Lens",
                "clareon": "Clareon PanOptix IOL",
                "panoptix": "Clareon PanOptix IOL",
            }
            text_lower = text.lower()
            for alias, actual_product in product_aliases.items():
                if alias in text_lower:
                    product_name = actual_product
                    break
    
    if not product_name or product_name not in PRODUCTS:
        return [], issues
    
    approved = PRODUCTS[product_name]['approved_claims']
    text_lower = text.lower()
    
    for approved_claim in approved:
        # Extract the main claim (first sentence, before qualifiers/references)
        # Split by common qualifier patterns
        main_claim = approved_claim
        for delimiter in ['. In a clinical', '. Based on', '. 1.', '. Surface property', '. In vitro']:
            if delimiter.lower() in approved_claim.lower():
                main_claim = approved_claim[:approved_claim.lower().find(delimiter.lower())]
                break
        
        # Normalize for matching
        claim_normalized = main_claim.lower().strip()
        
        # Check if a significant portion of the main claim appears in text
        # Break into key phrases and check if most of them are present
        words = [w for w in claim_normalized.split() if len(w) > 3]  # Filter out small words
        
        if len(words) > 0:
            # Check if at least 70% of key words appear in text
            matching_words = sum(1 for word in words if word in text_lower)
            match_ratio = matching_words / len(words)
            
            if match_ratio >= 0.7 or claim_normalized in text_lower:
                compliant_claims.append(approved_claim)
    
    return compliant_claims, issues


# ============================================================================
# 2. DISCLAIMER VALIDATOR
# ============================================================================

def validate_disclaimers(text: str, claims: List[str]) -> List[AnalysisIssue]:
    """
    Check for required disclaimers and proper placement.
    """
    issues = []
    
    required_disclaimer_patterns = [
        (r'results?\s+may\s+vary', 'Results may vary'),
        (r'consult.*(?:eye care|physician|doctor|professional)', 'Consult healthcare professional'),
        (r'(?:based on|in vitro|clinical study|data on file)', 'Data source'),
        (r'(?:individual\s+)?results.*may\s+vary', 'Individual variability'),
        (r'not.*all.*patients', 'Patient suitability'),
    ]
    
    disclaimers_found = []
    
    for pattern, name in required_disclaimer_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            disclaimers_found.append(name)
    
    # Check if major benefit claims lack disclaimers
    benefit_keywords = ['improves', 'eliminates', 'corrects', 'solves', 'reduces', 'freedom']
    has_benefit_claim = any(
        re.search(rf'\b{keyword}\b', text, re.IGNORECASE) 
        for keyword in benefit_keywords
    )
    
    if has_benefit_claim and not disclaimers_found:
        issues.append(AnalysisIssue(
            category="Disclaimers & Legal Text",
            issue_type="missing_disclaimer",
            issue_description="Material contains benefit claims but is missing required disclaimers such as 'Results may vary'",
            location="Overall document",
            text_snippet="",
            suggestion="Add disclaimers: 'Results may vary', 'Consult your eye care professional', or similar appropriate statements",
            severity="critical",
            reference_url=REGULATORY_REFERENCES.get("fda_labeling_requirements", {}).get("url", "")
        ))
    
    # Check for vague or misplaced disclaimers
    if disclaimers_found:
        disclaimer_section = text[-500:]  # Check last 500 chars for disclaimers
        for pattern, name in required_disclaimer_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                if not re.search(pattern, disclaimer_section, re.IGNORECASE):
                    issues.append(AnalysisIssue(
                        category="Disclaimers & Legal Text",
                        issue_type="misplaced_disclaimer",
                        issue_description=f"Disclaimer '{name}' appears far from related claims",
                        location="See placement in document",
                        text_snippet=name,
                        suggestion="Move disclaimers closer to related claims for clarity",
                        severity="warning"
                    ))
    
    return issues


# ============================================================================
# 3. REGULATORY LANGUAGE DETECTOR
# ============================================================================

def detect_regulatory_violations(text: str) -> List[AnalysisIssue]:
    """
    Detect non-compliant language: absolute statements, overpromising, etc.
    """
    issues = []
    lines = text.split('\n')
    
    # Absolute statement patterns (prohibited)
    absolute_patterns = {
        "overpromising": {
            "patterns": [
                (r'\b(?:perfect|completely|totally|100%|guaranteed|always|never|forever|eliminates?|cures?)\b', 
                 "This claim uses absolute language that may not be substantiated")
            ],
            "suggestion": "Use conditional language: 'may improve', 'can help', 'may reduce', 'designed to'",
            "reference": "overpromising_outcomes"
        },
        "unsubstantiated_superlatives": {
            "patterns": [
                (r'\b(?:best|superior|top|leading|unmatched|ultimate|most effective|only)\b',
                 "This claim uses a superlative (e.g., 'only', 'best', 'first') without supporting data")
            ],
            "suggestion": "Replace superlative wording or provide supporting clinical data",
            "reference": "unsubstantiated_superlatives"
        },
        "vague_testimonial": {
            "patterns": [
                (r'\b(?:amazing|wonderful|fantastic|incredible|changed my life|revolutionary)\b',
                 "Vague testimonial language")
            ],
            "suggestion": "Use specific, evidence-based claims instead of emotional language",
            "reference": "vague_testimonial"
        }
    }
    
    for line_num, line in enumerate(lines, 1):
        for violation_type, details in absolute_patterns.items():
            for pattern, description in details["patterns"]:
                matches = re.finditer(pattern, line, re.IGNORECASE)
                for match in matches:
                    issue = AnalysisIssue(
                        category="Regulatory & Compliance Language",
                        issue_type=violation_type,
                        issue_description=description,
                        location=f"Line {line_num}",
                        text_snippet=line.strip()[:200],
                        suggestion=details["suggestion"],
                        severity="critical",
                        reference_url=REGULATORY_REFERENCES.get(
                            details["reference"], {}
                        ).get("url", "")
                    )
                    issues.append(issue)
    
    # Check for unsupported comparative claims
    if re.search(r'\b(?:vs\.?|versus|better than|superior to|more effective than)\b', text, re.IGNORECASE):
        if not re.search(r'(?:clinical trial|study|data|evidence|proven)', text, re.IGNORECASE):
            issues.append(AnalysisIssue(
                category="Regulatory & Compliance Language",
                issue_type="unsupported_comparative",
                issue_description="This comparative claim (e.g., 'better than', 'superior to') is made without supporting clinical data",
                location="Document contains comparisons",
                text_snippet=re.search(r'.{0,50}(?:vs|versus|better than).{0,50}', text, re.IGNORECASE).group() if re.search(r'.{0,50}(?:vs|versus|better than).{0,50}', text, re.IGNORECASE) else "",
                suggestion="Support comparative claims with head-to-head clinical trial data or remove the comparison",
                severity="critical",
                reference_url=REGULATORY_REFERENCES.get("ftc_advertising_substantiation", {}).get("url", "")
            ))
    
    return issues


def detect_absolute_negation_statements(text: str) -> List[AnalysisIssue]:
    """
    Detect absolute negation statements like 'no longer X', 'no Y compromise'
    These are often absolute claims without proper qualifiers.
    """
    issues = []
    lines = text.split('\n')
    
    # Patterns for absolute negations
    negation_patterns = [
        (r'\bno longer\s+\w+', 'Absolute negation claim: "no longer" suggests permanent elimination'),
        (r'\bno\s+\w+\s+compromise', 'Absolute claim about eliminating compromise'),
        (r'\bno risk\b', 'Absolute claim about zero risk'),
        (r'\bcompletely\s+(?:safe|effective|eliminat)', 'Absolute claim using "completely"'),
    ]
    
    for line_num, line in enumerate(lines, 1):
        for pattern, description in negation_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                # Check if line has references
                has_ref = bool(re.search(r'[¹²³⁴⁵⁶⁷⁸⁹⁰]|\[\d+\]', line))
                if not has_ref:
                    match = re.search(pattern, line, re.IGNORECASE)
                    snippet = line.strip()
                    
                    issues.append(AnalysisIssue(
                        category="Regulatory & Compliance Language",
                        issue_type="absolute_statement",
                        issue_description=f"Absolute statement: {description}",
                        location=f"Line {line_num}",
                        text_snippet=snippet[:200],
                        suggestion="Use qualified language: 'may help', 'designed to', 'can reduce', 'for many patients'",
                        severity="critical",
                        reference_url=REGULATORY_REFERENCES.get("fda_labeling_requirements", {}).get("url", "")
                    ))
    
    return issues


def detect_comparative_claims_weak_refs(text: str) -> List[AnalysisIssue]:
    """
    Detect comparative claims ("better than", "vs.", "lagged") with weak or no references.
    """
    issues = []
    lines = text.split('\n')
    
    comparative_patterns = [
        (r'(?:better|superior|vs|versus|compared to|lagged|leading)', 'Comparative claim'),
    ]
    
    for line_num, line in enumerate(lines, 1):
        for pattern, description in comparative_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                # Check if this is in a quoted section or reference section
                if re.match(r'^\s*(?:\d+\.|References?:|Internal|Based on)', line, re.IGNORECASE):
                    continue
                
                # Check for strong references
                has_clinical_ref = bool(re.search(r'(?:clinical|study|trial|data on file|evidence)[¹²³⁴⁵⁶⁷⁸⁹⁰]?', line, re.IGNORECASE))
                has_any_ref = bool(re.search(r'[¹²³⁴⁵⁶⁷⁸⁹⁰]|\[\d+\]', line))
                
                # If comparative but only has weak ref (internal estimates, internal data)
                has_weak_ref = bool(re.search(r'Internal (?:Estimates|data)', line, re.IGNORECASE))
                
                if not has_clinical_ref or (has_weak_ref and has_any_ref):
                    match = re.search(pattern, line, re.IGNORECASE)
                    snippet = line.strip()
                    
                    issues.append(AnalysisIssue(
                        category="Regulatory & Compliance Language",
                        issue_type="unsupported_comparative",
                        issue_description=f"Comparative claim without adequate clinical support: '{pattern}'",
                        location=f"Line {line_num}",
                        text_snippet=snippet[:200],
                        suggestion="Support with head-to-head clinical trial data or remove the comparison",
                        severity="critical",
                        reference_url=REGULATORY_REFERENCES.get("ftc_advertising_substantiation", {}).get("url", "")
                    ))
    
    return issues


def detect_unqualified_percentage_claims(text: str) -> List[AnalysisIssue]:
    """
    Detect unqualified percentage claims that may be absolute statements.
    Examples: "100% water", "99% effective" without proper in vitro/clinical qualifiers.
    """
    issues = []
    lines = text.split('\n')
    
    # Patterns for percentage claims
    percentage_patterns = [
        (r'(?:approaches?|up to|nearly)?\s*100%', 'Absolute percentage claim'),
        (r'\d{2,3}%\s+(?:effective|improvement|reduction|success|water)', 'Unqualified percentage claim'),
    ]
    
    for line_num, line in enumerate(lines, 1):
        for pattern, description in percentage_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                # Skip if this is in the References section or a footnote
                if re.match(r'^\s*(?:\d+\.|References?:|In vitro|Surface)', line, re.IGNORECASE):
                    continue
                
                # Check if line has proper qualifiers (in vitro, clinical, studies, etc.)
                has_qualifier = bool(re.search(
                    r'(?:in vitro|clinical|study|studies|trial|data on file|analysis|test)',
                    line,
                    re.IGNORECASE
                ))
                
                # Check if line has reference numbers
                has_ref = bool(re.search(r'[¹²³⁴⁵⁶⁷⁸⁹⁰]|\[\d+\]', line))
                
                # Flag if percentage claim lacks both qualifier and reference context
                if not has_qualifier and not has_ref:
                    match = re.search(pattern, line, re.IGNORECASE)
                    snippet = line.strip()
                    
                    issues.append(AnalysisIssue(
                        category="Regulatory & Compliance Language",
                        issue_type="unqualified_percentage",
                        issue_description=f"Percentage claim without qualifying context: '{description}'",
                        location=f"Line {line_num}",
                        text_snippet=snippet[:200],
                        suggestion="Qualify with 'in vitro', 'clinical', or reference study data (e.g., 'approaches 100% water at the surface [7]')",
                        severity="critical",
                        reference_url=REGULATORY_REFERENCES.get("ftc_advertising_substantiation", {}).get("url", "")
                    ))
    
    return issues


def detect_weak_reference_claims(text: str) -> List[AnalysisIssue]:
    """
    Detect when product claims use weak references like 'Internal Estimates'.
    Flag the presence of Internal Estimates if product/market claims exist.
    """
    issues = []
    
    # Check if document has Internal Estimates references
    has_internal_estimates = bool(re.search(r'Internal\s+Estimates', text, re.IGNORECASE))
    
    if not has_internal_estimates:
        return issues
    
    lines = text.split('\n')
    
    # Find market/product claims
    claim_patterns = [
        r'(?:reusable|contact)\s+lens.*(?:market|segment|percentage|%)',
        r'(?:contact\s+)?lens\s+wearers.*(?:choose|prefer|percentage)',
        r'\d+%\s+of.*(?:market|wearers)',
    ]
    
    for line_num, line in enumerate(lines, 1):
        # Skip References section
        if re.match(r'^\s*(?:References?:|$)', line):
            continue
        
        # Check if line contains market/product claims
        for pattern in claim_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                # This is a market/product claim, and document has Internal Estimates
                # Flag it as potentially weak reference
                issues.append(AnalysisIssue(
                    category="Claim Validation",
                    issue_type="weak_reference",
                    issue_description="Market/product claim may be supported by weak reference (Internal Estimates instead of clinical data)",
                    location=f"Line {line_num}",
                    text_snippet=line.strip()[:200],
                    suggestion="Verify claim is supported by published industry data or clinical studies, not just internal estimates",
                    severity="critical",
                    reference_url=REGULATORY_REFERENCES.get("ftc_advertising_substantiation", {}).get("url", "")
                ))
                break
    
    return issues


# ============================================================================
# 4. CONSISTENCY CHECKER
# ============================================================================

def check_consistency(text: str) -> List[AnalysisIssue]:
    """
    Verify product names, data consistency, no contradictions.
    """
    issues = []
    
    # Check product name consistency
    product_variants = {}
    for product_name in PRODUCTS.keys():
        variants = [
            product_name,
            product_name.replace('®', ''),
            product_name.lower(),
            re.sub(r'[®™]', '', product_name)
        ]
        matches = []
        for variant in variants:
            matches.extend(re.finditer(re.escape(variant), text, re.IGNORECASE))
        if matches:
            product_variants[product_name] = len(matches)
    
    # Check for inconsistent spacing/formatting
    if product_variants:
        product_name = max(product_variants, key=product_variants.get)
        # Check for inconsistent trademark usage
        if f"{product_name}®" in text and product_name in text:
            issues.append(AnalysisIssue(
                category="Consistency & Accuracy",
                issue_type="inconsistent_trademark",
                issue_description="Product name trademarked inconsistently throughout document",
                location="Multiple locations",
                text_snippet="Product name formatting varies",
                suggestion=f"Use '{product_name}®' consistently throughout (or without ® if preferred, but be consistent)",
                severity="warning"
            ))
    
    # Check for contradictory claims
    negative_words = r'\b(?:not|no|never|cannot|lack|without|absent|missing|fails?)\b'
    positive_words = r'\b(?:improves?|reduces?|eliminates?|enhances?|provides?|delivers?)\b'
    
    lines = text.split('\n')
    for line_num, line in enumerate(lines, 1):
        has_negative = bool(re.search(negative_words, line, re.IGNORECASE))
        has_positive = bool(re.search(positive_words, line, re.IGNORECASE))
        
        # Flag suspicious combinations
        if has_negative and has_positive and 'not' not in line.lower()[:20]:
            if re.search(r'\bnot\s+(?:for|intended|recommended)\b', line, re.IGNORECASE):
                # This is typically ok (safety language)
                pass
            else:
                issues.append(AnalysisIssue(
                    category="Consistency & Accuracy",
                    issue_type="contradictory_statement",
                    issue_description="Line contains both positive and negative claims that may contradict",
                    location=f"Line {line_num}",
                    text_snippet=line.strip()[:200],
                    suggestion="Clarify the statement - ensure positive and negative elements are not contradictory",
                    severity="warning"
                ))
    
    return issues


# ============================================================================
# 5. TONE & AUDIENCE ANALYZER
# ============================================================================

def analyze_tone_and_audience(text: str) -> Tuple[str, float, List[AnalysisIssue]]:
    """
    Auto-detect audience (patient vs professional) and check tone appropriateness.
    Returns: (audience_type, confidence_score, issues)
    """
    issues = []
    
    # Patient-oriented keywords
    patient_indicators = [
        r'(?:patient|you|your|yourself|people|anyone|everyone)',
        r'(?:feel|experience|enjoy|benefit|results)',
        r'(?:daily life|everyday|activities|freedom|independence)',
        r'(?:doctor|eye care professional|surgeon|consult)',
        r'(?:simple|easy|convenient|comfortable)',
    ]
    
    # Professional-oriented keywords
    professional_indicators = [
        r'(?:clinical|study|trial|evidence|data|analysis)',
        r'(?:efficacy|safety|performance|outcomes)',
        r'(?:FDA approved|510\(k\)|cleared|indications)',
        r'(?:ophthalmologist|surgeon|physician|healthcare provider)',
        r'(?:methodology|parameters|specifications|technical)',
        r'(?:comparison|versus|demonstrated)',
    ]
    
    # Mixed/vague language
    emotional_indicators = [
        r'(?:amazing|wonderful|fantastic|incredible|revolutionary)',
        r'(?:love|best|perfect|greatest)',
    ]
    
    patient_score = sum(
        len(re.findall(pattern, text, re.IGNORECASE))
        for pattern in patient_indicators
    )
    
    professional_score = sum(
        len(re.findall(pattern, text, re.IGNORECASE))
        for pattern in professional_indicators
    )
    
    emotional_score = sum(
        len(re.findall(pattern, text, re.IGNORECASE))
        for pattern in emotional_indicators
    )
    
    total_score = patient_score + professional_score + emotional_score
    
    if total_score == 0:
        audience_type = "unknown"
        confidence = 0.0
    else:
        patient_ratio = patient_score / total_score
        professional_ratio = professional_score / total_score
        
        if patient_ratio > 0.5:
            audience_type = "patient"
            confidence = patient_ratio
        elif professional_ratio > 0.5:
            audience_type = "professional"
            confidence = professional_ratio
        else:
            audience_type = "mixed"
            confidence = max(patient_ratio, professional_ratio)
    
    # Check if tone matches audience
    if audience_type == "professional" and emotional_score > 3:
        issues.append(AnalysisIssue(
            category="Tone, Clarity & Audience Appropriateness",
            issue_type="inappropriate_tone",
            issue_description="Emotional language found in professional/clinical material",
            location="Multiple locations",
            text_snippet="",
            suggestion="Replace emotional language with objective, evidence-based terminology",
            severity="warning"
        ))
    
    if audience_type == "patient" and emotional_score == 0 and professional_score > 5:
        issues.append(AnalysisIssue(
            category="Tone, Clarity & Audience Appropriateness",
            issue_type="overly_technical",
                issue_description="This material appears aimed at patients but uses overly technical or medical terminology",
            location="Throughout document",
            text_snippet="",
            suggestion="Simplify technical terminology for patient audience or clarify this is for professionals",
            severity="warning"
        ))
    
    # Check for misleading language
    misleading_patterns = [
        r'(?:miracle|cure|eliminate)(?!d)(?!ing)',
        r'(?:works?|results?).*(?:guaranteed|always|never fails)',
        r'(?:all|everyone|100%).*(?:patients?|people)',
    ]
    
    for pattern in misleading_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            match = re.search(pattern, text, re.IGNORECASE)
            # Find the line containing this match
            text_lines = text.split('\n')
            for line in text_lines:
                if re.search(pattern, line, re.IGNORECASE):
                    snippet = line.strip()[:200]
                    break
            else:
                snippet = match.group()[:200]
            
            issues.append(AnalysisIssue(
                category="Tone, Clarity & Audience Appropriateness",
                issue_type="misleading_language",
                issue_description="Potentially misleading language detected",
                location="See text for context",
                text_snippet=snippet,
                suggestion="Use more measured language with appropriate qualifiers and disclaimers",
                severity="critical"
            ))
    
    return audience_type, confidence, issues


# ============================================================================
# 6. OUTPUT FORMATTER
# ============================================================================

def format_analysis_results(result: ComprehensiveAnalysisResult) -> str:
    """
    Format analysis results in a minimal, scannable, professional format.
    Inspired by Claude and modern AI outputs - clean, concise, no redundancy.
    """
    
    output = []
    
    # === QUICK SUMMARY ===
    critical_count = len([i for i in result.issues if i.severity == "critical"])
    warning_count = len([i for i in result.issues if i.severity == "warning"])
    
    # Verdict line
    if critical_count == 0 and warning_count == 0:
        output.append("**Status:** [OK] Compliant\n\n")
    elif critical_count > 0:
        output.append(f"**Status:** [NEEDS REVISION] {critical_count} critical, {warning_count} warning\n\n")
    else:
        output.append(f"**Status:** [MINOR REVISIONS] {warning_count} warning\n\n")
    
    # Quick stats (one line)
    output.append(f"**Summary:** {len(result.compliant_claims)} approved | {critical_count} critical | {warning_count} warnings\n\n")
    
    # --- DIVIDER ---
    output.append("---\n\n")
    
    # === APPROVED CLAIMS (LIST THEM) ===
    if result.compliant_claims:
        output.append("## Approved Claims\n\n")
        import re as regex_module
        
        for i, claim in enumerate(result.compliant_claims, 1):
            # Extract main claim by removing reference text
            # Find where reference descriptions start (they usually begin with a period followed by a keyword)
            reference_keywords = [
                '. 1. In',      # Catch ". 1. In vitro..." patterns
                '. 1. Shi',     # Catch ". 1. Shi X..." patterns
                '. 2. ',         # Catch multiple numbered references
                '. 3. ',
                '. In a clinical study',
                '. In a clinical',
                '. Based on',
                '. Surface property',
                '. In vitro',
                '. Alcon data',
                '. Shi X',
                '. Schnider',
                '. Ishihara',
                '. Laboratory',
                '. Lehmann',
                ' 1. In a clinical',
                ' 1. Based on',
                ' 1. Surface property',
            ]
            
            # Find the first reference keyword position
            first_ref_idx = len(claim)
            for keyword in reference_keywords:
                idx = claim.lower().find(keyword.lower())
                if idx != -1 and idx < first_ref_idx:
                    first_ref_idx = idx
            
            # Extract just the main claim (before reference details)
            main_claim = claim[:first_ref_idx].strip().rstrip('.')
            
            output.append(f"{i}. {main_claim}\n\n")
    
    # === CRITICAL ISSUES (grouped, deduplicated) ===
    if critical_count > 0:
        output.append("## Issues Found\n\n")
        
        # Group by type and collect unique issues
        critical_by_type = {}
        for issue in result.issues:
            if issue.severity == "critical":
                key = issue.issue_type
                if key not in critical_by_type:
                    critical_by_type[key] = []
                critical_by_type[key].append(issue)
        
        # Display each type once with a count
        for issue_type, issues in sorted(critical_by_type.items()):
            # Readable names
            type_names = {
                "unsupported_claim": "Missing Data Sources",
                "unsubstantiated_superlatives": "Unsupported Superlatives",
                "overpromising": "Overpromising Language",
                "absolute_statement": "Absolute Language",
                "unsupported_comparative": "Unsupported Claims",
                "missing_disclaimer": "Missing Disclaimers",
                "vague_testimonial": "Vague Language",
                "unqualified_percentage": "Percentage Claims",
                "weak_reference": "Weak References"
            }
            readable_name = type_names.get(issue_type, issue_type.replace('_', ' ').title())
            
            # Show count if > 1
            count_str = f" ({len(issues)})" if len(issues) > 1 else ""
            output.append(f"**{readable_name}{count_str}**\n")
            
            # Show just the first example with better truncation
            first_issue = issues[0]
            snippet = first_issue.text_snippet.strip()
            
            # Truncate to a complete sentence or phrase (not mid-word)
            # Try to truncate at 150 chars but prefer sentence boundary
            if len(snippet) > 150:
                # Try to truncate at last space before 150 chars
                truncated = snippet[:150]
                last_space = truncated.rfind(' ')
                if last_space > 75:  # Make sure we have at least 75 chars
                    snippet = snippet[:last_space] + '...'
                else:
                    snippet = snippet[:150] + '...'
            
            output.append(f"- Example: \"{snippet}\"\n")
            output.append(f"- Fix: {first_issue.suggestion}\n\n")
    
    # === WARNINGS (compact) ===
    if warning_count > 0:
        output.append("## Warnings\n\n")
        
        warning_issues = [i for i in result.issues if i.severity == "warning"]
        # Group warnings by type
        warning_by_type = {}
        for issue in warning_issues:
            key = issue.issue_type
            if key not in warning_by_type:
                warning_by_type[key] = 0
            warning_by_type[key] += 1
        
        for issue_type, count in warning_by_type.items():
            readable_type = issue_type.replace('_', ' ').title()
            count_str = f" ({count})" if count > 1 else ""
            # Get the suggestion from the first warning of this type
            suggestion = next(i.suggestion for i in warning_issues if i.issue_type == issue_type)
            output.append(f"- **{readable_type}{count_str}**: {suggestion}\n")
        
        output.append("\n")
    
    return "".join(output)


def generate_compliance_summary(result: ComprehensiveAnalysisResult) -> str:
    """
    Generate minimal next steps and metadata. No redundancy.
    """
    
    critical_issues = [i for i in result.issues if i.severity == "critical"]
    warning_issues = [i for i in result.issues if i.severity == "warning"]
    
    summary = []
    
    # Only show next steps if there are actual issues
    if critical_issues or warning_issues:
        summary.append("## Next Steps\n\n")
        
        # Collect all unique recommendations
        recommendations = set()
        
        # Critical issues recommendations
        critical_types = {i.issue_type for i in critical_issues}
        if "unsupported_claim" in critical_types:
            recommendations.add("Add supporting data or clinical references to all unsupported claims")
        if "unsubstantiated_superlatives" in critical_types:
            recommendations.add("Remove superlatives or add clinical evidence")
        if "overpromising" in critical_types or "absolute_statement" in critical_types:
            recommendations.add("Use conditional language ('may', 'can', 'designed to')")
        if "missing_disclaimer" in critical_types:
            recommendations.add("Add required disclaimers")
        if "unqualified_percentage" in critical_types:
            recommendations.add("Qualify percentage claims with 'in vitro', 'clinical', or reference study data")
        if "weak_reference" in critical_types:
            recommendations.add("Support market claims with published industry data or clinical studies instead of internal estimates")
        
        # Warnings recommendations
        warning_types = {i.issue_type for i in warning_issues}
        if "misplaced_disclaimer" in warning_types:
            recommendations.add("Move disclaimers closer to relevant claims")
        if "overly_technical" in warning_types:
            recommendations.add("Simplify technical terminology for patient audience")
        if "inconsistent_terminology" in warning_types:
            recommendations.add("Ensure consistent product naming and terminology")
        
        # Show as simple bullet list
        for i, rec in enumerate(sorted(recommendations), 1):
            summary.append(f"{i}. {rec}\n")
        
        summary.append("\n")
    
    # Metadata footer (minimal)
    summary.append("---\n\n")
    summary.append(f"**Product:** {result.product_detected or 'Not detected'}\n")
    summary.append(f"**Audience:** {result.audience_type.title()}\n\n")
    summary.append("*Review by qualified regulatory professionals recommended.*\n")
    
    return "".join(summary)


# ============================================================================
# 8. MAIN ORCHESTRATOR
# ============================================================================

def run_comprehensive_analysis(material_text: str, product_name: str = None) -> Dict[str, Any]:
    """
    Master function that orchestrates all analysis modules.
    
    Args:
        material_text: The promotional material to analyze
        product_name: Optional product name (auto-detected if not provided)
    
    Returns:
        Dictionary with complete analysis results
    """
    
    result = ComprehensiveAnalysisResult()
    
    # Detect product
    if not product_name:
        # Create mapping of product aliases to their keys
        product_aliases = {
            "total30": "Total 30 Contact Lens",
            "total 30": "Total 30 Contact Lens",
            "clareon": "Clareon PanOptix IOL",
            "panoptix": "Clareon PanOptix IOL",
            "iol": "Clareon PanOptix IOL",
            "intraocular": "Clareon PanOptix IOL",
        }
        
        text_lower = material_text.lower()
        
        # First try direct product key match
        for product in PRODUCTS.keys():
            if product.lower() in text_lower:
                product_name = product
                result.product_detected = product_name
                break
        
        # If not found, try aliases
        if not product_name:
            for alias, actual_product in product_aliases.items():
                if alias in text_lower:
                    product_name = actual_product
                    result.product_detected = product_name
                    break
    else:
        result.product_detected = product_name
    
    # 1. CLAIM VALIDATION
    extracted_claims = extract_claims(material_text)
    claim_reference_issues = validate_claim_references(material_text, extracted_claims)
    compliant_claims, approval_issues = validate_against_approved_claims(material_text, product_name)
    
    result.compliant_claims = compliant_claims
    result.issues.extend(claim_reference_issues)
    result.issues.extend(approval_issues)
    
    # 2. DISCLAIMER VALIDATION
    disclaimer_issues = validate_disclaimers(material_text, compliant_claims)
    result.issues.extend(disclaimer_issues)
    
    # 3. REGULATORY LANGUAGE DETECTION
    regulatory_issues = detect_regulatory_violations(material_text)
    result.issues.extend(regulatory_issues)
    
    # 3B. ABSOLUTE NEGATION STATEMENTS (catches "no longer", "no compromise")
    negation_issues = detect_absolute_negation_statements(material_text)
    result.issues.extend(negation_issues)
    
    # 3C. COMPARATIVE CLAIMS WITH WEAK REFERENCES
    comparative_issues = detect_comparative_claims_weak_refs(material_text)
    result.issues.extend(comparative_issues)

    # 3D. UNQUALIFIED PERCENTAGE CLAIMS
    unqualified_percentage_issues = detect_unqualified_percentage_claims(material_text)
    result.issues.extend(unqualified_percentage_issues)

    # 3E. WEAK REFERENCE CLAIMS
    weak_reference_issues = detect_weak_reference_claims(material_text)
    result.issues.extend(weak_reference_issues)
    
    # 4. CONSISTENCY CHECK
    consistency_issues = check_consistency(material_text)
    result.issues.extend(consistency_issues)
    
    # 5. TONE & AUDIENCE ANALYSIS
    audience_type, confidence, tone_issues = analyze_tone_and_audience(material_text)
    result.audience_type = audience_type
    result.audience_confidence = confidence
    result.issues.extend(tone_issues)
    
    # Generate formatted output
    formatted_table = format_analysis_results(result)
    compliance_summary = generate_compliance_summary(result)
    
    return {
        "formatted_table": formatted_table,
        "compliance_summary": compliance_summary,
        "compliant_claims": result.compliant_claims,
        "issues": [
            {
                "category": issue.category,
                "issue_type": issue.issue_type,
                "description": issue.issue_description,
                "location": issue.location,
                "snippet": issue.text_snippet,
                "suggestion": issue.suggestion,
                "severity": issue.severity,
                "reference": issue.reference_url
            }
            for issue in result.issues
        ],
        "audience_type": result.audience_type,
        "audience_confidence": result.audience_confidence,
        "product_detected": result.product_detected,
        "compliant_count": len(result.compliant_claims),
        "critical_issues_count": len([i for i in result.issues if i.severity == "critical"]),
        "warning_count": len([i for i in result.issues if i.severity == "warning"]),
        "summary_report": formatted_table + compliance_summary
    }
