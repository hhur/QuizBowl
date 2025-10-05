#!/usr/bin/env pwsh
# QuizBowlHub Real-time Features Testing Script
# Tests Socket.IO connectivity and real-time competition features

param(
    [string]$ServerUrl = "http://localhost:3001",
    [switch]$AutoOpen
)

Write-Host "⚡ QuizBowlHub Real-time Testing Suite" -ForegroundColor Green
Write-Host "🔗 Server: $ServerUrl" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "🔍 Checking server availability..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$ServerUrl/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Server is running (Status: $($healthCheck.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server not available: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Start the server with: .\scripts\start-dev.ps1" -ForegroundColor Yellow
    exit 1
}

# Test Socket.IO endpoint
Write-Host "🔌 Testing Socket.IO endpoint..." -ForegroundColor Yellow
try {
    $socketCheck = Invoke-WebRequest -Uri "$ServerUrl/socket.io/" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Socket.IO endpoint accessible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Socket.IO endpoint not available: $($_.Exception.Message)" -ForegroundColor Red
}

# Test real-time client
Write-Host "🧪 Testing real-time client..." -ForegroundColor Yellow
try {
    $clientCheck = Invoke-WebRequest -Uri "$ServerUrl/realtime-test-client.html" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Real-time test client accessible" -ForegroundColor Green
    
    if ($AutoOpen) {
        Write-Host "🌐 Opening test client in browser..." -ForegroundColor Cyan
        Start-Process "$ServerUrl/realtime-test-client.html"
    }
} catch {
    Write-Host "   ❌ Real-time test client not available: $($_.Exception.Message)" -ForegroundColor Red
}

# Display testing instructions
Write-Host ""
Write-Host "📋 Manual Testing Instructions" -ForegroundColor Magenta
Write-Host "──────────────────────────────────" -ForegroundColor Gray
Write-Host "1. Open the test client: $ServerUrl/realtime-test-client.html" -ForegroundColor White
Write-Host "2. Test user authentication with demo accounts:" -ForegroundColor White
Write-Host "   • Username: admin, Password: admin123" -ForegroundColor Gray
Write-Host "   • Username: student1, Password: student123" -ForegroundColor Gray
Write-Host "3. Create a game room and test real-time features:" -ForegroundColor White
Write-Host "   • Room creation and joining" -ForegroundColor Gray
Write-Host "   • Buzzer system (<100ms latency)" -ForegroundColor Gray
Write-Host "   • Live question display" -ForegroundColor Gray
Write-Host "   • Score tracking" -ForegroundColor Gray
Write-Host "4. Test multi-player scenarios:" -ForegroundColor White
Write-Host "   • Open multiple browser tabs" -ForegroundColor Gray
Write-Host "   • Join same room with different users" -ForegroundColor Gray
Write-Host "   • Test concurrent buzzing" -ForegroundColor Gray
Write-Host ""

# Performance testing suggestions
Write-Host "⚡ Performance Testing" -ForegroundColor Magenta
Write-Host "──────────────────────────" -ForegroundColor Gray
Write-Host "• Buzzer Latency: Should be <100ms" -ForegroundColor White
Write-Host "• API Response: Should be <200ms" -ForegroundColor White
Write-Host "• Concurrent Users: Test up to 8 users per room" -ForegroundColor White
Write-Host "• Connection Stability: Test reconnection scenarios" -ForegroundColor White
Write-Host ""

# Quick access URLs
Write-Host "🔗 Quick Access URLs" -ForegroundColor Magenta
Write-Host "────────────────────" -ForegroundColor Gray
Write-Host "• Main App: $ServerUrl/" -ForegroundColor Cyan
Write-Host "• Test Client: $ServerUrl/realtime-test-client.html" -ForegroundColor Cyan
Write-Host "• Health Check: $ServerUrl/api/health/detailed" -ForegroundColor Cyan
Write-Host "• Socket.IO: $ServerUrl/socket.io/" -ForegroundColor Cyan

if (-not $AutoOpen) {
    Write-Host ""
    Write-Host "💡 Add -AutoOpen to automatically open the test client" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Real-time testing setup complete!" -ForegroundColor Green