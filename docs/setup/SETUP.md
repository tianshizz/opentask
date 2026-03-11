# Setup Guide - Phase 1 MVP

This guide will help you start Opentask Phase 1 MVP version.

## Prerequisites

Ensure you have installed the following software:

- **Node.js** 18+ 
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** and **Docker Compose**
- **PostgreSQL** 14+ (runs via Docker)

## Quick Start

### 1. Automated Installation (Recommended)

```bash
# Grant script execution permission
chmod +x scripts/setup.sh

# Run installation script
./scripts/setup.sh
```

### 2. Manual Installation

If the automated script fails, you can manually execute the following steps:

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker services
docker-compose up -d

# 3. Wait for PostgreSQL to start（about 10 seconds）
sleep 10

# 4. Generate Prisma Client
cd packages/api
pnpm prisma generate

# 5. Run database migrations
pnpm prisma migrate dev --name init

# 6. Populate seed data
pnpm prisma db seed

# 7. Return to root directory
cd ../..
```

## Start Development Server

```bash
# Start all services (API + Web UI)
pnpm dev
```

Services will start on the following ports:

- **API Backend**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs
- **Web UI** (Phase 1 not yet implemented): http://localhost:3001

## Verify Installation

### 1. Check API Health Status

```bash
curl http://localhost:3000/api/v1/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Get Example Tickets

```bash
curl http://localhost:3000/api/v1/tickets
```

Should see pre-populated example tickets.

### 3. Access Swagger Documentation

Open browser and visit: http://localhost:3000/api/docs

You can test all API endpoints here.

## Database Management

### Prisma Studio (Database Visualization Tool)

```bash
pnpm db:studio
```

This will open Prisma Studio at http://localhost:5555, where you can directly view and edit database content.

### Reset Database

```bash
cd packages/api
pnpm prisma migrate reset
cd ../..
```

This will:
1. Delete all data
2. Re-run all migrations
3. Re-populate seed data

## Phase 1 Feature Testing

### 1. Create a Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket from API",
    "description": "Testing the ticket creation",
    "priority": "HIGH",
    "tags": ["test", "api"]
  }'
```

### 2. Update Ticket Status

```bash
curl -X PATCH http://localhost:3000/api/v1/tickets/<TICKET_ID>/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "reason": "Starting work on this"
  }'
```

### 3. Create Attempt

```bash
curl -X POST http://localhost:3000/api/v1/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "<TICKET_ID>",
    "agentId": "<AGENT_ID>",
    "reasoning": "I will analyze the issue first"
  }'
```

### 4. Add Comment

```bash
curl -X POST http://localhost:3000/api/v1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "<TICKET_ID>",
    "authorId": "<ACTOR_ID>",
    "content": "This looks good!",
    "type": "HUMAN_FEEDBACK"
  }'
```

## Phase 1 Completed Features

✅ **Implemented**:
- Ticket CRUD operations
- State machine (status transition validation)
- Attempt logging system
- Comment system
- Actor (Agent and Human) management
- PostgreSQL Database
- Prisma ORM integration
- Swagger API Documentation
- Docker Compose local development environment
- Database seed data

## Next Steps (Phase 1 Remaining Work)

Next to complete:

1. **Web UI (React)**
   - Ticket list page
   - Ticket detail page
   - Status management interface

2. **Python SDK**
   - Basic Client
   - Ticket operations
   - Attempt management

3. **Basic Testing**
   - Unit tests
   - Integration tests

## Common Issues

### PostgreSQL Connection Failed

Ensure Docker containers are running:
```bash
docker-compose ps
```

If not running, start them:
```bash
docker-compose up -d
```

### Prisma Error

Regenerate Prisma Client:
```bash
cd packages/api
pnpm prisma generate
cd ../..
```

### Port in use

If port 3000 is already in use, modify `packages/api/.env`:
```
API_PORT=3001
```

## Development Tools

### Logs

API logs will output directly to console. For detailed logs:

```bash
cd packages/api
LOG_LEVEL=debug pnpm dev
```

### Stop All Services

```bash
# Stop pnpm dev
Ctrl + C

# Stop Docker services
docker-compose down
```

### Clean All Data (including Docker volumes)

```bash
docker-compose down -v
```

## Get Help

- See [MASTER_PLAN.md](./MASTER_PLAN.md) to understand system architecture
- See [docs/api-reference.md](./docs/api-reference.md) for API details
- See example code: [examples/](./examples/)

Happy coding! 🚀
