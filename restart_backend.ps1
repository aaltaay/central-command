# Script to cleanly stop and restart all local AhmiOS Backend processes.
# This terminates old instances on ports 3001 and 8642, clears active tunnels, and spins up fresh instances.

$ErrorActionPreference = "SilentlyContinue"

# 1. Terminate any process on Port 3001 (Node Express backend)
$port3001 = Get-NetTCPConnection -LocalPort 3001 -State Listen
if ($port3001) {
    $pid3001 = $port3001[0].OwningProcess
    Write-Host "Stopping existing Node backend (PID $pid3001) on Port 3001..."
    Stop-Process -Id $pid3001 -Force
    Start-Sleep -Seconds 1
}

# 2. Terminate any process on Port 8642 (Hermes Gateway)
$port8642 = Get-NetTCPConnection -LocalPort 8642 -State Listen
if ($port8642) {
    $pid8642 = $port8642[0].OwningProcess
    Write-Host "Stopping existing Hermes Gateway (PID $pid8642) on Port 8642..."
    Stop-Process -Id $pid8642 -Force
    Start-Sleep -Seconds 1
}

# 3. Terminate any active Cloudflare Tunnel processes
$cfProcs = Get-Process -Name "cloudflared"
if ($cfProcs) {
    Write-Host "Stopping existing Cloudflare Tunnel instances..."
    $cfProcs | Stop-Process -Force
    Start-Sleep -Seconds 1
}

# 4. Start Hermes Gateway (Detached/Hidden)
Write-Host "Launching Hermes Gateway..."
Start-Process -FilePath "C:\Users\aalta\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe" -ArgumentList "gateway run --replace" -WindowStyle Hidden

# 5. Start Cloudflare Tunnel (Detached/Hidden)
Write-Host "Launching Cloudflare Tunnel..."
Start-Process -FilePath "C:\Users\aalta\cloudflared.exe" -ArgumentList "tunnel run ahmios-backend" -WindowStyle Hidden
Start-Sleep -Seconds 2

# 6. Start Node Express Backend Server (Detached/Hidden)
Write-Host "Launching Express Backend Server..."
Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev:server" -WorkingDirectory "C:\Users\aalta\github\ahmios-site" -WindowStyle Hidden

Write-Host "--------------------------------------------------------"
Write-Host "Success! Backend server, Hermes Gateway, and Cloudflare Tunnel"
Write-Host "have been successfully restarted in the background."
Write-Host "--------------------------------------------------------"
