#!/usr/bin/env pwsh
# QuizBowlHub Production Build Script
# Prepares the application for production deployment

Write-Host "🏗️  QuizBowlHub Production Build" -ForegroundColor Green
Write-Host ""

# Environment check
Write-Host "🔍 Checking environment..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "   ❌ package.json not found. Run from project root." -ForegroundColor Red
    exit 1
}

# Clean build directory
Write-Host "🧹 Cleaning build directory..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
New-Item -ItemType Directory -Path "dist" -Force
Write-Host "   ✅ Build directory prepared" -ForegroundColor Green

# Install production dependencies
Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow
npm ci --only=production

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Production dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install production dependencies" -ForegroundColor Red
    exit 1
}

# Copy application files
Write-Host "📁 Copying application files..." -ForegroundColor Yellow
$filesToCopy = @(
    "simple-server-phase3.js",
    "package.json",
    "package-lock.json",
    ".env.example"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file "dist/" -Force
        Write-Host "   ✅ Copied $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Warning: $file not found" -ForegroundColor Yellow
    }
}

# Copy static assets
Write-Host "📄 Copying static assets..." -ForegroundColor Yellow
if (Test-Path "realtime-test-client.html") {
    Copy-Item "realtime-test-client.html" "dist/" -Force
    Write-Host "   ✅ Copied test client" -ForegroundColor Green
}

# Create production environment file
Write-Host "⚙️  Creating production environment..." -ForegroundColor Yellow
@"
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
SESSION_SECRET=your-super-secure-session-secret-change-this-in-production
"@ | Out-File -FilePath "dist/.env" -Encoding UTF8
Write-Host "   ✅ Production .env created (update secrets!)" -ForegroundColor Green

# Create startup script
Write-Host "🚀 Creating startup script..." -ForegroundColor Yellow
@"
#!/usr/bin/env node
// QuizBowlHub Production Startup
console.log('🚀 Starting QuizBowlHub in production mode...');
require('./simple-server-phase3.js');
"@ | Out-File -FilePath "dist/start.js" -Encoding UTF8
Write-Host "   ✅ Startup script created" -ForegroundColor Green

# Create deployment instructions
Write-Host "📋 Creating deployment instructions..." -ForegroundColor Yellow
@"
# QuizBowlHub Production Deployment

## Prerequisites
- Node.js 18+ installed
- Redis server (for production scaling)
- PostgreSQL database (optional, currently using in-memory)

## Deployment Steps

1. Copy the entire 'dist' folder to your production server
2. Update the .env file with your production secrets:
   - JWT_SECRET: Generate a strong random secret
   - SESSION_SECRET: Generate a strong random secret
   - DATABASE_URL: If using PostgreSQL
   - REDIS_URL: If using Redis

3. Install dependencies:
   ```bash
   cd dist
   npm ci --only=production
   ```

4. Start the application:
   ```bash
   node start.js
   ```

## Production Checklist
- [ ] Update JWT_SECRET in .env
- [ ] Update SESSION_SECRET in .env
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL/TLS certificates
- [ ] Configure Redis for real-time scaling
- [ ] Set up database (PostgreSQL recommended)
- [ ] Configure monitoring and logging
- [ ] Set up backup procedures

## Performance Notes
- Current setup supports 50+ concurrent users
- For 100+ users, implement Redis adapter
- For 500+ users, consider database migration
- Monitor memory usage and add swap if needed

## Health Checks
- Basic: GET /api/health
- Detailed: GET /api/health/detailed
- Socket.IO: Connection to /socket.io/
"@ | Out-File -FilePath "dist/DEPLOYMENT.md" -Encoding UTF8
Write-Host "   ✅ Deployment instructions created" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Production build complete!" -ForegroundColor Green
Write-Host "📁 Build output in: ./dist/" -ForegroundColor Cyan
Write-Host "📋 See dist/DEPLOYMENT.md for deployment instructions" -ForegroundColor Cyan
Write-Host "⚠️  Remember to update secrets in dist/.env before deployment!" -ForegroundColor Yellow