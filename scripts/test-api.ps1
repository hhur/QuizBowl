#!/usr/bin/env pwsh
# QuizBowlHub API Testing Script
# Comprehensive API endpoint testing for development verification

param(
    [string]$BaseUrl = "http://localhost:3001",
    [switch]$Verbose
)

Write-Host "🧪 QuizBowlHub API Testing Suite" -ForegroundColor Green
Write-Host "🔗 Testing server: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "📡 Testing: $Description" -ForegroundColor Yellow
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -UseBasicParsing -TimeoutSec 10
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -Body $Body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
        }
        
        Write-Host "   ✅ $($response.StatusCode) - Success" -ForegroundColor Green
        
        if ($Verbose) {
            Write-Host "   📄 Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test health endpoints
Write-Host "🏥 Health Check Endpoints" -ForegroundColor Magenta
Test-Endpoint "$BaseUrl/api/health" "Basic Health Check"
Test-Endpoint "$BaseUrl/api/health/detailed" "Detailed Health Check"

# Test authentication endpoints
Write-Host "🔐 Authentication Endpoints" -ForegroundColor Magenta
Test-Endpoint "$BaseUrl/api/auth/register" "Registration Endpoint" "POST" @{} '{"username":"testuser","email":"test@example.com","password":"testpass123","role":"student"}'
Test-Endpoint "$BaseUrl/api/auth/login" "Login Endpoint" "POST" @{} '{"username":"admin","password":"admin123"}'

# Test question endpoints
Write-Host "❓ Question Endpoints" -ForegroundColor Magenta
Test-Endpoint "$BaseUrl/api/questions" "Get All Questions"
Test-Endpoint "$BaseUrl/api/questions/random" "Get Random Question"
Test-Endpoint "$BaseUrl/api/questions/category/Science" "Get Science Questions"

# Test static files
Write-Host "📁 Static File Endpoints" -ForegroundColor Magenta
Test-Endpoint "$BaseUrl/" "Main Application"
Test-Endpoint "$BaseUrl/realtime-test-client.html" "Real-time Test Client"

Write-Host "🎯 API Testing Complete!" -ForegroundColor Green