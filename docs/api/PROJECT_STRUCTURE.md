# Project Structure

This document outlines the recommended directory structure for the Opentask project.

## Monorepo Structure

```
opentask/
│
├── packages/                      # Monorepo packages
│   │
│   ├── api/                       # Backend API (NestJS/FastAPI)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── tickets/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   └── tickets.module.ts
│   │   │   │   ├── attempts/
│   │   │   │   ├── comments/
│   │   │   │   ├── channels/
│   │   │   │   ├── actors/
│   │   │   │   └── auth/
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── pipes/
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   └── storage.config.ts
│   │   │   │
│   │   │   ├── database/
│   │   │   │   ├── migrations/
│   │   │   │   ├── seeds/
│   │   │   │   └── prisma.service.ts
│   │   │   │
│   │   │   ├── workers/
│   │   │   │   ├── notification.worker.ts
│   │   │   │   └── analytics.worker.ts
│   │   │   │
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   │
│   │   ├── test/
│   │   │   ├── e2e/
│   │   │   └── unit/
│   │   │
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   │
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                       # Frontend Web UI (React)
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   └── assets/
│   │   │
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Input/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   └── Layout/
│   │   │   │   │
│   │   │   │   ├── tickets/
│   │   │   │   │   ├── TicketList/
│   │   │   │   │   ├── TicketDetail/
│   │   │   │   │   ├── TicketForm/
│   │   │   │   │   └── TicketCard/
│   │   │   │   │
│   │   │   │   ├── attempts/
│   │   │   │   │   ├── AttemptTimeline/
│   │   │   │   │   ├── AttemptDetails/
│   │   │   │   │   └── StepViewer/
│   │   │   │   │
│   │   │   │   └── comments/
│   │   │   │       ├── CommentList/
│   │   │   │       └── CommentForm/
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Tickets/
│   │   │   │   ├── TicketDetail/
│   │   │   │   ├── Analytics/
│   │   │   │   └── Settings/
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useTickets.ts
│   │   │   │   ├── useAttempts.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── useAuth.ts
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── slices/
│   │   │   │   │   ├── ticketSlice.ts
│   │   │   │   │   ├── attemptSlice.ts
│   │   │   │   │   └── userSlice.ts
│   │   │   │   └── store.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   ├── websocket.ts
│   │   │   │   └── storage.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── constants.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── ticket.ts
│   │   │   │   ├── attempt.ts
│   │   │   │   └── common.ts
│   │   │   │
│   │   │   ├── App.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tailwind.config.js
│   │
│   ├── sdk-python/                # Python SDK for AI Agents
│   │   ├── opentask/
│   │   │   ├── __init__.py
│   │   │   ├── client.py
│   │   │   ├── models/
│   │   │   │   ├── ticket.py
│   │   │   │   ├── attempt.py
│   │   │   │   ├── comment.py
│   │   │   │   └── enums.py
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── tickets.py
│   │   │   │   ├── attempts.py
│   │   │   │   └── comments.py
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── http.py
│   │   │   │   ├── serialization.py
│   │   │   │   └── logging.py
│   │   │   │
│   │   │   └── exceptions.py
│   │   │
│   │   ├── tests/
│   │   ├── examples/
│   │   ├── setup.py
│   │   ├── pyproject.toml
│   │   └── README.md
│   │
│   ├── sdk-ts/                    # TypeScript/JavaScript SDK
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── models/
│   │   │   ├── api/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   │
│   │   ├── tests/
│   │   ├── examples/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── channels/                  # Channel Adapters
│       ├── slack/
│       │   ├── src/
│       │   │   ├── adapter.ts
│       │   │   ├── handlers/
│       │   │   ├── formatters/
│       │   │   └── index.ts
│       │   └── package.json
│       │
│       ├── discord/
│       │   └── ...
│       │
│       └── telegram/
│           └── ...
│
├── docs/                          # Documentation
│   ├── api/
│   │   ├── openapi.yaml
│   │   └── README.md
│   │
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── agent-integration.md
│   │   ├── channel-setup.md
│   │   └── deployment.md
│   │
│   ├── architecture/
│   │   ├── system-design.md
│   │   ├── data-flow.md
│   │   └── security.md
│   │
│   └── database-schema.sql
│
├── examples/                      # Example implementations
│   ├── agents/
│   │   ├── simple_agent.py
│   │   ├── code_reviewer_agent.py
│   │   └── data_analyst_agent.py
│   │
│   ├── integrations/
│   │   ├── slack_bot.py
│   │   └── discord_bot.py
│   │
│   └── workflows/
│       ├── bug_fix_workflow.py
│       └── feature_dev_workflow.py
│
├── scripts/                       # Utility scripts
│   ├── init-db.sql
│   ├── seed-data.ts
│   ├── migrate.sh
│   └── deploy.sh
│
├── infra/                         # Infrastructure as Code
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── kubernetes/
│   │   ├── api-deployment.yaml
│   │   ├── web-deployment.yaml
│   │   └── ingress.yaml
│   │
│   └── helm/
│       └── opentask/
│
├── .github/                       # GitHub configurations
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   │
│   └── ISSUE_TEMPLATE/
│
├── docker-compose.yml             # Local development
├── docker-compose.prod.yml        # Production configuration
├── .env.example                   # Environment variables template
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── package.json                   # Root package.json (monorepo)
├── pnpm-workspace.yaml            # PNPM workspace config
├── turbo.json                     # Turborepo config
├── MASTER_PLAN.md                 # High-level architecture plan
├── PROJECT_STRUCTURE.md           # This file
├── README.md                      # Project README
├── CONTRIBUTING.md                # Contribution guidelines
└── LICENSE                        # License file
```

## Key Directories Explained

### `/packages/api`
Backend APIService，处理All业务逻辑、Database操作和外部集成。

**核心模块**:
- `tickets/`: Ticket CRUD 和Status管理
- `attempts/`: Agent 执行尝试的记录和查询
- `comments/`: 评论和反馈系统
- `channels/`: 多渠道抽象和适配器管理
- `actors/`: User和 Agent 管理
- `auth/`: Authentication和Authorization

### `/packages/web`
React 前端应用，提供人类User界面。

**关键Features**:
- Dashboard: OverviewAll tickets Status
- Ticket 详情页: 查看完整的 attempts、comments、artifacts
- 实时Update: WebSocket 连接显示 Agent 实时进度
- 审核界面: 批准/拒绝 tickets，提供反馈

### `/packages/sdk-python` & `/packages/sdk-ts`
简化 Agent Development的 SDK。

**主要Features**:
- 简洁的 API 封装
- 类型安全
- 自动重试和Error处理
- 流式日志记录
- Context manager 支持 (Python)

### `/packages/channels`
各个通信渠道的适配器Implementation。

**每个适配器需要Implementation**:
- 发送消息到渠道
- 监听来自渠道的消息
- 格式化 ticket 通知
- 处理交互 (buttons, reactions)

### `/docs`
完整的Documentation，包括 API 规范、UsageGuide、Architecture说明。

### `/examples`
实际可运行的Example，帮助User快速上手。

### `/infra`
基础设施代码，支持 Terraform 和 Kubernetes 部署。

## Technology Stack Summary

### Backend
- **Runtime**: Node.js 18+ (TypeScript) or Python 3.10+
- **Framework**: NestJS or FastAPI
- **ORM**: Prisma or TypeORM
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **Queue**: BullMQ or Celery
- **Storage**: MinIO (S3-compatible)

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI**: shadcn/ui + TailwindCSS
- **State**: Zustand or Redux Toolkit
- **Icons**: Lucide React
- **Real-time**: Socket.io-client

### Infrastructure
- **Container**: Docker
- **Orchestration**: Kubernetes
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK
- **CI/CD**: GitHub Actions

## Development Workflow

1. **Local Setup**: `docker-compose up -d`
2. **Database Migration**: `npm run migrate`
3. **Seed Data**: `npm run seed`
4. **Start Dev**: `npm run dev` (starts all services)
5. **Run Tests**: `npm run test`
6. **Build**: `npm run build`
7. **Deploy**: `npm run deploy`

## Package Management

Using **PNPM workspaces** for monorepo management:

```json
{
  "name": "opentask",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

## Build System

Using **Turborepo** for fast, efficient builds:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}
```

## Environment Management

Each package has its own `.env` file:
- `packages/api/.env`
- `packages/web/.env`

Root `.env` for shared configurations.

## Next Steps

1. Set up the monorepo structure
2. Initialize each package with basic scaffolding
3. Implement core data models (Prisma schema)
4. Build API endpoints for Ticket CRUD
5. Create basic Web UI
6. Develop Python SDK
7. Implement first channel adapter (Slack)

Refer to [MASTER_PLAN.md](./MASTER_PLAN.md) for the detailed roadmap.
