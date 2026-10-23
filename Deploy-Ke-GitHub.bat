@echo off
chcp 65001 >nul
title Deploy Undangan Pernikahan ke GitHub & Vercel
cls
echo ======================================================================
echo    🚀 PANDUAN DEPLOY KE GITHUB & VERCEL (GRATIS, CEPAT, PERMANEN)
echo ======================================================================
echo.
echo Kode proyek Anda telah di-commit secara rapi ke Git lokal.
echo.
echo Ikuti 2 langkah mudah berikut:
echo.
echo ----------------------------------------------------------------------
echo LANGKAH 1: Buat Repository di GitHub
echo ----------------------------------------------------------------------
echo 1. Buka browser: https://github.com/new
echo 2. Beri nama: undangan-pernikahan
echo 3. Klik tombol hijau "Create repository"
echo.
echo ----------------------------------------------------------------------
echo LANGKAH 2: Masukkan URL Repository Anda
echo ----------------------------------------------------------------------
set /p REPO_URL="Tempel URL GitHub Anda (contoh: https://github.com/user/undangan.git): "
if "%REPO_URL%"=="" (
    echo.
    echo Tidak ada URL yang dimasukkan. Batal.
    goto end
)

echo.
echo Mengirim kode ke GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo  🎉 BERHASIL DI-PUSH KE GITHUB!
    echo ======================================================================
    echo Sekarang buka: https://vercel.com/new
    echo Klik "Import" pada repository 'undangan-pernikahan' lalu klik "Deploy".
    echo Website Anda akan langsung online permanen dengan domain https://...vercel.app!
) else (
    echo.
    echo [!] Gagal push ke GitHub. Pastikan Anda sudah login git credential.
)

:end
echo.
pause
