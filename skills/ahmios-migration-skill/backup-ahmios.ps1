# backup-ahmios.ps1
# Run this on your current laptop to back up your Antigravity environment.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   AhmiOS Environment Backup Utility    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$userHome = $HOME
$geminiDir = Join-Path $userHome ".gemini"
$skillsDir = Join-Path $userHome "github\AhmiOS"
$stageDir = Join-Path $env:TEMP "ahmios_backup_stage"
$zipPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "ahmios_backup.zip"

if (Test-Path $stageDir) {
    Write-Host "Cleaning up old staging folder..." -ForegroundColor Gray
    Remove-Item $stageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $stageDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stageDir "gemini") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stageDir "skills") | Out-Null

# 1. Backup .gemini/config
Write-Host "1. Backing up global config..." -ForegroundColor Yellow
$configSrc = Join-Path $geminiDir "config"
$configDest = Join-Path $stageDir "gemini\config"
if (Test-Path $configSrc) {
    Copy-Item $configSrc $configDest -Recurse -Force
} else {
    Write-Warning "Global config folder not found at $configSrc"
}

# 2. Backup .gemini/antigravity files (excluding scratch, recordings, logs, etc.)
Write-Host "2. Backing up AhmiOS state and secrets..." -ForegroundColor Yellow
$agSrc = Join-Path $geminiDir "antigravity"
$agDest = Join-Path $stageDir "gemini\antigravity"
New-Item -ItemType Directory -Path $agDest | Out-Null

# Copy specific root files in antigravity folder (including env secrets)
$filesToCopy = @(".env.secrets", "antigravity_state.pbtxt", "agyhub_summaries_proto.pb", "installation_id", "mcp_oauth_tokens.json")
foreach ($file in $filesToCopy) {
    $filePath = Join-Path $agSrc $file
    if (Test-Path $filePath) {
        Copy-Item $filePath (Join-Path $agDest $file) -Force
    }
}

# Copy brain and conversations if they exist
foreach ($dir in @("brain", "conversations")) {
    $dirPath = Join-Path $agSrc $dir
    if (Test-Path $dirPath) {
        Write-Host "   Copying $dir..." -ForegroundColor Gray
        Copy-Item $dirPath (Join-Path $agDest $dir) -Recurse -Force
    }
}

# 3. Backup AhmiOS
Write-Host "3. Backing up custom skills..." -ForegroundColor Yellow
$skillsDest = Join-Path $stageDir "skills"
New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null
if (Test-Path $skillsDir) {
    Write-Host "   Running robocopy to copy custom skills (excluding build folders)..." -ForegroundColor Gray
    robocopy $skillsDir $skillsDest /E /XD node_modules venv .venv env .next dist .cache /XF *.log /R:1 /W:1 /NFL /NDL | Out-Null
    if ($LASTEXITCODE -ge 8) {
        Write-Warning "Robocopy failed to copy custom skills with status code $LASTEXITCODE"
    } else {
        Write-Host "   Custom skills copied successfully!" -ForegroundColor Green
    }
} else {
    Write-Warning "Skills folder not found at $skillsDir"
}

# 4. Backup scratch repositories, excluding bulky directories (node_modules, venv, build dirs)
Write-Host "4. Backing up repositories from scratch (excluding build artifacts)..." -ForegroundColor Yellow
$scratchSrc = Join-Path $agSrc "scratch"
$scratchDest = Join-Path $agDest "scratch"
New-Item -ItemType Directory -Path $scratchDest -Force | Out-Null

Write-Host "   Running robocopy to copy repositories..." -ForegroundColor Gray
robocopy $scratchSrc $scratchDest /E /XD node_modules venv .venv env .next dist _youtube_downloads tmp .cache /XF *.log /R:1 /W:1 /NFL /NDL | Out-Null
if ($LASTEXITCODE -ge 8) {
    Write-Host "   Robocopy finished with status code $LASTEXITCODE (might have skipped or had some errors)." -ForegroundColor Yellow
} else {
    Write-Host "   Repositories copied successfully!" -ForegroundColor Green
}

# 5. Compress staging folder to ZIP
Write-Host "5. Creating zip archive on Desktop..." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
# Compress-Archive has a 2GB limit in older powershell versions; let's use Zip if available or standard cmdlet
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($stageDir, $zipPath)

# 6. Clean up staging folder
Write-Host "6. Cleaning up temporary folders..." -ForegroundColor Yellow
Remove-Item $stageDir -Recurse -Force

Write-Host "=============================================" -ForegroundColor Green
Write-Host "          Backup Completed Successfully!     " -ForegroundColor Green
Write-Host " Archive path: $zipPath" -ForegroundColor Green
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host " Archive size: $([Math]::Round($zipSize, 2)) MB" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy 'ahmios_backup.zip' (on your Desktop) to a USB drive or cloud storage." -ForegroundColor White
Write-Host "2. Copy the 'restore-ahmios.ps1' script to the same location on your new laptop." -ForegroundColor White
Write-Host "3. Run 'restore-ahmios.ps1' on the new laptop to restore your workspace." -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Green
