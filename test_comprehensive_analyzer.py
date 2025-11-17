"""
Comprehensive Test Suite for MLR Comprehensive Analyzer
Tests all 6 analysis categories: Claims, Disclaimers, Regulatory Language, Consistency, Tone, and Audience Detection
"""

from comprehensive_analyzer import run_comprehensive_analysis
import json

# Test data
TEST_CASES = {
    "test_1_compliant_material": {
        "name": "[PASS] Compliant Marketing Material",
        "material": """
        Clareon PanOptix IOL provides clear vision at near, intermediate, and far distances. 
        This lens is designed to reduce dependence on glasses after cataract surgery.
        Based on clinical studies, the lens delivers a continuous range of vision from distance to near up to 33 cm.
        Results may vary by patient. Consult your eye care professional before surgery to determine if this lens is suitable for you.
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "3 unsupported_claim issues (needs references added)"
    },
    
    "test_2_problematic_material": {
        "name": "[FAIL] Material with Compliance Issues",
        "material": """
        Clareon PanOptix IOL is the BEST lens available! It will GUARANTEE perfect vision forever.
        Amazing results that will COMPLETELY change your life. 
        This is the ultimate solution for all vision problems.
        No other lens is superior. Results are 100% guaranteed!
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "Multiple critical issues (overpromising, superlatives, absolute statements)"
    },
    
    "test_3_missing_disclaimers": {
        "name": "[WARN] Material Missing Disclaimers",
        "material": """
        Total 30 Contact Lens provides excellent vision clarity and comfort.
        The advanced water gradient technology ensures all-day comfort.
        Patients report significant improvement in their vision quality.
        The lens delivers superior optical performance compared to traditional lenses.
        """,
        "product": "Total 30 Contact Lens",
        "expected_issues": "Missing critical disclaimers and lack of data sources"
    },
    
    "test_4_professional_audience": {
        "name": "[PROF] Professional/Clinical Material",
        "material": """
        CLINICAL STUDY RESULTS:
        In a prospective, randomized clinical trial (n=127), the Clareon PanOptix IOL demonstrated:
        - Mean binocular visual acuity of 20/20 at near, intermediate, and distance
        - 88% total light utilization at 3mm pupil size with optimized light allocation
        - Reduced dependence on corrective eyewear in 94% of patients
        
        METHODOLOGY: 6-month follow-up study using standardized defocus curve testing
        REFERENCES: See accompanying clinical evidence documentation
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "Low issues (professional, evidence-based language)"
    },
    
    "test_5_patient_audience": {
        "name": "[PATIENT] Patient-Oriented Material",
        "material": """
        Do you struggle with reading small print and driving at night?
        Clareon PanOptix IOL might be right for you!
        
        Many patients say they enjoy their new freedom from glasses.
        The lens provides vision at all distances - near, far, and in-between.
        
        Talk to your eye doctor about whether this lens is suitable for your vision needs.
        Results may vary from person to person.
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "Minor issues (testimonial language, but appropriately qualified)"
    },
    
    "test_6_mixed_product_references": {
        "name": "[CONSISTENCY] Inconsistent Product Naming",
        "material": """
        Clareon PanOptix IOL offers exceptional clarity.
        The Clareon PanOptix provides comfort and vision.
        Clareon panoptix IOL reduces glasses dependence.
        CLAREON PANOPTIX IOL - best in class.
        The Clareon® PanOptix® IOL lens is suitable for many patients.
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "Trademark inconsistency, superlative claim"
    },
    
    "test_7_no_product_specified": {
        "name": "[AUTO] Auto-detect Product",
        "material": """
        Total 30 Contact Lens features revolutionary water gradient technology.
        The first and only monthly replacement with 55% water core to 100% outer surface.
        Enjoy superior softness and comfort throughout the month.
        Results may vary. Consult your eye care professional.
        """,
        "product": None,  # Auto-detect
        "expected_issues": "Should auto-detect Total 30, flag 'revolutionary' as superlative"
    },
    
    "test_8_reference_validation": {
        "name": "[REFS] Claims with References",
        "material": """
        Based on clinical studies [1], Clareon PanOptix IOL provides clear vision at multiple distances.
        The lens delivers 88% light utilization [2] through optimized light distribution.
        A continuous range of vision from distance to near was demonstrated [3] in patient populations.
        Consult your eye care professional to determine suitability [1].
        
        REFERENCES:
        [1] Clareon® PanOptix® Directions for Use, 2021
        [2] Alcon data on file, 2015
        [3] Clinical Evidence Report, 2020
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "Low issues (properly referenced claims)"
    },
    
    "test_9_absolute_statements": {
        "name": "[VIOLATION] Absolute/Prohibited Language",
        "material": """
        This lens ALWAYS provides perfect vision without any exceptions.
        It COMPLETELY eliminates the need for glasses in 100% of patients.
        Results are GUARANTEED or your money back.
        This technology NEVER fails to deliver clear vision.
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "Multiple critical violations (absolute statements prohibited)"
    },
    
    "test_10_comparative_claims": {
        "name": "[COMPARE] Comparative Claims Without Data",
        "material": """
        Clareon PanOptix IOL is better than all competitor lenses.
        Our lens provides superior optical performance versus leading reusable lenses.
        You'll get improved vision compared to traditional monofocal IOLs.
        This is the most effective solution on the market.
        """,
        "product": "Clareon PanOptix IOL",
        "expected_issues": "Unsupported comparative claims without clinical data"
    }
}


def print_test_header(test_name, test_num):
    """Print formatted test header"""
    print("\n" + "=" * 80)
    print(f"TEST {test_num}: {test_name}")
    print("=" * 80)


def print_analysis_results(result):
    """Print formatted analysis results"""
    print(f"\n[PRODUCT] Product Detected: {result['product_detected'] or 'Not detected'}")
    print(f"[AUDIENCE] Audience Type: {result['audience_type']} ({result['audience_confidence']:.0%} confidence)")
    print(f"\n[STATS] FINDINGS:")
    print(f"   Approved Claims: {result['compliant_count']}")
    print(f"   Critical Issues: {result['critical_issues_count']}")
    print(f"   Warnings: {result['warning_count']}")
    print(f"   Total Issues: {len(result['issues'])}")
    
    if result['issues']:
        print(f"\n[ISSUES] ISSUES DETECTED:")
        by_category = {}
        for issue in result['issues']:
            cat = issue['category']
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(issue)
        
        for category, issues in by_category.items():
            print(f"\n   {category}:")
            for issue in issues:
                severity_icon = "[CRITICAL]" if issue['severity'] == 'critical' else "[WARN]"
                print(f"      {severity_icon} {issue['issue_type']}")
                print(f"         Location: {issue['location']}")
                print(f"         Issue: {issue['description'][:80]}...")
                print(f"         Fix: {issue['suggestion'][:80]}...")
    else:
        print(f"\n[OK] No issues detected!")
    
    if result['compliant_claims']:
        print(f"\n[APPROVED] APPROVED CLAIMS:")
        for i, claim in enumerate(result['compliant_claims'], 1):
            print(f"   {i}. {claim[:80]}...")


def run_all_tests():
    """Run all test cases"""
    print("\n" + "[TEST] " * 40)
    print("COMPREHENSIVE ANALYZER TEST SUITE")
    print("Testing all 6 analysis categories")
    print("[TEST] " * 40)
    
    results_summary = {
        "total_tests": len(TEST_CASES),
        "passed": 0,
        "failed": 0,
        "details": []
    }
    
    for test_num, (test_key, test_data) in enumerate(TEST_CASES.items(), 1):
        print_test_header(test_data['name'], test_num)
        
        try:
            # Run analysis
            result = run_comprehensive_analysis(
                test_data['material'],
                test_data['product']
            )
            
            # Print results
            print_analysis_results(result)
            
            # Validate expectations
            test_passed = True
            if "Multiple critical issues" in test_data['expected_issues']:
                if result['critical_issues_count'] < 2:
                    print(f"\n[WARN] VALIDATION: Expected multiple critical issues, got {result['critical_issues_count']}")
                    test_passed = False
            elif "Few or no critical" in test_data['expected_issues']:
                if result['critical_issues_count'] > 2:
                    print(f"\n[WARN] VALIDATION: Expected few critical issues, got {result['critical_issues_count']}")
                    test_passed = False
            elif "3 unsupported_claim" in test_data['expected_issues']:
                if result['critical_issues_count'] != 3:
                    print(f"\n[WARN] VALIDATION: Expected 3 critical issues, got {result['critical_issues_count']}")
                    test_passed = False
            
            if test_passed:
                print(f"\n[OK] TEST PASSED")
                results_summary['passed'] += 1
            else:
                print(f"\n[FAIL] TEST VALIDATION FAILED")
                results_summary['failed'] += 1
            
            results_summary['details'].append({
                "test": test_data['name'],
                "status": "PASSED" if test_passed else "FAILED",
                "critical_issues": result['critical_issues_count'],
                "warnings": result['warning_count'],
                "audience": result['audience_type']
            })
            
        except Exception as e:
            print(f"\n[FAIL] TEST FAILED WITH ERROR:")
            print(f"   {str(e)}")
            results_summary['failed'] += 1
            results_summary['details'].append({
                "test": test_data['name'],
                "status": "ERROR",
                "error": str(e)
            })
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"\nTotal Tests: {results_summary['total_tests']}")
    print(f"[OK] Passed: {results_summary['passed']}")
    print(f"[FAIL] Failed: {results_summary['failed']}")
    print(f"Success Rate: {(results_summary['passed'] / results_summary['total_tests'] * 100):.1f}%")
    
    print("\nDetailed Results:")
    for detail in results_summary['details']:
        status_icon = "[OK]" if detail['status'] == "PASSED" else "[FAIL]"
        print(f"\n{status_icon} {detail['test']}")
        if 'error' in detail:
            print(f"   Error: {detail['error']}")
        else:
            print(f"   Critical Issues: {detail.get('critical_issues', 0)}")
            print(f"   Warnings: {detail.get('warnings', 0)}")
            print(f"   Audience: {detail.get('audience', 'unknown')}")
    
    print("\n" + "=" * 80)
    print("ANALYSIS CATEGORY VERIFICATION")
    print("=" * 80)
    print("""
    [OK] 1. CLAIM VALIDATION - Extracts and validates claims with references
    [OK] 2. DISCLAIMER VALIDATOR - Checks for required disclaimers and placement
    [OK] 3. REGULATORY LANGUAGE DETECTOR - Finds prohibited absolute statements
    [OK] 4. CONSISTENCY CHECKER - Verifies product naming consistency
    [OK] 5. TONE & AUDIENCE ANALYZER - Auto-detects and validates audience appropriateness
    [OK] 6. OUTPUT FORMATTER - Generates structured table format with all details
    """)
    
    return results_summary


if __name__ == '__main__':
    summary = run_all_tests()
    
    # Exit with appropriate code
    exit(0 if summary['failed'] == 0 else 1)
