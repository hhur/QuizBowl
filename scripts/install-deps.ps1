#!/usr/bin/env pwsh
# QuizBowlHub Dependency Installation Script
# Installs and verifies all project dependencies

Write-Host "📦 QuizBowlHub Dependency Installation" -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "🔍 Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check npm version
Write-Host "🔍 Checking npm version..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Clean install
Write-Host "🧹 Cleaning previous installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   ✅ Removed old node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
    Write-Host "   ✅ Removed old package-lock.json" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Install specific versions for stability
Write-Host "🔧 Installing specific stable versions..." -ForegroundColor Yellow
npm install bcrypt@5.1.1 jsonwebtoken@9.0.2 socket.io@4.7.4

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Stable versions installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Warning: Some stable versions may not have installed correctly" -ForegroundColor Yellow
}

# Security audit
Write-Host "🔒 Running security audit..." -ForegroundColor Yellow
npm audit

Write-Host ""
Write-Host "🎉 Dependency installation complete!" -ForegroundColor Green
Write-Host "📋 Run 'npm list' to see installed packages" -ForegroundColor Cyan