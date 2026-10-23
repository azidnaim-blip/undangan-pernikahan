'use client';

import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Sparkles,
  QrCode,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Clock,
  ShoppingBag,
  Utensils,
  Bike,
  HeartHandshake
} from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';
import {
  CustomerDisplayState,
  initialCustomerDisplayState,
  subscribeCustomerDisplay,
  getCachedCustomerDisplayState
} from '@/lib/customerDisplayChannel';

// Signature Showcase Items for Idle State
const SIGNATURE_PROMOS = [
  {
    name: 'Signature Flat White',
    category: 'Espresso Bar',
    description: 'Double ristretto espresso dipadukan susu oat creamy dengan microfoam selembut sutra.',
    price: 32000,
    tag: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisan Almond Croissant',
    category: 'Viennoiserie',
    description: 'Pastry mentega renyah berlapis frangipane almond manis dan taburan kacang panggang.',
    price: 28000,
    tag: 'Freshly Baked',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kyoto Matcha Cloud',
    category: 'Artisan Tea',
    description: 'Matcha Uji seremonial premium dengan lapisan cold foam vanila dingin yang menyegarkan.',
    price: 35000,
    tag: 'Specialty',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Caramel Macchiato Reserve',
    category: 'Signature Sweet',
    description: 'Susu vanila segar dengan espresso pekat dan siraman saus karamel mentega gurih.',
    price: 34000,
    tag: 'Chef Pick',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80',
  },
];

export default function CustomerDisplayPage() {
  const [displayState, setDisplayState] = useState<CustomerDisplayState>(initialCustomerDisplayState);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [activePromoIndex, setActivePromoIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 1. Clock and Date updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
      setCurrentDate(
        new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Promo Carousel auto-rotation for Idle state
  useEffect(() => {
    const promoTimer = setInterval(() => {
      setActivePromoIndex((prev) => (prev + 1) % SIGNATURE_PROMOS.length);
    }, 4500);
    return () => clearInterval(promoTimer);
  }, []);

  // 3. Subscribe to Realtime Display State from Cashier POS
  useEffect(() => {
    // Initial cache sync
    const initial = getCachedCustomerDisplayState();
    if (initial) {
      setDisplayState(initial);
    }

    const unsubscribe = subscribeCustomerDisplay((newState) => {
      setDisplayState(newState);
      if (newState.status === 'SUCCESS') {
        playSoundEffect('success');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const { status, cart, customerName, orderType, subtotal, discount, grandTotal, paymentMethod, completedOrder } = displayState;

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen w-full bg-[#F8F6F2] text-[#181615] flex flex-col justify-between overflow-hidden select-none font-sans relative">
      {/* Ambient background luxury radial glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C2552D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/70 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* TOP BAR: Brand Mark & Live Time HUD */}
      <header className="px-4 py-3 sm:px-8 sm:py-5 border-b border-stone-200/60 bg-white/75 backdrop-blur-3xl flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-[#C2552D] via-[#B54B24] to-[#8E3615] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(194,85,45,0.35)] border-t border-white/30">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-[17px] sm:text-[20px] tracking-tight leading-tight text-[#181615]">
                BrewPoint
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#C2552D]/10 text-[#C2552D] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                Specialty Coffee
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] font-medium text-[#736B66] flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
              <span>Layar Interaktif Pelanggan</span>
            </p>
          </div>
        </div>

        {/* Date & Time Widget */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[14px] font-bold font-mono tabular-nums text-[#181615]">
              {currentTime}
            </div>
            <div className="text-[11.5px] font-medium text-[#8C827A]">
              {currentDate}
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200/80 text-[#736B66] hover:text-[#181615] flex items-center justify-center shadow-xs active:scale-95 transition-all"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh Kiosk'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN SCREEN AREA: 4 DYNAMIC STATES */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto justify-center overflow-y-auto no-scrollbar">
        {/* ================= STATE 1: IDLE / STANDBY ================= */}
        {status === 'IDLE' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8 py-6 animate-fade-in">
            {/* Hero Welcome */}
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200/80 shadow-xs text-[#C2552D] text-[13px] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Selamat Datang • Crafted with Passion</span>
              </div>
              <h2 className="text-[34px] sm:text-[44px] font-extrabold text-[#181615] tracking-tight leading-tight">
                Nikmati Racikan Kopi & Menu Pilihan Terbaik
              </h2>
              <p className="text-[15px] text-[#736B66] leading-relaxed max-w-xl mx-auto">
                Silakan pesan langsung di meja kasir. Kami siap meracik kopi berkualitas tinggi khusus untuk Anda.
              </p>
            </div>

            {/* Showcase Signature Menu Carousel */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {SIGNATURE_PROMOS.map((item, index) => {
                const isFeatured = index === activePromoIndex;
                return (
                  <div
                    key={item.name}
                    className={`rounded-3xl p-4 transition-all duration-500 text-left flex flex-col justify-between border ${
                      isFeatured
                        ? 'bg-white shadow-[0_12px_36px_-6px_rgba(194,85,45,0.18)] border-[#C2552D]/40 ring-2 ring-[#C2552D] -translate-y-1'
                        : 'bg-white/80 border-stone-200/60 shadow-xs hover:border-stone-300'
                    }`}
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-stone-100 border border-black/[0.04]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                          {item.tag}
                        </div>
                      </div>

                      <div className="text-[10px] uppercase font-bold text-[#C2552D] tracking-wider mb-0.5">
                        {item.category}
                      </div>
                      <h3 className="font-bold text-[15px] text-[#181615] leading-snug line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-[11.5px] text-[#736B66] line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[14px] font-black font-mono tabular-nums text-[#181615]">
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-[11px] font-bold text-[#C2552D]">Specialty</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hospitality Cue */}
            <div className="flex items-center gap-2 text-[13px] text-[#8C827A] font-medium pt-2">
              <HeartHandshake className="w-4 h-4 text-[#C2552D]" />
              <span>Kasir kami siap membantu Anda memilih racikan terbaik hari ini</span>
            </div>
          </div>
        )}

        {/* ================= STATE 2: ACTIVE ORDER (INPUT KASIR) ================= */}
        {status === 'ACTIVE_ORDER' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4 animate-fade-in">
            {/* Left Column: Live Order Items List (8 cols) */}
            <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-stone-200/80 shadow-[0_4px_24px_rgba(28,25,23,0.03)] flex flex-col min-h-[380px] lg:h-[520px]">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#C2552D]/10 text-[#C2552D] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[18px] text-[#181615] tracking-tight">
                      Rincian Pesanan Anda
                    </h3>
                    <p className="text-[12px] text-[#736B66]">
                      {totalQuantity} item sedang dicatat kasir
                    </p>
                  </div>
                </div>

                {/* Table or Customer Pill */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-stone-100 border border-stone-200 text-[#181615] text-[12px] font-bold flex items-center gap-1.5">
                    {orderType === 'DINE_IN' && <Utensils className="w-3.5 h-3.5 text-[#C2552D]" />}
                    {orderType === 'TAKEAWAY' && <ShoppingBag className="w-3.5 h-3.5 text-[#C2552D]" />}
                    {orderType === 'DELIVERY' && <Bike className="w-3.5 h-3.5 text-[#C2552D]" />}
                    <span>{customerName || 'Pelanggan Walk-In'}</span>
                  </span>
                </div>
              </div>

              {/* Scrollable Order Docket */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 flex items-center justify-between gap-3 animate-fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Coffee className="w-5 h-5 text-[#C2552D]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[14px] text-[#181615] truncate">
                          {item.productName}
                        </h4>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.modifiers.map((m) => (
                              <span
                                key={m.optionId}
                                className="px-1.5 py-0.2 rounded-md bg-white border border-stone-200 text-[#736B66] text-[10px] font-medium"
                              >
                                {m.optionName}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <span className="text-[11px] text-[#8C827A] italic block mt-0.5">
                            "{item.notes}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[12px] text-[#736B66] font-mono">
                        {item.quantity} × {formatRupiah(item.unitPrice)}
                      </div>
                      <div className="text-[15px] font-bold font-mono tabular-nums text-[#181615]">
                        {formatRupiah(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Live Bill Summary Card (5 cols) */}
            <div className="lg:col-span-5 bg-white/95 backdrop-blur-2xl rounded-3xl p-7 border border-stone-200/80 shadow-[0_12px_40px_-8px_rgba(28,25,23,0.08)] flex flex-col justify-between min-h-[380px] lg:h-[520px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2552D] bg-[#C2552D]/10 px-2.5 py-1 rounded-lg">
                  Ringkasan Tagihan
                </span>
                <h3 className="text-[22px] font-extrabold text-[#181615] tracking-tight mt-2">
                  Total Pembayaran
                </h3>
                <p className="text-[13px] text-[#736B66] mt-0.5">
                  Silakan periksa pesanan Anda sebelum kasir memproses struk.
                </p>

                {/* Totals Breakdown */}
                <div className="mt-6 pt-4 border-t border-stone-200 space-y-2 text-[14px]">
                  <div className="flex items-center justify-between text-[#736B66]">
                    <span>Subtotal ({totalQuantity} menu)</span>
                    <span className="font-semibold font-mono tabular-nums text-[#181615]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-[#34C759]">
                      <span>Diskon Spesial</span>
                      <span className="font-bold font-mono tabular-nums">
                        -{formatRupiah(discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[#736B66]">
                    <span>Pajak Restoran PB1</span>
                    <span className="font-medium text-[12px] text-[#8C827A]">Termasuk</span>
                  </div>
                </div>
              </div>

              {/* Grand Total Hero Box */}
              <div className="bg-[#FAF8F5] border border-stone-200 p-5 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A]">
                  Jumlah yang Harus Dibayar
                </span>
                <div className="text-[34px] sm:text-[40px] font-black font-mono tabular-nums text-[#181615] tracking-tight">
                  {formatRupiah(grandTotal)}
                </div>
                <div className="text-[12px] text-[#736B66] flex items-center justify-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                  <span>Kasir sedang menyelesaikan pesanan Anda</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATE 3: PAYMENT / QRIS SCREEN ================= */}
        {status === 'PAYMENT' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4 animate-fade-in">
            {/* Left Column: Compact Order Review (5 cols) */}
            <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col min-h-[380px] lg:h-[520px] justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="font-bold text-[17px] text-[#181615]">
                      Pesanan: {customerName || 'Pelanggan'}
                    </h3>
                    <span className="text-[12px] text-[#736B66]">
                      {totalQuantity} item • {orderType}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-[#C2552D]/10 text-[#C2552D] font-bold text-[11px]">
                    Tahap Bayar
                  </span>
                </div>

                <div className="overflow-y-auto max-h-[300px] py-3 space-y-2 no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between items-center text-[13px] py-1">
                      <span className="text-[#181615] font-medium truncate max-w-[180px]">
                        {item.quantity}× {item.productName}
                      </span>
                      <span className="font-mono tabular-nums font-bold text-[#181615]">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Banner */}
              <div className="pt-4 border-t border-stone-200 flex items-baseline justify-between">
                <span className="font-bold text-[16px] text-[#181615]">Total Tagihan</span>
                <span className="font-black font-mono tabular-nums text-[28px] text-[#181615]">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Right Column: High-Res Interactive QRIS / Cash Notice (7 cols) */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-3xl rounded-3xl p-8 border border-stone-200 shadow-[0_16px_50px_-10px_rgba(194,85,45,0.15)] flex flex-col items-center text-center justify-center min-h-[380px] lg:h-[520px]">
              {paymentMethod === 'QRIS' ? (
                <div className="space-y-4 animate-scale-up flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] font-bold text-[12px]">
                    <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                    <span>Pembayaran QRIS Statis / Dinamis</span>
                  </div>

                  {/* QRIS High-Res Box */}
                  <div className="p-4 rounded-3xl bg-white border-2 border-stone-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col items-center relative group">
                    <div className="w-64 h-64 bg-stone-50 rounded-2xl flex flex-col items-center justify-center p-4 border border-stone-200/70">
                      <QrCode className="w-48 h-48 text-[#181615] stroke-[1.4]" />
                      <div className="text-[11px] font-extrabold text-[#C2552D] tracking-wider uppercase mt-1">
                        QRIS Standar Indonesia
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[15px] font-bold text-[#181615]">
                      Scan dengan Aplikasi Perbankan / E-Wallet Anda
                    </div>
                    <p className="text-[12px] text-[#736B66]">
                      BCA Mobile • Mandiri Livin • GoPay • OVO • Dana • ShopeePay • LinkAja
                    </p>
                  </div>
                </div>
              ) : (
                /* Cash Payment Mode Notice */
                <div className="space-y-4 animate-scale-up flex flex-col items-center py-6">
                  <div className="w-20 h-20 rounded-3xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#C2552D] shadow-xs">
                    <Coffee className="w-10 h-10 stroke-[1.8]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[26px] font-extrabold text-[#181615] tracking-tight">
                      Pembayaran Tunai (Cash)
                    </h3>
                    <p className="text-[14px] text-[#736B66] max-w-md mx-auto">
                      Silakan serahkan uang tunai pas atau pecahan ke kasir kami sebesar:
                    </p>
                    <div className="text-[38px] font-black font-mono tabular-nums text-[#C2552D] tracking-tight pt-2">
                      {formatRupiah(grandTotal)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STATE 4: SUCCESS / CELEBRATION ================= */}
        {status === 'SUCCESS' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8 animate-scale-up">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#34C759] to-[#248A3D] text-white flex items-center justify-center shadow-[0_12px_36px_rgba(52,199,89,0.35)] border-2 border-white/40">
              <CheckCircle2 className="w-12 h-12 stroke-[2.4]" />
            </div>

            <div className="space-y-2 max-w-lg">
              <span className="text-[13px] font-bold text-[#34C759] uppercase tracking-wider">
                Pembayaran Berhasil Diverifikasi
              </span>
              <h2 className="text-[38px] sm:text-[46px] font-black text-[#181615] tracking-tight leading-tight">
                Terima Kasih atas Pesanan Anda! ✨
              </h2>
              <p className="text-[15px] text-[#736B66] leading-relaxed">
                Struk telah dicatat. Tim barista kami sedang menyiapkan racikan minuman & makanan Anda dengan penuh cinta.
              </p>
            </div>

            {/* Big Order Number Ticket */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-[0_12px_40px_-8px_rgba(28,25,23,0.06)] min-w-[320px] text-center space-y-2">
              <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
                Nomor Antrean Struk
              </span>
              <div className="text-[34px] font-black font-mono tabular-nums text-[#C2552D] tracking-tight">
                {completedOrder?.orderNumber || '#ORD-LIVE'}
              </div>
              <div className="text-[13px] text-[#181615] font-semibold pt-1 border-t border-stone-100 flex items-center justify-between">
                <span>Total Dibayar:</span>
                <span className="font-mono">{formatRupiah(completedOrder?.total || grandTotal)}</span>
              </div>
              {completedOrder && completedOrder.change > 0 && (
                <div className="text-[12px] text-[#34C759] font-bold flex items-center justify-between">
                  <span>Kembalian Tunai:</span>
                  <span className="font-mono">{formatRupiah(completedOrder.change)}</span>
                </div>
              )}
            </div>

            <div className="text-[12px] text-[#8C827A] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C2552D] animate-ping" />
              <span>Layar akan kembali ke beranda dalam beberapa detik...</span>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER: Boutique Brand Signature */}
      <footer className="px-8 py-3.5 border-t border-stone-200/60 bg-white/60 backdrop-blur-md flex items-center justify-between text-[11.5px] text-[#8C827A] font-medium">
        <div className="flex items-center gap-2">
          <span>BrewPoint Specialty Coffee & Eatery</span>
          <span>•</span>
          <span>Purr Style Modern POS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#C2552D]" />
          <span>Realtime Customer-Facing Terminal</span>
        </div>
      </footer>
    </div>
  );
}
