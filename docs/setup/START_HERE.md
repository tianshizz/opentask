# 🎉 欢迎Usage Opentask！

## Phase 1 MVP Completed！

你现在拥有一个完整的 AI Agent Ticket 管理系统。这个Documentation将帮助你快速上手。

## 📁 项目结构

```
opentask/
├── packages/
│   ├── api/                    # ✅ NestJS 后端 API
│   │   ├── src/
│   │   │   ├── modules/        # Tickets, Attempts, Comments, Actors
│   │   │   ├── database/       # Prisma Configuration
│   │   │   └── main.ts
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── seed.ts         # 种子数据
│   │
│   └── sdk-python/             # ✅ Python SDK
│       ├── opentask/
│       │   ├── client.py       # 主客户端
│       │   └── models.py       # 数据Model
│       └── setup.py
│
├── docs/
│   ├── api-reference.md        # API Documentation
│   └── database-schema.sql     # Database SQL
│
├── examples/
│   └── simple_agent.py         # ✅ 完整Example
│
├── scripts/
│   └── setup.sh                # 🚀 一键Installation脚本
│
├── MASTER_PLAN.md              # 📋 完整Architecture设计
├── QUICKSTART.md               # ⚡ 5分钟Quick Start
├── SETUP.md                    # 📖 详细InstallationGuide
├── PHASE1_COMPLETE.md          # ✅ Phase 1 CompleteSummary
└── docker-compose.yml          # 🐳 Docker Configuration
```

## 🚀 三步启动

### Step 1: Installation依赖和启动Service

你可以选择两种方式之一：

#### 选项 A: Usage Docker（推荐，更简单）

```bash
# 自动Installation
chmod +x scripts/setup.sh
./scripts/setup.sh
```

这个脚本会：
- ✅ InstallationAll依赖
- ✅ 启动 Docker Service（PostgreSQL, Redis, MinIO）
- ✅ 运行Database迁移
- ✅ 填充Example数据

#### 选项 B: 本地Installation（无需 Docker）

```bash
# 1. 先Installation PostgreSQL 和 Redis
# macOS (推荐Usage Homebrew):
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
createdb opentask

# 2. 运行Installation脚本
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

**📖 详细的本地InstallationGuide**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)

**Windows User**: 请查看 [docs/setup-without-docker.md](./docs/setup-without-docker.md) 了解如何在 Windows 上Installation PostgreSQL 和 Redis

### Step 2: 启动 API Service器

```bash
# 启动DevelopmentService器
pnpm dev
```

访问：
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs

### Step 3: 运行Example Agent

```bash
# Installation Python SDK
cd packages/sdk-python
pip install -e .
cd ../..

# 运行Example
python examples/simple_agent.py
```

## 🎯 核心Features演示

### 1. 通过 API 创建 Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的第一个 Ticket",
    "description": "Test Opentask 系统",
    "priority": "HIGH"
  }'
```

### 2. Usage Python SDK

```python
from opentask import OpentaskClient, TicketPriority

# 创建客户端
client = OpentaskClient(api_url="http://localhost:3000")

# 创建 agent
agent = client.create_agent(name="Test Agent")
client.agent_id = agent.id

# 创建 ticket
ticket = client.create_ticket(
    title="Fix登录 bug",
    priority=TicketPriority.HIGH
)

# 执行任务
with ticket.attempt() as attempt:
    attempt.log_step("分析Issue")
    attempt.log_step("应用Fix")
    attempt.complete("FixComplete！")

# 请求审核
ticket.request_review("请审核我的Fix")
```

### 3. 查看数据（Prisma Studio）

```bash
pnpm db:studio
```

打开 http://localhost:5555 查看All数据。

## 📚 学习资源

### 新手入门
1. **[QUICKSTART.md](./QUICKSTART.md)** - 5 分钟快速上手
2. **[examples/simple_agent.py](./examples/simple_agent.py)** - 完整的Example代码
3. **Swagger UI** - http://localhost:3000/api/docs

### 深入了解
1. **[MASTER_PLAN.md](./MASTER_PLAN.md)** - 系统Architecture和设计理念
2. **[docs/api-reference.md](./docs/api-reference.md)** - 完整 API Documentation
3. **[packages/sdk-python/README.md](./packages/sdk-python/README.md)** - SDK Documentation

### DevelopmentGuide
1. **[SETUP.md](./SETUP.md)** - 详细Installation和Configuration
2. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - 项目结构说明
3. **[PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)** - Phase 1 ImplementationSummary

## 🔧 常用命令

```bash
# 启动AllService
pnpm dev

# Database管理
pnpm db:studio              # 打开Database GUI
pnpm db:migrate             # 运行迁移
pnpm db:seed                # 填充Example数据

# Docker
docker-compose up -d        # 启动Service
docker-compose down         # 停止Service
docker-compose ps           # 查看Status

# Python SDK
cd packages/sdk-python
pip install -e .            # Development模式Installation
pytest                      # 运行Test（如果有）
```

## 💡 下一步做什么？

### 探索系统
- ✅ 打开 Swagger UI 查看All API
- ✅ 运行 `simple_agent.py` 看完整工作流
- ✅ 用 Prisma Studio 查看Database

### 创建自己的 Agent
- ✅ Reference `examples/simple_agent.py`
- ✅ 阅读 [Python SDK Documentation](./packages/sdk-python/README.md)
- ✅ Implementation你的业务逻辑

### 集成到现有系统
- ✅ Usage REST API 集成
- ✅ 或Usage Python SDK
- ✅ 查看 [API Documentation](./docs/api-reference.md)

## 🐛 遇到Issue？

### 检查清单
1. ✅ Docker 是否在运行？`docker-compose ps`
2. ✅ Database是否迁移？`pnpm db:migrate`
3. ✅ EnvironmentVariable是否Configuration？查看 `packages/api/.env`
4. ✅ 依赖是否Installation？`pnpm install`

### 常见Issue
- **端口被占用**: 修改 `packages/api/.env` 中的 `API_PORT`
- **Prisma Error**: 运行 `cd packages/api && pnpm prisma generate`
- **Docker 连接Failed**: `docker-compose down && docker-compose up -d`

### 获取帮助
- 查看 [SETUP.md](./SETUP.md) 的常见Issue部分
- 查看 [GitHub Issues](https://github.com/yourusername/opentask/issues)

## 🎉 Complete Phase 1！

恭喜！你现在拥有：

- ✅ 完整的后端 API（NestJS + Prisma）
- ✅ Python SDK（易于Usage）
- ✅ Database（PostgreSQL + 完整 schema）
- ✅ Example代码和Documentation
- ✅ DevelopmentEnvironment（Docker Compose）

系统现在可以：
- ✅ 创建和管理 Tickets
- ✅ 记录 Agent 执行过程（Attempts）
- ✅ 支持人机协作（审核工作流）
- ✅ Status管理和转换Validation

## 📖 快速Reference

### API 端点
```
POST   /api/v1/tickets                    # 创建 ticket
GET    /api/v1/tickets                    # 列出 tickets
GET    /api/v1/tickets/:id                # 获取 ticket
PATCH  /api/v1/tickets/:id/status         # UpdateStatus
POST   /api/v1/tickets/:id/request-review # 请求审核

POST   /api/v1/attempts                   # 创建 attempt
POST   /api/v1/attempts/:id/steps         # 添加Step
POST   /api/v1/attempts/:id/complete      # Complete attempt

POST   /api/v1/comments                   # 创建评论
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

### Status流转
```
OPEN → IN_PROGRESS → WAITING_REVIEW → COMPLETED → CLOSED
                           ↓
                     NEEDS_REVISION → IN_PROGRESS
```

---

**准备好了吗？开始构建你的 AI Agent 吧！** 🚀

有Issue？查看 [QUICKSTART.md](./QUICKSTART.md) 或 [SETUP.md](./SETUP.md)
