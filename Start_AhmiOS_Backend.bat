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
cd C:\Users\aalta\github\ahmios-site
npm run dev:server
pause
