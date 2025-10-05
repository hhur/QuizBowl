#!/usr/bin/env pwsh
# QuizBowlHub Scripts Index
# Quick reference and launcher for all developer scripts

Write-Host "🚀 QuizBowlHub Developer Scripts" -ForegroundColor Green
Write-Host "═══════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🛠️  DEVELOPMENT SCRIPTS" -ForegroundColor Magenta
Write-Host "────────────────────────" -ForegroundColor Gray
Write-Host "  1. start-dev.ps1       - Start development server with logging" -ForegroundColor White
Write-Host "  2. test-api.ps1         - Test all API endpoints" -ForegroundColor White
Write-Host "  3. test-realtime.ps1    - Test real-time competition features" -ForegroundColor White
Write-Host "  4. install-deps.ps1     - Install and verify dependencies" -ForegroundColor White
Write-Host ""

Write-Host "📦 DEPLOYMENT SCRIPTS" -ForegroundColor Magenta
Write-Host "─────────────────────" -ForegroundColor Gray
Write-Host "  5. build-prod.ps1       - Build production deployment package" -ForegroundColor White
Write-Host ""

Write-Host "🔧 MAINTENANCE SCRIPTS" -ForegroundColor Magenta
Write-Host "──────────────────────" -ForegroundColor Gray
Write-Host "  6. logs.ps1             - View and manage application logs" -ForegroundColor White
Write-Host "  7. db-manage.ps1        - Database backup and management" -ForegroundColor White
Write-Host "  8. format-code.ps1      - Code formatting and quality checks" -ForegroundColor White
Write-Host "  9. project-utils.ps1    - Project information and utilities" -ForegroundColor White
Write-Host ""

Write-Host "📚 QUICK COMMANDS" -ForegroundColor Magenta
Write-Host "─────────────────" -ForegroundColor Gray
Write-Host "  # Start development"
Write-Host "  .\scripts\start-dev.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Test everything"
Write-Host "  .\scripts\test-api.ps1 -Verbose" -ForegroundColor Cyan
Write-Host "  .\scripts\test-realtime.ps1 -AutoOpen" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Monitor logs"
Write-Host "  .\scripts\logs.ps1 follow" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Check project info"
Write-Host "  .\scripts\project-utils.ps1 info" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 TIP: Run any script without parameters to see detailed usage instructions" -ForegroundColor Yellow
Write-Host "📖 Full documentation: .\scripts\README.md" -ForegroundColor Cyan
Write-Host ""