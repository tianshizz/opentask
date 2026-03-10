#!/bin/bash

echo "🚀 Setting up Opentask..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐳 Starting Docker services (PostgreSQL, Redis, MinIO)..."
docker-compose up -d postgres redis minio

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U opentask > /dev/null 2>&1; do
  sleep 1
done

echo "✅ PostgreSQL is ready!"

echo "🔧 Generating Prisma client..."
cd packages/api && pnpm prisma generate && cd ../..

echo "🗃️  Running database migrations..."
cd packages/api && pnpm prisma migrate dev --name init && cd ../..

echo "🌱 Seeding database..."
cd packages/api && pnpm prisma db seed && cd ../..

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
