#!/bin/bash

# Payroo Setup Script
# This script sets up the Payroo development environment

set -e

echo "🚀 Setting up Payroo Mini Payrun System..."

# Check Node.js version
echo "📋 Checking prerequisites..."
node_version=$(node -v | cut -d'v' -f2)
required_version="18.0.0"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup API
echo "🔧 Setting up API..."
cd api

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating API environment file..."
    cp .env.example .env
    echo "✅ Created api/.env file"
fi

# Install API dependencies
echo "📦 Installing API dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo "✅ API setup complete!"

# Setup Web
echo "🔧 Setting up Web app..."
cd ../web

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating Web environment file..."
    cp .env.example .env
    echo "✅ Created web/.env file"
fi

# Install Web dependencies
echo "📦 Installing Web dependencies..."
npm install

echo "✅ Web setup complete!"

cd ..

echo ""
echo "🎉 Setup complete! You can now start the development servers:"
echo ""
echo "Start both servers:"
echo "  npm run dev"
echo ""
echo "Or start them individually:"
echo "  Terminal 1: cd api && npm run dev"
echo "  Terminal 2: cd web && npm run dev"
echo ""
echo "🌐 URLs:"
echo "  Web App: http://localhost:3000"
echo "  API: http://localhost:4000"
echo "  API Health: http://localhost:4000/health"
echo ""
echo "📊 Database Studio:"
echo "  cd api && npm run db:studio"
echo ""
echo "🧪 Run tests:"
echo "  npm test"
echo ""
