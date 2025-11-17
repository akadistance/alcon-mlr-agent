"""
Collaboration Features
Enables team collaboration on compliance reviews with comments, sharing, and export
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import os

# In-memory storage for demo (in production, use a database)
collaboration_data = {
    "shared_analyses": {},
    "comments": {},
    "review_workflows": {}
}

def create_shareable_link(
    conversation_id: str,
    messages: List[Dict[str, Any]],
    analysis_summary: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a shareable link for a conversation/analysis
    
    Args:
        conversation_id: Unique conversation identifier
        messages: List of conversation messages
        analysis_summary: Optional analysis results summary
        
    Returns:
        Dictionary with share_id and shareable_url
    """
    share_id = str(uuid.uuid4())
    
    shared_content = {
        "share_id": share_id,
        "conversation_id": conversation_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "messages": messages,
        "analysis_summary": analysis_summary,
        "comments": [],
        "permissions": {
            "can_comment": True,
            "can_export": True,
            "can_edit": False
        }
    }
    
    collaboration_data["shared_analyses"][share_id] = shared_content
    
    return {
        "share_id": share_id,
        "shareable_url": f"/shared/{share_id}",
        "expires_at": None,  # Can implement expiration logic
        "permissions": shared_content["permissions"]
    }

def add_comment(
    share_id: str,
    user_name: str,
    comment_text: str,
    message_index: Optional[int] = None
) -> Dict[str, Any]:
    """
    Add a comment to a shared analysis
    
    Args:
        share_id: Shared analysis identifier
        user_name: Name of the commenter
        comment_text: Comment content
        message_index: Optional index of message being commented on
        
    Returns:
        Comment object with metadata
    """
    if share_id not in collaboration_data["shared_analyses"]:
        raise ValueError(f"Shared analysis {share_id} not found")
    
    comment_id = str(uuid.uuid4())
    comment = {
        "comment_id": comment_id,
        "user_name": user_name,
        "comment_text": comment_text,
        "message_index": message_index,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "replies": []
    }
    
    collaboration_data["shared_analyses"][share_id]["comments"].append(comment)
    
    return comment

def add_reply(
    share_id: str,
    comment_id: str,
    user_name: str,
    reply_text: str
) -> Dict[str, Any]:
    """
    Add a reply to an existing comment
    
    Args:
        share_id: Shared analysis identifier
        comment_id: Comment to reply to
        user_name: Name of the replier
        reply_text: Reply content
        
    Returns:
        Reply object with metadata
    """
    if share_id not in collaboration_data["shared_analyses"]:
        raise ValueError(f"Shared analysis {share_id} not found")
    
    shared_analysis = collaboration_data["shared_analyses"][share_id]
    
    for comment in shared_analysis["comments"]:
        if comment["comment_id"] == comment_id:
            reply = {
                "reply_id": str(uuid.uuid4()),
                "user_name": user_name,
                "reply_text": reply_text,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            comment["replies"].append(reply)
            return reply
    
    raise ValueError(f"Comment {comment_id} not found")

def get_shared_analysis(share_id: str) -> Dict[str, Any]:
    """
    Retrieve a shared analysis with all comments
    
    Args:
        share_id: Shared analysis identifier
        
    Returns:
        Complete shared analysis object
    """
    if share_id not in collaboration_data["shared_analyses"]:
        raise ValueError(f"Shared analysis {share_id} not found")
    
    return collaboration_data["shared_analyses"][share_id]

def create_review_workflow(
    conversation_id: str,
    reviewers: List[Dict[str, str]],
    review_type: str = "compliance"
) -> Dict[str, Any]:
    """
    Create a review workflow for team collaboration
    
    Args:
        conversation_id: Conversation being reviewed
        reviewers: List of reviewer dictionaries with name and role
        review_type: Type of review (compliance, legal, medical)
        
    Returns:
        Workflow object with tracking information
    """
    workflow_id = str(uuid.uuid4())
    
    workflow = {
        "workflow_id": workflow_id,
        "conversation_id": conversation_id,
        "review_type": review_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "reviewers": [
            {
                "name": reviewer["name"],
                "role": reviewer.get("role", "reviewer"),
                "status": "pending",
                "reviewed_at": None,
                "decision": None,
                "comments": []
            }
            for reviewer in reviewers
        ],
        "final_decision": None
    }
    
    collaboration_data["review_workflows"][workflow_id] = workflow
    
    return workflow

def submit_review(
    workflow_id: str,
    reviewer_name: str,
    decision: str,
    comments: str
) -> Dict[str, Any]:
    """
    Submit a review decision in a workflow
    
    Args:
        workflow_id: Workflow identifier
        reviewer_name: Name of the reviewer
        decision: Review decision (approved/rejected/needs_revision)
        comments: Review comments
        
    Returns:
        Updated workflow object
    """
    if workflow_id not in collaboration_data["review_workflows"]:
        raise ValueError(f"Workflow {workflow_id} not found")
    
    workflow = collaboration_data["review_workflows"][workflow_id]
    
    for reviewer in workflow["reviewers"]:
        if reviewer["name"] == reviewer_name:
            reviewer["status"] = "reviewed"
            reviewer["reviewed_at"] = datetime.now(timezone.utc).isoformat()
            reviewer["decision"] = decision
            reviewer["comments"] = comments
            break
    
    # Check if all reviewers have completed
    all_reviewed = all(r["status"] == "reviewed" for r in workflow["reviewers"])
    
    if all_reviewed:
        # Determine final decision
        decisions = [r["decision"] for r in workflow["reviewers"]]
        if all(d == "approved" for d in decisions):
            workflow["final_decision"] = "approved"
        elif any(d == "rejected" for d in decisions):
            workflow["final_decision"] = "rejected"
        else:
            workflow["final_decision"] = "needs_revision"
        
        workflow["status"] = "completed"
    
    return workflow

def export_conversation(
    conversation_id: str,
    messages: List[Dict[str, Any]],
    format: str = "json"
) -> str:
    """
    Export a conversation in various formats
    
    Args:
        conversation_id: Conversation identifier
        messages: List of conversation messages
        format: Export format (json, markdown, pdf)
        
    Returns:
        Exported content as string
    """
    if format == "json":
        return json.dumps({
            "conversation_id": conversation_id,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "messages": messages
        }, indent=2)
    
    elif format == "markdown":
        md_lines = [
            f"# EyeQ Conversation Export",
            f"**Conversation ID:** {conversation_id}",
            f"**Exported:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
            "",
            "---",
            ""
        ]
        
        for msg in messages:
            role = "**User**" if msg.get("type") == "user" else "**EyeQ**"
            content = msg.get("content", "")
            timestamp = msg.get("timestamp", "")
            
            md_lines.append(f"### {role} {f'({timestamp})' if timestamp else ''}")
            md_lines.append(content)
            md_lines.append("")
            
            # Include analysis if present
            if msg.get("analysis"):
                md_lines.append("**Analysis Results:**")
                analysis = msg["analysis"]
                
                if analysis.get("approved_claims"):
                    md_lines.append("\n**Approved Claims:**")
                    for claim in analysis["approved_claims"]:
                        md_lines.append(f"- {claim}")
                
                if analysis.get("issues"):
                    md_lines.append("\n**Compliance Issues:**")
                    for issue in analysis["issues"]:
                        md_lines.append(f"- **{issue.get('issue', 'Issue')}**: {issue.get('description', '')}")
                
                md_lines.append("")
            
            md_lines.append("---")
            md_lines.append("")
        
        return "\n".join(md_lines)
    
    else:
        raise ValueError(f"Unsupported export format: {format}")

def get_collaboration_stats(conversation_id: str) -> Dict[str, Any]:
    """
    Get collaboration statistics for a conversation
    
    Args:
        conversation_id: Conversation identifier
        
    Returns:
        Statistics dictionary with shares, comments, reviews, etc.
    """
    # Find all shares for this conversation
    shares = [
        share for share in collaboration_data["shared_analyses"].values()
        if share["conversation_id"] == conversation_id
    ]
    
    # Find all workflows for this conversation
    workflows = [
        workflow for workflow in collaboration_data["review_workflows"].values()
        if workflow["conversation_id"] == conversation_id
    ]
    
    # Count comments across all shares
    total_comments = sum(len(share["comments"]) for share in shares)
    
    # Count active reviews
    active_reviews = sum(1 for workflow in workflows if workflow["status"] == "pending")
    completed_reviews = sum(1 for workflow in workflows if workflow["status"] == "completed")
    
    return {
        "conversation_id": conversation_id,
        "shares_count": len(shares),
        "total_comments": total_comments,
        "active_reviews": active_reviews,
        "completed_reviews": completed_reviews,
        "last_activity": max(
            [share["created_at"] for share in shares] + 
            [workflow["created_at"] for workflow in workflows],
            default=datetime.now(timezone.utc).isoformat()
        )
    }

def format_collaboration_summary(stats: Dict[str, Any]) -> str:
    """
    Format collaboration statistics into a readable summary
    
    Args:
        stats: Statistics from get_collaboration_stats()
        
    Returns:
        Formatted markdown summary
    """
    summary = []
    summary.append("## Collaboration Summary")
    summary.append("")
    summary.append(f"- **Shared Links:** {stats['shares_count']}")
    summary.append(f"- **Team Comments:** {stats['total_comments']}")
    summary.append(f"- **Active Reviews:** {stats['active_reviews']}")
    summary.append(f"- **Completed Reviews:** {stats['completed_reviews']}")
    summary.append(f"- **Last Activity:** {stats['last_activity'][:19].replace('T', ' ')}")
    summary.append("")
    
    if stats['active_reviews'] > 0:
        summary.append("⏳ Reviews in progress - check back for team feedback")
    elif stats['completed_reviews'] > 0:
        summary.append("✅ All reviews completed")
    else:
        summary.append("💡 Share this analysis with your team for collaborative review")
    
    return "\n".join(summary)

