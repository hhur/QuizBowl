#!/usr/bin/env pwsh
# QuizBowlHub Project Utilities Script
# Various utility functions for project management

param(
    [string]$Action = "info",
    [string]$NewVersion = "",
    [switch]$DryRun
)

Write-Host "🔧 QuizBowlHub Project Utilities" -ForegroundColor Green
Write-Host ""

switch ($Action.ToLower()) {
    "info" {
        Write-Host "📊 Project Information" -ForegroundColor Cyan
        Write-Host "────────────────────" -ForegroundColor Gray
        
        # Read package.json
        if (Test-Path "package.json") {
            $package = Get-Content "package.json" | ConvertFrom-Json
            Write-Host "   📋 Name: $($package.name)" -ForegroundColor White
            Write-Host "   🏷️  Version: $($package.version)" -ForegroundColor White
            Write-Host "   📄 Description: $($package.description)" -ForegroundColor White
            
            if ($package.scripts) {
                Write-Host "   ⚙️  Scripts: $($package.scripts.PSObject.Properties.Name.Count) available" -ForegroundColor White
            }
            
            if ($package.dependencies) {
                Write-Host "   📦 Dependencies: $($package.dependencies.PSObject.Properties.Name.Count) packages" -ForegroundColor White
            }
        }
        
        # Git information
        try {
            $gitBranch = git rev-parse --abbrev-ref HEAD 2>$null
            $gitCommit = git rev-parse --short HEAD 2>$null
            $gitStatus = git status --porcelain 2>$null
            
            Write-Host "   🌳 Git Branch: $gitBranch" -ForegroundColor White
            Write-Host "   🔖 Latest Commit: $gitCommit" -ForegroundColor White
            
            if ($gitStatus) {
                $changedFiles = ($gitStatus | Measure-Object).Count
                Write-Host "   📄 Modified Files: $changedFiles" -ForegroundColor Yellow
            } else {
                Write-Host "   ✅ Working Directory: Clean" -ForegroundColor Green
            }
        } catch {
            Write-Host "   🚫 Git: Not a git repository" -ForegroundColor Gray
        }
        
        # File statistics
        $jsFiles = Get-ChildItem -Path "." -Filter "*.js" -Recurse -File | Where-Object {
            $_.FullName -notmatch "node_modules|dist|.git" 
        }
        $totalSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
        $totalSizeKB = [math]::Round($totalSize / 1KB, 2)
        
        Write-Host "   📁 Project Files: $($jsFiles.Count) JavaScript files ($totalSizeKB KB)" -ForegroundColor White
        
        # Node.js version
        try {
            $nodeVersion = node --version
            Write-Host "   🔸 Node.js: $nodeVersion" -ForegroundColor White
        } catch {
            Write-Host "   ❌ Node.js: Not installed" -ForegroundColor Red
        }
    }
    
    "tree" {
        Write-Host "🌳 Project Structure" -ForegroundColor Cyan
        Write-Host "──────────────────" -ForegroundColor Gray
        
        function Show-DirectoryTree {
            param(
                [string]$Path = ".",
                [string]$Prefix = "",
                [int]$MaxDepth = 3,
                [int]$CurrentDepth = 0
            )
            
            if ($CurrentDepth -gt $MaxDepth) { return }
            
            $items = Get-ChildItem -Path $Path | Where-Object {
                $_.Name -notmatch "^(node_modules|dist|\.git|\.turbo)$"
            } | Sort-Object @{Expression={$_.PSIsContainer}; Descending=$true}, Name
            
            for ($i = 0; $i -lt $items.Count; $i++) {
                $item = $items[$i]
                $isLast = ($i -eq $items.Count - 1)
                $currentPrefix = if ($isLast) { "└── " } else { "├── " }
                $nextPrefix = if ($isLast) { "    " } else { "│   " }
                
                if ($item.PSIsContainer) {
                    Write-Host "$Prefix$currentPrefix📁 $($item.Name)" -ForegroundColor Yellow
                    Show-DirectoryTree -Path $item.FullName -Prefix "$Prefix$nextPrefix" -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
                } else {
                    $icon = switch ($item.Extension) {
                        ".js" { "📄" }
                        ".json" { "📄" }
                        ".md" { "📄" }
                        ".html" { "🌐" }
                        ".ps1" { "⚙️" }
                        default { "📄" }
                    }
                    Write-Host "$Prefix$currentPrefix$icon $($item.Name)" -ForegroundColor White
                }
            }
        }
        
        Show-DirectoryTree
    }
    
    "dependencies" {
        Write-Host "📦 Analyzing Dependencies" -ForegroundColor Cyan
        Write-Host "────────────────────────" -ForegroundColor Gray
        
        if (Test-Path "package.json") {
            $package = Get-Content "package.json" | ConvertFrom-Json
            
            if ($package.dependencies) {
                Write-Host "   📚 Production Dependencies:" -ForegroundColor Green
                $package.dependencies.PSObject.Properties | ForEach-Object {
                    Write-Host "      • $($_.Name): $($_.Value)" -ForegroundColor White
                }
            }
            
            if ($package.devDependencies) {
                Write-Host "   🔧 Development Dependencies:" -ForegroundColor Yellow
                $package.devDependencies.PSObject.Properties | ForEach-Object {
                    Write-Host "      • $($_.Name): $($_.Value)" -ForegroundColor White
                }
            }
            
            # Check for outdated packages
            Write-Host "   🔍 Checking for updates..." -ForegroundColor Cyan
            try {
                $outdated = npm outdated --json 2>$null
                if ($outdated) {
                    $outdatedPkgs = $outdated | ConvertFrom-Json
                    $updateCount = ($outdatedPkgs.PSObject.Properties | Measure-Object).Count
                    if ($updateCount -gt 0) {
                        Write-Host "      ⚠️  $updateCount packages have updates available" -ForegroundColor Yellow
                    } else {
                        Write-Host "      ✅ All packages are up to date" -ForegroundColor Green
                    }
                } else {
                    Write-Host "      ✅ All packages are up to date" -ForegroundColor Green
                }
            } catch {
                Write-Host "      ℹ️  Could not check for updates" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ❌ No package.json found" -ForegroundColor Red
        }
    }
    
    "version" {
        if (-not $NewVersion) {
            Write-Host "❌ Please specify a new version with -NewVersion parameter" -ForegroundColor Red
            Write-Host "📋 Example: .\scripts\project-utils.ps1 version -NewVersion '1.2.0'" -ForegroundColor Cyan
            exit 1
        }
        
        Write-Host "🏷️  Updating project version to $NewVersion" -ForegroundColor Yellow
        
        if (Test-Path "package.json") {
            $package = Get-Content "package.json" | ConvertFrom-Json
            $oldVersion = $package.version
            
            if ($DryRun) {
                Write-Host "   📄 Would update version: $oldVersion -> $NewVersion" -ForegroundColor Cyan
            } else {
                $package.version = $NewVersion
                $package | ConvertTo-Json -Depth 10 | Out-File -FilePath "package.json" -Encoding UTF8
                Write-Host "   ✅ Updated package.json: $oldVersion -> $NewVersion" -ForegroundColor Green
                
                # Update package-lock.json if it exists
                if (Test-Path "package-lock.json") {
                    $lockfile = Get-Content "package-lock.json" | ConvertFrom-Json
                    $lockfile.version = $NewVersion
                    $lockfile | ConvertTo-Json -Depth 10 | Out-File -FilePath "package-lock.json" -Encoding UTF8
                    Write-Host "   ✅ Updated package-lock.json" -ForegroundColor Green
                }
                
                # Create git tag if in git repository
                try {
                    git tag "v$NewVersion"
                    Write-Host "   ✅ Created git tag: v$NewVersion" -ForegroundColor Green
                } catch {
                    Write-Host "   ℹ️  Could not create git tag (not a git repo or tag exists)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "   ❌ No package.json found" -ForegroundColor Red
        }
    }
    
    "scripts" {
        Write-Host "⚙️  Available Scripts" -ForegroundColor Cyan
        Write-Host "──────────────────" -ForegroundColor Gray
        
        # Project scripts from package.json
        if (Test-Path "package.json") {
            $package = Get-Content "package.json" | ConvertFrom-Json
            if ($package.scripts) {
                Write-Host "   📋 NPM Scripts:" -ForegroundColor Green
                $package.scripts.PSObject.Properties | ForEach-Object {
                    Write-Host "      • npm run $($_.Name): $($_.Value)" -ForegroundColor White
                }
                Write-Host ""
            }
        }
        
        # PowerShell scripts in scripts folder
        $scriptFiles = Get-ChildItem -Path "scripts" -Filter "*.ps1" -ErrorAction SilentlyContinue
        if ($scriptFiles) {
            Write-Host "   ⚙️  PowerShell Scripts:" -ForegroundColor Blue
            foreach ($script in $scriptFiles) {
                $description = ""
                $firstLine = Get-Content $script.FullName -TotalCount 3 | Where-Object { $_ -match "^#" } | Select-Object -First 1
                if ($firstLine -match "# (.+)") {
                    $description = " - $($matches[1])"
                }
                Write-Host "      • .\scripts\$($script.Name)$description" -ForegroundColor White
            }
        }
    }
    
    default {
        Write-Host "❓ Available utility actions:" -ForegroundColor Yellow
        Write-Host "   info         - Show project information and statistics" -ForegroundColor White
        Write-Host "   tree         - Display project directory structure" -ForegroundColor White
        Write-Host "   dependencies - Analyze project dependencies" -ForegroundColor White
        Write-Host "   version      - Update project version" -ForegroundColor White
        Write-Host "   scripts      - List available scripts" -ForegroundColor White
        Write-Host "" 
        Write-Host "📋 Usage examples:" -ForegroundColor Cyan
        Write-Host "   .\scripts\project-utils.ps1 info" -ForegroundColor Gray
        Write-Host "   .\scripts\project-utils.ps1 tree" -ForegroundColor Gray
        Write-Host "   .\scripts\project-utils.ps1 version -NewVersion '1.1.0'" -ForegroundColor Gray
        Write-Host "   .\scripts\project-utils.ps1 version -NewVersion '1.1.0' -DryRun" -ForegroundColor Gray
    }
}