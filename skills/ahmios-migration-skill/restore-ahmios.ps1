# restore-ahmios.ps1
# Copy this script alongside 'ahmios_backup.zip' to your new laptop, and run it.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   AhmiOS Environment Restore Utility   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Detect current target user information
$newUsername = $env:USERNAME
$newUserHome = $HOME
$newGeminiDir = Join-Path $newUserHome ".gemini"
$newSkillsDir = Join-Path $newUserHome "github\AhmiOS"
$oldUsername = "aalta" # Username from the old machine

Write-Host "Detecting environment..." -ForegroundColor Yellow
Write-Host "   Target User: $newUsername" -ForegroundColor Gray
Write-Host "   Target Home: $newUserHome" -ForegroundColor Gray

# Locate the backup ZIP archive
$zipPath = Join-Path $PSScriptRoot "ahmios_backup.zip"
if (-not (Test-Path $zipPath)) {
    $zipPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "ahmios_backup.zip"
}

if (-not (Test-Path $zipPath)) {
    Write-Host "ERROR: Could not find ahmios_backup.zip in the script folder or on the Desktop." -ForegroundColor Red
    Write-Host "Please place this script in the same folder as ahmios_backup.zip and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found backup archive: $zipPath" -ForegroundColor Green

# Extract ZIP to a temporary directory
$tempExtractDir = Join-Path $env:TEMP "ahmios_restore_temp"
if (Test-Path $tempExtractDir) {
    Remove-Item $tempExtractDir -Recurse -Force | Out-Null
}
New-Item -ItemType Directory -Path $tempExtractDir | Out-Null

Write-Host "Extracting archive to temp folder..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $tempExtractDir)

# Ensure parent directories exist
if (-not (Test-Path $newGeminiDir)) {
    New-Item -ItemType Directory -Path $newGeminiDir | Out-Null
}

# 1. Restore config
Write-Host "1. Restoring global config..." -ForegroundColor Yellow
$configDest = Join-Path $newGeminiDir "config"
$extractedConfig = Join-Path $tempExtractDir "gemini\config"
if (Test-Path $extractedConfig) {
    if (Test-Path $configDest) {
        $backupSuffix = (Get-Date).ToString("yyyyMMddHHmmss")
        Write-Host "   Backing up existing config folder to config_backup_$backupSuffix" -ForegroundColor Gray
        Rename-Item $configDest "config_backup_$backupSuffix" -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $configDest -Force | Out-Null
    robocopy $extractedConfig $configDest /E /R:1 /W:1 /NFL /NDL | Out-Null
} else {
    Write-Warning "No config directory found in backup."
}

# 2. Restore antigravity folder
Write-Host "2. Restoring antigravity files..." -ForegroundColor Yellow
$agDest = Join-Path $newGeminiDir "antigravity"
$extractedAG = Join-Path $tempExtractDir "gemini\antigravity"
if (Test-Path $extractedAG) {
    if (-not (Test-Path $agDest)) {
        New-Item -ItemType Directory -Path $agDest -Force | Out-Null
    }
    robocopy $extractedAG $agDest /E /R:1 /W:1 /NFL /NDL | Out-Null
} else {
    Write-Warning "No antigravity directory found in backup."
}

# 3. Restore skills
Write-Host "3. Restoring custom AhmiOS..." -ForegroundColor Yellow
$extractedSkills = Join-Path $tempExtractDir "skills"
if (Test-Path $extractedSkills) {
    if (Test-Path $newSkillsDir) {
        $backupSuffix = (Get-Date).ToString("yyyyMMddHHmmss")
        Write-Host "   Backing up existing skills folder to AhmiOS_backup_$backupSuffix" -ForegroundColor Gray
        Rename-Item $newSkillsDir "AhmiOS_backup_$backupSuffix" -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $newSkillsDir -Force | Out-Null
    robocopy $extractedSkills $newSkillsDir /E /R:1 /W:1 /NFL /NDL | Out-Null
} else {
    Write-Warning "No AhmiOS directory found in backup."
}

# 4. Path adjustment if username changed
if ($newUsername -ine $oldUsername) {
    Write-Host "4. Detecting username change from '$oldUsername' to '$newUsername'. Updating path configurations..." -ForegroundColor Cyan

    $oldUserEscaped = [Regex]::Escape($oldUsername)
    $oldUserPathEscaped = [Regex]::Escape("C:\Users\$oldUsername")
    $oldUserPathEscapedLower = [Regex]::Escape("c:\Users\$oldUsername")
    $oldUserPathEscapedDoubleSlash = [Regex]::Escape("C:\\Users\\$oldUsername")
    $oldUserPathEscapedDoubleSlashLower = [Regex]::Escape("c:\\Users\\$oldUsername")

    # A. Update config.json permissions if containing old path
    $configJsonPath = Join-Path $newGeminiDir "config\config.json"
    if (Test-Path $configJsonPath) {
        Write-Host "   Updating paths in config.json..." -ForegroundColor Gray
        $content = Get-Content $configJsonPath -Raw
        $content = $content -replace $oldUserPathEscaped, "C:\Users\$newUsername"
        $content = $content -replace $oldUserPathEscapedLower, "C:\Users\$newUsername"
        $content | Set-Content $configJsonPath
    }

    # B. Update mcp_config.json
    $mcpConfigPath = Join-Path $newGeminiDir "config\mcp_config.json"
    if (Test-Path $mcpConfigPath) {
        Write-Host "   Updating paths in mcp_config.json..." -ForegroundColor Gray
        $content = Get-Content $mcpConfigPath -Raw
        $content = $content -replace $oldUserPathEscapedDoubleSlash, "C:\\Users\\$newUsername"
        $content = $content -replace $oldUserPathEscapedDoubleSlashLower, "c:\\Users\\$newUsername"
        $content = $content -replace $oldUserPathEscaped, "C:\Users\$newUsername"
        $content = $content -replace $oldUserPathEscapedLower, "c:\Users\$newUsername"
        $content | Set-Content $mcpConfigPath
    }

    # C. Update project files
    $projectsDir = Join-Path $newGeminiDir "config\projects"
    if (Test-Path $projectsDir) {
        Write-Host "   Updating paths in project config files..." -ForegroundColor Gray
        Get-ChildItem $projectsDir -Filter *.json | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $content = $content -replace "Users/$oldUserEscaped", "Users/$newUsername"
            $content = $content -replace "users/$oldUserEscaped", "users/$newUsername"
            $content = $content -replace $oldUserPathEscaped, "C:\Users\$newUsername"
            $content = $content -replace $oldUserPathEscapedLower, "c:\Users\$newUsername"
            $content | Set-Content $_.FullName
        }
    }

    # D. Update local .env files inside repositories
    $scratchDir = Join-Path $agDest "scratch"
    if (Test-Path $scratchDir) {
        Write-Host "   Updating paths in repository env files..." -ForegroundColor Gray
        Get-ChildItem $scratchDir -Filter .env -Recurse -Depth 2 -Force -ErrorAction SilentlyContinue | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $content = $content -replace $oldUserPathEscaped, "C:\Users\$newUsername"
            $content = $content -replace $oldUserPathEscapedLower, "c:\Users\$newUsername"
            $content | Set-Content $_.FullName
        }
    }
} else {
    Write-Host "4. Username is identical ('$newUsername'). No path updates needed." -ForegroundColor Green
}

# 5. Fix symlink for mcp_config.json in antigravity folder
Write-Host "5. Recreating mcp_config.json symlink..." -ForegroundColor Yellow
$symlinkPath = Join-Path $agDest "mcp_config.json"
if (Test-Path $symlinkPath) {
    # Remove existing link or file
    Remove-Item $symlinkPath -Force
}
# Create symbolic link linking antigravity\mcp_config.json -> config\mcp_config.json
New-Item -ItemType SymbolicLink -Path $symlinkPath -Target (Join-Path $configDest "mcp_config.json") | Out-Null
Write-Host "   Symlink created successfully!" -ForegroundColor Gray

# 6. Cleanup temp extract folder
Write-Host "6. Cleaning up temporary folders..." -ForegroundColor Yellow
Remove-Item $tempExtractDir -Recurse -Force

Write-Host "=============================================" -ForegroundColor Green
Write-Host "          Restore Completed Successfully!    " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "All config files, skills, environments, and repos have been restored." -ForegroundColor White
Write-Host "Note: Run 'npm install' or 'pip install -r requirements.txt' inside your" -ForegroundColor Yellow
Write-Host "project folders to rebuild dependencies (e.g. node_modules, venv) on the new laptop." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Green
