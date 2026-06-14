# sync-brain-to-onedrive.ps1
# Runs a robust one-way sync of the Antigravity brain and conversations to OneDrive.

$ErrorActionPreference = "SilentlyContinue"

$userHome = $HOME
$agSrc = Join-Path $userHome ".gemini\antigravity"
$oneDriveDest = Join-Path $userHome "OneDrive\AhmiOSBrain"

# Create destination folders if they don't exist
if (-not (Test-Path $oneDriveDest)) {
    New-Item -ItemType Directory -Path $oneDriveDest | Out-Null
}

Write-Host "Syncing AhmiOS state to OneDrive..." -ForegroundColor Cyan

# 1. Sync brain directory
$brainSrc = Join-Path $agSrc "brain"
$brainDest = Join-Path $oneDriveDest "brain"
Write-Host "   Syncing brain folder..." -ForegroundColor Gray
robocopy $brainSrc $brainDest /E /R:2 /W:2 /NJH /NJS /NDL /NFL | Out-Null

# 2. Sync conversations directory
$convSrc = Join-Path $agSrc "conversations"
$convDest = Join-Path $oneDriveDest "conversations"
Write-Host "   Syncing conversations folder..." -ForegroundColor Gray
robocopy $convSrc $convDest /E /R:2 /W:2 /NJH /NJS /NDL /NFL | Out-Null

Write-Host "Sync complete!" -ForegroundColor Green
