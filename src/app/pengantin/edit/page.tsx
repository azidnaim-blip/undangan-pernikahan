'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WEDDING_DATA, WeddingData } from '@/app/undangan/wedding-data';
import {
  Sliders,
  User,
  UserCheck,
  Calendar,
  MapPin,
  CreditCard,
  Upload,
  Save,
  RotateCcw,
  Eye,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Heart
} from 'lucide-react';

export default function PengantinEditorPage() {
  const [data, setData] = useState<WeddingData>(WEDDING_DATA);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [guestPreviewName, setGuestPreviewName] = useState('Budi Santoso');
  const [copiedLink, setCopiedLink] = useState(false);

  // Ambil data terbaru dari server saat halaman dimuat
  useEffect(() => {
    fetch('/api/wedding')
      .then((res) => res.json())
      .then((serverData) => {
        if (serverData && serverData.groom) {
          setData(serverData);
        }
      })
      .catch((err) => {
        console.error('Gagal memuat data dari server:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'groom' | 'bride' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file foto maksimal 2 MB agar website tetap cepat dibuka di HP tamu.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (field === 'groom') {
        setData((prev) => ({ ...prev, groom: { ...prev.groom, photo: result } }));
      } else if (field === 'bride') {
        setData((prev) => ({ ...prev, bride: { ...prev.bride, photo: result } }));
      } else if (field === 'hero') {
        setData((prev) => ({ ...prev, heroImage: result }));
      }
      showToast("Foto berhasil dipilih! Jangan lupa klik 'Simpan Perubahan ke Semua Tamu'.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        // Simpan juga ke localStorage cadangan
        try {
          localStorage.setItem('custom_wedding_data', JSON.stringify(data));
        } catch {}
        showToast("✅ Berhasil! Seluruh data undangan langsung terupdate untuk semua tamu.");
      } else {
        alert("Gagal menyimpan ke server: " + (result.error || "Terjadi kesalahan."));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghubungi server. Pastikan server dev berjalan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Kembalikan seluruh isi undangan ke pengaturan template awal?")) {
      setIsSaving(true);
      try {
        const res = await fetch('/api/wedding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(WEDDING_DATA),
        });
        if (res.ok) {
          setData(WEDDING_DATA);
          localStorage.removeItem('custom_wedding_data');
          showToast("Data berhasil dikembalikan ke template awal!");
        }
      } catch (e) {
        alert("Gagal reset data.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const copyGuestLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/?to=${encodeURIComponent(guestPreviewName)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showToast("Link undangan dengan nama tamu berhasil disalin!");
  };

  const updateBank = (index: number, field: 'bankName' | 'accountNumber' | 'accountHolder', val: string) => {
    const currentBanks = data.gifts?.banks ? [...data.gifts.banks] : [];
    while (currentBanks.length <= index) {
      currentBanks.push({ bankName: '', accountNumber: '', accountHolder: '', logo: '' });
    }
    currentBanks[index] = { ...currentBanks[index], [field]: val };
    setData({ ...data, gifts: { ...data.gifts, banks: currentBanks } });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-amber-300/60 overflow-hidden">
        
        {/* Header Link Pengantin */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 p-6 sm:p-8 text-white relative">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs text-amber-100 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Buka Undangan Tamu</span>
            </Link>

            <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-900/60 text-amber-200 border border-amber-400/40">
              Panel Khusus Pengantin
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <Sliders className="w-8 h-8 text-amber-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif">Pengaturan Isi Undangan</h1>
              <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-lg">
                Ubah nama pengantin, foto, tanggal, lokasi, rekening hadiah, dan nomor WhatsApp. Perubahan akan <strong>langsung berlaku ke semua HP tamu</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Generator Link Tamu Cepat */}
        <div className="bg-amber-50/80 p-5 sm:p-6 border-b border-amber-200">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Bagikan Link Khusus Nama Tamu (Muncul di Amplop Cover)
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input 
              type="text" 
              placeholder="Ketik Nama Tamu (Contoh: Bpk. Joko & Keluarga)"
              value={guestPreviewName}
              onChange={(e) => setGuestPreviewName(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2 text-xs rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            />
            <button 
              type="button"
              onClick={copyGuestLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedLink ? "✓ Tersalin!" : "Salin Link Tamu"}</span>
            </button>
          </div>
        </div>

        {/* Form Pengaturan */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
          
          {/* 1. MEMPELAI PRIA */}
          <div className="bg-cream-50/40 p-5 rounded-2xl border border-amber-200/80">
            <h2 className="text-sm font-bold text-amber-900 border-b border-amber-200 pb-2 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              1. Data Mempelai Pria
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  value={data.groom.fullName}
                  onChange={(e) => setData({ ...data, groom: { ...data.groom, fullName: e.target.value } })}
                  required 
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Panggilan (Nickname)</label>
                <input 
                  type="text" 
                  value={data.groom.nickname}
                  onChange={(e) => setData({ ...data, groom: { ...data.groom, nickname: e.target.value } })}
                  required 
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Ayah</label>
                <input 
                  type="text" 
                  value={data.groom.father}
                  onChange={(e) => setData({ ...data, groom: { ...data.groom, father: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Ibu</label>
                <input 
                  type="text" 
                  value={data.groom.mother}
                  onChange={(e) => setData({ ...data, groom: { ...data.groom, mother: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Link Instagram (Opsional)</label>
                <input 
                  type="text" 
                  value={data.groom.instagram}
                  onChange={(e) => setData({ ...data, groom: { ...data.groom, instagram: e.target.value } })}
                  placeholder="https://instagram.com/username"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Foto Mempelai Pria</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'groom')}
                    className="w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. MEMPELAI WANITA */}
          <div className="bg-cream-50/40 p-5 rounded-2xl border border-amber-200/80">
            <h2 className="text-sm font-bold text-amber-900 border-b border-amber-200 pb-2 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              2. Data Mempelai Wanita
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  value={data.bride.fullName}
                  onChange={(e) => setData({ ...data, bride: { ...data.bride, fullName: e.target.value } })}
                  required 
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Panggilan (Nickname)</label>
                <input 
                  type="text" 
                  value={data.bride.nickname}
                  onChange={(e) => setData({ ...data, bride: { ...data.bride, nickname: e.target.value } })}
                  required 
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Ayah</label>
                <input 
                  type="text" 
                  value={data.bride.father}
                  onChange={(e) => setData({ ...data, bride: { ...data.bride, father: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Ibu</label>
                <input 
                  type="text" 
                  value={data.bride.mother}
                  onChange={(e) => setData({ ...data, bride: { ...data.bride, mother: e.target.value } })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Link Instagram (Opsional)</label>
                <input 
                  type="text" 
                  value={data.bride.instagram}
                  onChange={(e) => setData({ ...data, bride: { ...data.bride, instagram: e.target.value } })}
                  placeholder="https://instagram.com/username"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Foto Mempelai Wanita</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'bride')}
                    className="w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. WAKTU & TANGGAL */}
          <div className="bg-cream-50/40 p-5 rounded-2xl border border-amber-200/80">
            <h2 className="text-sm font-bold text-amber-900 border-b border-amber-200 pb-2 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              3. Tanggal & Waktu Acara
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Teks Tanggal Utama (Tampilan)</label>
                <input 
                  type="text" 
                  value={data.displayDate}
                  onChange={(e) => setData({ ...data, displayDate: e.target.value })}
                  placeholder="Sabtu, 28 November 2026"
                  required 
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Target Countdown (ISO Format)</label>
                <input 
                  type="text" 
                  value={data.weddingDate}
                  onChange={(e) => setData({ ...data, weddingDate: e.target.value })}
                  placeholder="2026-11-28T08:00:00"
                  required 
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Akad & Resepsi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 pt-4 border-t border-amber-200/60">
              <div className="space-y-3">
                <p className="font-bold text-xs text-amber-800 uppercase tracking-wider">Acara Akad Nikah</p>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Waktu</label>
                  <input 
                    type="text" 
                    value={data.events.akad.time}
                    onChange={(e) => setData({ ...data, events: { ...data.events, akad: { ...data.events.akad, time: e.target.value } } })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Nama Tempat/Masjid</label>
                  <input 
                    type="text" 
                    value={data.events.akad.venue}
                    onChange={(e) => setData({ ...data, events: { ...data.events, akad: { ...data.events.akad, venue: e.target.value } } })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Alamat Lengkap</label>
                  <textarea 
                    rows={2}
                    value={data.events.akad.address}
                    onChange={(e) => setData({ ...data, events: { ...data.events, akad: { ...data.events.akad, address: e.target.value } } })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-xs text-amber-800 uppercase tracking-wider">Acara Resepsi</p>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Waktu</label>
                  <input 
                    type="text" 
                    value={data.events.resepsi.time}
                    onChange={(e) => setData({ ...data, events: { ...data.events, resepsi: { ...data.events.resepsi, time: e.target.value } } })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Nama Gedung/Hotel</label>
                  <input 
                    type="text" 
                    value={data.events.resepsi.venue}
                    onChange={(e) => setData({ ...data, events: { ...data.events, resepsi: { ...data.events.resepsi, venue: e.target.value } } })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Alamat Lengkap</label>
                  <textarea 
                    rows={2}
                    value={data.events.resepsi.address}
                    onChange={(e) => setData({ ...data, events: { ...data.events, resepsi: { ...data.events.resepsi, address: e.target.value } } })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. KONTAK WHATSAPP & BUKU TAMU */}
          <div className="bg-cream-50/40 p-5 rounded-2xl border border-amber-200/80">
            <h2 className="text-sm font-bold text-amber-900 border-b border-amber-200 pb-2 mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              4. Nomor WhatsApp Penerima Konfirmasi Buku Tamu
            </h2>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nomor WhatsApp Pengantin (Format Internasional: 628xxxxxxxx)</label>
              <input 
                type="text" 
                value={data.whatsappNumber || "6281234567890"}
                onChange={(e) => setData({ ...data, whatsappNumber: e.target.value })}
                placeholder="6281234567890"
                required 
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                *Setiap tamu yang mengisi Buku Tamu & RSVP di website akan mengirimkan pesan konfirmasi kehadiran langsung ke nomor WhatsApp ini.
              </p>
            </div>
          </div>

          {/* 5. AMPLOP DIGITAL & KADO */}
          <div className="bg-cream-50/40 p-5 rounded-2xl border border-amber-200/80">
            <h2 className="text-sm font-bold text-amber-900 border-b border-amber-200 pb-2 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              5. Amplop Digital & Rekening Hadiah
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="font-bold text-xs text-amber-800">Rekening 1 (Bank Utama / Pengantin Pria)</p>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Nama Bank (BCA, Mandiri, BRI, dll)</label>
                  <input 
                    type="text" 
                    value={data.gifts.banks[0]?.bankName || ''}
                    onChange={(e) => updateBank(0, 'bankName', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Nomor Rekening</label>
                  <input 
                    type="text" 
                    value={data.gifts.banks[0]?.accountNumber || ''}
                    onChange={(e) => updateBank(0, 'accountNumber', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Atas Nama</label>
                  <input 
                    type="text" 
                    value={data.gifts.banks[0]?.accountHolder || ''}
                    onChange={(e) => updateBank(0, 'accountHolder', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-xs text-amber-800">Rekening 2 (Bank / E-Wallet / Pengantin Wanita)</p>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Nama Bank / E-Wallet</label>
                  <input 
                    type="text" 
                    value={data.gifts.banks[1]?.bankName || ''}
                    onChange={(e) => updateBank(1, 'bankName', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Nomor Rekening / HP</label>
                  <input 
                    type="text" 
                    value={data.gifts.banks[1]?.accountNumber || ''}
                    onChange={(e) => updateBank(1, 'accountNumber', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Atas Nama</label>
                  <input 
                    type="text" 
                    value={data.gifts.banks[1]?.accountHolder || ''}
                    onChange={(e) => updateBank(1, 'accountHolder', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                  />
                </div>
              </div>
            </div>

            {/* Kado Fisik */}
            <div className="mt-5 pt-4 border-t border-amber-200/60">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Alamat Pengiriman Kado Fisik</label>
              <textarea 
                rows={2}
                value={data.gifts.physicalGift.address}
                onChange={(e) => setData({ ...data, gifts: { ...data.gifts, physicalGift: { ...data.gifts.physicalGift, address: e.target.value } } })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300"
              />
            </div>
          </div>

          {/* 6. MUSIK & FOTO HERO */}
          <div className="bg-cream-50/40 p-5 rounded-2xl border border-amber-200/80">
            <h2 className="text-sm font-bold text-amber-900 border-b border-amber-200 pb-2 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-600" />
              6. Musik Latar & Foto Sampul Utama
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">URL Audio Musik Latar (.mp3)</label>
                <input 
                  type="text" 
                  value={data.backgroundMusic}
                  onChange={(e) => setData({ ...data, backgroundMusic: e.target.value })}
                  placeholder="https://.../romantic-piano.mp3"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Foto Sampul Depan (Hero)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'hero')}
                  className="w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-amber-200 flex flex-wrap items-center justify-between gap-4">
            <button 
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-600 hover:bg-stone-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset ke Template Awal</span>
            </button>

            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                target="_blank"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold shadow-sm transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Hasil Undangan</span>
              </Link>

              <button 
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan ke Server..." : "Simpan Perubahan ke Semua Tamu"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-bounce border border-amber-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

      </div>
    </div>
  );
}
