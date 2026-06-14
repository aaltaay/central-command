@echo off
title AhmiOS Backend Server (Hermes Uplink)
echo ===================================================
echo AhmiOS Central Command - Local Backend Server
echo ===================================================
echo.
echo Keep this window open in the background.
echo As long as this window is open, the dashboard at
echo https://ahmios.altaystudio.com/ will be able to
echo connect to your local Hermes agent and skills.
echo.
echo Press Ctrl+C to stop the server if needed.
echo.

REM Start Hermes Gateway (API server on port 8642) in background
echo Starting Hermes Gateway API server...
start /b "" "C:\Users\aalta\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe" gateway run
timeout /t 3 /nobreak >nul

cd C:\Users\aalta\github\ahmios-site
npm run dev:server
pause
