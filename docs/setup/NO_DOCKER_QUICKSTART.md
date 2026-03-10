# 🚀 无 Docker Quick Start

如果你不想Usage Docker，这里是完整的本地InstallationStep。

## macOS 快速Installation（推荐）

### 1. Installation必要Service

```bash
# Usage Homebrew Installation PostgreSQL 和 Redis
brew install postgresql@15 redis pnpm

# 启动Service
brew services start postgresql@15
brew services start redis

# ValidationInstallation
psql --version        # 应该显示 PostgreSQL 15.x
redis-cli ping        # 应该返回 PONG
pnpm --version        # 应该显示 pnpm Version
```

### 2. 创建Database

```bash
# 创建Database
createdb opentask

# Validation
psql opentask -c "SELECT current_database();"
```

### 3. ConfigurationEnvironmentVariable

```bash
# 复制本地Configuration
cp packages/api/.env.local packages/api/.env

# 内容应该是：
# DATABASE_URL="postgresql://localhost:5432/opentask"
# REDIS_URL="redis://localhost:6379"
```

### 4. 运行Installation脚本

```bash
# 赋予执行Permission
chmod +x scripts/setup-local.sh

# 运行Installation
./scripts/setup-local.sh
```

### 5. 启动Service

```bash
# 启动DevelopmentService器
pnpm dev
```

✅ Complete！访问 http://localhost:3000/api/docs

---

## Windows 快速Installation

### 1. Installation PostgreSQL

1. 下载Installation器: https://www.postgresql.org/download/windows/
2. 运行Installation，Usage默认设置
3. 记住你设置的密码

### 2. Installation Redis

**方式 A - WSL2（推荐）**:
```bash
# 在 PowerShell (Admin) 中
wsl --install

# 重启后，在 WSL2 中Installation
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

**方式 B - Windows Version**:
1. 下载: https://github.com/microsoftarchive/redis/releases
2. 解压并运行 `redis-server.exe`

### 3. Installation Node.js 和 pnpm

```bash
# 下载 Node.js 18+
# https://nodejs.org/

# Installation pnpm
npm install -g pnpm
```

### 4. 创建Database

Usage pgAdmin (随 PostgreSQL 一起Installation):
1. 打开 pgAdmin
2. 右键 "Databases" → "Create" → "Database"
3. Name: `opentask`
4. 点击 "Save"

### 5. ConfigurationEnvironmentVariable

创建 `packages/api/.env`:
```bash
# 将 YOUR_PASSWORD 替换为你设置的密码
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/opentask"
REDIS_URL="redis://localhost:6379"
API_PORT=3000
CORS_ORIGIN="http://localhost:3001"
NODE_ENV=development
```

### 6. Installation项目

```bash
# 在项目根目录（Git Bash 或 WSL2）
pnpm install

# 生成 Prisma 客户端
cd packages/api
pnpm prisma generate

# 运行迁移
pnpm prisma migrate dev --name init

# 填充数据
pnpm prisma db seed

cd ../..
```

### 7. 启动Service

```bash
pnpm dev
```

---

## Ubuntu/Debian 快速Installation

```bash
# 1. InstallationService
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib redis-server curl

# 2. Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installation pnpm
npm install -g pnpm

# 4. 启动Service
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl enable postgresql
sudo systemctl enable redis

# 5. 创建Database
sudo -u postgres createdb opentask

# 6. ConfigurationEnvironmentVariable
cp packages/api/.env.local packages/api/.env

# 7. 运行Installation脚本
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 8. 启动
pnpm dev
```

---

## ValidationInstallation

### 检查Service是否运行

```bash
# PostgreSQL
psql opentask -c "SELECT version();"

# Redis
redis-cli ping

# 应该看到：
# ✅ PostgreSQL Version信息
# ✅ PONG
```

### 检查Database

```bash
# 查看表
psql opentask -c "\dt"

# 应该看到：tickets, attempts, comments, actors 等表
```

### Test API

```bash
# 健康检查
curl http://localhost:3000/api/v1/tickets

# 或在浏览器打开
open http://localhost:3000/api/docs
```

---

## 常用命令

### Service管理

```bash
# macOS - 启动/停止Service
brew services start postgresql@15
brew services stop postgresql@15
brew services start redis
brew services stop redis

# Linux - 启动/停止Service
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl start redis
sudo systemctl stop redis

# 查看ServiceStatus
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Database管理

```bash
# 打开 Prisma Studio (GUI)
pnpm db:studio

# 命令行访问Database
psql opentask

# 重置Database
cd packages/api
pnpm prisma migrate reset
cd ../..
```

---

## 常见Issue

### Q: PostgreSQL 连接Failed

**Error**: `connection refused`

**解决**:
```bash
# 检查Service是否运行
brew services list | grep postgresql

# 启动Service
brew services start postgresql@15

# 检查端口
lsof -i :5432
```

### Q: DatabaseAuthenticationFailed

**Error**: `password authentication failed`

**解决**:
```bash
# 方案 1: Usage系统User（macOS/Linux）
DATABASE_URL="postgresql://localhost:5432/opentask"

# 方案 2: 创建密码（如果需要）
psql postgres -c "ALTER USER postgres WITH PASSWORD 'mypassword';"
# 然后修改 .env:
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/opentask"
```

### Q: Redis 连接Failed

**解决**:
```bash
# 检查 Redis
redis-cli ping

# 如果没响应，启动 Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Q: 端口被占用

**解决**:
```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或修改 API 端口
# 编辑 packages/api/.env
API_PORT=3001
```

---

## 对比 Docker 方式

| Features | 本地Installation | Docker |
|------|---------|--------|
| Installation复杂度 | ⭐⭐⭐⭐ | ⭐⭐ |
| 启动速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 资源占用 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 易于调试 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Environment隔离 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**建议**: 
- 个人Development → 本地Installation
- 团队协作 → Docker
- 快速Test → Docker
- 性能优先 → 本地Installation

---

## 下一步

InstallationComplete后：

1. ✅ 访问 API Documentation: http://localhost:3000/api/docs
2. ✅ 运行Example: `python examples/simple_agent.py`
3. ✅ 查看数据: `pnpm db:studio`

**完整Documentation**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)
