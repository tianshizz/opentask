# 🎉 Welcome to Opentask！

## Phase 1 MVP Completed！

You now have a complete AI Agent Ticket management system. This documentation will help you get started quickly。

## 📁 Project Structure

```
opentask/
├── packages/
│   ├── api/                    # ✅ NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/        # Tickets, Attempts, Comments, Actors
│   │   │   ├── database/       # Prisma Configuration
│   │   │   └── main.ts
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── seed.ts         # Seed data
│   │
│   └── sdk-python/             # ✅ Python SDK
│       ├── opentask/
│       │   ├── client.py       # Main client
│       │   └── models.py       # Data models
│       └── setup.py
│
├── docs/
│   ├── api-reference.md        # API Documentation
│   └── database-schema.sql     # Database SQL
│
├── examples/
│   └── simple_agent.py         # ✅ Complete example
│
├── scripts/
│   └── setup.sh                # 🚀 One-click installation script
│
├── MASTER_PLAN.md              # 📋 Complete architecture design
├── QUICKSTART.md               # ⚡ 5minute quick start
├── SETUP.md                    # 📖 Detailed installation guide
├── PHASE1_COMPLETE.md          # ✅ Phase 1 completion summary
└── docker-compose.yml          # 🐳 Docker Configuration
```

## 🚀 Three Steps to Start

### Step 1: Install Dependencies and Start Services

You can choose one of two methods：

#### Option A: Usage Docker（Recommended, simpler）

```bash
# Automated installation
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This script will：
- ✅ Install all dependencies
- ✅ Start Docker services（PostgreSQL, Redis, MinIO）
- ✅ Run database migrations
- ✅ Populate example data

#### Option B: Local Installation (No Docker)

```bash
# 1. First install PostgreSQL and Redis
# macOS (Recommended: use Homebrew):
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
createdb opentask

# 2. Run installation script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

**📖 Detailed local installation guide**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)

**Windows Users**: Please see [docs/setup-without-docker.md](./docs/setup-without-docker.md) to learn how to install on Windows PostgreSQL and Redis

### Step 2: Start API Server

```bash
# Start development server
pnpm dev
```

Access：
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs

### Step 3: Run Example Agent

```bash
# Install Python SDK
cd packages/sdk-python
pip install -e .
cd ../..

# Run example
python examples/simple_agent.py
```

## 🎯 Core Features Demo

### 1. Create Ticket via API

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Ticket",
    "description": "Test Opentask system",
    "priority": "HIGH"
  }'
```

### 2. Usage Python SDK

```python
from opentask import OpentaskClient, TicketPriority

# Create client
client = OpentaskClient(api_url="http://localhost:3000")

# Create agent
agent = client.create_agent(name="Test Agent")
client.agent_id = agent.id

# Create ticket
ticket = client.create_ticket(
    title="Fix login bug",
    priority=TicketPriority.HIGH
)

# Execute task
with ticket.attempt() as attempt:
    attempt.log_step("Analyzing issue")
    attempt.log_step("Applying fix")
    attempt.complete("Fix complete！")

# Request review
ticket.request_review("Please review my fix")
```

### 3. View Data（Prisma Studio）

```bash
pnpm db:studio
```

Open http://localhost:5555 view all data。

## 📚 Learning Resources

### Getting Started
1. **[QUICKSTART.md](./QUICKSTART.md)** - 5 分钟Quick start
2. **[examples/simple_agent.py](./examples/simple_agent.py)** - Complete example code
3. **Swagger UI** - http://localhost:3000/api/docs

### In-Depth Learning
1. **[MASTER_PLAN.md](./MASTER_PLAN.md)** - System architecture and design philosophy
2. **[docs/api-reference.md](./docs/api-reference.md)** - Complete API documentation
3. **[packages/sdk-python/README.md](./packages/sdk-python/README.md)** - SDK documentation

### Development Guide
1. **[SETUP.md](./SETUP.md)** - Detailed installation and configuration
2. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Project Structure说明
3. **[PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)** - Phase 1 implementation summary

## 🔧 Common Commands

```bash
# Start all services
pnpm dev

# Database management
pnpm db:studio              # OpenDatabase GUI
pnpm db:migrate             # Run migrations
pnpm db:seed                # Populate example data

# Docker
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose ps           # Check status

# Python SDK
cd packages/sdk-python
pip install -e .            # Install in development mode
pytest                      # Run tests（if available）
```

## 💡 What to Do Next？

### Explore the System
- ✅ Open Swagger UI view all APIs
- ✅ Run `simple_agent.py` see complete workflow
- ✅ view database with Prisma Studio

### Create Your Own Agent
- ✅ Reference `examples/simple_agent.py`
- ✅ Read [Python SDK documentation](./packages/sdk-python/README.md)
- ✅ Implement your business logic

### Integrate into Existing System
- ✅ Integrate using REST API
- ✅ or use Python SDK
- ✅ 查看 [API Documentation](./docs/api-reference.md)

## 🐛 Encountering Issues？

### Checklist
1. ✅ Docker running？`docker-compose ps`
2. ✅ Database migrated？`pnpm db:migrate`
3. ✅ Environment variables configured？查看 `packages/api/.env`
4. ✅ Dependencies installed？`pnpm install`

### Common Issues
- **Port in use**: Modify `packages/api/.env` in `API_PORT`
- **Prisma Error**: Run `cd packages/api && pnpm prisma generate`
- **Docker Connection failed**: `docker-compose down && docker-compose up -d`

### Get Help
- 查看 [SETUP.md](./SETUP.md) ofCommon Issues部分
- 查看 [GitHub Issues](https://github.com/yourusername/opentask/issues)

## 🎉 Phase 1 Complete！

Congratulations! You now have：

- ✅ 完整ofBackend API（NestJS + Prisma）
- ✅ Python SDK（Easy to use）
- ✅ Database（PostgreSQL + Complete schema）
- ✅ Example code and documentation
- ✅ Development environment（Docker Compose）

The system can now：
- ✅ Create and manage tickets
- ✅ Record agent execution process（Attempts）
- ✅ Support human-agent collaboration (review workflow)
- ✅ Status management and transition validation

## 📖 Quick Reference

### API Endpoints
```
POST   /api/v1/tickets                    # Create ticket
GET    /api/v1/tickets                    # List tickets
GET    /api/v1/tickets/:id                # Get ticket
PATCH  /api/v1/tickets/:id/status         # Update status
POST   /api/v1/tickets/:id/request-review # Request review

POST   /api/v1/attempts                   # Create attempt
POST   /api/v1/attempts/:id/steps         # Add step
POST   /api/v1/attempts/:id/complete      # Complete attempt

POST   /api/v1/comments                   # Create comment
```

### Python SDK
```python
client = OpentaskClient(api_url="http://localhost:3000")
ticket = client.create_ticket(title="Task", priority=TicketPriority.HIGH)
with ticket.attempt() as attempt:
    attempt.log_step("Working...")
    attempt.complete("Done!")
ticket.request_review("Please review")
```

### Status Flow
```
OPEN → IN_PROGRESS → WAITING_REVIEW → COMPLETED → CLOSED
                           ↓
                     NEEDS_REVISION → IN_PROGRESS
```

---

**Ready? Start building your AI Agent！** 🚀

Have issues?查看 [QUICKSTART.md](./QUICKSTART.md) or [SETUP.md](./SETUP.md)
