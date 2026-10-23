@echo off
title UNDANGAN PERNIKAHAN DIGITAL - ARYA & ANNISA
color 0E
echo ========================================================
echo        UNDANGAN PERNIKAHAN DIGITAL BERBASIS WEB
echo                  Arya & Annisa
echo ========================================================
echo.
echo Membuka undangan pernikahan di browser default Anda...
echo Parameter contoh tamu: Budi Santoso
echo.

start "" "%~dp0undangan-pernikahan\index.html?to=Budi+Santoso"

echo Selesai! Jika browser tidak terbuka otomatis, buka:
echo %~dp0undangan-pernikahan\index.html
echo.
pause
