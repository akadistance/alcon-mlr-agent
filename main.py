'''
Developer: Jason Jiwan
EyeQ - Analyzes marketing content for Alcon product compliance
Date: September 2025
Description: Uses LangChain and Claude 4 Sonnet to analyze promotional text against approved claims and FDA/FTC guidelines,
providing structured feedback for unstructured conversational prompts.'''   

from dotenv import load_dotenv
import os
import re

from agent_runtime import (
    ConversationState,
    agent_executor
)

# Load environment variables
load_dotenv(verbose=True)

# Check for required API key (agent_runtime validates on import as well)
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("Error: ANTHROPIC_API_KEY not found in environment variables.")
    print("Please make sure your .env file contains a valid Anthropic API key.")
    exit(1)
print("API key loaded successfully")

# ConversationState is imported from agent_runtime


# Main conversation loop
def run_conversation():
    """Main conversational interface"""
    print("Initializing conversation state...")
    conversation_state = ConversationState()
    print("Conversation state initialized.")

    while True:
        user_input = input("\nYou: ").strip()

        if not user_input:
            continue

        # Add user message to history
        conversation_state.add_message("user", user_input)
        
        recent_history = [{"role": msg["role"], "content": msg["content"]} for msg in conversation_state.get_recent_messages(limit=10) if msg["content"].strip()]

        # Build context from conversation state and prepend to user input
        from agent_runtime import build_context_string
        context_str = build_context_string(conversation_state)
        
        # Prepend context to user input if context exists
        if context_str and context_str.strip():
            user_input_with_context = f"{context_str}\n\nUser message: {user_input}"
        else:
            user_input_with_context = user_input

        # Stream the response in real-time using callbacks
        print("\nEyeQ: ", end="", flush=True)
        
        full_response = ""
        
        try:
            # Use LLM's streaming callbacks for real token-by-token streaming
            from langchain_core.callbacks import StreamingStdOutCallbackHandler
            
            # Create streaming callback that captures text
            class TokenStreamHandler(StreamingStdOutCallbackHandler):
                def __init__(self):
                    super().__init__()
                    self.text = ""
                
                def on_llm_new_token(self, token: str, **kwargs):
                    """Called when a new token is generated"""
                    print(token, end="", flush=True)
                    self.text += token
            
            handler = TokenStreamHandler()
            
            # Invoke with streaming callback
            response_dict = agent_executor.invoke(
                {
                    "input_text": user_input_with_context,
                    "chat_history": recent_history
                },
                config={"callbacks": [handler]}
            )
            
            # Get the full response from handler
            full_response = handler.text
            
            # If handler didn't capture text, extract from response
            if not full_response:
                if isinstance(response_dict, dict):
                    full_response = response_dict.get('text', str(response_dict))
                else:
                    full_response = str(response_dict)
            
            print()  # New line after streaming
            
        except Exception as e:
            print(f"\n[Streaming error: {e}]")
            print("Falling back to non-streaming...")
            
            # Fallback to non-streaming
            raw_response = agent_executor.invoke({
                "input_text": user_input_with_context,
                "chat_history": recent_history
            })
            
            if isinstance(raw_response, dict):
                full_response = raw_response.get('text', str(raw_response))
            else:
                full_response = str(raw_response)
            
            print(full_response)
        
        response = full_response.strip()
        
        # Ensure valid response
        if not response.strip():
            response = "I apologize, but I didn't generate a proper response. Could you please try again?"
        
        # Store analysis in memory if it was a compliance review
        if any(keyword in user_input.lower() for keyword in ['analyze', 'review', 'check', 'compliance', 'issues', 'find', 'problems', 'errors']):
            # Extract issues from response for memory
            issues = []
            # Try to extract from markdown headers or bullet points
            issue_matches = re.findall(r'[•\-\*]\s*\*\*(.+?)\*\*', response)
            if issue_matches:
                issues = issue_matches
            else:
                # Fallback: try to extract from numbered items
                issue_matches = re.findall(r'\d+\.\s+(.+?)(?:\n|$)', response)
                if issue_matches:
                    issues = [match.split('\n')[0].strip() for match in issue_matches]
            
            # Store in conversation state
            if issues or 'compliance' in response.lower() or 'issue' in response.lower():
                conversation_state.set_last_analysis(
                    analysis_summary=response[:200],  # First 200 chars as summary
                    issues=issues
                )
                print(f"[MEMORY] Stored analysis with {len(issues)} issues")
        
        # Add to conversation history
        if response.strip():
            conversation_state.add_message("assistant", response)

# ComplianceResponse, prompt, llm, and agent setup are imported from agent_runtime

if __name__ == "__main__":
    run_conversation()