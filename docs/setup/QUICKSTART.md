# Quick StartGuide

This is the quick start guide for Opentask Phase 1 MVP。

## 🚀 5-Minute Quick Start

### Choose Installation Method

#### Method 1: Using Docker (Recommended)

```bash
# Grant execute permission and run installation script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development server
pnpm dev
```

#### Method 2: Local Installation (No Docker)

```bash
# First install PostgreSQL and Redis
# macOS:
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# Create database
createdb opentask

# Run installation script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# Start development server
pnpm dev
```

**Detailed no-Docker installation guide**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)

### 2. Verify System

Open browser and access：
- **API Documentation**: http://localhost:3000/api/docs
- **Database visualization**: Run `pnpm db:studio` then access http://localhost:5555

### 3. RunExample Agent

```bash
# Install Python SDK
cd packages/sdk-python
pip install -e .
cd ../..

# RunExample
python examples/simple_agent.py
```

## 📚 Core Concepts

### Ticket（Task ticket）
- Represents a task to be completed
- Has clear status flow：OPEN → IN_PROGRESS → WAITING_REVIEW → COMPLETED → CLOSED
- Supports priority, tags, and metadata

### Attempt（Attempt）
- Agent Record of each attempt to complete a ticket
- Contains detailed steps
- Can generate artifacts（Artifacts）
- Records execution time, token usage and other metrics

### Comment（Comment）
- Communication between humans and agents
- Supports different types: feedback, updates, status changes

### Actor（Actor）
- HUMAN：Human user
- AGENT：AI Agent

## 🔧 API Usage Examples

### Create Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix login bug",
    "description": "Users cannot login",
    "priority": "HIGH",
    "tags": ["bug", "urgent"]
  }'
```

### View All Tickets

```bash
curl http://localhost:3000/api/v1/tickets
```

### View Specific Ticket

```bash
curl http://localhost:3000/api/v1/tickets/<TICKET_ID>
```

### Update Status

```bash
curl -X PATCH http://localhost:3000/api/v1/tickets/<TICKET_ID>/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "reason": "Starting work"
  }'
```

## 🐍 Python SDK Usage

### Basic Usage

```python
from opentask import OpentaskClient, TicketPriority

# Create client
client = OpentaskClient(api_url="http://localhost:3000")

# Create Agent
agent = client.create_agent(
    name="My Agent",
    email="agent@example.com"
)
client.agent_id = agent.id

# Create Ticket
ticket = client.create_ticket(
    title="Fix bug",
    priority=TicketPriority.HIGH,
    tags=["bug"]
)

# Execute work
with ticket.attempt() as attempt:
    attempt.log_step("Analyzing issue")
    attempt.log_step("Applying fix")
    attempt.complete(outcome="Fixed!")

# Request review
ticket.request_review("Please review my fix")
```

### Context Manager

```python
# Attempt Automatically manages lifecycle
with ticket.attempt() as attempt:
    # Automatically marks as FAILED if exception occurs
    risky_operation()
    attempt.complete("Success!")
```

## 📊 Database Management

### View Data（Prisma Studio）

```bash
pnpm db:studio
```

### Reset Database

```bash
cd packages/api
pnpm prisma migrate reset
cd ../..
```

### Add Example Data

```bash
cd packages/api
pnpm prisma db seed
cd ../..
```

## 🔍 Status Flow

```
OPEN (New)
  ↓
IN_PROGRESS (In Progress)
  ↓
WAITING_REVIEW (Awaiting Review)
  ↓ (Approved)          ↓ (Needs Revision)
COMPLETED         NEEDS_REVISION
  ↓                   ↓
CLOSED          IN_PROGRESS (Restart)
```

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and modify：

```bash
cp .env.example packages/api/.env
```

Main configuration items：
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string  
- `API_PORT`: API service port（default 3000）
- `CORS_ORIGIN`: Allowed CORS origins

## 🐛 Common Issues

### Docker containers not started

```bash
docker-compose up -d
docker-compose ps  # Check status
```

### Prisma client not generated

```bash
cd packages/api
pnpm prisma generate
cd ../..
```

### Port conflict

Modify `packages/api/.env` inof `API_PORT`

### Python SDK import error

```bash
cd packages/sdk-python
pip install -e .  # Install in development mode
cd ../..
```

## 🎯 Next Steps

Now you have completed the Phase 1 MVP setup! Next you can：

1. **Explore API**: Access http://localhost:3000/api/docs
2. **RunExample**: `python examples/simple_agent.py`
3. **Create your own Agent**: Refer to SDK documentation
4. **View Data**: `pnpm db:studio`

## 📖 More Resources

- [Complete documentation](./SETUP.md)
- [Master Plan](./MASTER_PLAN.md)
- [API Reference](./docs/api-reference.md)
- [Python SDK](./packages/sdk-python/README.md)

Happy coding! 🚀
