'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Lock,
  Unlock,
  PlusCircle,
  RefreshCw,
  History
} from 'lucide-react';
import { formatRupiah, formatDateIndo, playSoundEffect } from '@/lib/utils';
import RoleGuard from '@/components/auth/RoleGuard';

interface PettyCashItem {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface ShiftData {
  id: string;
  userName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalCashSales: number;
  totalQrisSales: number;
  totalPettyCash: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  pettyCashRecord?: PettyCashItem[];
}

function ShiftContent() {
  const [activeShift, setActiveShift] = useState<ShiftData | null>(null);
  const [closedShifts, setClosedShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isOpenShiftModal, setIsOpenShiftModal] = useState<boolean>(false);
  const [isPettyCashModal, setIsPettyCashModal] = useState<boolean>(false);
  const [isCloseShiftModal, setIsCloseShiftModal] = useState<boolean>(false);

  // Form states
  const [newShiftName, setNewShiftName] = useState<string>('Dina (Kasir 1)');
  const [newStartingCash, setNewStartingCash] = useState<number>(250000);
  const [newShiftNotes, setNewShiftNotes] = useState<string>('');

  const [pettyAmount, setPettyAmount] = useState<number>(0);
  const [pettyReason, setPettyReason] = useState<string>('');

  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [closeShiftNotes, setCloseShiftNotes] = useState<string>('');

  const fetchShiftData = async () => {
    try {
      setLoading(true);
      const [activeRes, allRes] = await Promise.all([
        fetch('/api/shift'),
        fetch('/api/shift?all=true'),
      ]);

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveShift(data);
      } else {
        setActiveShift(null);
      }

      if (allRes.ok) {
        const allData = await allRes.json();
        setClosedShifts(allData.filter((s: ShiftData) => s.status === 'CLOSED'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, []);

  // Open Shift Handler
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: newShiftName,
          startingCash: newStartingCash,
          notes: newShiftNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal membuka shift');
      }

      playSoundEffect('success');
      setIsOpenShiftModal(false);
      fetchShiftData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Record Petty Cash Handler
  const handleRecordPettyCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    try {
      const res = await fetch('/api/shift/petty-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: activeShift.id,
          amount: pettyAmount,
          reason: pettyReason,
        }),
      });

      if (!res.ok) throw new Error('Gagal mencatat petty cash');

      playSoundEffect('success');
      setIsPettyCashModal(false);
      setPettyAmount(0);
      setPettyReason('');
      fetchShiftData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Close Shift Handler (Z-Report)
  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    const actual = parseFloat(actualCashInput);
    if (isNaN(actual) || actual < 0) {
      alert('Masukkan jumlah uang fisik aktual kas laci yang valid');
      return;
    }

    try {
      const res = await fetch('/api/shift/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualCash: actual,
          notes: closeShiftNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menutup shift');

      playSoundEffect('success');
      setIsCloseShiftModal(false);
      setActualCashInput('');
      setCloseShiftNotes('');
      fetchShiftData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F6F2] p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-8 select-none no-scrollbar">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200/60 shadow-xs">
        <div>
          <h2 className="text-[18px] sm:text-[22px] font-bold text-[#181615] tracking-tight flex items-center gap-2 sm:gap-2.5">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#C2552D]" />
            <span>Manajemen Shift & Kas Laci Kasir</span>
          </h2>
          <p className="text-[11px] sm:text-[13px] text-[#736B66] font-medium mt-0.5">
            Rekonsiliasi modal kas awal, kas masuk, petty cash, dan Z-Report serah terima kasir
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={fetchShiftData}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1D1D1F] flex items-center justify-center shadow-xs active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-[#6E6E73] ${loading ? 'animate-spin' : ''}`} />
          </button>

          {!activeShift ? (
            <button
              type="button"
              onClick={() => setIsOpenShiftModal(true)}
              className="py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl bg-[#34C759] hover:bg-[#28a745] text-white font-semibold text-[12px] sm:text-[13px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Unlock className="w-4 h-4 stroke-[2.4]" />
              <span>Buka Shift Baru</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPettyCashModal(true)}
                className="py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1D1D1F] font-semibold text-[12px] sm:text-[13px] flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-[#C2552D]" />
                <span>Catat Petty Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCloseShiftModal(true)}
                className="py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl bg-[#C2552D] hover:bg-[#A8441E] text-white font-semibold text-[12px] sm:text-[13px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Lock className="w-4 h-4 stroke-[2.4]" />
                <span>Tutup Shift Kasir</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE SHIFT STATUS */}
      {activeShift ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Shift Cards Grid (Apple Wallet Metrics Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Kas Awal */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
              <span className="text-[12px] font-semibold text-[#6E6E73]">Modal Kas Awal</span>
              <div className="text-[24px] font-black font-mono tabular-nums tracking-tight text-[#1D1D1F]">
                {formatRupiah(activeShift.startingCash)}
              </div>
              <div className="text-[11px] text-[#86868B] font-medium flex items-center gap-1 pt-1">
                <Clock className="w-3 h-3 text-[#C2552D]" />
                <span>Buka: {formatDateIndo(activeShift.startTime)}</span>
              </div>
            </div>

            {/* 2. Penjualan Tunai */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#6E6E73]">Penjualan Tunai</span>
                <span className="p-1 rounded-full bg-[#34C759]/10 text-[#34C759]">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
              <div className="text-[24px] font-black font-mono tabular-nums tracking-tight text-[#34C759]">
                {formatRupiah(activeShift.totalCashSales)}
              </div>
              <div className="text-[11px] text-[#86868B] pt-1">
                Kas fisik masuk ke laci
              </div>
            </div>

            {/* 3. Kas Keluar (Petty Cash) */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#6E6E73]">Petty Cash (Kas Keluar)</span>
                <span className="p-1 rounded-full bg-[#FF3B30]/10 text-[#FF3B30]">
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
              <div className="text-[24px] font-black font-mono tabular-nums tracking-tight text-[#FF3B30]">
                -{formatRupiah(activeShift.totalPettyCash)}
              </div>
              <div className="text-[11px] text-[#86868B] pt-1">
                Biaya operasional kasir
              </div>
            </div>

            {/* 4. Total Uang Seharusnya di Laci */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#C2552D] uppercase tracking-wider">
                  SALDO LACI SEHARUSNYA
                </span>
                <Wallet className="w-4 h-4 text-[#C2552D]" />
              </div>
              <div className="text-[24px] font-black font-mono tabular-nums tracking-tight text-[#1D1D1F]">
                {formatRupiah(activeShift.expectedCash)}
              </div>
              <div className="text-[11px] text-[#C2552D] font-semibold pt-1">
                Kas Awal + Tunai - Petty Cash
              </div>
            </div>
          </div>

          {/* Secondary Details & Petty Cash History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Non-Tunai / QRIS Card */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <h4 className="text-[15px] font-bold text-[#1D1D1F] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0071E3]" />
                <span>Penerimaan QRIS & E-Wallet</span>
              </h4>
              <div className="p-4 rounded-xl bg-[#F2F2F7] border border-black/[0.04] space-y-1">
                <span className="text-[12px] text-[#6E6E73] font-medium">Total Masuk ke Rekening:</span>
                <div className="text-[24px] font-black font-mono tabular-nums text-[#0071E3] tracking-tight">
                  {formatRupiah(activeShift.totalQrisSales)}
                </div>
                <p className="text-[11px] text-[#86868B] pt-1 leading-normal">
                  Pembayaran non-tunai langsung masuk ke rekening bank cafe.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F2F2F7] border border-black/[0.04] space-y-2 text-[12px] text-[#6E6E73]">
                <div className="flex justify-between py-1 border-b border-black/[0.06]">
                  <span className="font-medium">Kasir Bertugas:</span>
                  <span className="font-bold text-[#1D1D1F]">{activeShift.userName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">Catatan:</span>
                  <span className="italic text-[#86868B]">{activeShift.notes || '-'}</span>
                </div>
              </div>
            </div>

            {/* Petty Cash Table */}
            <div className="lg:col-span-2 bg-white border border-black/[0.06] rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <h4 className="text-[15px] font-bold text-[#1D1D1F] flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-[#FF3B30]" />
                  <span>Rincian Petty Cash (Shift Ini)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsPettyCashModal(true)}
                  className="text-[12px] font-semibold text-[#0071E3] hover:underline"
                >
                  + Tambah Pengeluaran
                </button>
              </div>

              {activeShift.pettyCashRecord && activeShift.pettyCashRecord.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] text-[#6E6E73]">
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Keperluan</th>
                        <th className="py-2.5 px-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {activeShift.pettyCashRecord.map((p) => (
                        <tr key={p.id} className="text-[#1D1D1F]">
                          <td className="py-2.5 px-3 font-mono text-[12px] text-[#6E6E73]">
                            {formatDateIndo(p.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 font-medium">{p.reason}</td>
                          <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-[#FF3B30] text-right">
                            <div className="flex justify-end items-center gap-2">
                              <span className="text-[10px] font-sans font-normal select-none">-Rp</span>
                              <span>{p.amount.toLocaleString('id-ID')}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-[#86868B] text-[13px]">
                  Belum ada catatan pengeluaran kas kecil pada shift ini.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* NO ACTIVE SHIFT BANNER */
        <div className="bg-white border border-black/[0.06] rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F2F2F7] flex items-center justify-center mx-auto text-[#C2552D]">
            <Lock className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#1D1D1F]">Shift Kasir Sedang Tutup</h3>
            <p className="text-[13px] text-[#6E6E73] mt-1 max-w-md mx-auto">
              Silakan buka shift kasir terlebih dahulu dan masukkan modal kas awal di laci untuk memulai transaksi penjualan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenShiftModal(true)}
            className="py-3 px-6 rounded-2xl bg-[#C2552D] hover:bg-[#A8441E] text-white font-bold text-[14px] shadow-sm inline-flex items-center gap-2 active:scale-95 transition-all"
          >
            <Unlock className="w-4 h-4 stroke-[2.4]" />
            <span>Buka Shift Sekarang</span>
          </button>
        </div>
      )}

      {/* CLOSED SHIFTS HISTORY */}
      <div className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#C2552D]" />
          <h4 className="text-[15px] font-bold text-[#1D1D1F]">
            Riwayat Shift Kasir Sebelumnya (Z-Reports)
          </h4>
        </div>

        {closedShifts.length === 0 ? (
          <p className="text-[13px] text-[#86868B] italic py-3">Belum ada riwayat shift tertutup.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-black/[0.06] text-[#6E6E73]">
                  <th className="py-2.5 px-3">Waktu Buka / Tutup</th>
                  <th className="py-2.5 px-3">Kasir</th>
                  <th className="py-2.5 px-3 text-right">Kas Awal</th>
                  <th className="py-2.5 px-3 text-right">Penjualan Tunai</th>
                  <th className="py-2.5 px-3 text-right">QRIS</th>
                  <th className="py-2.5 px-3 text-right">Petty Cash</th>
                  <th className="py-2.5 px-3 text-right">Fisik Laci</th>
                  <th className="py-2.5 px-3 text-right">Selisih</th>
                  <th className="py-2.5 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {closedShifts.map((s) => {
                  const diff = s.cashDifference || 0;
                  return (
                    <tr key={s.id} className="text-[#1D1D1F] hover:bg-[#F2F2F7]">
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>{formatDateIndo(s.startTime)}</div>
                        <div className="text-[#86868B]">{s.endTime ? formatDateIndo(s.endTime) : '-'}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#1D1D1F]">{s.userName}</td>
                      <td className="py-3 px-3 font-mono tabular-nums text-[#1D1D1F]">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] text-[#86868B] font-sans font-normal select-none">Rp</span>
                          <span>{s.startingCash.toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-[#34C759] font-bold">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-sans font-normal select-none">+Rp</span>
                          <span>{s.totalCashSales.toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-[#0071E3] font-semibold">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-sans font-normal select-none">Rp</span>
                          <span>{s.totalQrisSales.toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-[#FF3B30] font-semibold">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-sans font-normal select-none">-Rp</span>
                          <span>{s.totalPettyCash.toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums font-bold text-[#1D1D1F]">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] text-[#86868B] font-sans font-normal select-none">Rp</span>
                          <span>{(s.actualCash || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums font-bold text-right">
                        <div className="flex justify-end items-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 ${
                              diff === 0
                                ? 'bg-[#34C759]/10 text-[#34C759]'
                                : diff > 0
                                ? 'bg-[#0071E3]/10 text-[#0071E3]'
                                : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                            }`}
                          >
                            <span>{diff >= 0 ? '+Rp' : '-Rp'}</span>
                            <span>{Math.abs(diff).toLocaleString('id-ID')}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#6E6E73] italic max-w-[140px] truncate">
                        {s.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL BUKA SHIFT */}
      {isOpenShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] p-6 space-y-4 animate-scale-up">
            <h3 className="text-[18px] font-bold text-[#1D1D1F] flex items-center gap-2">
              <Unlock className="w-5 h-5 text-[#34C759]" />
              <span>Buka Shift Kasir Baru</span>
            </h3>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#6E6E73]">Nama Kasir</label>
                <input
                  type="text"
                  required
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-[13px] font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#6E6E73]">
                  Modal Kas Awal di Laci (Starting Float)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={newStartingCash}
                  onChange={(e) => setNewStartingCash(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-[15px] font-bold text-[#1D1D1F] focus:outline-none focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#6E6E73]">Catatan Pembukaan</label>
                <input
                  type="text"
                  placeholder="Contoh: Shift Pagi 08:00 - 16:00"
                  value={newShiftNotes}
                  onChange={(e) => setNewShiftNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-[13px] text-[#1D1D1F] focus:outline-none focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsOpenShiftModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6E6E73] hover:text-[#1D1D1F] active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#34C759] hover:bg-[#28a745] text-white text-[13px] font-bold shadow-sm active:scale-95 transition-all"
                >
                  Mulai Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PETTY CASH */}
      {isPettyCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] p-6 space-y-4 animate-scale-up">
            <h3 className="text-[18px] font-bold text-[#1D1D1F] flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#C2552D]" />
              <span>Catat Petty Cash (Kas Keluar)</span>
            </h3>

            <form onSubmit={handleRecordPettyCash} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#6E6E73]">Nominal Pengeluaran (Rp)</label>
                <input
                  type="number"
                  min="1000"
                  required
                  placeholder="20000"
                  value={pettyAmount || ''}
                  onChange={(e) => setPettyAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-[15px] font-bold text-[#FF3B30] focus:outline-none focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#6E6E73]">Keperluan / Keterangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli es batu kristal 2 pack darurat"
                  value={pettyReason}
                  onChange={(e) => setPettyReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-[13px] text-[#1D1D1F] focus:outline-none focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsPettyCashModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6E6E73] hover:text-[#1D1D1F] active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF3B30] hover:bg-red-700 text-white text-[13px] font-bold shadow-sm active:scale-95 transition-all"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TUTUP SHIFT */}
      {isCloseShiftModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <h3 className="text-[18px] font-bold text-[#1D1D1F] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C2552D]" />
              <span>Tutup Shift Kasir & Z-Report</span>
            </h3>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-[#F2F2F7] border border-black/[0.04] space-y-2 text-[12px]">
              <div className="flex justify-between items-center text-[#6E6E73]">
                <span>Modal Kas Awal:</span>
                <span className="font-bold font-mono tabular-nums text-[#1D1D1F]">{formatRupiah(activeShift.startingCash)}</span>
              </div>
              <div className="flex justify-between items-center text-[#6E6E73]">
                <span>Penjualan Tunai:</span>
                <span className="font-bold font-mono tabular-nums text-[#34C759]">+{formatRupiah(activeShift.totalCashSales)}</span>
              </div>
              <div className="flex justify-between items-center text-[#6E6E73]">
                <span>Petty Cash:</span>
                <span className="font-bold font-mono tabular-nums text-[#FF3B30]">-{formatRupiah(activeShift.totalPettyCash)}</span>
              </div>
              <div className="flex justify-between items-center font-bold pt-2 border-t border-black/[0.06] text-[14px] text-[#1D1D1F]">
                <span>Saldo Kas Seharusnya di Laci:</span>
                <span className="font-mono tabular-nums">{formatRupiah(activeShift.expectedCash)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#1D1D1F]">
                  Hitung Uang Fisik Aktual di Laci Kasir (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Masukkan jumlah fisik uang kasir..."
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-[16px] font-black text-[#1D1D1F] focus:outline-none focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15"
                />
              </div>

              {actualCashInput && !isNaN(parseFloat(actualCashInput)) && (
                <div
                  className={`p-3.5 rounded-xl border text-[13px] font-bold flex items-center justify-between ${
                    parseFloat(actualCashInput) - activeShift.expectedCash === 0
                      ? 'bg-[#34C759]/10 border-[#34C759]/30 text-[#1D1D1F]'
                      : parseFloat(actualCashInput) - activeShift.expectedCash > 0
                      ? 'bg-[#0071E3]/10 border-[#0071E3]/30 text-[#1D1D1F]'
                      : 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
                  }`}
                >
                  <span>Selisih Kas Laci:</span>
                  <span className="text-[15px] font-black">
                    {parseFloat(actualCashInput) - activeShift.expectedCash >= 0
                      ? `+${formatRupiah(parseFloat(actualCashInput) - activeShift.expectedCash)} (Lebih/Pas)`
                      : `${formatRupiah(parseFloat(actualCashInput) - activeShift.expectedCash)} (Kurang)`}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#6E6E73]">Catatan Serah Terima</label>
                <input
                  type="text"
                  placeholder="Contoh: Kas diserahkan ke kasir sore, uang pas"
                  value={closeShiftNotes}
                  onChange={(e) => setCloseShiftNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-[13px] text-[#1D1D1F] focus:outline-none focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6E6E73] hover:text-[#1D1D1F] active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C2552D] hover:bg-[#A8441E] text-white text-[13px] font-bold shadow-sm active:scale-95 transition-all"
                >
                  Konfirmasi Tutup Shift (Z-Report)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShiftPage() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'CASHIER']}>
      <ShiftContent />
    </RoleGuard>
  );
}
