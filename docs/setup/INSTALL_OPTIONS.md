# Installation Method Comparison

Opentask supports two installation methods. Choose the one that best suits your needs:

## 🐳 Method 1: Docker (Recommended)

### Advantages
- ✅ **One-Click Installation**: Just run one script
- ✅ **Environment Isolation**: Won't conflict with other system services
- ✅ **Team Collaboration**: Everyone uses the same environment
- ✅ **Quick Reset**: Easily rebuild clean environment
- ✅ **Production Consistency**: Same configuration as production environment

### Disadvantages
- ❌ Requires Docker Desktop installation
- ❌ Uses more system resources
- ❌ Slower startup

### Who is it for?
- Team development
- Need quick setup
- Planning to deploy to production
- Don't want to manually configure services

### Installation Steps

```bash
# Prerequisites: Install Docker Desktop
# Download: https://www.docker.com/products/docker-desktop

# Run installation script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start
pnpm dev
```

## 💻 Method 2: Local Installation (No Docker)

### Advantages
- ✅ **Faster Startup**: Directly uses system services
- ✅ **Less Resource Usage**: No container overhead
- ✅ **Easier Debugging**: Direct database access
- ✅ **No Docker Required**: Lower system requirements

### Disadvantages
- ❌ Requires manual installation of PostgreSQL and Redis
- ❌ Requires manual service management
- ❌ May conflict with other system services
- ❌ More complex environment configuration

### Who is it for?
- Personal development
- Already have PostgreSQL/Redis installed
- Limited system resources
- Don't want to use Docker

### InstallationStep

#### macOS

```bash
# 1. Install PostgreSQL and Redis
brew install postgresql@15 redis

# 2. Start services
brew services start postgresql@15
brew services start redis

# 3. Create database
createdb opentask

# 4. Run installation script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 5. Start
pnpm dev
```

#### Ubuntu/Debian

```bash
# 1. Install PostgreSQL and Redis
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib redis-server

# 2. Start services
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl enable postgresql
sudo systemctl enable redis

# 3. Create database
sudo -u postgres createdb opentask

# 4. Configure environment variables
cp packages/api/.env.local packages/api/.env
# Edit .env file and adjust database connection as needed

# 5. Run installation script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 6. Start
pnpm dev
```

#### Windows

```bash
# 1. Install PostgreSQL
# Download: https://www.postgresql.org/download/windows/
# Run installer and remember the password

# 2. Install Redis
# Download: https://github.com/microsoftarchive/redis/releases
# Or use WSL2: wsl --install

# 3. Create database
# Use pgAdmin or command line to create a database named opentask

# 4. Configure environment variables
# Copy packages/api/.env.local to packages/api/.env
# Modify DATABASE_URL to your configuration

# 5. Run installation (in Git Bash or WSL2)
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 6. Start
pnpm dev
```

## 🔄 Switching Installation Methods

### From Docker to Local

```bash
# 1. Stop Docker services
docker-compose down

# 2. Install local services
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# 3. Create database
createdb opentask

# 4. Modify environment variables
cp packages/api/.env.local packages/api/.env

# 5. Re-run migrations
cd packages/api
pnpm prisma migrate reset
pnpm prisma db seed
cd ../..

# 6. Start
pnpm dev
```

### From Local to Docker

```bash
# 1. Stop local services
brew services stop postgresql@15
brew services stop redis

# 2. Start Docker
docker-compose up -d

# 3. Modify environment variables
cp packages/api/.env.example packages/api/.env

# 4. Re-run migrations
cd packages/api
pnpm prisma migrate reset
pnpm prisma db seed
cd ../..

# 5. Start
pnpm dev
```

## 🆚 Quick Comparison Table

| Feature | Docker | Local Installation |
|------|--------|---------|
| Installation Difficulty | ⭐⭐ (Requires Docker) | ⭐⭐⭐⭐ (Manual install) |
| Startup Speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Resource Usage | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Environment Isolation | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Team Collaboration | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Debugging Convenience | ⭐⭐⭐ | ⭐⭐⭐⭐ |

## 💡 Recommended Choice

### Choose Docker if you:
- 🆕 Just starting to learn or test the system
- 👥 Working in a team
- 🚀 Planning to deploy to production
- 💻 Have sufficient system resources

### Choose Local Installation if you:
- 💻 Already familiar with PostgreSQL and Redis
- ⚡ Need faster startup speed
- 🔧 Frequently need direct database access
- 📦 Have limited system resources

## 📚 Detailed Documentation

- **Docker Installation**: [SETUP.md](./SETUP.md)
- **Local Installation**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)

## ❓ Common Questions

### Q: Can I mix both methods?
A: Not recommended. Choose one method and stick with it. If you need to switch, follow the switching steps above.

### Q: Which method is better for production?
A: Docker. It provides better isolation and consistency.

### Q: Which should I use on Windows?
A: If possible, use WSL2 + Docker. Otherwise, use local installation.

### Q: Can I install only PostgreSQL without Redis?
A: In Phase 1 MVP, Redis is optional (not heavily used yet), but recommended for future features.

---

**Need Help?** See the corresponding detailed installation documentation or ask in GitHub Issues.
