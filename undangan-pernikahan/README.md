# Panduan Lengkap: Mengatur Isi Undangan Pernikahan Secara Mandiri

Undangan pernikahan berbasis web ini telah dilengkapi sistem **pengaturan mandiri**, sehingga Anda dapat dengan mudah mengubah nama mempelai, tanggal acara, lokasi, foto, nomor rekening amplop digital, dan musik pengiring sesuai keinginan Anda.

---

## 🎨 METODE 1: Mengatur Secara Visual Lewat Form di Browser (Paling Mudah, Tanpa Koding)

Anda tidak perlu membuka kode program atau teks yang rumit. Cukup gunakan form visual interaktif:

### Jika Menjalankan Server Lokal (Next.js):
1. Buka link: **[http://localhost:3000/undangan/edit](http://localhost:3000/undangan/edit)**
   *(atau pada halaman undangan [http://localhost:3000](http://localhost:3000), klik tombol **"Atur Undangan"** di sudut kiri atas)*.
2. Anda akan melihat formulir lengkap:
   - **Data Mempelai Pria**: Nama lengkap & gelar, nama panggilan, nama ayah & ibu, foto.
   - **Data Mempelai Wanita**: Nama lengkap & gelar, nama panggilan, nama ayah & ibu, foto.
   - **Foto Sampul Utama & Tanggal Acara**: Tanggal akad untuk timer hitung mundur, teks tanggal, link audio musik latar (MP3).
   - **Rangkaian Acara**: Jam, nama masjid/gedung, alamat lengkap untuk Akad & Resepsi.
   - **Amplop Digital & WhatsApp**: Nomor rekening BCA, Bank Mandiri/lainnya, atas nama, alamat kirim kado, nomor WhatsApp panitia/mempelai.
3. Klik tombol **"Pilih Foto"** untuk memilih foto langsung dari laptop atau HP Anda.
4. Klik **"Simpan Perubahan"** &rarr; Halaman undangan akan otomatis langsung terbarui seketika!

### Jika Membuka Versi Standalone (Offline / Tanpa Server):
1. Buka berkas **[`undangan-pernikahan/editor.html`](file:///d:/apk%20newwwwww/undangan-pernikahan/editor.html)** di browser (cukup klik dua kali).
2. Isi formulir yang disediakan.
3. Klik **"Simpan Perubahan"** untuk langsung melihat hasilnya di `index.html`.
4. Anda juga bisa mengeklik tombol **"Unduh File .js"** untuk mengunduh berkas `wedding-config.js` baru agar dapat disimpan secara permanen saat Anda mengunggahnya ke hosting gratis (seperti GitHub Pages / Vercel).

---

## 💻 METODE 2: Mengubah Lewat Berkas Konfigurasi (File Code / Text Editor)

Jika Anda lebih suka mengedit langsung file kode melalui Notepad atau VS Code:

### 1. Untuk Versi Standalone:
Buka berkas **[`undangan-pernikahan/wedding-config.js`](file:///d:/apk%20newwwwww/undangan-pernikahan/wedding-config.js)**:
```javascript
const WEDDING_DATA = {
  groom: {
    nickname: "Arya",
    fullName: "Raden Arya Wijaya, S.Kom.",
    father: "Bpk. Bambang Wijaya",
    mother: "Ibu Sri Rahayu",
    instagram: "https://instagram.com/aryawijaya",
    photo: "https://... atau assets/groom.jpg",
  },
  bride: {
    nickname: "Annisa",
    fullName: "Siti Annisa Putri, S.Farm.",
    father: "Bpk. H. Rahmat Hidayat",
    mother: "Ibu Hj. Siti Nurjanah",
    instagram: "https://instagram.com/annisaputri",
    photo: "https://... atau assets/bride.jpg",
  },
  weddingDate: "2026-11-28T08:00:00", // Format: YYYY-MM-DDTHH:mm:ss
  displayDate: "Sabtu, 28 November 2026",
  // ...
};
```
Tinggal ganti teks di dalam tanda kutip `"..."` lalu simpan (`Ctrl + S`).

### 2. Untuk Versi Next.js:
Buka berkas **[`src/app/undangan/wedding-data.ts`](file:///d:/apk%20newwwwww/src/app/undangan/wedding-data.ts)** dan ganti nilainya sesuai keinginan.

---

## 📸 Cara Memasukkan Foto Pribadi Sendiri

Ada 3 cara mudah:
1. **Paling Praktis (Upload Langsung di Editor)**:
   Buka form editor ([/undangan/edit](http://localhost:3000/undangan/edit) atau `editor.html`), klik tombol **"Pilih Foto"**, lalu pilih foto dari laptop/HP Anda.
2. **Menggunakan Link Foto Online (Google Drive / Imgur / Cloudinary / Unsplash)**:
   Salin link foto berakhiran `.jpg` / `.png` lalu tempelkan ke kolom URL Foto.
3. **Menyimpan Berkas Foto di Folder Proyek**:
   - Salin file foto Anda (misal `foto-kita.jpg`) ke folder `public/uploads/` atau `undangan-pernikahan/assets/`.
   - Isi path fotonya: `/uploads/foto-kita.jpg` atau `./assets/foto-kita.jpg`.

---

## 🎵 Cara Mengganti Musik Pengiring (BGM)

1. Cari file audio MP3 lagu pernikahan pilihan Anda yang memiliki link langsung (Direct URL).
2. Atau salin file lagu Anda (misal `lagu.mp3`) ke folder `public/` atau `undangan-pernikahan/`.
3. Masukkan link atau nama filenya pada kolom **URL Musik Latar** di form editor.

---

## 💌 Cara Membuat Link Undangan Khusus Tamu (Personalisasi Nama)

Bagikan tautan dengan menambahkan parameter `?to=Nama+Tamu`:
- `http://localhost:3000/?to=Budi+Santoso`
- `http://localhost:3000/?to=Bpk.+Hendra+%26+Keluarga`
- `https://website-anda.com/?to=Sahabat+Tersayang`

Nama tamu akan otomatis tampil di cover depan, sapaan pembuka, dan otomatis terisi di formulir RSVP!
