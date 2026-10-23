'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  Monitor,
  Sparkles,
  ShoppingBag,
  QrCode,
  CheckCircle2,
  Coffee
} from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';
import { CustomerDisplayState } from '@/lib/customerDisplayChannel';

interface CustomerDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayState: CustomerDisplayState;
  onOpenExternalWindow: () => void;
}

export default function CustomerDisplayModal({
  isOpen,
  onClose,
  displayState,
  onOpenExternalWindow,
}: CustomerDisplayModalProps) {
  if (!isOpen) return null;

  const { status, cart, customerName, orderType, subtotal, discount, grandTotal, paymentMethod, completedOrder } = displayState;
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-stone-200/80 flex flex-col max-h-[92vh] animate-scale-up">
        {/* Modal Grabber & Top Controls */}
        <div className="px-6 py-4 border-b border-stone-200/80 bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#C2552D] via-[#B54B24] to-[#8E3615] text-white flex items-center justify-center shadow-xs">
              <Monitor className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-[#181615]">
                  Layar Pelanggan (Customer-Facing View)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759] text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[12px] text-[#736B66]">
                Pratinjau tampilan yang dilihat pembeli secara realtime di monitor kedua
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                onOpenExternalWindow();
              }}
              className="py-2 px-3.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-[#181615] font-bold text-[12.5px] flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C2552D]" />
              <span>Buka di Monitor Kedua (Popup)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300 text-[#736B66] hover:text-[#181615] flex items-center justify-center active:scale-90 transition-all"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Scaled Preview Frame */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F6F2] no-scrollbar">
          {status === 'IDLE' && (
            <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2552D]/10 text-[#C2552D] text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mode Standby / Idle</span>
              </div>
              <h4 className="text-[22px] font-extrabold text-[#181615]">
                Selamat Datang di BrewPoint Specialty Coffee
              </h4>
              <p className="text-[13px] text-[#736B66] max-w-md mx-auto">
                Saat kasir belum memilih menu, layar pelanggan menampilkan sapaan hangat, jam digital, dan etalase menu signature hari ini.
              </p>
            </div>
          )}

          {status === 'ACTIVE_ORDER' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Order list */}
              <div className="md:col-span-7 bg-white rounded-2xl p-5 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#C2552D]" />
                    <span className="font-bold text-[14px] text-[#181615]">Rincian Pesanan ({totalQuantity} item)</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-[#181615]">
                    {customerName || 'Pelanggan'} • {orderType}
                  </span>
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between items-center text-[13px] p-2 rounded-xl bg-stone-50">
                      <div>
                        <span className="font-bold text-[#181615]">{item.quantity}× {item.productName}</span>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <span className="text-[11px] text-[#736B66] block">
                            {item.modifiers.map(m => m.optionName).join(', ')}
                          </span>
                        )}
                      </div>
                      <span className="font-bold font-mono tabular-nums text-[#181615]">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Totals */}
              <div className="md:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2552D]">Total Tagihan</span>
                <div className="text-[30px] font-black font-mono tabular-nums text-[#181615]">
                  {formatRupiah(grandTotal)}
                </div>
                {discount > 0 && (
                  <div className="text-[12px] text-[#34C759] font-bold">
                    Diskon: -{formatRupiah(discount)}
                  </div>
                )}
                <p className="text-[11.5px] text-[#736B66] leading-relaxed">
                  Pelanggan dapat melihat kalkulasi harga secara transparan dan akurat.
                </p>
              </div>
            </div>
          )}

          {status === 'PAYMENT' && (
            <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center space-y-4">
              <span className="text-[11px] font-bold text-[#0071E3] uppercase tracking-wider bg-[#0071E3]/10 px-3 py-1 rounded-full">
                Mode Pembayaran Aktif: {paymentMethod}
              </span>
              <div className="text-[28px] font-black font-mono tabular-nums text-[#181615]">
                {formatRupiah(grandTotal)}
              </div>
              {paymentMethod === 'QRIS' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 h-32 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-[#181615]" />
                  </div>
                  <span className="text-[12px] font-bold text-[#181615]">QRIS Ditampilkan Ukuran Besar di Layar Pelanggan</span>
                </div>
              ) : (
                <p className="text-[13px] text-[#736B66]">
                  Layar pelanggan menampilkan arahan untuk menyerahkan uang tunai ke kasir.
                </p>
              )}
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-[18px] font-bold text-[#181615]">Pembayaran Berhasil!</h4>
              <div className="text-[24px] font-mono font-bold text-[#C2552D]">
                {completedOrder?.orderNumber || '#ORD-LIVE'}
              </div>
              <p className="text-[12px] text-[#736B66]">
                Layar merayakan transaksi sukses dan menampilkan nomor antrean ke pembeli.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/80 bg-white flex items-center justify-between text-[12px] text-[#736B66]">
          <span>Gunakan kabel HDMI / Wireless Display / iPad Sidecar untuk memindahkan layar ini ke monitor pelanggan.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#181615] font-bold text-[12px] transition-all"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
