# Quick StartGuide

这是 Opentask Phase 1 MVP 的Quick StartGuide。

## 🚀 5 分钟快速启动

### 选择Installation方式

#### 方式 1: Usage Docker（推荐）

```bash
# 赋予执行Permission并运行Installation脚本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 启动DevelopmentService器
pnpm dev
```

#### 方式 2: 本地Installation（无 Docker）

```bash
# 先Installation PostgreSQL 和 Redis
# macOS:
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# 创建Database
createdb opentask

# 运行Installation脚本
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 启动DevelopmentService器
pnpm dev
```

**详细的无 Docker InstallationGuide**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)

### 2. Validation系统

打开浏览器访问：
- **API Documentation**: http://localhost:3000/api/docs
- **Database可视化**: 运行 `pnpm db:studio` 然后访问 http://localhost:5555

### 3. 运行Example Agent

```bash
# Installation Python SDK
cd packages/sdk-python
pip install -e .
cd ../..

# 运行Example
python examples/simple_agent.py
```

## 📚 核心概念

### Ticket（任务单）
- 代表一个需要Complete的任务
- 有明确的Status流转：OPEN → IN_PROGRESS → WAITING_REVIEW → COMPLETED → CLOSED
- 支持优先级、标签、元数据

### Attempt（尝试）
- Agent 每attemptsComplete Ticket 的记录
- 包含详细的Step（Steps）
- 可以生成工件（Artifacts）
- 记录执行时间、token Usage量等指标

### Comment（评论）
- 人类和 Agent 之间的沟通
- 支持不同类型：反馈、Update、Status变更

### Actor（参与者）
- HUMAN：人类User
- AGENT：AI Agent

## 🔧 API UsageExample

### 创建 Ticket

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

### 查看All Tickets

```bash
curl http://localhost:3000/api/v1/tickets
```

### 查看特定 Ticket

```bash
curl http://localhost:3000/api/v1/tickets/<TICKET_ID>
```

### UpdateStatus

```bash
curl -X PATCH http://localhost:3000/api/v1/tickets/<TICKET_ID>/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "reason": "Starting work"
  }'
```

## 🐍 Python SDK Usage

### 基础Usage

```python
from opentask import OpentaskClient, TicketPriority

# 创建客户端
client = OpentaskClient(api_url="http://localhost:3000")

# 创建 Agent
agent = client.create_agent(
    name="My Agent",
    email="agent@example.com"
)
client.agent_id = agent.id

# 创建 Ticket
ticket = client.create_ticket(
    title="Fix bug",
    priority=TicketPriority.HIGH,
    tags=["bug"]
)

# 执行工作
with ticket.attempt() as attempt:
    attempt.log_step("Analyzing issue")
    attempt.log_step("Applying fix")
    attempt.complete(outcome="Fixed!")

# 请求审核
ticket.request_review("Please review my fix")
```

### 上下文管理器

```python
# Attempt 自动管理生命周期
with ticket.attempt() as attempt:
    # 如果出现异常，自动标记为 FAILED
    risky_operation()
    attempt.complete("Success!")
```

## 📊 Database管理

### 查看数据（Prisma Studio）

```bash
pnpm db:studio
```

### 重置Database

```bash
cd packages/api
pnpm prisma migrate reset
cd ../..
```

### 添加Example数据

```bash
cd packages/api
pnpm prisma db seed
cd ../..
```

## 🔍 Status流转

```
OPEN (新建)
  ↓
IN_PROGRESS (In Progress)
  ↓
WAITING_REVIEW (Awaiting Review)
  ↓ (批准)          ↓ (需要修改)
COMPLETED         NEEDS_REVISION
  ↓                   ↓
CLOSED          IN_PROGRESS (重新开始)
```

## ⚙️ EnvironmentVariable

复制 `.env.example` 到 `.env` 并修改：

```bash
cp .env.example packages/api/.env
```

主要Configuration项：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `REDIS_URL`: Redis 连接字符串  
- `API_PORT`: API Service端口（默认 3000）
- `CORS_ORIGIN`: 允许的跨域来源

## 🐛 常见Issue

### Docker 容器未启动

```bash
docker-compose up -d
docker-compose ps  # 检查Status
```

### Prisma 客户端未生成

```bash
cd packages/api
pnpm prisma generate
cd ../..
```

### 端口冲突

修改 `packages/api/.env` 中的 `API_PORT`

### Python SDK 导入Error

```bash
cd packages/sdk-python
pip install -e .  # Development模式Installation
cd ../..
```

## 🎯 下一步

现在你已经Complete了 Phase 1 MVP 的设置！接下来可以：

1. **探索 API**: 访问 http://localhost:3000/api/docs
2. **运行Example**: `python examples/simple_agent.py`
3. **创建自己的 Agent**: Reference SDK Documentation
4. **查看数据**: `pnpm db:studio`

## 📖 更多资源

- [完整Documentation](./SETUP.md)
- [Master Plan](./MASTER_PLAN.md)
- [API Reference](./docs/api-reference.md)
- [Python SDK](./packages/sdk-python/README.md)

Happy coding! 🚀
