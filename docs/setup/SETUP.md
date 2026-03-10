# Setup Guide - Phase 1 MVP

本Guide将帮助你启动 Opentask 系统的 Phase 1 MVP Version。

## Prerequisites

确保你已Installation以下软件：

- **Node.js** 18+ 
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** 和 **Docker Compose**
- **PostgreSQL** 14+ (通过 Docker 运行)

## 快速启动

### 1. 自动Installation（推荐）

```bash
# 赋予脚本执行Permission
chmod +x scripts/setup.sh

# 运行Installation脚本
./scripts/setup.sh
```

### 2. 手动Installation

如果自动脚本Failed，可以手动执行以下Step：

```bash
# 1. Installation依赖
pnpm install

# 2. 启动 Docker Service
docker-compose up -d

# 3. 等待 PostgreSQL 启动（大约 10 秒）
sleep 10

# 4. 生成 Prisma Client
cd packages/api
pnpm prisma generate

# 5. 运行Database迁移
pnpm prisma migrate dev --name init

# 6. 填充种子数据
pnpm prisma db seed

# 7. 返回根目录
cd ../..
```

## 启动DevelopmentService器

```bash
# 启动AllService（API + Web UI）
pnpm dev
```

Service将在以下端口启动：

- **API 后端**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs
- **Web UI** (Phase 1 暂未Implementation): http://localhost:3001

## ValidationInstallation

### 1. 检查 API 健康Status

```bash
curl http://localhost:3000/api/v1/health
```

应该返回：
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. 获取Example Tickets

```bash
curl http://localhost:3000/api/v1/tickets
```

应该看到预填充的Exampletickets。

### 3. 访问 Swagger Documentation

打开浏览器访问: http://localhost:3000/api/docs

你可以在这里TestAll的 API 端点。

## Database管理

### Prisma Studio（Database可视化工具）

```bash
pnpm db:studio
```

这将在 http://localhost:5555 打开 Prisma Studio，你可以直接查看和编辑Database内容。

### 重置Database

```bash
cd packages/api
pnpm prisma migrate reset
cd ../..
```

这将：
1. 删除All数据
2. 重新运行All迁移
3. 重新填充种子数据

## Phase 1 FeaturesTest

### 1. 创建一个 Ticket

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

### 3. 创建 Attempt

```bash
curl -X POST http://localhost:3000/api/v1/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "<TICKET_ID>",
    "agentId": "<AGENT_ID>",
    "reasoning": "I will analyze the issue first"
  }'
```

### 4. 添加 Comment

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

## Phase 1 Complete的Features

✅ **已Implementation**:
- Ticket CRUD 操作
- Status机（Status转换Validation）
- Attempt 记录系统
- Comment 系统
- Actor（Agent 和 Human）管理
- PostgreSQL Database
- Prisma ORM 集成
- Swagger API Documentation
- Docker Compose 本地DevelopmentEnvironment
- Database种子数据

## 下一步 (Phase 1 剩余工作)

接下来需要Complete：

1. **Web UI (React)**
   - Ticket 列表页
   - Ticket 详情页
   - Status管理界面

2. **Python SDK**
   - 基础 Client
   - Ticket 操作
   - Attempt 管理

3. **基础Test**
   - 单元Test
   - 集成Test

## 常见Issue

### PostgreSQL 连接Failed

确保 Docker 容器正在运行：
```bash
docker-compose ps
```

如果没有运行，启动它们：
```bash
docker-compose up -d
```

### Prisma Error

重新生成 Prisma Client：
```bash
cd packages/api
pnpm prisma generate
cd ../..
```

### 端口被占用

如果 3000 端口已被占用，修改 `packages/api/.env`:
```
API_PORT=3001
```

## Development工具

### 日志

API 日志会直接输出到控制台。如需详细日志：

```bash
cd packages/api
LOG_LEVEL=debug pnpm dev
```

### 停止AllService

```bash
# 停止 pnpm dev
Ctrl + C

# 停止 Docker Service
docker-compose down
```

### 清理All数据（包括 Docker 卷）

```bash
docker-compose down -v
```

## 获取帮助

- 查看 [MASTER_PLAN.md](./MASTER_PLAN.md) 了解系统Architecture
- 查看 [docs/api-reference.md](./docs/api-reference.md) 了解 API 详情
- 查看Example代码：[examples/](./examples/)

祝Development顺利！🚀
