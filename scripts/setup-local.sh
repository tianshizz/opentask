#!/bin/bash

echo "🚀 Setting up Opentask (Local Mode - No Docker)..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed."
    echo ""
    echo "Please install PostgreSQL 14+ first:"
    echo ""
    echo "macOS (Homebrew):"
    echo "  brew install postgresql@15"
    echo "  brew services start postgresql@15"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get install postgresql postgresql-contrib"
    echo "  sudo systemctl start postgresql"
    echo ""
    echo "Windows:"
    echo "  Download from https://www.postgresql.org/download/windows/"
    echo ""
    read -p "Press Enter after installing PostgreSQL..."
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed."
    echo ""
    echo "Please install Redis 6+ first:"
    echo ""
    echo "macOS (Homebrew):"
    echo "  brew install redis"
    echo "  brew services start redis"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get install redis-server"
    echo "  sudo systemctl start redis"
    echo ""
    echo "Windows:"
    echo "  Download from https://github.com/microsoftarchive/redis/releases"
    echo ""
    read -p "Press Enter after installing Redis..."
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Setting up PostgreSQL database..."

# Create database if it doesn't exist
echo "Creating database 'opentask'..."
createdb opentask 2>/dev/null || echo "Database already exists or needs manual creation"

# Alternative: Use psql to create database
psql postgres -c "CREATE DATABASE opentask;" 2>/dev/null || echo "Database setup: checking existing..."

echo ""
echo "✅ PostgreSQL ready!"

# Check if Redis is running
echo ""
echo "🔍 Checking Redis..."
if redis-cli ping &> /dev/null; then
    echo "✅ Redis is running!"
else
    echo "⚠️  Redis is not running. Please start it:"
    echo "   macOS: brew services start redis"
    echo "   Linux: sudo systemctl start redis"
    echo ""
    read -p "Press Enter after starting Redis..."
fi

echo ""
echo "📝 Configuring environment variables..."
CURRENT_USER=$(whoami)
echo "Detected system user: $CURRENT_USER"

if [ ! -f packages/api/.env ]; then
    echo "Creating .env file from template..."
    cp packages/api/.env.local packages/api/.env
    # Replace YOUR_USERNAME with actual username
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/YOUR_USERNAME/$CURRENT_USER/g" packages/api/.env
    else
        # Linux
        sed -i "s/YOUR_USERNAME/$CURRENT_USER/g" packages/api/.env
    fi
    echo "✅ .env file created with user: $CURRENT_USER"
else
    echo "ℹ️  .env file already exists"
    echo "Current DATABASE_URL:"
    grep "^DATABASE_URL" packages/api/.env || echo "  (not found)"
fi

echo ""
echo "🔧 Generating Prisma client..."
(cd packages/api && pnpm prisma generate)

echo ""
echo "🗃️  Running database migrations..."
(cd packages/api && pnpm prisma migrate dev --name init)

echo ""
echo "🌱 Seeding database..."
(cd packages/api && pnpm prisma db seed)

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now start the development server:"
echo "   pnpm dev"
echo ""
echo "📚 API Documentation will be available at:"
echo "   http://localhost:3000/api/docs"
echo ""
echo "🔍 Prisma Studio (Database GUI):"
echo "   pnpm db:studio"
echo ""
echo "📝 Note: Make sure PostgreSQL and Redis are running:"
echo "   PostgreSQL: brew services list | grep postgresql"
echo "   Redis: brew services list | grep redis"
echo ""
