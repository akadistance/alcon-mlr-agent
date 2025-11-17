Prompt Library for MLR Pre-Screening Agent
Prompt Library
1. Main Compliance Analysis Prompt
Prompt:
You are an MLR Pre-Screening Agent for Alcon products. Analyze promotional text for the specified product ({product_name}) from Medical, Legal, and Regulatory perspectives.
Use the compliance_analysis tool to retrieve approved claims, check for disclaimers, and identify guideline violations (e.g., unsubstantiated superlatives, overpromising outcomes, vague/testimonial language).
Additionally, evaluate the text for:
- Incomplete disclosures (e.g., claims lacking specificity about conditions, limitations, or patient suitability).
- Missing safety information (e.g., lack of instructions for proper use or surgical risks).
From a Medical perspective, ensure claims are clinically accurate and supported by evidence.
From a Legal perspective, check for compliance with advertising laws and intellectual property.
From a Regulatory perspective, ensure adherence to FDA/FTC guidelines.
For each issue, provide a dictionary with:
- "issue": the issue type (e.g., "unsubstantiated_superlatives", "incomplete_disclosure")
- "description": a brief explanation of the issue
- "suggestion": a specific, compliant alternative or correction
- "reference": a relevant FDA/FTC guideline URL (e.g., "https://www.fda.gov/regulatory-information")
Return structured feedback as a JSON string in triple backticks (```) with no other text:

{format_instructions}


Rationale:

Purpose: Instructs Claude to analyze arbitrary promotional text using approved claims and hard-coded FDA/FTC guidelines, covering Medical, Legal, and Regulatory perspectives.
Modularity: Uses placeholders for {product_name} and {format_instructions}.
Dynamic Analysis: Relies on Claude to detect nuanced issues (incomplete disclosures, safety info) contextually.
Optimization: Enforces JSON output for parsing.

Testing Log:

Test 1: Product: Total 30 Contact Lens, Input: "Total 30 Contact Lens is the best for perfect vision."
Output: Flagged "unsubstantiated_superlatives" ("best"), "overpromising_outcomes" ("perfect"), "missing_disclaimers."
Issue: Claude correctly used guideline patterns and suggested alternatives.


Test 2: Product: Clareon PanOptix IOL, Input: "Clareon PanOptix IOL provides clear vision at all distances."
Output: Approved claim detected, flagged "incomplete_disclosure" and "missing_safety_information."
Issue: Claude identified lack of specificity and safety info contextually.


Test 3: Product: Total 30 Contact Lens, Input: Word document with "Total 30 Contact Lens provides clear vision for up to 30 days."
Output: Approved claim detected, flagged "incomplete_disclosure" and "missing_safety_information."
Issue: Prompt ensured dynamic handling of random inputs.



Sample Input/Output Pairs
Input 1 (Text, Total 30 Contact Lens):
Total 30 Contact Lens guarantees fantastic comfort and vision forever.

Output 1:
{
  "summary": "Analysis of promotional text for Total 30 Contact Lens.",
  "approved_claims": ["No approved claims found."],
  "issues": [
    {
      "issue": "overpromising_outcomes",
      "description": "Claims promising guaranteed results are prohibited. Found: guarantees, forever",
      "suggestion": "Use conditional language like 'may provide comfort.'",
      "reference": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents"
    },
    {
      "issue": "vague_testimonial",
      "description": "Vague or testimonial-style claims are not permitted. Found: fantastic",
      "suggestion": "Use specific claims like 'designed for comfort.'",
      "reference": "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance"
    },
    {
      "issue": "missing_disclaimers",
      "description": "Claims must include disclaimers for limitations.",
      "suggestion": "Add: 'Results may vary; consult your eye care professional.'",
      "reference": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents"
    }
  ],
  "tools_used": ["compliance_analysis"]
}

Input 2 (Word Document, Clareon PanOptix IOL):Content: "Clareon PanOptix IOL provides clear vision at near, intermediate, and far distances. Consult your eye care professional."
Output 2:
{
  "summary": "Analysis of promotional text for Clareon PanOptix IOL.",
  "approved_claims": ["Clareon PanOptix IOL provides clear vision at near, intermediate, and far distances."],
  "issues": [
    {
      "issue": "incomplete_disclosure",
      "description": "Claim lacks specificity about conditions (e.g., patient suitability).",
      "suggestion": "Clarify: 'Clear vision at multiple distances for suitable cataract patients.'",
      "reference": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents"
    },
    {
      "issue": "missing_safety_information",
      "description": "Lacks safety information about surgical risks or post-operative care.",
      "suggestion": "Add: 'Follow post-operative care instructions to minimize risks.'",
      "reference": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents"
    }
  ],
  "tools_used": ["compliance_analysis"]
}
