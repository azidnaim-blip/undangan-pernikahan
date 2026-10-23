@echo off
chcp 65001 >nul
title Server Produksi Undangan Pernikahan (Port 3000)
cls
echo ======================================================================
echo    ⚡ MENJALANKAN SERVER PRODUKSI UNDANGAN PERNIKAHAN (PORT 3000)
echo ======================================================================
echo.
cd /d "%~dp0"
if not exist ".next" (
    echo [!] Folder .next belum ditemukan. Menjalankan build terlebih dahulu...
    call npm run build
)
echo Server Next.js Production aktif di:
echo - Lokal  : http://localhost:3000
echo - Jaringan: http://0.0.0.0:3000
echo.
echo Tekan Ctrl + C untuk mematikan server.
echo.
npx next start -H 0.0.0.0 -p 3000
pause
