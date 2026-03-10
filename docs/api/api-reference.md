# Opentask API Reference

Base URL: `http://localhost:3000/api/v1`

## Authentication

All API requests require authentication using either:
- **JWT Token**: For human users
- **API Key**: For AI agents

### Headers

```http
Authorization: Bearer <jwt_token>
# OR
X-API-Key: <api_key>
X-Agent-ID: <agent_id>
```

---

## Tickets API

### Create Ticket

```http
POST /tickets
Content-Type: application/json

{
  "title": "Fix authentication bug",
  "description": "Users cannot login with OAuth",
  "priority": "high",
  "tags": ["bug", "auth"],
  "channelId": "uuid",
  "channelType": "slack"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Fix authentication bug",
  "description": "Users cannot login with OAuth",
  "status": "open",
  "priority": "high",
  "createdBy": {
    "id": "...",
    "type": "agent",
    "name": "GPT-4 Agent"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Get Ticket

```http
GET /tickets/:id
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Fix authentication bug",
  "status": "in_progress",
  "priority": "high",
  "assignedAgent": {
    "id": "...",
    "name": "Code Fixer Agent"
  },
  "attempts": [
    {
      "id": "...",
      "attemptNumber": 1,
      "status": "success",
      "startedAt": "2024-01-15T10:35:00Z",
      "completedAt": "2024-01-15T10:45:00Z"
    }
  ],
  "comments": [
    {
      "id": "...",
      "type": "agent_update",
      "content": "Starting analysis...",
      "author": { "name": "Code Fixer Agent" },
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

### List Tickets

```http
GET /tickets?status=open&priority=high&page=1&limit=20&sortBy=createdAt&order=desc
```

**Query Parameters:**
- `status`: Filter by status (open, in_progress, waiting_review, etc.)
- `priority`: Filter by priority (low, medium, high, urgent)
- `assignedAgentId`: Filter by assigned agent
- `tags`: Filter by tags (comma-separated)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (createdAt, updatedAt, priority)
- `order`: Sort order (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Update Ticket Status

```http
PATCH /tickets/:id/status
Content-Type: application/json

{
  "status": "waiting_review",
  "reason": "All fixes applied, ready for review"
}
```

**Valid Status Transitions:**
- `open` → `in_progress`, `cancelled`
- `in_progress` → `waiting_review`, `blocked`, `cancelled`
- `waiting_review` → `completed`, `needs_revision`, `in_progress`
- `needs_revision` → `in_progress`, `cancelled`
- `completed` → `closed`, `needs_revision`

### Request Review

```http
POST /tickets/:id/request-review
Content-Type: application/json

{
  "message": "I've fixed all the issues. Please review the changes.",
  "highlights": [
    "Added OAuth error handling",
    "Implemented redirect validation"
  ]
}
```

### Approve Ticket

```http
POST /tickets/:id/approve
Content-Type: application/json

{
  "message": "Looks good! Approved.",
  "metadata": {
    "reviewedBy": "user@example.com",
    "reviewDuration": 300
  }
}
```

### Request Revision

```http
POST /tickets/:id/request-revision
Content-Type: application/json

{
  "message": "Please add unit tests for the OAuth flow.",
  "requiredChanges": [
    "Add unit tests",
    "Update documentation"
  ]
}
```

---

## Attempts API

### Create Attempt

```http
POST /tickets/:ticketId/attempts
Content-Type: application/json

{
  "reasoning": "I will analyze the OAuth flow and identify the bug."
}
```

**Response:**
```json
{
  "id": "...",
  "ticketId": "...",
  "attemptNumber": 1,
  "status": "running",
  "reasoning": "I will analyze the OAuth flow and identify the bug.",
  "startedAt": "2024-01-15T10:35:00Z"
}
```

### Add Step to Attempt

```http
POST /attempts/:attemptId/steps
Content-Type: application/json

{
  "action": "Analyzing auth.py",
  "input": {
    "file": "src/auth.py",
    "method": "static_analysis"
  },
  "status": "running"
}
```

### Update Step

```http
PATCH /attempts/:attemptId/steps/:stepId
Content-Type: application/json

{
  "status": "completed",
  "output": {
    "issuesFound": 3,
    "suggestions": ["Add error handling", "Validate redirect URL"]
  }
}
```

### Log Tool Call

```http
POST /attempts/:attemptId/tool-calls
Content-Type: application/json

{
  "toolName": "read_file",
  "parameters": {
    "path": "src/auth.py"
  },
  "result": {
    "content": "...",
    "lines": 150
  },
  "executionTimeMs": 45
}
```

### Upload Artifact

```http
POST /attempts/:attemptId/artifacts
Content-Type: multipart/form-data

file: <binary>
name: "oauth_fix.patch"
artifactType: "patch"
metadata: {"linesChanged": 25}
```

**Response:**
```json
{
  "id": "...",
  "attemptId": "...",
  "name": "oauth_fix.patch",
  "artifactType": "patch",
  "storagePath": "s3://bucket/artifacts/...",
  "sizeBytes": 1024,
  "url": "https://...",
  "createdAt": "2024-01-15T10:40:00Z"
}
```

### Complete Attempt

```http
POST /attempts/:attemptId/complete
Content-Type: application/json

{
  "status": "success",
  "outcome": "Successfully fixed OAuth redirect bug",
  "summary": {
    "filesModified": ["src/auth.py"],
    "testsAdded": 3,
    "confidence": 0.9
  }
}
```

---

## Comments API

### Add Comment

```http
POST /tickets/:ticketId/comments
Content-Type: application/json

{
  "content": "I've reviewed the changes and they look good.",
  "type": "human_feedback",
  "mentionedAttemptId": "uuid"
}
```

### Reply to Comment

```http
POST /tickets/:ticketId/comments
Content-Type: application/json

{
  "content": "Thank you! I'll add the tests now.",
  "type": "agent_update",
  "replyToCommentId": "uuid"
}
```

### Get Comments

```http
GET /tickets/:ticketId/comments?page=1&limit=50
```

---

## WebSocket Events

Connect to: `ws://localhost:3000/ws`

### Subscribe to Ticket Updates

```javascript
socket.emit('subscribe', {
  ticketId: '550e8400-e29b-41d4-a716-446655440000'
});
```

### Events Received

#### Ticket Status Changed
```json
{
  "event": "ticket.status_changed",
  "data": {
    "ticketId": "...",
    "oldStatus": "in_progress",
    "newStatus": "waiting_review",
    "changedBy": { "name": "Agent" },
    "timestamp": "2024-01-15T10:45:00Z"
  }
}
```

#### New Attempt Started
```json
{
  "event": "attempt.started",
  "data": {
    "ticketId": "...",
    "attemptId": "...",
    "attemptNumber": 2,
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

#### Step Completed
```json
{
  "event": "attempt.step_completed",
  "data": {
    "attemptId": "...",
    "stepId": "...",
    "action": "Analyzing code",
    "status": "completed",
    "timestamp": "2024-01-15T11:02:00Z"
  }
}
```

#### New Comment
```json
{
  "event": "comment.created",
  "data": {
    "ticketId": "...",
    "commentId": "...",
    "type": "human_feedback",
    "author": { "name": "John Doe" },
    "content": "Looks good!",
    "timestamp": "2024-01-15T11:10:00Z"
  }
}
```

---

## Agent SDK Usage

### Python SDK

```python
from opentask import OpentaskClient, TicketStatus

client = OpentaskClient(
    api_url="http://localhost:3000",
    api_key="your-api-key"
)

# Create ticket
ticket = client.create_ticket(
    title="Fix bug",
    description="Bug description",
    priority="high"
)

# Start attempt
with ticket.attempt() as attempt:
    # Log steps
    attempt.log_step("Analyzing code")
    
    # Call tools
    code = attempt.call_tool("read_file", path="app.py")
    
    # Upload artifacts
    attempt.add_artifact("fix.patch", patch_content)
    
    # Complete
    attempt.complete(
        outcome="Bug fixed",
        confidence=0.9
    )

# Request review
ticket.request_review("Please review the fix")

# Wait for feedback (blocking)
feedback = ticket.wait_for_feedback(timeout=3600)

# Or use callback
ticket.on_feedback(lambda fb: print(f"Received: {fb}"))
```

### TypeScript SDK

```typescript
import { OpentaskClient } from 'opentask-sdk';

const client = new OpentaskClient({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// Create ticket
const ticket = await client.createTicket({
  title: 'Fix bug',
  description: 'Bug description',
  priority: 'high'
});

// Start attempt
const attempt = await ticket.startAttempt();

// Log steps
await attempt.logStep('Analyzing code');

// Upload artifacts
await attempt.addArtifact('fix.patch', patchContent);

// Complete
await attempt.complete({
  outcome: 'Bug fixed',
  confidence: 0.9
});

// Request review
await ticket.requestReview('Please review the fix');

// Subscribe to feedback
ticket.onFeedback((feedback) => {
  console.log('Received feedback:', feedback);
});
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot transition from 'closed' to 'in_progress'",
    "details": {
      "currentStatus": "closed",
      "requestedStatus": "in_progress"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `PERMISSION_DENIED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Ticket/Attempt not found
- `INVALID_STATUS_TRANSITION` - Invalid status change
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limits

- **Agent API**: 1000 requests per minute
- **Human API**: 100 requests per minute
- **WebSocket**: 10 subscriptions per connection

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705318800
```

---

## Pagination

All list endpoints support pagination:

```
?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## Filtering & Sorting

### Filter Operators

```
?status=in:open,in_progress
?priority=eq:high
?createdAt=gte:2024-01-01T00:00:00Z
?tags=contains:bug
```

### Sort

```
?sortBy=createdAt&order=desc
?sortBy=priority,createdAt&order=desc,asc
```

---

## Webhooks (Coming Soon)

Subscribe to events via webhooks:

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["ticket.status_changed", "attempt.completed"],
  "secret": "your-webhook-secret"
}
```

Webhook payload:
```json
{
  "event": "ticket.status_changed",
  "data": {...},
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "sha256=..."
}
```

---

## Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "database": "connected",
  "redis": "connected",
  "storage": "connected"
}
```

---

For more details, see the [OpenAPI specification](./openapi.yaml).
