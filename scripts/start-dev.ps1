#!/usr/bin/env pwsh
# QuizBowlHub Development Server Startup Script
# Starts the Phase 3 real-time competition server with enhanced logging

Write-Host "🚀 Starting QuizBowlHub Development Server..." -ForegroundColor Green
Write-Host "📍 Server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔄 Real-time features enabled with Socket.IO" -ForegroundColor Yellow
Write-Host "🔐 Main login page: http://localhost:3001/" -ForegroundColor Magenta
Write-Host "🧪 Test client: http://localhost:3001/realtime-test-client.html" -ForegroundColor Magenta
Write-Host "" 

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if main server file exists
if (-not (Test-Path "simple-server-phase3.js")) {
    Write-Host "❌ Server file not found: simple-server-phase3.js" -ForegroundColor Red
    Write-Host "💡 Make sure you're running this from the project root directory" -ForegroundColor Yellow
    exit 1
}

# Check if main app file exists
if (-not (Test-Path "main-app.html")) {
    Write-Host "⚠️  Main app file not found: main-app.html" -ForegroundColor Yellow
    Write-Host "🔧 The server will use fallback page" -ForegroundColor Cyan
}

# Start the development server
Write-Host "🎯 Launching Phase 3 Server..." -ForegroundColor Green
Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    node simple-server-phase3.js
} catch {
    Write-Host "❌ Error starting server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" 
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   • Check if port 3001 is already in use" -ForegroundColor White
    Write-Host "   • Verify Node.js is installed: node --version" -ForegroundColor White
    Write-Host "   • Check dependencies: npm install" -ForegroundColor White
    Write-Host "   • View logs: .\scripts\logs.ps1 errors" -ForegroundColor White
    exit 1
}