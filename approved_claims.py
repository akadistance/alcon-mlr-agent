# Approved claims and product details for Alcon MLR Pre-Screening Agent

PRODUCTS = {
    "Clareon PanOptix IOL": {
        "description": "Clareon PanOptix IOL is a trifocal intraocular lens designed to provide clear vision at near, intermediate, and far distances for patients undergoing cataract surgery.",
        "approved_claims": [
            # Comprehensive Vision Range & Clarity
            "20/20 Near, Intermediate, and Distance Vision is now possible † Based on mean value of binocular defocus curve at near, intermediate, and distance at 6 months (n=127). ‡ Snellen VA was converted from logMAR VA. A Snellen notation of 20/20-2 or better indicates a logMAR VA of 0.04 or better, which means 3 or more of the 5 Early Treatment Diabetic Retinopathy Study chart letters in the line were identified correctly.",
            "The latest advancements in lens technology enable the Clareon® PanOptix® IOL to deliver a full range of vision and exceptional clarity.",
            
            # ENLIGHTEN® Optical Technology
            "ENLIGHTEN® Optical Technology—a proprietary design that optimizes intermediate vision without compromising exceptional near and distance vision.",
            
            # Optimized Light Utilization
            "Optimized light energy distribution — 88% total light utilization at a 3 mm pupil size (Light allocation: 50% distance, 25% intermediate, 25% near).",
            "Reduces dependence on pupil size with a 4.5 mm diffractive zone.",
            
            # Patient Satisfaction & Independence
            "Patients love their results with the Clareon® PanOptix® IOL.",
            "Enjoy a Full Range of Vision and Exceptional Clarity Without Glasses. * Based on in vitro examinations of glistenings, surface haze and SSNGs.",
            
            # Presbyopia Correction & Eyeglass Reduction
            "The Clareon® PanOptix® lens mitigates the effects of presbyopia by providing improved intermediate and near visual acuity, while maintaining comparable distance visual acuity with a reduced need for eyeglasses, compared to a monofocal IOL.",
            
            # Comfort & Continuous Focus Range
            "More comfortable intermediate vision at 60 cm.",
            "A continuous range of vision from distance to near up to 33 cm. *Based on data for AcrySof IQ PanOptix Trifocal IOL."
        ]
    },
    "Total 30 Contact Lens": {
        "description": "Total 30 Contact Lens is a monthly disposable contact lens with water gradient technology for extended comfort and clear vision.",
        "approved_claims": [
            # Ultimate Comfort & Water Gradient
            "TOTAL30® contact lenses that feel like nothing, even at day 30. In a clinical study wherein patients (n=66) used CLEAR CARE solution for nightly cleaning, disinfecting, and storing; Alcon data on file, 2021.",
            "The first and only monthly replacement Water Gradient contact lenses. Surface property analysis of lehfilcon A lenses out of pack and after 30 days of wear; Alcon data on file, 2021.",
            
            # Water Content & Softness
            "TOTAL30® contact lenses feature a gradual transition in water content, from 55% at the core to nearly 100% water at the outermost surface. 1. In vitro analysis of lens oxygen permeability, water content, and surface imaging; Alcon data on file, 2021. 2. In vitro analysis of lehfilcon A contact lenses outermost surface softness and correlation with water content; Alcon data on file, 2021.",
            "Water Gradient Technology in TOTAL30 contact lenses lasts for a full 30 days. 1. Surface property analysis of lehfilcon A lenses out of pack and after 30 days of wear; Alcon data on file, 2021. 2. Surface observations of lehfilcon A contact lens and human cornea using scanning transmissions electron microscopy; Alcon data on file, 2021.",
            
            # Cleanliness & Deposit Resistance
            "CELLIGENT® Technology creates a dynamic lens surface that biomimics the corneal surface. 1. Shi X, Cantu-Crouch D, Sharma V, et al. Surface characterization of a silicone hydrogel contact lens having bioinspired 2-methacryloyloxyethyl phosphorylcholine polymer layer in hydrated state. Colloids Surf B: Biointerfaces. March 2021;199:111539. 2. Surface observations of lehfilcon A contact lens and human cornea using scanning transmissions electron microscopy; Alcon data on file, 2021.",
            "Helps resist the adherence of bacteria and lipids for a clean lens. In vitro evaluation of bacterial biofilm in commercial lenses; Alcon data on file, 2020.",
            
            # Softness & Lubricity vs. Competitors
            "Water Gradient delivers superior softness and superior lubricity vs. leading reusable lenses. 1. Laboratory analysis of surface modulus of lehfilcon A and commercial lenses using atomic force microscope; Alcon data on file, 2021. 2. Surface lubricity testing of lehfilcon A and commercial lenses using nano-tribometer; Alcon data on file, 2021.",
            
            # Additional Benefits & UV Protection
            "Class 1 UV Blocking delivers the highest level of UV protection available in a monthly replacement lens. Laboratory assessment of ultraviolet and visible light transmission properties of lehfilcon A contact lenses using spectrophotometer; Alcon data on file, 2020.",
            "The first and only monthly replacement Water Gradient toric contact lenses. 1. Shi X, Cantu-Crouch D, Sharma V, et al. Surface characterization of a silicone hydrogel contact lens having bioinspired 2-methacryloyloxyethyl phosphorylcholine polymer layer in hydrated state. Colloids Surf B: Biointerfaces. March 2021;199:111539. 2. Surface property analysis of lehfilcon A lenses out of pack and after 30 days of wear; Alcon data on file, 2021. 3. Surface observations of lehfilcon A contact lens and human cornea using scanning transmissions electron microscopy; Alcon data on file, 2021.",
            
            # Breakthrough Innovation
            "TOTAL30 delivers the only Water Gradient, reusable lens that is clinically shown to feel like nothing, even on day 30. In a clinical study wherein patients (n=66) used CLEAR CARE solution for nightly cleaning, disinfecting, and storing; Alcon data on file, 2021."
        ]
    }
}

FDA_FTC_GUIDELINES = {
    "unsubstantiated_superlatives": {
        "description": "Claims like 'best,' 'most effective,' or 'superior' must be supported by substantial evidence or clinical data.",
        "reference": "https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance",
        "suggestion": "Replace with specific, evidence-based claims like 'clinically proven to improve vision.'",
        "patterns": [r"\bbest\b", r"\bmost effective\b", r"\bsuperior\b", r"\btop\b", r"\bunmatched\b", r"\bleading\b", r"\bultimate\b"]
    },
    "overpromising_outcomes": {
        "description": "Claims promising guaranteed or absolute results (e.g., 'perfect,' 'always') are prohibited without evidence.",
        "reference": "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/medical-device-promotion-advertising",
        "suggestion": "Use conditional language like 'may improve vision clarity.'",
        "patterns": [r"\bperfect\b", r"\bguaranteed\b", r"\balways\b", r"\bcomplete\b", r"\b100%\b", r"\bforever\b"]
    },
    "missing_disclaimers": {
        "description": "Claims must include disclaimers for limitations or risks (e.g., 'consult a doctor,' 'results may vary').",
        "reference": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?CFRPart=801",
        "suggestion": "Add disclaimer: 'Results may vary; consult your eye care professional.'",
        "patterns": []  # Handled by checking for disclaimer presence
    },
    "vague_testimonial": {
        "description": "Vague or testimonial-style claims (e.g., 'amazing,' 'incredible') are not permitted without substantiation.",
        "reference": "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255",
        "suggestion": "Use specific claims like 'designed for comfort.'",
        "patterns": [r"\bamazing\b", r"\bwonderful\b", r"\bfantastic\b", r"\bchanged my life\b", r"\bincredible\b", r"\brevolutionary\b"]
    },
    "incomplete_disclosure": {
        "description": "Claims lacking specificity about conditions, limitations, or patient suitability are non-compliant.",
        "reference": "https://www.fda.gov/medical-devices/overview-device-regulation/device-labeling",
        "suggestion": "Clarify with specific conditions, e.g., 'for suitable patients' or 'for specific prescriptions.'",
        "patterns": []  # Handled by Claude's contextual analysis
    },
    "missing_safety_information": {
        "description": "Claims must include safety information about proper use or risks (e.g., surgical risks, care instructions).",
        "reference": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?CFRPart=801",
        "suggestion": "Add: 'Follow proper care instructions to avoid risks' or 'Consult your doctor for surgical risks.'",
        "patterns": []  # Handled by Claude's contextual analysis
    }
}

SAMPLE_COMPLIANT_TEXT = {
    "Clareon PanOptix IOL": (
        "Clareon PanOptix IOL provides clear vision at near, intermediate, and far distances. "
        "Consult your eye care professional before surgery."
    ),
    "Total 30 Contact Lens": (
        "Total 30 Contact Lens provides clear vision for up to 30 days with water gradient technology. "
        "Consult your eye care professional."
    )
}

SAMPLE_NON_COMPLIANT_TEXT = {
    "Clareon PanOptix IOL": (
        "Clareon PanOptix IOL is the best lens for perfect vision at all distances."
    ),
    "Total 30 Contact Lens": (
        "Total 30 Contact Lens guarantees fantastic comfort and vision forever."
    )
}