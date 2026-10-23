@echo off
title BREWPOINT CAFE POS & KDS
color 0E
echo ========================================================
echo        BREWPOINT POS & KITCHEN DISPLAY SYSTEM
echo              Sistem Kasir Cafe Modern
echo ========================================================
echo.
echo Menjalankan server lokal POS Cafe pada http://localhost:3000 ...
echo Tekan Ctrl + C di jendela ini jika ingin menghentikan aplikasi.
echo.

set PATH=%PATH%;C:\Program Files\nodejs

:: Buka browser secara otomatis setelah 3 detik
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000/pos"

:: Jalankan Next.js server produksi lokal
npm.cmd start

pause
