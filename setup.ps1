# Payroo Setup Script for Windows PowerShell
# This script sets up the Payroo development environment

Write-Host "🚀 Setting up Payroo Mini Payrun System..." -ForegroundColor Green

# Check Node.js version
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Setup API
Write-Host "🔧 Setting up API..." -ForegroundColor Yellow
Set-Location api

# Copy environment file
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating API environment file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created api/.env file" -ForegroundColor Green
}

# Install API dependencies
Write-Host "📦 Installing API dependencies..." -ForegroundColor Yellow
npm install

# Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push

# Seed database with sample data
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
npm run db:seed

Write-Host "✅ API setup complete!" -ForegroundColor Green

# Setup Web
Write-Host "🔧 Setting up Web app..." -ForegroundColor Yellow
Set-Location ..\web

# Copy environment file
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating Web environment file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created web/.env file" -ForegroundColor Green
}

# Install Web dependencies
Write-Host "📦 Installing Web dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✅ Web setup complete!" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "🎉 Setup complete! You can now start the development servers:" -ForegroundColor Green
Write-Host ""
Write-Host "Start both servers:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or start them individually:" -ForegroundColor White
Write-Host "  Terminal 1: cd api && npm run dev" -ForegroundColor Cyan
Write-Host "  Terminal 2: cd web && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor White
Write-Host "  Web App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "  API Health: http://localhost:4000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Database Studio:" -ForegroundColor White
Write-Host "  cd api && npm run db:studio" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Run tests:" -ForegroundColor White
Write-Host "  npm test" -ForegroundColor Cyan
Write-Host ""
