# No-Docker Installation Summary

## ✅ Created Files

To support running without Docker, the following files have been created:

### 1. Installation Scripts
- **`scripts/setup-local.sh`** - Automated local installation script
  - Checks if PostgreSQL and Redis are installed
  - Creates database
  - Runs migrations and seed data

### 2. Configuration Files
- **`packages/api/.env.local`** - Local environment variable template
  - Configures local PostgreSQL connection
  - Configures local Redis connection

### 3. Documentation
- **`NO_DOCKER_QUICKSTART.md`** - Quick start guide (No Docker)
  - macOS installation steps
  - Windows installation steps
  - Ubuntu/Debian installation steps
  - Common issues FAQ

- **`docs/setup-without-docker.md`** - Detailed installation documentation
  - Complete manual installation steps
  - Detailed instructions for each platform
  - Troubleshooting guide
  - Performance optimization tips

- **`INSTALL_OPTIONS.md`** - Installation method comparison
  - Pros and cons of Docker vs local installation
  - Use case analysis
  - How to switch between methods

### 4. Updated Documentation
- **`README.md`** - Added explanation of both installation methods
- **`QUICKSTART.md`** - Added local installation option
- **`START_HERE.md`** - Added local installation instructions

---

## 🚀 Quick Start (macOS)

```bash
# 1. Install required services
brew install postgresql@15 redis pnpm

# 2. Start services
brew services start postgresql@15
brew services start redis

# 3. Create database
createdb opentask

# 4. Configure environment variables
cp packages/api/.env.local packages/api/.env

# 5. Run installation script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 6. Start services
pnpm dev
```

Access: http://localhost:3000/api/docs

---

## 📁 Key Configuration

### Database Connection

**Local PostgreSQL (no password)**:
```bash
DATABASE_URL="postgresql://localhost:5432/opentask"
```

**With username and password**:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/opentask"
```

### Redis Connection

```bash
REDIS_URL="redis://localhost:6379"
```

---

## 🔧 Service Management

### macOS (Homebrew)

```bash
# Start
brew services start postgresql@15
brew services start redis

# Stop
brew services stop postgresql@15
brew services stop redis

# Check status
brew services list
```

### Linux (systemd)

```bash
# Start
sudo systemctl start postgresql
sudo systemctl start redis

# Stop
sudo systemctl stop postgresql
sudo systemctl stop redis

# Check status
sudo systemctl status postgresql
sudo systemctl status redis
```

---

## ✅ Validate Installation

### 1. Check Services

```bash
# PostgreSQL
psql --version
psql opentask -c "SELECT version();"

# Redis
redis-cli ping  # Should return PONG
```

### 2. Check Database

```bash
# View tables
psql opentask -c "\dt"

# Should see: tickets, attempts, comments, actors, etc.
```

### 3. Test API

```bash
# Start services
pnpm dev

# Test endpoint
curl http://localhost:3000/api/v1/tickets

# Or access Swagger
open http://localhost:3000/api/docs
```

---

## 🐛 Common Issues

### PostgreSQL Connection Failed

```bash
# Check service
brew services list | grep postgresql

# Start service
brew services start postgresql@15

# Check connection
psql -l
```

### Redis Connection Failed

```bash
# Check service
redis-cli ping

# Start service
brew services start redis

# Manual start (for debugging)
redis-server
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change API port
# Edit packages/api/.env
API_PORT=3001
```

---

## 📊 Comparison with Docker

| Feature | Local Installation | Docker |
|------|---------|--------|
| **Installation Complexity** | ⭐⭐⭐⭐ | ⭐⭐ |
| **Startup Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Resource Usage** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Easy to Debug** | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Environment Isolation** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Team Collaboration** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

### Recommended Choice

**Choose Local Installation if**:
- ✅ You're already familiar with PostgreSQL and Redis
- ✅ Need faster startup and runtime speed
- ✅ System resources are limited
- ✅ Working on personal development

**Choose Docker if**:
- ✅ Just starting to learn the system
- ✅ Working in a team
- ✅ Need environment consistency
- ✅ Planning to deploy to production

---

## 🔄 Switching Methods

### From Docker to Local

```bash
# 1. Stop Docker
docker-compose down

# 2. Install local services
brew install postgresql@15 redis
brew services start postgresql@15 redis
createdb opentask

# 3. Update configuration
cp packages/api/.env.local packages/api/.env

# 4. Re-run migrations
cd packages/api
pnpm prisma migrate reset
cd ../..

# 5. Start
pnpm dev
```

### From Local to Docker

```bash
# 1. Stop local services
brew services stop postgresql@15 redis

# 2. Update configuration
cp packages/api/.env.example packages/api/.env

# 3. Start Docker
docker-compose up -d

# 4. Re-run migrations
cd packages/api
pnpm prisma migrate reset
cd ../..

# 5. Start
pnpm dev
```

---

## 📚 Documentation Index

1. **Quick Start**: [NO_DOCKER_QUICKSTART.md](./NO_DOCKER_QUICKSTART.md)
2. **Detailed Documentation**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)
3. **Installation Comparison**: [INSTALL_OPTIONS.md](./INSTALL_OPTIONS.md)
4. **Main Documentation**: [README.md](./README.md)
5. **Start Here**: [START_HERE.md](./START_HERE.md)

---

## ✨ Summary

Now you can:

1. ✅ Run the entire system **without Docker**
2. ✅ Use **local PostgreSQL** and **Redis**
3. ✅ **Faster startup speed**
4. ✅ **Lower resource usage**
5. ✅ **Easier to debug**

All features are identical to the Docker version, only the runtime environment differs.

**Get Started**: See [NO_DOCKER_QUICKSTART.md](./NO_DOCKER_QUICKSTART.md)
