# Opentask Python SDK

Python SDK for the Opentask AI Agent Ticket Management System.

## Installation

```bash
pip install opentask
```

Or for development:

```bash
cd packages/sdk-python
pip install -e .
```

## Quick Start

```python
from opentask import OpentaskClient, TicketPriority

# Initialize client
client = OpentaskClient(
    api_url="http://localhost:3000",
    agent_id="your-agent-id"
)

# Create a ticket
ticket = client.create_ticket(
    title="Fix authentication bug",
    description="Users cannot login with OAuth",
    priority=TicketPriority.HIGH,
    tags=["bug", "auth"]
)

# Work on the ticket with an attempt
with ticket.attempt() as attempt:
    # Log steps
    attempt.log_step("Analyzing auth flow")
    attempt.log_step("Identified issue in token validation")
    
    # Add artifacts
    attempt.add_artifact("fix.patch", patch_content, "patch")
    
    # Complete the attempt
    attempt.complete(
        outcome="Fixed token validation logic",
        confidence=0.9
    )

# Request review
ticket.request_review("I've fixed the issue. Please review.")

# Check status
ticket.refresh()
print(f"Ticket status: {ticket.status}")
```

## Advanced Usage

### Managing Ticket Status

```python
from opentask import TicketStatus

# Update ticket status
ticket.update_status(TicketStatus.IN_PROGRESS, reason="Starting work")

# Later...
ticket.update_status(TicketStatus.WAITING_REVIEW)
```

### Working with Attempts

```python
# Get all attempts for a ticket
attempts = ticket.get_attempts()

for attempt in attempts:
    print(f"Attempt #{attempt.attempt_number}: {attempt.status}")
    print(f"  Outcome: {attempt.outcome}")
    print(f"  Steps: {len(attempt.steps)}")
```

### Adding Comments

```python
# Add a comment
ticket.add_comment("Working on this issue now", comment_type="AGENT_UPDATE")

# Get all comments
comments = ticket.get_comments()
for comment in comments:
    print(f"{comment.author.name}: {comment.content}")
```

### Listing Tickets

```python
# List all open tickets
result = client.list_tickets(status=TicketStatus.OPEN, page=1, limit=20)

for ticket_data in result["data"]:
    print(f"#{ticket_data.id}: {ticket_data.title}")

# Pagination info
print(f"Page {result['pagination']['page']} of {result['pagination']['totalPages']}")
```

### Error Handling

```python
try:
    ticket = client.create_ticket(title="My ticket")
    with ticket.attempt() as attempt:
        # If an exception occurs, attempt is marked as FAILED automatically
        risky_operation()
        attempt.complete("Success!")
except Exception as e:
    print(f"Error: {e}")
```

## API Reference

### OpentaskClient

Main client class for interacting with the API.

#### Methods

- `create_ticket(title, description=None, priority=MEDIUM, tags=None, assigned_agent_id=None, metadata=None)` - Create a new ticket
- `get_ticket(ticket_id)` - Get a ticket by ID
- `list_tickets(status=None, priority=None, assigned_agent_id=None, page=1, limit=20)` - List tickets
- `create_agent(name, email=None, metadata=None)` - Create a new agent
- `get_actor(actor_id)` - Get an actor by ID

### TicketProxy

Proxy object for interacting with a specific ticket.

#### Methods

- `refresh()` - Refresh ticket data from server
- `attempt()` - Create a new attempt context manager
- `update_status(status, reason=None)` - Update ticket status
- `request_review(message)` - Request human review
- `add_comment(content, comment_type="AGENT_UPDATE")` - Add a comment
- `get_attempts()` - Get all attempts
- `get_comments()` - Get all comments

### AttemptContext

Context manager for creating and managing an attempt.

#### Methods

- `log_step(action, input_data=None, output_data=None)` - Log a step
- `add_artifact(name, content, artifact_type="file")` - Add an artifact
- `complete(outcome, status=SUCCESS, confidence=None)` - Complete the attempt

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run type checking
mypy opentask

# Format code
black opentask
```

## License

MIT
