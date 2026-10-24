# 🚀 Panduan Otomatisasi Deploy BrewPoint POS (Vercel & Android APK)

Dokumen ini memandu Anda menghubungkan repository GitHub ke **Vercel** (untuk server web 24/7) dan mengaktifkan **GitHub Actions** (untuk membuat file installer Android `.apk` secara otomatis).

---

## Bagian 1: Buat Database Cloud Gratis di Neon (1 Menit)

1. Buka [neon.tech](https://neon.tech) dan login / daftar menggunakan akun GitHub Anda.
2. Klik **"Create Project"**.
   - Project name: `brewpoint-pos`
   - Database name: `neondb` (default)
3. Setelah project dibuat, Anda akan melihat kotak **Connection Details**.
4. Salin string koneksi **Prisma** atau **Direct connection**, contohnya:
   ```text
   postgresql://username:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Simpan string ini untuk dimasukkan ke Vercel di Bagian 2.

---

## Bagian 2: Hubungkan Repository ke Vercel (2 Menit)

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** ➔ **"Project"**.
3. Cari repository Anda: `azidnaim-blip/undangan-pernikahan` dan klik **"Import"**.
4. Di bagian **Configure Project**:
   - **Framework Preset**: Biarkan otomatis `Next.js`.
   - **Root Directory**: `./` (default).
   - **Environment Variables**: Klik tanda tambah dan masukkan:
     - **Name**: `DATABASE_URL`
     - **Value**: *(Tempelkan string koneksi Neon PostgreSQL dari Bagian 1)*
5. Klik **"Deploy"**!
6. Vercel akan otomatis meng-compile aplikasi Anda. Setelah selesai, Anda akan mendapatkan URL permanen seperti:
   ```text
   https://brewpoint-pos.vercel.app
   ```

---

## Bagian 3: Inisialisasi Database Pertama Kali (Seed Data)

Setelah Vercel selesai deploy dan terhubung ke Neon:
1. Buka terminal di laptop Anda dan jalankan perintah:
   ```bash
   # Masukkan URL Neon sementara untuk push schema & seed:
   $env:DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   
   # Buat tabel di cloud database:
   npm run prisma:push
   
   # Isi menu kopi, bahan baku, dan PIN staf default:
   npm run prisma:seed
   ```
2. Data akun default otomatis aktif:
   - **Owner / Manager**: PIN `9999`
   - **Dina (Kasir)**: PIN `1234`
   - **Reza (Barista)**: PIN `5678`

---

## Bagian 4: Otomatisasi Build Android APK (GitHub Actions)

Setiap kali Anda melakukan perintah:
```bash
git add .
git commit -m "update fitur"
git push origin main
```

Maka secara otomatis:
1. **Vercel** langsung meng-update website kasir online Anda dalam hitungan detik.
2. **GitHub Actions** (`.github/workflows/build-apk.yml`) langsung otomatis:
   - Menyiapkan environment Android SDK & Gradle.
   - Meng-compile aplikasi native Android.
   - Menghasilkan file installer: **`brewpoint-pos.apk`**.
   - Menerbitkan rilis baru di tab **Releases** GitHub Anda.

---

## Bagian 5: Cara Download & Install APK di HP Kasir / Barista

Staf cafe atau kasir dapat mengunduh APK dengan 2 cara mudah:
1. **Melalui Menu Web**:
   Buka URL Vercel atau akses halaman [`/download`](https://brewpoint-pos.vercel.app/download), lalu klik tombol **"Download APK Sekarang"** atau scan QR Code yang muncul di layar.
2. **Melalui Link Langsung GitHub Releases**:
   ```text
   https://github.com/azidnaim-blip/undangan-pernikahan/releases/latest/download/brewpoint-pos.apk
   ```

Selamat! Sistem POS & KDS cafe Anda kini berjalan 24/7 di cloud dan memiliki aplikasi Android mandiri! 🎉
