# Installation方式对比

Opentask 支持两种Installation方式，选择最适合你的：

## 🐳 方式 1: Docker（推荐）

### 优点
- ✅ **一键Installation**: 运行一个脚本即可
- ✅ **Environment隔离**: 不会与系统其他Service冲突
- ✅ **团队协作**: All人Usage相同的Environment
- ✅ **快速重置**: 可以轻松重建干净Environment
- ✅ **Production一致**: 与ProductionEnvironmentConfiguration相同

### 缺点
- ❌ 需要Installation Docker Desktop
- ❌ 占用更多系统资源
- ❌ 启动稍慢

### 适合谁？
- 团队Development
- 需要快速上手
- Plan部署到ProductionEnvironment
- 不想手动ConfigurationService

### InstallationStep

```bash
# Prerequisites：Installation Docker Desktop
# 下载: https://www.docker.com/products/docker-desktop

# 运行Installation脚本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 启动
pnpm dev
```

## 💻 方式 2: 本地Installation（无 Docker）

### 优点
- ✅ **启动更快**: 直接Usage系统Service
- ✅ **资源占用少**: 不需要容器开销
- ✅ **易于调试**: 直接访问Database
- ✅ **不需要 Docker**: 系统要求更低

### 缺点
- ❌ 需要手动Installation PostgreSQL 和 Redis
- ❌ 需要手动管理Service
- ❌ 可能与系统其他Service冲突
- ❌ EnvironmentConfiguration更复杂

### 适合谁？
- 个人Development
- 已经有 PostgreSQL/Redis
- 系统资源有限
- 不想Usage Docker

### InstallationStep

#### macOS

```bash
# 1. Installation PostgreSQL 和 Redis
brew install postgresql@15 redis

# 2. 启动Service
brew services start postgresql@15
brew services start redis

# 3. 创建Database
createdb opentask

# 4. 运行Installation脚本
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 5. 启动
pnpm dev
```

#### Ubuntu/Debian

```bash
# 1. Installation PostgreSQL 和 Redis
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib redis-server

# 2. 启动Service
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl enable postgresql
sudo systemctl enable redis

# 3. 创建Database
sudo -u postgres createdb opentask

# 4. ConfigurationEnvironmentVariable
cp packages/api/.env.local packages/api/.env
# 编辑 .env 文件，根据需要调整Database连接

# 5. 运行Installation脚本
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 6. 启动
pnpm dev
```

#### Windows

```bash
# 1. Installation PostgreSQL
# 下载: https://www.postgresql.org/download/windows/
# 运行Installation器，记住密码

# 2. Installation Redis
# 下载: https://github.com/microsoftarchive/redis/releases
# 或Usage WSL2: wsl --install

# 3. 创建Database
# Usage pgAdmin 或命令行创建名为 opentask 的Database

# 4. ConfigurationEnvironmentVariable
# 复制 packages/api/.env.local 到 packages/api/.env
# 修改 DATABASE_URL 为你的Configuration

# 5. 运行Installation（在 Git Bash 或 WSL2 中）
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 6. 启动
pnpm dev
```

## 🔄 切换Installation方式

### 从 Docker 切换到本地

```bash
# 1. 停止 Docker Service
docker-compose down

# 2. Installation本地Service
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# 3. 创建Database
createdb opentask

# 4. 修改EnvironmentVariable
cp packages/api/.env.local packages/api/.env

# 5. 重新运行迁移
cd packages/api
pnpm prisma migrate reset
pnpm prisma db seed
cd ../..

# 6. 启动
pnpm dev
```

### 从本地切换到 Docker

```bash
# 1. 停止本地Service
brew services stop postgresql@15
brew services stop redis

# 2. 启动 Docker
docker-compose up -d

# 3. 修改EnvironmentVariable
cp packages/api/.env.example packages/api/.env

# 4. 重新运行迁移
cd packages/api
pnpm prisma migrate reset
pnpm prisma db seed
cd ../..

# 5. 启动
pnpm dev
```

## 🆚 快速对比表

| Features | Docker | 本地Installation |
|------|--------|---------|
| Installation难度 | ⭐⭐ (需要 Docker) | ⭐⭐⭐⭐ (手动Installation) |
| 启动速度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 资源占用 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Environment隔离 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 团队协作 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 调试便利性 | ⭐⭐⭐ | ⭐⭐⭐⭐ |

## 💡 推荐选择

### 选择 Docker，如果你：
- 🆕 刚开始学习或Test系统
- 👥 在团队中工作
- 🚀 Plan部署到ProductionEnvironment
- 💻 有足够的系统资源

### 选择本地Installation，如果你：
- 💻 已经熟悉 PostgreSQL 和 Redis
- ⚡ 需要更快的启动速度
- 🔧 经常需要直接访问Database
- 📦 系统资源有限

## 📚 详细Documentation

- **Docker Installation**: [SETUP.md](./SETUP.md)
- **本地Installation**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)

## ❓ 常见Issue

### Q: 我可以混用吗？
A: 不推荐。选择一种方式并坚持Usage。如果需要切换，按照上面的切换Step操作。

### Q: 哪种方式更适合ProductionEnvironment？
A: Docker。它提供更好的隔离性和一致性。

### Q: 我在 Windows 上应该用哪种？
A: 如果可以，Usage WSL2 + Docker。否则直接本地Installation。

### Q: 可以只Installation PostgreSQL，不Installation Redis 吗？
A: Phase 1 MVP 中 Redis 是可选的（暂未深度Usage），但建议Installation以支持未来Features。

---

**需要帮助？** 查看对应的详细InstallationDocumentation或在 GitHub Issues 提问。
