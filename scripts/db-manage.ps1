#!/usr/bin/env pwsh
# QuizBowlHub Database Management Script
# Manages question database, user accounts, and data operations

param(
    [string]$Action = "status",
    [string]$BackupFile = "",
    [switch]$Force
)

Write-Host "🗃️  QuizBowlHub Database Manager" -ForegroundColor Green
Write-Host ""

# Define data directories
$dataDir = "data"
$backupDir = "$dataDir\backups"
$questionFile = "$dataDir\questions.json"
$usersFile = "$dataDir\users.json"

# Create data directories if they don't exist
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

switch ($Action.ToLower()) {
    "status" {
        Write-Host "📊 Database Status" -ForegroundColor Cyan
        Write-Host "─────────────────" -ForegroundColor Gray
        
        # Check questions database
        if (Test-Path $questionFile) {
            $questions = Get-Content $questionFile | ConvertFrom-Json
            Write-Host "   ❓ Questions: $($questions.Count) total" -ForegroundColor White
            $categories = $questions | Group-Object category | Sort-Object Name
            foreach ($cat in $categories) {
                Write-Host "      • $($cat.Name): $($cat.Count) questions" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ❓ Questions: Using in-memory default (25 questions)" -ForegroundColor Yellow
        }
        
        # Check users database
        if (Test-Path $usersFile) {
            $users = Get-Content $usersFile | ConvertFrom-Json
            Write-Host "   👥 Users: $($users.Count) registered" -ForegroundColor White
            $roles = $users | Group-Object role | Sort-Object Name
            foreach ($role in $roles) {
                Write-Host "      • $($role.Name): $($role.Count) users" -ForegroundColor Gray
            }
        } else {
            Write-Host "   👥 Users: Using in-memory default accounts" -ForegroundColor Yellow
        }
        
        # Check backups
        $backups = Get-ChildItem $backupDir -Filter "*.json" -ErrorAction SilentlyContinue
        Write-Host "   💾 Backups: $($backups.Count) available" -ForegroundColor White
    }
    
    "backup" {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupPath = "$backupDir\db-backup-$timestamp.json"
        
        Write-Host "💾 Creating database backup..." -ForegroundColor Yellow
        
        $backupData = @{
            timestamp = $timestamp
            questions = @()
            users = @()
        }
        
        # Backup questions
        if (Test-Path $questionFile) {
            $backupData.questions = Get-Content $questionFile | ConvertFrom-Json
            Write-Host "   ✅ Questions backed up: $($backupData.questions.Count) items" -ForegroundColor Green
        }
        
        # Backup users
        if (Test-Path $usersFile) {
            $backupData.users = Get-Content $usersFile | ConvertFrom-Json
            Write-Host "   ✅ Users backed up: $($backupData.users.Count) items" -ForegroundColor Green
        }
        
        # Save backup
        $backupData | ConvertTo-Json -Depth 10 | Out-File -FilePath $backupPath -Encoding UTF8
        Write-Host "   📁 Backup saved: $(Split-Path $backupPath -Leaf)" -ForegroundColor Green
    }
    
    "restore" {
        if (-not $BackupFile) {
            Write-Host "❌ Please specify a backup file with -BackupFile parameter" -ForegroundColor Red
            Write-Host "📋 Available backups:" -ForegroundColor Cyan
            $backups = Get-ChildItem $backupDir -Filter "*.json" | Sort-Object LastWriteTime -Descending
            foreach ($backup in $backups) {
                Write-Host "   • $($backup.Name) ($(Get-Date $backup.LastWriteTime -Format 'yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
            }
            exit 1
        }
        
        $backupPath = "$backupDir\$BackupFile"
        if (-not (Test-Path $backupPath)) {
            Write-Host "❌ Backup file not found: $BackupFile" -ForegroundColor Red
            exit 1
        }
        
        if (-not $Force) {
            Write-Host "⚠️  This will overwrite current database. Use -Force to confirm." -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host "🔄 Restoring from backup: $BackupFile" -ForegroundColor Yellow
        
        try {
            $backupData = Get-Content $backupPath | ConvertFrom-Json
            
            # Restore questions
            if ($backupData.questions -and $backupData.questions.Count -gt 0) {
                $backupData.questions | ConvertTo-Json -Depth 10 | Out-File -FilePath $questionFile -Encoding UTF8
                Write-Host "   ✅ Questions restored: $($backupData.questions.Count) items" -ForegroundColor Green
            }
            
            # Restore users
            if ($backupData.users -and $backupData.users.Count -gt 0) {
                $backupData.users | ConvertTo-Json -Depth 10 | Out-File -FilePath $usersFile -Encoding UTF8
                Write-Host "   ✅ Users restored: $($backupData.users.Count) items" -ForegroundColor Green
            }
            
            Write-Host "🎉 Database restoration complete!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Restoration failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "reset" {
        if (-not $Force) {
            Write-Host "⚠️  This will reset database to default state. Use -Force to confirm." -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host "🔄 Resetting database to defaults..." -ForegroundColor Yellow
        
        # Remove data files
        if (Test-Path $questionFile) {
            Remove-Item $questionFile -Force
            Write-Host "   ✅ Questions reset to in-memory defaults" -ForegroundColor Green
        }
        
        if (Test-Path $usersFile) {
            Remove-Item $usersFile -Force
            Write-Host "   ✅ Users reset to default accounts" -ForegroundColor Green
        }
        
        Write-Host "🎉 Database reset complete!" -ForegroundColor Green
    }
    
    "export" {
        Write-Host "📤 Exporting database to CSV..." -ForegroundColor Yellow
        
        if (Test-Path $questionFile) {
            $questions = Get-Content $questionFile | ConvertFrom-Json
            $csvPath = "$dataDir\questions-export-$(Get-Date -Format 'yyyyMMdd').csv"
            $questions | Export-Csv -Path $csvPath -NoTypeInformation
            Write-Host "   ✅ Questions exported: $(Split-Path $csvPath -Leaf)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  No questions file found" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "❓ Available database actions:" -ForegroundColor Yellow
        Write-Host "   status   - Show database status and statistics" -ForegroundColor White
        Write-Host "   backup   - Create a backup of current database" -ForegroundColor White
        Write-Host "   restore  - Restore from backup file" -ForegroundColor White
        Write-Host "   reset    - Reset to default database (requires -Force)" -ForegroundColor White
        Write-Host "   export   - Export questions to CSV format" -ForegroundColor White
        Write-Host "" 
        Write-Host "📋 Usage examples:" -ForegroundColor Cyan
        Write-Host "   .\scripts\db-manage.ps1 status" -ForegroundColor Gray
        Write-Host "   .\scripts\db-manage.ps1 backup" -ForegroundColor Gray
        Write-Host "   .\scripts\db-manage.ps1 restore -BackupFile 'db-backup-20251004.json'" -ForegroundColor Gray
        Write-Host "   .\scripts\db-manage.ps1 reset -Force" -ForegroundColor Gray
    }
}