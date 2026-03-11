# Opentask 🎫🤖

A simple ticket management system designed for AI Agents.

## What is Opentask?

Opentask enables AI Agents to autonomously manage tasks with human oversight. Agents can:
- Create and execute tickets
- Record detailed attempt histories
- Wait for human review and feedback
- Iterate based on feedback until completion
- Work across multiple communication channels (Slack, Discord, Telegram, Web UI)

## Core Concepts

- **Ticket**: A task unit representing work to be done
- **Attempt**: A single execution attempt by an agent, with full logging
- **Comment/Feedback**: Human or agent communication on a ticket
- **Channel**: Abstract communication layer supporting multiple platforms
- **State Machine**: Manages ticket lifecycle and valid transitions

## Quick Start

### Choose Your Installation Method

**🐳 Option 1: Docker (Recommended - Simpler)**

```bash
# Prerequisites: Docker Desktop
# Download: https://www.docker.com/products/docker-desktop

chmod +x scripts/setup.sh
./scripts/setup.sh
pnpm dev
```

**💻 Option 2: Local Installation (No Docker)**

```bash
# macOS Quick Setup
brew install pnpm

# That's it! No database setup needed - SQLite is built-in
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
pnpm dev
```

**Detailed Documentation**:
- 🐳 Docker Setup: [docs/setup/SETUP.md](./docs/setup/SETUP.md)
- 💻 Local Setup: [docs/setup/NO_DOCKER_QUICKSTART.md](./docs/setup/NO_DOCKER_QUICKSTART.md)
- 📊 Installation Comparison: [docs/setup/INSTALL_OPTIONS.md](./docs/setup/INSTALL_OPTIONS.md)

### Using the Agent SDK

**Python:**
```python
from opentask import OpentaskClient

client = OpentaskClient(api_url="http://localhost:3000", agent_id="my-agent")

ticket = client.create_ticket(
    title="Fix login bug",
    description="Users can't login with OAuth"
)

with ticket.attempt() as attempt:
    attempt.log_step("Analyzing auth flow")
    # Do work...
    attempt.complete(outcome="Fixed OAuth redirect URL")

ticket.request_review()
```

**TypeScript:**
```typescript
import { OpentaskClient } from 'opentask-sdk';

const client = new OpentaskClient({ apiUrl: 'http://localhost:3000' });

const ticket = await client.createTicket({
  title: 'Implement feature X',
  description: 'Add new dashboard widget'
});

const attempt = await ticket.startAttempt();
await attempt.logStep('Creating component');
// Do work...
await attempt.complete({ outcome: 'Component created' });

await ticket.requestReview();
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  Channels (Slack, Discord, Telegram, UI)   │
├─────────────────────────────────────────────┤
│           API Gateway & WebSocket           │
├─────────────────────────────────────────────┤
│  Services (Ticket, Attempt, Comment, etc.)  │
├─────────────────────────────────────────────┤
│    PostgreSQL │ Redis │ Queue │ Storage     │
└─────────────────────────────────────────────┘
```

## Project Structure

```
opentask/
├── packages/
│   ├── api/              # Backend API
│   ├── web/              # Web UI
│   ├── sdk-python/       # Python SDK
│   ├── sdk-ts/           # TypeScript SDK
│   └── channels/         # Channel adapters
├── docs/                 # Documentation
├── examples/             # Example agents
└── docker-compose.yml    # Local development setup
```

## 🔗 Integration with OpenClaw

**Opentask** is designed to work seamlessly with [OpenClaw](https://github.com/openclaw/openclaw), an open-source AI agent framework. Together, they provide the best experience for building autonomous AI workflows.

### Why Use Opentask with OpenClaw?

- **Task Orchestration**: OpenClaw agents automatically create and manage tickets in Opentask
- **Human-in-the-Loop**: Opentask provides a structured review and approval workflow
- **Full Observability**: Track every step of your agent's execution with detailed attempt logs
- **Feedback Loop**: Agents learn from human feedback and improve over time


### Best Practices

1. **Use Opentask for Long-Running Tasks**: Complex tasks that require human oversight
2. **Enable Real-time Updates**: Connect Slack/Discord channels for notifications
3. **Review Attempt Logs**: Opentask captures every step for debugging and improvement
4. **Iterate on Feedback**: Use human feedback to refine agent behavior

For more details on integration patterns, see our [documentation](./docs/README.md).

## Documentation

### 📚 [Full Documentation Index](./docs/README.md)

**Quick Links:**
- [🚀 Getting Started](./docs/setup/START_HERE.md) - New users start here
- [🔧 API Reference](./docs/api/API_DOCUMENTATION.md) - REST API documentation
- [🐍 Python SDK Guide](./packages/sdk-python/README.md) - SDK usage guide
- [💬 Slack Setup](./docs/guides/SLACK_SETUP_GUIDE.md) - Slack integration guide

## Roadmap

- [x] Design architecture
- [x] **Phase 1**: Core API and data models (MVP) ✅ **COMPLETED**
  - [x] Backend API (NestJS + Prisma)
  - [x] State machine and business logic
  - [x] Python SDK
  - [x] Database schema and migrations
  - [x] Example agent code
  - [x] Documentation and setup guides
  - [x] Web UI

## Features (Phase 1 MVP)

- ✅ **Core API**: RESTful API for ticket management (NestJS + Prisma)
- ✅ **Ticket Lifecycle**: State machine with automatic transitions
- ✅ **Agent Integration**: Python SDK for AI agents
- ✅ **Web UI**: Modern dashboard and ticket management interface (React + TypeScript)
- ✅ **Attempt Tracking**: Full history of agent attempts with step-by-step logs
- ✅ **Human Feedback**: Comment system for review and approval
- ✅ **Actor Management**: Separate human and agent actors

- [ ] **Phase 2**: Channel integrations (Slack, Discord, Telegram)
- [ ] **Phase 3**: Advanced features (dependencies, analytics)
- [ ] **Phase 4**: Enterprise features (multi-tenancy, advanced permissions)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details

## Contact

- GitHub Issues: [github.com/tianshizz/opentask/issues](https://github.com/tianshizz/opentask/issues)
- GitHub Repo: [github.com/tianshizz/opentask](https://github.com/tianshizz/opentask)

---

Built with ❤️ for the AI Agent community
