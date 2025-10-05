#!/usr/bin/env pwsh
# QuizBowlHub Log Management Script
# Manages application logs and debugging output

param(
    [string]$Action = "view",
    [int]$Lines = 50,
    [switch]$Follow,
    [switch]$Clear
)

Write-Host "📋 QuizBowlHub Log Manager" -ForegroundColor Green
Write-Host ""

# Define log directories
$logDir = "logs"
$logFile = "$logDir\app.log"
$errorLogFile = "$logDir\error.log"
$accessLogFile = "$logDir\access.log"

# Create logs directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "📁 Created logs directory" -ForegroundColor Green
}

switch ($Action.ToLower()) {
    "view" {
        Write-Host "📖 Viewing recent logs ($Lines lines)" -ForegroundColor Yellow
        Write-Host "" 
        
        if (Test-Path $logFile) {
            Write-Host "=== APPLICATION LOGS ===" -ForegroundColor Cyan
            Get-Content $logFile -Tail $Lines
        } else {
            Write-Host "ℹ️  No application logs found" -ForegroundColor Gray
        }
        
        if (Test-Path $errorLogFile) {
            Write-Host "" 
            Write-Host "=== ERROR LOGS ===" -ForegroundColor Red
            Get-Content $errorLogFile -Tail $Lines
        } else {
            Write-Host "ℹ️  No error logs found" -ForegroundColor Gray
        }
    }
    
    "follow" {
        Write-Host "👀 Following logs (Ctrl+C to stop)" -ForegroundColor Yellow
        Write-Host "" 
        
        if (Test-Path $logFile) {
            Get-Content $logFile -Wait -Tail $Lines
        } else {
            Write-Host "ℹ️  Waiting for logs to be created..." -ForegroundColor Gray
            # Wait for log file to be created
            while (-not (Test-Path $logFile)) {
                Start-Sleep -Seconds 1
            }
            Get-Content $logFile -Wait -Tail 0
        }
    }
    
    "clear" {
        Write-Host "🧹 Clearing all logs" -ForegroundColor Yellow
        
        $logFiles = @($logFile, $errorLogFile, $accessLogFile)
        foreach ($file in $logFiles) {
            if (Test-Path $file) {
                Remove-Item $file -Force
                Write-Host "   ✅ Cleared $(Split-Path $file -Leaf)" -ForegroundColor Green
            }
        }
        
        Write-Host "📁 Logs cleared successfully" -ForegroundColor Green
    }
    
    "errors" {
        Write-Host "🚨 Viewing error logs only" -ForegroundColor Red
        Write-Host "" 
        
        if (Test-Path $errorLogFile) {
            Get-Content $errorLogFile -Tail $Lines
        } else {
            Write-Host "✅ No error logs found - that's good!" -ForegroundColor Green
        }
    }
    
    "size" {
        Write-Host "📊 Log file sizes" -ForegroundColor Cyan
        Write-Host "" 
        
        $logFiles = @(
            @{Name="Application"; Path=$logFile},
            @{Name="Errors"; Path=$errorLogFile},
            @{Name="Access"; Path=$accessLogFile}
        )
        
        foreach ($log in $logFiles) {
            if (Test-Path $log.Path) {
                $size = (Get-Item $log.Path).Length
                $sizeKB = [math]::Round($size / 1KB, 2)
                Write-Host "   $($log.Name): ${sizeKB} KB" -ForegroundColor White
            } else {
                Write-Host "   $($log.Name): No file" -ForegroundColor Gray
            }
        }
    }
    
    "archive" {
        Write-Host "📦 Archiving logs" -ForegroundColor Yellow
        
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $archiveDir = "$logDir\archive"
        
        if (-not (Test-Path $archiveDir)) {
            New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
        }
        
        $logFiles = Get-ChildItem $logDir -Filter "*.log"
        foreach ($file in $logFiles) {
            $archiveName = "$archiveDir\$($file.BaseName)-$timestamp.log"
            Copy-Item $file.FullName $archiveName
            Write-Host "   ✅ Archived $($file.Name) -> $(Split-Path $archiveName -Leaf)" -ForegroundColor Green
        }
        
        # Clear current logs after archiving
        foreach ($file in $logFiles) {
            Remove-Item $file.FullName -Force
        }
        
        Write-Host "📁 Logs archived and cleared" -ForegroundColor Green
    }
    
    default {
        Write-Host "❓ Available log actions:" -ForegroundColor Yellow
        Write-Host "   view     - View recent logs (default)" -ForegroundColor White
        Write-Host "   follow   - Follow logs in real-time" -ForegroundColor White
        Write-Host "   clear    - Clear all log files" -ForegroundColor White
        Write-Host "   errors   - View error logs only" -ForegroundColor White
        Write-Host "   size     - Show log file sizes" -ForegroundColor White
        Write-Host "   archive  - Archive and clear logs" -ForegroundColor White
        Write-Host "" 
        Write-Host "📋 Usage examples:" -ForegroundColor Cyan
        Write-Host "   .\scripts\logs.ps1 view -Lines 100" -ForegroundColor Gray
        Write-Host "   .\scripts\logs.ps1 follow" -ForegroundColor Gray
        Write-Host "   .\scripts\logs.ps1 clear" -ForegroundColor Gray
    }
}