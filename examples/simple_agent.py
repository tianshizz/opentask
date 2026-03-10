"""
Simple Agent Example - Demonstrates basic usage of Opentask

This example shows how an AI agent can:
1. Create a ticket
2. Execute work with multiple attempts
3. Request human review
4. Handle feedback and iterate
"""

import sys
import os

# Add SDK to path for development
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'packages', 'sdk-python'))

from opentask import OpentaskClient, TicketPriority, AttemptStatus
import time


def analyze_code(file_path: str) -> dict:
    """Simulate code analysis"""
    return {
        "issues": ["Missing error handling", "No input validation"],
        "suggestions": ["Add try-catch blocks", "Validate user input"]
    }


def apply_fix(issue: str) -> str:
    """Simulate applying a fix"""
    return f"Fixed: {issue}"


def main():
    # Initialize the client
    # First, create an agent if needed
    client = OpentaskClient(
        api_url="http://localhost:3000",
        agent_id=None,  # Will be set after creating agent
    )
    
    # Create or get agent
    try:
        agent = client.create_agent(
            name="Code Fixer Agent",
            email="codefixer@agents.local",
            metadata={"capabilities": ["bug_fixing", "code_analysis"]}
        )
        client.agent_id = agent.id
        print(f"✅ Agent created: {agent.name} ({agent.id})")
    except Exception:
        # Agent might already exist, use a default one
        client.agent_id = "00000000-0000-0000-0000-000000000001"
    
    print("🤖 Starting AI Agent...")
    
    # Step 1: Create a ticket
    print("\n📝 Creating ticket...")
    ticket = client.create_ticket(
        title="Fix security vulnerabilities in auth.py",
        description="""
        Security scan detected issues in the authentication module:
        - Missing error handling in login function
        - No input validation for user credentials
        - Potential SQL injection vulnerability
        """,
        priority=TicketPriority.HIGH,
        tags=["security", "bug", "auth"],
        metadata={
            "source": "security_scan",
            "severity": "critical"
        }
    )
    print(f"✅ Ticket created: {ticket.id}")
    
    # Step 2: Start working on the ticket
    print(f"\n🔧 Starting work on ticket {ticket.id}...")
    from opentask import TicketStatus
    ticket.update_status(TicketStatus.IN_PROGRESS)
    
    # Attempt 1: Initial analysis and fix
    print("\n📊 Attempt 1: Analyzing and fixing issues...")
    with ticket.attempt() as attempt:
        attempt.log_step(
            "Analyzing auth.py",
            details={"file": "src/auth.py", "lines": 1234}
        )
        
        # Simulate code analysis
        time.sleep(1)
        analysis = analyze_code("src/auth.py")
        
        attempt.log_step(
            "Issues identified",
            details=analysis
        )
        
        # Apply fixes
        for issue in analysis["issues"]:
            attempt.log_step(f"Applying fix for: {issue}")
            fix = apply_fix(issue)
            attempt.add_artifact(
                name=f"fix_{issue.replace(' ', '_')}.patch",
                content=fix,
                artifact_type="patch"
            )
        
        attempt.complete(
            outcome="Applied fixes for all identified issues",
            status=AttemptStatus.SUCCESS,
            confidence=0.85
        )
    
    print("✅ Attempt 1 completed")
    
    # Step 3: Request human review
    print("\n👀 Requesting human review...")
    ticket.request_review(
        message="""
        I've analyzed the authentication module and applied fixes for:
        1. Added try-catch blocks for error handling
        2. Implemented input validation for user credentials
        3. Used parameterized queries to prevent SQL injection
        
        All changes have been tested. Please review the attached patches.
        """,
        artifacts_summary=[
            "fix_Missing_error_handling.patch",
            "fix_No_input_validation.patch"
        ]
    )
    
    print(f"📬 Ticket #{ticket.id} is now waiting for review")
    print("   Status:", ticket.status)
    
    # Step 4: Wait for feedback (in a real scenario, this would be event-driven)
    print("\n⏳ In real scenario, would wait for human feedback via webhooks...")
    print("   For this demo, simulating feedback...\n")
    
    # For this example, we'll simulate receiving feedback
    print("📨 Simulated feedback from human reviewer:")
    simulated_feedback = {
        "status": "needs_revision",
        "comment": "Good work! But please also add unit tests for the validation logic.",
    }
    print(f"   Comment: {simulated_feedback['comment']}")
    
    # Step 5: Handle feedback and iterate
    if simulated_feedback["status"] == "needs_revision":
        print("\n🔄 Starting Attempt 2 based on feedback...")
        ticket.update_status(TicketStatus.IN_PROGRESS)
        
        with ticket.attempt() as attempt:
            attempt.log_step(
                "Processing feedback",
                details=simulated_feedback
            )
            
            attempt.log_step("Creating unit tests for validation logic")
            
            # Simulate test creation
            test_code = """
def test_input_validation():
    assert validate_username("valid_user") == True
    assert validate_username("invalid@user") == False
    assert validate_password("Str0ng!Pass") == True
    assert validate_password("weak") == False
"""
            
            attempt.add_artifact(
                name="test_auth_validation.py",
                content=test_code,
                artifact_type="test"
            )
            
            attempt.log_step("Running tests", details={"passed": 4, "failed": 0})
            
            attempt.complete(
                outcome="Added comprehensive unit tests for validation logic",
                status=AttemptStatus.SUCCESS,
                confidence=0.95
            )
        
        print("✅ Attempt 2 completed")
        
        # Request review again
        print("\n👀 Requesting review again...")
        ticket.request_review(
            message="I've added unit tests as requested. All tests are passing with 95% coverage."
        )
    
    # Step 6: Approval and completion
    print("\n✅ In real scenario, human would approve via UI...")
    print("   For this demo, showing final state\n")
    
    # Refresh ticket to get latest data
    ticket.refresh()
    
    print("🎉 Demo workflow complete!")
    
    # Step 7: Display summary
    attempts = ticket.get_attempts()
    comments = ticket.get_comments()
    
    print("\n📊 Summary:")
    print(f"   - Ticket ID: {ticket.id}")
    print(f"   - Title: {ticket.ticket.title}")
    print(f"   - Priority: {ticket.ticket.priority}")
    print(f"   - Status: {ticket.status}")
    print(f"   - Attempts: {len(attempts)}")
    print(f"   - Comments: {len(comments)}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Agent interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise
