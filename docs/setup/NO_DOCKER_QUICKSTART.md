# 🚀 No-Docker Quick Start

If you don't want to use Docker, here are the complete local installation steps.

## macOS Quick Installation (Recommended)

### 1. Install Required Services

```bash
# Use Homebrew to install PostgreSQL and Redis
brew install postgresql@15 redis pnpm

# Start services
brew services start postgresql@15
brew services start redis

# Verify installation
psql --version        # Should show PostgreSQL 15.x
redis-cli ping        # Should return PONG
pnpm --version        # Should show pnpm version
```

### 2. Create Database

```bash
# Create database
createdb opentask

# Verify
psql opentask -c "SELECT current_database();"
```

### 3. Configure Environment Variables

```bash
# Copy local configuration
cp packages/api/.env.local packages/api/.env

# Content should be:
# DATABASE_URL="postgresql://localhost:5432/opentask"
# REDIS_URL="redis://localhost:6379"
```

### 4. Run Installation Script

```bash
# Grant execution permission
chmod +x scripts/setup-local.sh

# Run installation
./scripts/setup-local.sh
```

### 5. Start Services

```bash
# Start development server
pnpm dev
```

✅ Done! Visit http://localhost:3000/api/docs

---

## Windows Quick Installation

### 1. Install PostgreSQL

1. Download installer: https://www.postgresql.org/download/windows/
2. Run installation with default settings
3. Remember the password you set

### 2. Install Redis

**Method A - WSL2 (Recommended)**:
```bash
# In PowerShell (Admin)
wsl --install

# After restart, install in WSL2
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

**Method B - Windows Version**:
1. Download: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

### 3. Install Node.js and pnpm

```bash
# Download Node.js 18+
# https://nodejs.org/

# Install pnpm
npm install -g pnpm
```

### 4. Create Database

Using pgAdmin (installed with PostgreSQL):
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `opentask`
4. Click "Save"

### 5. Configure Environment Variables

Create `packages/api/.env`:
```bash
# Replace YOUR_PASSWORD with the password you set
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/opentask"
REDIS_URL="redis://localhost:6379"
API_PORT=3000
CORS_ORIGIN="http://localhost:3001"
NODE_ENV=development
```

### 6. Install Project

```bash
# In project root directory (Git Bash or WSL2)
pnpm install

# Generate Prisma client
cd packages/api
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# Seed data
pnpm prisma db seed

cd ../..
```

### 7. Start Services

```bash
pnpm dev
```

---

## Ubuntu/Debian Quick Installation

```bash
# 1. Install services
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib redis-server curl

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install pnpm
npm install -g pnpm

# 4. Start services
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl enable postgresql
sudo systemctl enable redis

# 5. Create database
sudo -u postgres createdb opentask

# 6. Configure environment variables
cp packages/api/.env.local packages/api/.env

# 7. Run installation script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 8. Start
pnpm dev
```

---

## Verify Installation

### Check if Services are Running

```bash
# PostgreSQL
psql opentask -c "SELECT version();"

# Redis
redis-cli ping

# Should see:
# ✅ PostgreSQL version information
# ✅ PONG
```

### Check Database

```bash
# View tables
psql opentask -c "\dt"

# Should see: tickets, attempts, comments, actors, etc.
```

### Test API

```bash
# Health check
curl http://localhost:3000/api/v1/tickets

# Or open in browser
open http://localhost:3000/api/docs
```

---

## Common Commands

### Service Management

```bash
# macOS - Start/Stop services
brew services start postgresql@15
brew services stop postgresql@15
brew services start redis
brew services stop redis

# Linux - Start/Stop services
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl start redis
sudo systemctl stop redis

# View service status
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Database Management

```bash
# Open Prisma Studio (GUI)
pnpm db:studio

# Access database via command line
psql opentask

# Reset database
cd packages/api
pnpm prisma migrate reset
cd ../..
```

---

## Common Issues

### Q: PostgreSQL Connection Failed

**Error**: `connection refused`

**Solution**:
```bash
# Check if service is running
brew services list | grep postgresql

# Start service
brew services start postgresql@15

# Check port
lsof -i :5432
```

### Q: Database Authentication Failed

**Error**: `password authentication failed`

**Solution**:
```bash
# Option 1: Use system user (macOS/Linux)
DATABASE_URL="postgresql://localhost:5432/opentask"

# Option 2: Create password (if needed)
psql postgres -c "ALTER USER postgres WITH PASSWORD 'mypassword';"
# Then modify .env:
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/opentask"
```

### Q: Redis Connection Failed

**Solution**:
```bash
# Check Redis
redis-cli ping

# If no response, start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Q: Port in Use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or modify API port
# Edit packages/api/.env
API_PORT=3001
```

---

## Comparison with Docker

| Feature | Local Installation | Docker |
|------|---------|--------|
| Installation Complexity | ⭐⭐⭐⭐ | ⭐⭐ |
| Startup Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Resource Usage | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Easy Debugging | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Environment Isolation | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommended**: 
- Personal Development → Local Installation
- Team Collaboration → Docker
- Quick Testing → Docker
- Performance Priority → Local Installation

---

## Next Steps

After installation is complete:

1. ✅ Visit API Documentation: http://localhost:3000/api/docs
2. ✅ Run Example: `python examples/simple_agent.py`
3. ✅ View Data: `pnpm db:studio`

**Complete Documentation**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)
