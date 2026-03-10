# 本地InstallationGuide（无需 Docker）

如果你不想Usage Docker，可以直接在本地Installation PostgreSQL 和 Redis。

## 快速Installation

### Usage自动脚本

```bash
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

## 手动InstallationStep

### 1. Installation PostgreSQL

#### macOS (Homebrew)

```bash
# Installation PostgreSQL 15
brew install postgresql@15

# 启动Service
brew services start postgresql@15

# 添加到 PATH (如果需要)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# ValidationInstallation
psql --version
```

#### Ubuntu/Debian

```bash
# Installation
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# 启动Service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Validation
psql --version
```

#### Windows

1. 下载Installation器: https://www.postgresql.org/download/windows/
2. 运行Installation器，Usage默认端口 5432
3. 记住设置的密码

### 2. 创建Database

```bash
# macOS/Linux
createdb opentask

# 或Usage psql
psql postgres -c "CREATE DATABASE opentask;"

# 创建User（可选，如果需要特定User）
psql postgres -c "CREATE USER opentask WITH PASSWORD 'opentask_dev_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE opentask TO opentask;"
```

### 3. Installation Redis

#### macOS (Homebrew)

```bash
# Installation
brew install redis

# 启动Service
brew services start redis

# Validation
redis-cli ping
# 应该返回: PONG
```

#### Ubuntu/Debian

```bash
# Installation
sudo apt-get install redis-server

# 启动Service
sudo systemctl start redis
sudo systemctl enable redis

# Validation
redis-cli ping
```

#### Windows

1. 下载 Redis: https://github.com/microsoftarchive/redis/releases
2. 解压并运行 `redis-server.exe`
3. 或Usage WSL2 Installation Linux Version

### 4. ConfigurationEnvironmentVariable

编辑 `packages/api/.env`:

```bash
# 本地 PostgreSQL (默认无密码)
DATABASE_URL="postgresql://localhost:5432/opentask"

# 如果设置了User名和密码
# DATABASE_URL="postgresql://opentask:opentask_dev_password@localhost:5432/opentask"

# 本地 Redis
REDIS_URL="redis://localhost:6379"

# API Configuration
API_PORT=3000
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
CORS_ORIGIN="http://localhost:3001"
NODE_ENV=development
```

### 5. Installation项目依赖

```bash
# Installation pnpm (如果还没Installation)
npm install -g pnpm

# Installation依赖
pnpm install
```

### 6. 初始化Database

```bash
# 生成 Prisma 客户端
cd packages/api
pnpm prisma generate

# 运行Database迁移
pnpm prisma migrate dev --name init

# 填充Example数据
pnpm prisma db seed

# 返回根目录
cd ../..
```

### 7. 启动DevelopmentService器

```bash
pnpm dev
```

## ValidationInstallation

### 检查ServiceStatus

```bash
# PostgreSQL
psql -U postgres -c "SELECT version();"

# 或检查连接
psql opentask -c "\dt"

# Redis
redis-cli ping
# 应该返回: PONG

# 查看运行的Service (macOS)
brew services list
```

### Test API

```bash
# 健康检查
curl http://localhost:3000/api/v1/health

# 查看 Swagger Documentation
open http://localhost:3000/api/docs

# 获取 tickets
curl http://localhost:3000/api/v1/tickets
```

## 常见Issue

### PostgreSQL 连接Failed

**Error**: `connection refused` 或 `could not connect to server`

**Solution**:

```bash
# 检查 PostgreSQL 是否运行
brew services list | grep postgresql

# 启动Service
brew services start postgresql@15

# 检查端口
lsof -i :5432
```

### PostgreSQL AuthenticationFailed

**Error**: `password authentication failed`

**Solution**:

```bash
# 方案 1: Usage系统User（无密码）
DATABASE_URL="postgresql://localhost:5432/opentask"

# 方案 2: 创建特定User
psql postgres -c "CREATE USER opentask WITH PASSWORD 'your_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE opentask TO opentask;"

# 然后Usage
DATABASE_URL="postgresql://opentask:your_password@localhost:5432/opentask"
```

### Redis 连接Failed

**Error**: `Could not connect to Redis`

**Solution**:

```bash
# 检查 Redis 是否运行
redis-cli ping

# 启动 Redis
brew services start redis

# 或手动启动
redis-server
```

### Database迁移Failed

**Error**: `Prisma Migrate` 相关Error

**Solution**:

```bash
# 重置Database（会删除All数据）
cd packages/api
pnpm prisma migrate reset

# 重新运行迁移
pnpm prisma migrate dev

cd ../..
```

### 端口被占用

**Error**: `Port 3000 is already in use`

**Solution**:

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或修改端口
# 编辑 packages/api/.env
API_PORT=3001
```

## Service管理

### 启动Service

```bash
# macOS
brew services start postgresql@15
brew services start redis

# Linux
sudo systemctl start postgresql
sudo systemctl start redis
```

### 停止Service

```bash
# macOS
brew services stop postgresql@15
brew services stop redis

# Linux
sudo systemctl stop postgresql
sudo systemctl stop redis
```

### 查看ServiceStatus

```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql
sudo systemctl status redis
```

## Database管理工具

### Prisma Studio（推荐）

```bash
pnpm db:studio
```

访问: http://localhost:5555

### psql (命令行)

```bash
# 连接到Database
psql opentask

# 常用命令
\dt          # 列出All表
\d tickets   # 查看表结构
SELECT * FROM tickets LIMIT 5;  # 查询数据
\q           # 退出
```

### pgAdmin (GUI)

下载: https://www.pgadmin.org/

连接Configuration:
- Host: localhost
- Port: 5432
- Database: opentask
- Username: 你的User名

## 性能优化

### PostgreSQL Configuration

编辑 PostgreSQL Configuration文件 (macOS):

```bash
# 找到Configuration文件
$(brew --prefix)/var/postgresql@15/postgresql.conf

# 调整性能参数
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

### Redis Configuration

```bash
# Redis Configuration文件
/opt/homebrew/etc/redis.conf

# 或
/usr/local/etc/redis.conf
```

## 完全卸载（如果需要）

### PostgreSQL

```bash
# macOS
brew services stop postgresql@15
brew uninstall postgresql@15
rm -rf /opt/homebrew/var/postgresql@15

# Linux
sudo apt-get remove --purge postgresql postgresql-contrib
sudo rm -rf /var/lib/postgresql
```

### Redis

```bash
# macOS
brew services stop redis
brew uninstall redis

# Linux
sudo apt-get remove --purge redis-server
```

## Summary

Usage本地Installation的优点：
- ✅ 不依赖 Docker
- ✅ 启动更快
- ✅ 资源占用更少
- ✅ 更容易调试

Usage本地Installation的缺点：
- ❌ 需要手动管理Service
- ❌ 可能与系统其他Service冲突
- ❌ Environment不够隔离

如果你需要在团队中协作或部署到ProductionEnvironment，仍然建议Usage Docker。
