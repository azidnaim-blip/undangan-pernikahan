# 🚀 Panduan Lengkap Deployment Undangan Pernikahan Digital

Dokumen ini menjelaskan **3 opsi deployment** untuk mempublikasikan website undangan pernikahan Anda agar dapat diakses oleh tamu undangan secara online 24/7 di seluruh dunia.

---

## ⚡ OPSI 1: Live Cloudflare Tunnel (Langsung Aktif Saat Ini)

Saat ini server produksi telah aktif berjalan dan terhubung ke terowongan aman Cloudflare (*Cloudflare Tunnel*):

### 🌐 Link Online yang Sedang Aktif:
* **Link Tamu Utama**:  
  👉 **[https://heather-always-mime-clay.trycloudflare.com/](https://heather-always-mime-clay.trycloudflare.com/)**
* **Contoh Link Khusus Tamu di Amplop Depan**:  
  👉 `https://heather-always-mime-clay.trycloudflare.com/?to=Budi+Santoso`  
  👉 `https://heather-always-mime-clay.trycloudflare.com/?to=Bpk.+Hendra+%26+Keluarga`
* **Link Panel Pengantin (Ubah Data, Foto, Rekening)**:  
  👉 **[https://heather-always-mime-clay.trycloudflare.com/pengantin/edit](https://heather-always-mime-clay.trycloudflare.com/pengantin/edit)**

### 📱 Cara Menjalankannya di Komputer Kapan Saja:
Cukup klik dua kali berkas:  
👉 `Bagikan-Undangan-Ke-HP.bat`  
Skrip ini akan otomatis menyalakan server produksi Next.js dan menghubungkan Cloudflare Tunnel serta menyalin link ke clipboard Anda.

---

## ☁️ OPSI 2: Deploy Permanen ke Vercel (100% Gratis & Rekomendasi Utama)

Platform **Vercel** adalah platform resmi pembuat Next.js. Deploy ke Vercel memberikan:
* Domain HTTPS permanen (contoh: `https://undangan-arya-annisa.vercel.app`)
* Server aktif 24 jam nonstop tanpa perlu laptop Anda tetap menyala
* Server CDN super cepat (region Singapura / `sin1`)
* Dukungan kustom domain pribadi (misal: `www.arya-annisa.com` atau `nikah.my.id`)

### Langkah Mudah Deploy ke Vercel:
1. **Langkah 1**: Buka berkas pembantu:  
   👉 `Deploy-Ke-GitHub.bat` (atau buat repo di [github.com/new](https://github.com/new)).
2. **Langkah 2**: Masukkan URL repository GitHub Anda ke skrip tersebut untuk mengunggah (*push*) kode.
3. **Langkah 3**: Buka [vercel.com/new](https://vercel.com/new), login dengan akun GitHub Anda.
4. **Langkah 4**: Klik tombol **"Import"** pada repository proyek ini, lalu klik **"Deploy"**.
5. Selesai! Dalam 1-2 menit, website undangan pernikahan Anda sudah online permanen di internet.

---

## 📦 OPSI 3: Deploy Versi Statis HTML (Netlify Drop / cPanel Hosting)

Jika Anda ingin website statis murni yang super ringan (tanpa butuh Node.js server):

Telah disediakan berkas paket ZIP siap unggah di root proyek:  
👉 `undangan-pernikahan-siap-deploy.zip` (berisi HTML, CSS, JS, dan Gambar).

### A. Deploy via Netlify Drop (Hanya 10 Detik, Tanpa Registrasi Rumit):
1. Buka browser: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Tarik (*drag and drop*) folder `undangan-pernikahan` atau ekstrak file `undangan-pernikahan-siap-deploy.zip` ke kotak yang tersedia.
3. Netlify akan langsung memberikan link publik HTTPS aktif (contoh: `https://arya-annisa-wedding.netlify.app`).

### B. Deploy ke cPanel / Hosting Pribadi:
1. Login ke cPanel hosting Anda, buka **File Manager** -> folder `public_html`.
2. Unggah berkas `undangan-pernikahan-siap-deploy.zip`.
3. Klik kanan berkas zip lalu pilih **Extract**.
4. Website pernikahan Anda langsung live di domain utama Anda.

---

## 🔒 Keamanan & Pemisahan Akses Tamu vs Pengantin

* **Tamu Undangan**: Hanya melihat visual undangan mewah, animasi kelopak emas, cerita cinta, galeri foto, amplop digital, dan formulir Buku Tamu WhatsApp. Seluruh tombol pengeditan **disembunyikan** dari tamu.
* **Pengantin**: Membuka `/pengantin/edit` untuk mengatur data. Setiap kali pengantin mengklik *"Simpan Perubahan ke Semua Tamu"*, data tersimpan ke server dan otomatis langsung tampil ke semua tamu.
