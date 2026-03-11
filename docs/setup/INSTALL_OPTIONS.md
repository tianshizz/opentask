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
- ✅ **Faster Startup**: No containers to start
- ✅ **Less Resource Usage**: SQLite is embedded, no separate database process
- ✅ **Easier Debugging**: Direct database access with simple file-based storage
- ✅ **No Docker Required**: Zero dependencies for database
- ✅ **Quick Setup**: Just install pnpm and go

### Disadvantages
- ❌ SQLite not suitable for high-concurrency production use
- ❌ Need to manually migrate to PostgreSQL for production
- ❌ Less familiar to teams used to traditional databases

### Who is it for?
- Personal development
- Quick prototyping and testing
- Limited system resources
- Don't want to use Docker
- Getting started quickly

### InstallationStep

#### macOS

```bash
# 1. Install pnpm (if not installed)
brew install pnpm

# 2. Run installation script (uses SQLite by default)
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 5. Start
pnpm dev
```

#### Ubuntu/Debian

```bash
# 1. Install Node.js 18+ and pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# 2. Run installation script (uses SQLite by default)
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

### From Docker to Local (SQLite)

```bash
# 1. Stop Docker services
docker-compose down

# 2. Update environment variables
cp packages/api/.env.local packages/api/.env
# DATABASE_URL="file:./dev.db" is already set

# 3. Re-run migrations
cd packages/api
pnpm prisma migrate reset
pnpm prisma db seed
cd ../..

# 6. Start
pnpm dev
```

### From Local (SQLite) to Docker (PostgreSQL)

```bash
# 1. Start Docker
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
| Installation Difficulty | ⭐⭐ (Requires Docker) | ⭐ (Just pnpm) |
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
- 💻 Want the simplest setup possible
- ⚡ Need fastest startup speed
- 🔧 Prefer file-based database
- 📦 Have limited system resources
- 🚀 Just getting started

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

### Q: Can I use PostgreSQL instead of SQLite for local development?
A: Yes! Just change DATABASE_URL in .env.local to a PostgreSQL connection string and install PostgreSQL locally.

### Q: When should I switch from SQLite to PostgreSQL?
A: SQLite is perfect for development. Switch to PostgreSQL when deploying to production or if you need better concurrency support.

---

**Need Help?** See the corresponding detailed installation documentation or ask in GitHub Issues.
