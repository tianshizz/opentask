# 🚀 No-Docker Quick Start

If you don't want to use Docker, here are the complete local installation steps.

## macOS Quick Installation (Recommended)

### 1. Install pnpm

```bash
# Use Homebrew to install pnpm
brew install pnpm

# Verify installation
pnpm --version        # Should show pnpm version
```

### 2. Configure Environment Variables

```bash
# Copy local configuration (SQLite is default)
cp packages/api/.env.local packages/api/.env

# Content should be:
# DATABASE_URL="file:./dev.db"
```

### 3. Run Installation Script

```bash
# Grant execution permission
chmod +x scripts/setup-local.sh

# Run installation
./scripts/setup-local.sh
```

### 4. Start Services

```bash
# Start development server
pnpm dev
```

✅ Done! Visit http://localhost:3000/api/docs

---

## Windows Quick Installation

### 1. Install Node.js and pnpm

```bash
# Download Node.js 18+
# https://nodejs.org/

# Install pnpm
npm install -g pnpm
```

### 2. Configure Environment Variables

Copy `packages/api/.env.local` to `packages/api/.env` (SQLite is default):
```bash
DATABASE_URL="file:./dev.db"
API_PORT=3000
CORS_ORIGIN="http://localhost:3001"
NODE_ENV=development
```

### 3. Install Project

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

### 4. Start Services

```bash
pnpm dev
```

---

## Ubuntu/Debian Quick Installation

```bash
# 1. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install pnpm
npm install -g pnpm

# 3. Configure environment variables (SQLite is default)
cp packages/api/.env.local packages/api/.env

# 4. Run installation script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# 5. Start
pnpm dev
```

---

## Verify Installation

### Check Database

```bash
# View tables using Prisma Studio
cd packages/api
pnpm prisma studio
# Opens http://localhost:5555 where you can view all tables

# Or check SQLite directly
sqlite3 packages/api/dev.db ".tables"
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

### Database Management

```bash
# Open Prisma Studio (GUI)
pnpm db:studio

# Access SQLite database directly
sqlite3 packages/api/dev.db

# Reset database
cd packages/api
pnpm prisma migrate reset
cd ../..

# Backup database (SQLite)
cp packages/api/dev.db packages/api/dev.db.backup
```

---

## Common Issues

### Q: Database Migration Failed

**Error**: `Migration failed` or database errors

**Solution**:
```bash
# Reset and re-run migrations
cd packages/api
rm -f dev.db  # Remove old database
pnpm prisma migrate reset --skip-seed
pnpm prisma db seed
cd ../..
```

### Q: Want to use PostgreSQL instead of SQLite?

**Solution**:
```bash
# 1. Install PostgreSQL
brew install postgresql@15  # macOS
# OR
sudo apt-get install postgresql  # Linux

# 2. Start PostgreSQL
brew services start postgresql@15  # macOS
# OR
sudo systemctl start postgresql  # Linux

# 3. Create database
createdb opentask

# 4. Update .env file
DATABASE_URL="postgresql://localhost:5432/opentask"

# 5. Re-run migrations
cd packages/api
pnpm prisma migrate reset
cd ../..
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

| Feature | Local (SQLite) | Docker (PostgreSQL) |
|------|---------|--------|
| Installation Complexity | ⭐ | ⭐⭐ |
| Startup Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Resource Usage | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Easy Debugging | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Environment Isolation | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Production Ready | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommended**: 
- Getting Started → Local (SQLite)
- Personal Development → Local (SQLite)
- Team Collaboration → Docker (PostgreSQL)
- Production → Docker (PostgreSQL)

---

## Next Steps

After installation is complete:

1. ✅ Visit API Documentation: http://localhost:3000/api/docs
2. ✅ Run Example: `python examples/simple_agent.py`
3. ✅ View Data: `pnpm db:studio`

**Complete Documentation**: [docs/setup-without-docker.md](./docs/setup-without-docker.md)
