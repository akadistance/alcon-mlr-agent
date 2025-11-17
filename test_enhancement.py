"""
Test script for EyeQ conversational intelligence enhancements
Demonstrates the new 5-stage conversation flow
"""

from agent_runtime import (
    ConversationState,
    agent_executor,
    build_context_string
)

def print_separator(title=""):
    """Print a visual separator"""
    print("\n" + "="*80)
    if title:
        print(f"  {title}")
        print("="*80)
    print()

def test_stage_1_greeting():
    """Test Stage 1: Greeting/Initial Interaction"""
    print_separator("STAGE 1: Greeting/Initial Interaction")
    
    conversation_state = ConversationState()
    user_input = "Hi"
    
    print(f"User: {user_input}")
    print("\nExpected Behavior:")
    print("  - Natural introduction as EyeQ")
    print("  - Mentions MLR compliance/Alcon")
    print("  - Asks what they need help with")
    print("  - Brief and conversational")
    print("\nAgent Response:")
    print("-" * 80)
    
    conversation_state.add_message("user", user_input)
    recent_history = conversation_state.get_recent_messages(limit=10)
    context_str = build_context_string(conversation_state)
    
    response = agent_executor.invoke({
        "input_text": user_input,
        "chat_history": recent_history,
        "context": context_str
    })
    
    response_text = response.get('text', str(response))
    print(response_text)
    print("-" * 80)
    
    conversation_state.add_message("assistant", response_text)
    return conversation_state

def test_stage_2_content_sharing(conversation_state):
    """Test Stage 2: File Upload/Content Sharing"""
    print_separator("STAGE 2: Content Sharing")
    
    promotional_text = """
TOTAL30® contact lenses that feel like nothing, even at day 30.

Experience the breakthrough Water Gradient Technology that delivers superior comfort 
and exceptional performance throughout the entire month.

Key Benefits:
- Unmatched comfort that lasts
- Crystal clear vision
- Breathable design for healthier eyes
"""
    
    user_input = f"Here's a promotional piece I'm working on:\n\n{promotional_text}"
    
    print(f"User: [Shares promotional content about TOTAL30]")
    print("\nExpected Behavior:")
    print("  - Acknowledges receipt (1-2 sentences)")
    print("  - Briefly describes what it sees")
    print("  - Asks what they want to do with it")
    print("  - Does NOT immediately analyze")
    print("\nAgent Response:")
    print("-" * 80)
    
    conversation_state.add_message("user", user_input)
    conversation_state.set_uploaded_content(promotional_text)
    recent_history = conversation_state.get_recent_messages(limit=10)
    context_str = build_context_string(conversation_state)
    
    response = agent_executor.invoke({
        "input_text": user_input,
        "chat_history": recent_history,
        "context": context_str
    })
    
    response_text = response.get('text', str(response))
    print(response_text)
    print("-" * 80)
    
    conversation_state.add_message("assistant", response_text)
    return conversation_state

def test_stage_3_analysis(conversation_state):
    """Test Stage 3: Analysis Request"""
    print_separator("STAGE 3: Analysis Request")
    
    user_input = "Please analyze this for compliance issues"
    
    print(f"User: {user_input}")
    print("\nExpected Behavior:")
    print("  - Structured format with ## headers")
    print("  - Document Overview section")
    print("  - Compliance Strengths (prose)")
    print("  - Compliance Concerns (High/Medium priority)")
    print("  - Reference Integrity check")
    print("  - Recommendations (numbered)")
    print("  - Overall Assessment")
    print("\nAgent Response:")
    print("-" * 80)
    
    conversation_state.add_message("user", user_input)
    recent_history = conversation_state.get_recent_messages(limit=10)
    context_str = build_context_string(conversation_state)
    
    response = agent_executor.invoke({
        "input_text": user_input,
        "chat_history": recent_history,
        "context": context_str
    })
    
    response_text = response.get('text', str(response))
    print(response_text)
    print("-" * 80)
    
    # Since we're calling agent_executor directly (not through main.py),
    # we need to manually store the analysis in memory
    # (In production, main.py and web_backend.py do this automatically)
    import re
    issues = []
    # Try to extract from markdown headers or bullet points
    issue_matches = re.findall(r'[•\-\*]\s*\*\*(.+?)\*\*', response_text)
    if issue_matches:
        issues = issue_matches
    else:
        # Fallback: try to extract from numbered items
        issue_matches = re.findall(r'\d+\.\s+(.+?)(?:\n|$)', response_text)
        if issue_matches:
            issues = [match.split('\n')[0].strip() for match in issue_matches]
    
    # Store in conversation state
    if issues or 'compliance' in response_text.lower() or 'issue' in response_text.lower():
        conversation_state.set_last_analysis(
            analysis_summary=response_text[:200],
            issues=issues
        )
        print(f"\n[MEMORY] Stored analysis with {len(issues)} issues")
    
    conversation_state.add_message("assistant", response_text)
    
    # Verify memory was stored
    if conversation_state.has_recent_analysis():
        last_analysis = conversation_state.get_last_analysis()
        print(f"✅ [VERIFIED] Analysis stored in memory: {len(last_analysis.get('issues', []))} issues")
    else:
        print(f"⚠️ [WARNING] Analysis was NOT stored in memory")
    
    return conversation_state

def test_stage_4_followup(conversation_state):
    """Test Stage 4: Follow-Up Questions"""
    print_separator("STAGE 4: Follow-Up Questions")
    
    user_input = "Why is the 'feels like nothing' claim problematic?"
    
    print(f"User: {user_input}")
    print("\nExpected Behavior:")
    print("  - Conversational prose response")
    print("  - Explains the WHY")
    print("  - References FDA/FTC principles")
    print("  - Provides specific fix suggestions")
    print("  - NO bullet points, minimal formatting")
    print("  - Natural language")
    print("\nAgent Response:")
    print("-" * 80)
    
    conversation_state.add_message("user", user_input)
    recent_history = conversation_state.get_recent_messages(limit=10)
    context_str = build_context_string(conversation_state)
    
    response = agent_executor.invoke({
        "input_text": user_input,
        "chat_history": recent_history,
        "context": context_str
    })
    
    response_text = response.get('text', str(response))
    print(response_text)
    print("-" * 80)
    
    conversation_state.add_message("assistant", response_text)
    return conversation_state

def test_stage_5_casual(conversation_state):
    """Test Stage 5: Casual Conversation"""
    print_separator("STAGE 5: Casual Conversation")
    
    user_input = "Thanks for the help!"
    
    print(f"User: {user_input}")
    print("\nExpected Behavior:")
    print("  - Natural, friendly response")
    print("  - No formatting")
    print("  - Example: 'You're welcome! Let me know if you need anything else.'")
    print("\nAgent Response:")
    print("-" * 80)
    
    conversation_state.add_message("user", user_input)
    recent_history = conversation_state.get_recent_messages(limit=10)
    context_str = build_context_string(conversation_state)
    
    response = agent_executor.invoke({
        "input_text": user_input,
        "chat_history": recent_history,
        "context": context_str
    })
    
    response_text = response.get('text', str(response))
    print(response_text)
    print("-" * 80)
    
    conversation_state.add_message("assistant", response_text)
    return conversation_state

def test_context_memory(conversation_state):
    """Test context memory - agent should remember previous analysis"""
    print_separator("BONUS: Context Memory Test")
    
    user_input = "What were the main issues you found?"
    
    print(f"User: {user_input}")
    print("\nExpected Behavior:")
    print("  - References previous analysis")
    print("  - Doesn't repeat entire analysis")
    print("  - Summarizes key findings")
    print("  - Shows it remembers context")
    print("\nAgent Response:")
    print("-" * 80)
    
    conversation_state.add_message("user", user_input)
    recent_history = conversation_state.get_recent_messages(limit=10)
    context_str = build_context_string(conversation_state)
    
    print(f"[DEBUG] Context string being sent: {context_str}\n")
    
    response = agent_executor.invoke({
        "input_text": user_input,
        "chat_history": recent_history,
        "context": context_str
    })
    
    response_text = response.get('text', str(response))
    print(response_text)
    print("-" * 80)

def main():
    """Run all enhancement tests"""
    print("\n" + "█"*80)
    print("  EyeQ CONVERSATIONAL INTELLIGENCE TEST SUITE")
    print("  Testing 5-Stage Conversation Flow + Context Memory")
    print("█"*80)
    
    # Run tests in sequence (simulating a real conversation)
    conv_state = test_stage_1_greeting()
    conv_state = test_stage_2_content_sharing(conv_state)
    conv_state = test_stage_3_analysis(conv_state)
    conv_state = test_stage_4_followup(conv_state)
    conv_state = test_stage_5_casual(conv_state)
    test_context_memory(conv_state)
    
    print_separator("ALL TESTS COMPLETED")
    print("✅ All 6 tests executed successfully!")
    print("\nReview the responses above to verify:")
    print("  1. Natural greeting with variation")
    print("  2. Content acknowledgment without immediate analysis")
    print("  3. Structured analysis format with headers")
    print("  4. Conversational follow-up explanation")
    print("  5. Casual, friendly response")
    print("  6. Context memory (remembers previous analysis)")
    print("\n")

if __name__ == "__main__":
    import sys
    import os
    
    # Make sure we're in the right directory
    if not os.path.exists("agent_runtime.py"):
        print("❌ Error: Please run this script from the MLR-Pre-Screening directory")
        print(f"Current directory: {os.getcwd()}")
        sys.exit(1)
    
    # Check for API key
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ Error: ANTHROPIC_API_KEY not found in .env file")
        sys.exit(1)
    
    print("✅ Environment validated")
    print(f"✅ API key found (length: {len(api_key)})")
    
    # Run tests
    main()

