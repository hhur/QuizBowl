#!/usr/bin/env pwsh
# QuizBowlHub Code Formatting and Quality Script
# Formats code, runs linting, and performs quality checks

param(
    [string]$Action = "format",
    [switch]$Fix,
    [switch]$All
)

Write-Host "🎨 QuizBowlHub Code Formatter" -ForegroundColor Green
Write-Host ""

# Check if Prettier is installed globally
function Test-PrettierInstalled {
    try {
        $null = Get-Command prettier -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check if ESLint is installed
function Test-ESLintInstalled {
    try {
        $null = Get-Command eslint -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

switch ($Action.ToLower()) {
    "format" {
        Write-Host "🎨 Formatting code files..." -ForegroundColor Yellow
        
        if (-not (Test-PrettierInstalled)) {
            Write-Host "📦 Installing Prettier..." -ForegroundColor Cyan
            npm install -g prettier
        }
        
        # Define file patterns to format
        $patterns = @(
            "*.js",
            "*.json",
            "*.md",
            "*.html",
            "*.css"
        )
        
        foreach ($pattern in $patterns) {
            $files = Get-ChildItem -Path "." -Filter $pattern -Recurse -File | Where-Object {
                $_.FullName -notmatch "node_modules|dist|.git" 
            }
            
            if ($files.Count -gt 0) {
                Write-Host "   📄 Formatting $($files.Count) $pattern files" -ForegroundColor White
                foreach ($file in $files) {
                    try {
                        prettier --write $file.FullName
                        Write-Host "      ✅ $($file.Name)" -ForegroundColor Green
                    } catch {
                        Write-Host "      ❌ $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
        }
        
        Write-Host "🎉 Code formatting complete!" -ForegroundColor Green
    }
    
    "lint" {
        Write-Host "🔍 Running code linting..." -ForegroundColor Yellow
        
        # JavaScript linting
        $jsFiles = Get-ChildItem -Path "." -Filter "*.js" -Recurse -File | Where-Object {
            $_.FullName -notmatch "node_modules|dist|.git" 
        }
        
        if ($jsFiles.Count -gt 0) {
            Write-Host "   📄 Checking $($jsFiles.Count) JavaScript files" -ForegroundColor White
            
            foreach ($file in $jsFiles) {
                # Basic syntax check
                try {
                    node -c $file.FullName
                    Write-Host "      ✅ $($file.Name) - Syntax OK" -ForegroundColor Green
                } catch {
                    Write-Host "      ❌ $($file.Name) - Syntax Error" -ForegroundColor Red
                }
            }
        }
        
        # JSON validation
        $jsonFiles = Get-ChildItem -Path "." -Filter "*.json" -Recurse -File | Where-Object {
            $_.FullName -notmatch "node_modules|dist|.git" 
        }
        
        if ($jsonFiles.Count -gt 0) {
            Write-Host "   📄 Validating $($jsonFiles.Count) JSON files" -ForegroundColor White
            
            foreach ($file in $jsonFiles) {
                try {
                    $null = Get-Content $file.FullName | ConvertFrom-Json
                    Write-Host "      ✅ $($file.Name) - Valid JSON" -ForegroundColor Green
                } catch {
                    Write-Host "      ❌ $($file.Name) - Invalid JSON" -ForegroundColor Red
                }
            }
        }
    }
    
    "quality" {
        Write-Host "📋 Running code quality checks..." -ForegroundColor Yellow
        
        # Count lines of code
        $jsFiles = Get-ChildItem -Path "." -Filter "*.js" -Recurse -File | Where-Object {
            $_.FullName -notmatch "node_modules|dist|.git" 
        }
        
        $totalLines = 0
        $totalFiles = 0
        
        foreach ($file in $jsFiles) {
            $lines = (Get-Content $file.FullName).Count
            $totalLines += $lines
            $totalFiles++
        }
        
        Write-Host "   📄 Code Statistics:" -ForegroundColor Cyan
        Write-Host "      Files: $totalFiles JavaScript files" -ForegroundColor White
        Write-Host "      Lines: $totalLines total lines of code" -ForegroundColor White
        Write-Host "      Average: $([math]::Round($totalLines / [math]::Max($totalFiles, 1), 1)) lines per file" -ForegroundColor White
        
        # Check for common issues
        Write-Host "   🔍 Code Quality Checks:" -ForegroundColor Cyan
        
        $issues = @()
        
        foreach ($file in $jsFiles) {
            $content = Get-Content $file.FullName -Raw
            
            # Check for console.log statements
            if ($content -match "console\.log") {
                $issues += "$($file.Name): Contains console.log statements"
            }
            
            # Check for TODO comments
            if ($content -match "TODO|FIXME|HACK") {
                $issues += "$($file.Name): Contains TODO/FIXME comments"
            }
            
            # Check for long lines (>120 characters)
            $lines = Get-Content $file.FullName
            $longLines = $lines | Where-Object { $_.Length -gt 120 }
            if ($longLines.Count -gt 0) {
                $issues += "$($file.Name): $($longLines.Count) lines exceed 120 characters"
            }
        }
        
        if ($issues.Count -eq 0) {
            Write-Host "      ✅ No quality issues found" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️  Found $($issues.Count) quality issues:" -ForegroundColor Yellow
            foreach ($issue in $issues) {
                Write-Host "         • $issue" -ForegroundColor Gray
            }
        }
    }
    
    "clean" {
        Write-Host "🧹 Cleaning temporary and generated files..." -ForegroundColor Yellow
        
        $cleanPatterns = @(
            "*.tmp",
            "*.temp",
            "*~",
            "*.bak",
            ".DS_Store",
            "Thumbs.db"
        )
        
        $cleaned = 0
        
        foreach ($pattern in $cleanPatterns) {
            $files = Get-ChildItem -Path "." -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                Remove-Item $file.FullName -Force
                Write-Host "   ✅ Removed: $($file.Name)" -ForegroundColor Green
                $cleaned++
            }
        }
        
        if ($cleaned -eq 0) {
            Write-Host "   ℹ️  No temporary files found" -ForegroundColor Gray
        } else {
            Write-Host "   🎉 Cleaned $cleaned temporary files" -ForegroundColor Green
        }
    }
    
    "all" {
        Write-Host "🎨 Running complete code formatting and quality suite..." -ForegroundColor Magenta
        Write-Host ""
        
        # Run all checks in sequence
        & $PSCommandPath format
        Write-Host ""
        & $PSCommandPath lint
        Write-Host ""
        & $PSCommandPath quality
        Write-Host ""
        & $PSCommandPath clean
        
        Write-Host ""
        Write-Host "🎆 Complete code quality suite finished!" -ForegroundColor Green
    }
    
    default {
        Write-Host "❓ Available formatting actions:" -ForegroundColor Yellow
        Write-Host "   format   - Format code with Prettier" -ForegroundColor White
        Write-Host "   lint     - Run syntax and validation checks" -ForegroundColor White
        Write-Host "   quality  - Analyze code quality and statistics" -ForegroundColor White
        Write-Host "   clean    - Remove temporary and generated files" -ForegroundColor White
        Write-Host "   all      - Run all formatting and quality checks" -ForegroundColor White
        Write-Host "" 
        Write-Host "📋 Usage examples:" -ForegroundColor Cyan
        Write-Host "   .\scripts\format-code.ps1 format" -ForegroundColor Gray
        Write-Host "   .\scripts\format-code.ps1 all" -ForegroundColor Gray
        Write-Host "   .\scripts\format-code.ps1 quality" -ForegroundColor Gray
    }
}