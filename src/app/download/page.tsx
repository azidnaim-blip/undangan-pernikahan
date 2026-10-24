'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Smartphone,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ExternalLink,
  Coffee,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Cpu,
  Lock
} from 'lucide-react';

const REPO_SLUG = process.env.NEXT_PUBLIC_GITHUB_REPO || 'azidnaim-blip/undangan-pernikahan';
const LATEST_APK_URL = `https://github.com/${REPO_SLUG}/releases/latest/download/brewpoint-pos.apk`;
const RELEASES_PAGE_URL = `https://github.com/${REPO_SLUG}/releases`;

export default function DownloadPage() {
  const [showQr, setShowQr] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#181615] flex flex-col font-sans selection:bg-[#C2552D]/15 selection:text-[#C2552D]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/pos" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2552D] to-[#9E3E1B] flex items-center justify-center text-white shadow-md shadow-[#C2552D]/20 group-hover:scale-105 transition-transform">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-[#181615] flex items-center gap-1.5">
              <span>BrewPoint POS</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#C2552D]/10 text-[#C2552D] px-2 py-0.5 rounded-full">
                Android APK
              </span>
            </div>
            <div className="text-[11px] text-[#86868B] font-medium">Boutique Cafe POS & KDS System</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/pos"
            className="px-3.5 py-1.5 text-xs font-semibold text-[#86868B] hover:text-[#181615] bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-full transition-colors flex items-center gap-1.5"
          >
            <span>Buka Web POS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181615] via-[#2A2320] to-[#181615] text-white p-6 sm:p-10 shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C2552D]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#E5D7CE]">
                <Smartphone className="w-3.5 h-3.5 text-[#34C759]" />
                <span>Installer Native Android (.apk)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Download Aplikasi Kasir BrewPoint untuk Android
              </h1>
              <p className="text-sm text-[#C2B7AF] leading-relaxed">
                Pasang aplikasi langsung di smartphone atau tablet Android Anda. Bebas bilah browser, hemat kuota,
                antarmuka sentuh responsif, dan siap terhubung dengan printer kasir.
              </p>

              {/* Specs Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                  <HardDrive className="w-3.5 h-3.5 text-[#C2552D]" />
                  <span>Ukuran: ~15 MB</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                  <Cpu className="w-3.5 h-3.5 text-[#34C759]" />
                  <span>Android 7.0+ (Universal)</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Auto-Signed & Terverifikasi</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
              <a
                href={LATEST_APK_URL}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C2552D] hover:bg-[#A84520] text-white font-bold text-sm shadow-lg shadow-[#C2552D]/30 active:scale-95 transition-all text-center"
              >
                <Download className="w-4 h-4" />
                <span>Download APK Sekarang</span>
              </a>

              <button
                onClick={() => setShowQr(!showQr)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/90 font-semibold text-xs border border-white/15 backdrop-blur-sm transition-colors"
              >
                <QrCode className="w-4 h-4 text-[#C2552D]" />
                <span>{showQr ? 'Tutup QR Scanner' : 'Scan via Kamera HP'}</span>
              </button>

              <a
                href={RELEASES_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-white/60 hover:text-white pt-1 transition-colors"
              >
                <span>Lihat Riwayat Versi GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* QR Code Modal Drawer */}
          {showQr && (
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center text-center space-y-3 animate-fade-in">
              <div className="text-xs font-semibold text-[#E5D7CE]">
                Pindai QR ini dengan kamera HP untuk langsung mengunduh:
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                {/* QR Code SVG / API Generator */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    LATEST_APK_URL
                  )}`}
                  alt="QR Code Download APK"
                  className="w-44 h-44 rounded-lg object-contain"
                />
              </div>
              <div className="text-[11px] text-[#A89F97] font-mono break-all max-w-sm">
                {LATEST_APK_URL}
              </div>
            </div>
          )}
        </div>

        {/* 3 Step Installation Guide */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#181615] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
            <span>Panduan Instalasi APK di HP Android</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#C2552D]/10 text-[#C2552D] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-[#181615]">Unduh File APK</h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Klik tombol <strong>Download APK</strong> di atas atau scan QR code menggunakan kamera smartphone
                Android kasir Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-[#181615]">Izinkan Instalasi</h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Buka file <code className="font-mono text-[#181615]">brewpoint-pos.apk</code> yang baru diunduh. Jika muncul pop-up peringatan Play Protect, pilih <strong>Tetap Install (Install Anyway)</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-[#181615]">Buka & Masukkan PIN</h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Buka aplikasi dari menu HP. Masukkan 4-digit PIN Anda (Kasir: <code className="font-mono font-bold">1234</code>, Barista: <code className="font-mono font-bold">5678</code>, Owner: <code className="font-mono font-bold">9999</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Roles Quick Access Note */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold text-sm text-[#181615] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C2552D]" />
              <span>Satu File APK untuk Seluruh Staf Cafe</span>
            </div>
            <p className="text-xs text-[#86868B]">
              Aplikasi secara otomatis menampilkan antarmuka yang disesuaikan saat masing-masing staf memasukkan PIN mereka.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#34C759]/10 text-[#34C759]">
              Owner (9999)
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3]">
              Kasir (1234)
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FF9500]/10 text-[#FF9500]">
              Barista (5678)
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/[0.06] py-6 text-center text-xs text-[#86868B]">
        <p>© 2026 BrewPoint Coffee POS. Otomatisasi CI/CD didukung oleh GitHub Actions & Vercel.</p>
      </footer>
    </div>
  );
}
