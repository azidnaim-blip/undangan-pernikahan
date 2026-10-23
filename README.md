# ☕ BrewPoint POS & Kitchen Display System (KDS)

Sistem Point of Sale (POS) kasir cafe modern, touch-friendly, dan offline-first yang dibangun menggunakan **Next.js 14**, **SQLite & Prisma ORM**, **Tailwind CSS**, dan arsitektur lokal/hybrid.

Aplikasi ini dirancang khusus untuk operasional kedai kopi / cafe counter-service, lengkap dengan manajemen resep bahan baku otomatis, alur antrean dapur realtime, serah terima shift kasir, dan laporan analitik eksekutif dengan export PDF.

---

## 🌟 Fitur Utama

### 1. 🖥️ POS Kasir Touch-Friendly (`/pos`)
- **Pencarian Cepat & Kategori Menu**: Signature Coffee, Espresso Based, Non-Coffee, Tea, Pastry & Bakery.
- **Kustomisasi Minuman (Modifiers)**:
  - Suhu: *Hot / Iced*
  - Tingkat Manis: *100% Normal, 70% Less Sugar, 50% Half, 0% No Sugar*
  - Level Es: *Normal, Less Ice, No Ice*
  - Pilihan Susu: *Fresh Milk, Oat Milk Barista (+Rp 8.000)*
  - Tambahan / Add-ons: *Extra Espresso Shot (+Rp 5.000), Grass Jelly (+Rp 4.000), Caramel Drizzle (+Rp 4.000)*
- **Multi-Metode Pembayaran**:
  - **Tunai (Cash)**: Tombol pecahan uang cepat (*Uang Pas, 20k, 50k, 100k, 200k*), numpad sentuh, dan kalkulator kembalian otomatis.
  - **QRIS & E-Wallet**: Tampilan QR code dinamis, mendukung pembayaran BCA, Mandiri, GoPay, OVO, ShopeePay, DANA.
- **Cetak Struk Thermal**:
  - Format standar printer thermal **58mm** dan **80mm**.
  - Cetak langsung melalui dialog browser printer atau unduh struk dalam format **PDF**.
  - Nomor antrean harian otomatis (*#001, #002...*).

### 2. 👨‍🍳 Barista / Kitchen Display System (`/kds`)
- Tampilan kartu antrean pesanan masuk tanpa kertas (paperless).
- **Indikator Waktu Tunggu Realtime**:
  - 🟢 Hijau (< 5 menit)
  - 🟡 Kuning (5 - 10 menit)
  - 🔴 Merah (> 10 menit)
- Penekanan visual pada kustomisasi minuman (*LESS SUGAR*, *OAT MILK*, *EXTRA SHOT*).
- Tombol status satu sentuhan: `Mulai Dibuat` -> `Pesanan Siap!` -> `Selesai Diambil`.
- Audio bell alert saat ada pesanan baru masuk dari kasir.

### 3. 💵 Manajemen Shift Kasir & Petty Cash (`/shift`)
- **Buka Shift**: Input modal kas awal di laci (*Starting Cash Float*).
- **Petty Cash**: Catat pengeluaran kas kecil kasir selama bertugas (misal: es batu darurat, air galon, plastik) dengan nominal dan keterangan.
- **Tutup Shift (Z-Report)**:
  - Input hitungan fisik uang di laci kasir.
  - Sistem otomatis menghitung **Saldo Seharusnya vs Saldo Fisik** dan menampilkan indikator **Selisih (Pas, Kurang, atau Lebih)**.
  - Rekam jejak seluruh shift sebelumnya tersimpan rapi.

### 4. 📦 Stok Bahan Baku, Resep & HPP (`/inventory`)
- **Otomatis Potong Stok**: Setiap transaksi selesai di kasir, sistem langsung memotong gramatur/ml bahan baku terkait sesuai resep menu.
- **Peringatan Stok Menipis**: Indikator visual saat stok bahan berada di bawah ambang batas minimum.
- **Formula Resep & HPP**:
  - Perhitungan otomatis Harga Pokok Penjualan (HPP) berdasarkan biaya per gram/ml bahan baku.
  - Kalkulasi margin laba kotor (%) per porsi menu.
- Fitur **+ Restock Cepat** untuk menambah stok bahan yang baru dibeli.

### 5. 📊 Dashboard Owner & Laporan Analitik (`/reports`)
- **KPI Finansial**: Total Omset, Total Transaksi, Laba Kotor (Gross Profit), dan Rata-rata Nilai Transaksi (AOV).
- **Analisis Jam Sibuk (Peak Hours)**: Grafik batang volume kunjungan cafe dari jam 07:00 hingga 22:00 untuk optimasi shift barista.
- **Menu Terlaris (Best Sellers)**: Peringkat 10 menu terfavorit beserta kontribusi omset dan estimasi laba.
- **Export Dokumen**:
  - **Export PDF**: Unduh dokumen laporan penjualan eksekutif berformat rapi siap cetak/diserahkan ke owner.
  - **Export Excel (CSV)**: Unduh data mentah transaksi untuk olah data di Microsoft Excel / Google Sheets.

---

## 🚀 Cara Menjalankan

### Cara 1: Sekali Klik di Windows
Cukup klik dua kali file **`start-pos.bat`**. 
Script akan otomatis menjalankan server lokal dan membuka browser kasir di `http://localhost:3000/pos`.

### Cara 2: Melalui Terminal / Command Prompt
```bash
# Jalankan mode produksi (cepat & teroptimasi)
npm start

# Atau jalankan mode development (untuk edit kode)
npm run dev
```

Buka browser di:
- Layar Kasir: `http://localhost:3000/pos`
- Layar Barista (KDS): `http://localhost:3000/kds`
- Layar Shift: `http://localhost:3000/shift`
- Layar Inventaris: `http://localhost:3000/inventory`
- Layar Laporan: `http://localhost:3000/reports`

---

## 📱 Akses dari Tablet iPad / Android via WiFi Cafe (LAN)
Untuk membuka aplikasi kasir atau layar barista dari tablet Android atau iPad yang terhubung ke WiFi yang sama dengan PC kasir:
1. Cari tahu IP komputer kasir (ketik `ipconfig` di command prompt, misal `192.168.1.15`).
2. Jalankan server dengan:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
3. Buka browser tablet di: `http://192.168.1.15:3000/pos` (untuk kasir) atau `http://192.168.1.15:3000/kds` (untuk tablet barista).

---

## 👤 Akun & PIN Default
- **Owner / Manager**: PIN `9999`
- **Kasir Utama (Dina)**: PIN `1234`
- **Barista (Reza)**: PIN `5678`

---

## 🗄️ Struktur Database & Database Reset
Database menggunakan SQLite lokal yang tersimpan di file `prisma/dev.db`.
Jika ingin mereset data kembali ke kondisi awal cafe siap pakai:
```bash
node prisma/seed.js
```
