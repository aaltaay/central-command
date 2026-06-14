# setup.ps1
# Run this script after cloning the AhmiOS repository to configure it.

$ErrorActionPreference = "Continue"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "         AhmiOS Setup & Initialization       " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Update/Initialize Git Submodules
Write-Host "1. Initializing and updating nested git submodules..." -ForegroundColor Yellow
if (Test-Path .git) {
    git submodule update --init --recursive
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Submodules initialized successfully!" -ForegroundColor Green
    } else {
        Write-Warning "   Failed to update submodules. Please run 'git submodule update --init --recursive' manually."
    }
} else {
    Write-Warning "   Not a git repository. Skipping submodule update."
}

# 2. Check for Python environment
Write-Host "`n2. Detecting Python environment..." -ForegroundColor Yellow
$pythonCmd = "python"
$pythonPath = Get-Command python -ErrorAction SilentlyContinue

# Check user's specific Anaconda location as fallback/primary if exists
$anacondaPath = "C:\Users\$env:USERNAME\anaconda3\python.exe"
if (Test-Path $anacondaPath) {
    $pythonCmd = $anacondaPath
    Write-Host "   Detected Anaconda Python: $pythonCmd" -ForegroundColor Green
} elseif ($null -ne $pythonPath) {
    Write-Host "   Detected System Python: $($pythonPath.Source)" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "   Please install Python before running this setup." -ForegroundColor Yellow
    exit 1
}

# 3. Install dependencies from requirements.txt in all skill directories
Write-Host "`n3. Installing Python dependencies..." -ForegroundColor Yellow

# Find all requirements.txt files recursively
$reqFiles = Get-ChildItem -Path . -Filter requirements.txt -Recurse -File -ErrorAction SilentlyContinue

foreach ($req in $reqFiles) {
    Write-Host "   Installing dependencies from: $($req.FullName)" -ForegroundColor Gray
    & $pythonCmd -m pip install -r $req.FullName --quiet --user
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Warning "   Some dependencies failed to install for $($req.Directory.Name)."
    }
}

# 4. Check for .env.secrets configuration
Write-Host "`n4. Validating environment configuration..." -ForegroundColor Yellow
$secretsPath = "C:\Users\$env:USERNAME\.gemini\antigravity\.env.secrets"
if (Test-Path $secretsPath) {
    Write-Host "   Found secrets file at $secretsPath" -ForegroundColor Green
    $secretsContent = Get-Content $secretsPath -Raw
    
    # Check for Pinecone Keys
    if ($secretsContent -match "PINECONE_API_KEY") {
        Write-Host "   [OK] PINECONE_API_KEY is configured." -ForegroundColor Green
    } else {
        Write-Host "   [WARNING] PINECONE_API_KEY is missing from .env.secrets." -ForegroundColor Yellow
    }
    
    # Check for Gemini Keys
    if ($secretsContent -match "GEMINI_API_KEY") {
        Write-Host "   [OK] GEMINI_API_KEY is configured." -ForegroundColor Green
    } else {
        Write-Host "   [WARNING] GEMINI_API_KEY is missing from .env.secrets." -ForegroundColor Yellow
    }
} else {
    Write-Host "   [WARNING] Secrets file not found at $secretsPath" -ForegroundColor Yellow
    Write-Host "   Make sure to create this file and configure GEMINI_API_KEY and PINECONE_API_KEY." -ForegroundColor Yellow
}

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "        Setup Completed Successfully!         " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
