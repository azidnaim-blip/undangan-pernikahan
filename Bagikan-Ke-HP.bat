@echo off
chcp 65001 >nul
title BrewPoint POS - Akses Online HP
cls

cd /d "%~dp0"
node scripts/share.js

if %errorlevel% neq 0 (
    echo.
    echo [!] Terjadi kesalahan. Membuka mode darurat...
    if exist "cloudflared.exe" (
        cloudflared.exe tunnel --url http://localhost:3000
    ) else (
        ssh -p 443 -R0:localhost:3000 -o StrictHostKeyChecking=no a.pinggy.io
    )
)

pause
