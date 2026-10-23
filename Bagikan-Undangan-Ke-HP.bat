@echo off
chcp 65001 >nul
title Undangan Pernikahan - Bagikan Ke HP Online
cls

cd /d "%~dp0"
node scripts/share-undangan.js

if %errorlevel% neq 0 (
    echo.
    echo [!] Terjadi kesalahan. Membuka mode darurat tunnel...
    if exist "cloudflared.exe" (
        cloudflared.exe tunnel --url http://localhost:3000
    )
)

pause
