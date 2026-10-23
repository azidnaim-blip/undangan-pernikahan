'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Printer,
  Delete,
  Check,
  Sparkles
} from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  subtotal: number;
  discount: number;
  customerName: string;
  orderType: string;
  onClose: () => void;
  onConfirmPayment: (paymentData: {
    paymentMethod: 'CASH' | 'QRIS';
    amountPaid: number;
    change: number;
    autoPrint: boolean;
  }) => void;
}

export default function PaymentModal({
  isOpen,
  total,
  subtotal,
  discount,
  customerName,
  orderType,
  onClose,
  onConfirmPayment,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'EDC'>('CASH');
  const [cashInput, setCashInput] = useState<string>('');
  const [autoPrint, setAutoPrint] = useState<boolean>(true);

  const cashAmount = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashAmount - total);
  const isCashSufficient = cashAmount >= total;
  const amountShort = Math.max(0, total - cashAmount);

  // Smart Denominations calculation
  const smartDenominations = useMemo(() => {
    const list: { label: string; value: number }[] = [
      { label: 'Uang Pas', value: total },
    ];

    // Nearest round up to 10k/20k/50k
    if (total % 10000 !== 0) {
      const nearest10k = Math.ceil(total / 10000) * 10000;
      if (nearest10k > total) list.push({ label: 'Pembulatan', value: nearest10k });
    }

    if (total < 50000) {
      list.push({ label: '50.000', value: 50000 });
    }
    if (total < 100000) {
      list.push({ label: '100.000', value: 100000 });
    } else if (total < 200000) {
      list.push({ label: '200.000', value: 200000 });
    }

    // Deduplicate
    const uniqueMap = new Map<number, { label: string; value: number }>();
    list.forEach(item => {
      if (!uniqueMap.has(item.value)) {
        uniqueMap.set(item.value, item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [total]);

  const handleNumpad = (val: string) => {
    playSoundEffect('tap');
    if (val === 'C') {
      setCashInput('');
    } else if (val === 'DEL') {
      setCashInput((prev) => prev.slice(0, -1));
    } else if (val === '000') {
      if (cashInput) setCashInput((prev) => prev + '000');
    } else {
      setCashInput((prev) => prev + val);
    }
  };

  const handleQuickAmount = (amt: number) => {
    playSoundEffect('tap');
    setCashInput(amt.toString());
  };

  const handleSubmit = () => {
    if (paymentMethod === 'CASH' && !isCashSufficient) {
      playSoundEffect('alert');
      return;
    }

    playSoundEffect('success');
    onConfirmPayment({
      paymentMethod: paymentMethod === 'QRIS' ? 'QRIS' : 'CASH',
      amountPaid: paymentMethod === 'CASH' ? cashAmount : total,
      change: paymentMethod === 'CASH' ? change : 0,
      autoPrint,
    });
  };

  const orderTypeLabel =
    orderType === 'DELIVERY'
      ? 'Delivery'
      : orderType === 'DINE_IN'
      ? 'Dine In'
      : 'Take Away';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white/95 backdrop-blur-3xl rounded-[32px] w-full max-w-2xl overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.22)] border border-black/[0.08] flex flex-col max-h-[94vh] animate-scale-up">
        {/* Apple Top Grabber */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        {/* Header Bar */}
        <div className="px-6 py-2.5 border-b border-black/[0.05] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#1D1D1F] text-white text-[10.5px] font-bold uppercase tracking-wider">
                {orderTypeLabel}
              </span>
              <span className="text-[13px] font-bold text-[#1D1D1F]">
                {customerName || 'Pelanggan Umum'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#767680]/[0.08] hover:bg-[#767680]/[0.15] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center active:scale-90 transition-all"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Large Total Tagihan Banner */}
        <div className="bg-[#FAF8F5]/80 border-b border-black/[0.05] p-4 text-center">
          <span className="text-[11.5px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
            Total Pembayaran
          </span>
          <div className="text-[36px] sm:text-[44px] font-black font-mono tabular-nums text-[#1D1D1F] tracking-tight">
            {formatRupiah(total)}
          </div>
          {discount > 0 && (
            <div className="text-[11.5px] text-[#34C759] font-bold mt-0.5 font-mono">
              Hemat Diskon {formatRupiah(discount)}
            </div>
          )}
        </div>

        {/* Apple Segmented Payment Tabs */}
        <div className="px-6 pt-3 pb-1">
          <div className="grid grid-cols-3 bg-[#767680]/[0.08] p-1 rounded-2xl border border-black/[0.02]">
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setPaymentMethod('CASH');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-bold transition-all ${
                paymentMethod === 'CASH'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Tunai / Cash</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setPaymentMethod('QRIS');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-bold transition-all ${
                paymentMethod === 'QRIS'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QRIS Interaktif</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setPaymentMethod('EDC');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-bold transition-all ${
                paymentMethod === 'EDC'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Kartu / EDC</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4 no-scrollbar">
          {paymentMethod === 'CASH' && (
            <div className="space-y-3.5">
              {/* Cash Input & Change Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Cash Received Input */}
                <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/80">
                  <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-1">
                    Uang Diterima
                  </span>
                  <div className="text-[26px] font-black font-mono tabular-nums text-[#1D1D1F]">
                    {cashAmount > 0 ? formatRupiah(cashAmount) : 'Rp 0'}
                  </div>
                </div>

                {/* Kembalian / Status Display */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCashSufficient
                      ? 'bg-[#34C759]/10 border-[#34C759]/30 text-[#34C759]'
                      : 'bg-stone-100/80 border-stone-200/80 text-[#86868B]'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">
                    {isCashSufficient ? 'Kembalian Pelanggan' : 'Sisa Kurang'}
                  </span>
                  <div className="text-[26px] font-black font-mono tabular-nums">
                    {isCashSufficient
                      ? formatRupiah(change)
                      : formatRupiah(amountShort)}
                  </div>
                </div>
              </div>

              {/* Smart Denomination Pills */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  Pecahan Cepat
                </span>
                <div className="flex flex-wrap gap-2">
                  {smartDenominations.map((denom) => (
                    <button
                      key={denom.label + denom.value}
                      type="button"
                      onClick={() => handleQuickAmount(denom.value)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[12.5px] font-bold transition-all active:scale-95 ${
                        cashAmount === denom.value
                          ? 'bg-[#1D1D1F] text-white shadow-xs'
                          : 'bg-[#767680]/[0.08] hover:bg-[#767680]/[0.15] text-[#1D1D1F]'
                      }`}
                    >
                      {denom.label === 'Uang Pas' ? 'Uang Pas' : formatRupiah(denom.value)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleNumpad('C')}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-bold bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 active:scale-95 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Tactile Glass Numpad */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {['1', '2', '3', 'DEL', '4', '5', '6', '000', '7', '8', '9', 'C'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleNumpad(btn)}
                    className={`h-11 rounded-2xl font-bold font-mono text-[16px] transition-all flex items-center justify-center shadow-xs active:scale-95 ${
                      btn === 'DEL' || btn === 'C'
                        ? 'bg-stone-200/70 hover:bg-stone-300 text-[#1D1D1F]'
                        : 'bg-white hover:bg-stone-50 text-[#1D1D1F] border border-stone-200/80'
                    }`}
                  >
                    {btn === 'DEL' ? <Delete className="w-5 h-5 stroke-[2]" /> : btn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === 'QRIS' && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 text-center space-y-4 shadow-xs">
              <div className="w-48 h-48 mx-auto p-3 rounded-2xl bg-white border border-stone-300 shadow-md flex items-center justify-center">
                {/* Visual QR Code Display */}
                <div className="w-full h-full bg-[#181615] rounded-xl flex flex-col items-center justify-center text-white p-3 text-center">
                  <QrCode className="w-20 h-20 text-white mb-1" />
                  <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-stone-300">
                    SCAN QRIS BREWPOINT
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[16px] text-[#1D1D1F]">
                  Tampilkan QRIS ke Layar Pelanggan
                </h4>
                <p className="text-[12px] text-[#86868B] max-w-sm mx-auto">
                  Pelanggan dapat memindai langsung menggunakan GoPay, OVO, Dana, BCA, atau Mobile Banking lainnya.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terhubung Realtime ke Monitor Pelanggan</span>
              </div>
            </div>
          )}

          {paymentMethod === 'EDC' && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center text-[#1D1D1F]">
                <CreditCard className="w-8 h-8 stroke-[1.8]" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[16px] text-[#1D1D1F]">
                  Pembayaran Kartu Debit / Kredit (Mesin EDC)
                </h4>
                <p className="text-[12px] text-[#86868B] max-w-sm mx-auto">
                  Gesek atau masukkan kartu ke mesin EDC cafe, lalu konfirmasi pembayaran setelah struk EDC keluar.
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {['BCA', 'Mandiri', 'BRI', 'BNI'].map((bank) => (
                  <span
                    key={bank}
                    className="px-3 py-1 rounded-xl bg-stone-100 text-[#1D1D1F] text-[12px] font-bold border border-stone-200"
                  >
                    {bank}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-black/[0.05] bg-white/70 space-y-3">
          {/* Auto Print Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => setAutoPrint(e.target.checked)}
                className="w-4 h-4 rounded text-[#1D1D1F] focus:ring-0 border-stone-300"
              />
              <span className="text-[12.5px] font-medium text-[#736B66] flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-[#86868B]" />
                Cetak Struk Otomatis Setelah Bayar
              </span>
            </label>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            disabled={paymentMethod === 'CASH' && !isCashSufficient}
            onClick={handleSubmit}
            className="w-full h-12 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,0,0,0.16)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4 stroke-[2.6]" />
            <span>
              Konfirmasi Selesai ({paymentMethod === 'CASH' ? 'Tunai' : paymentMethod})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
