'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Play,
  Volume2,
  VolumeX,
  RefreshCw,
  BellRing,
  Coffee,
  Check,
  BookOpen,
  X
} from 'lucide-react';
import { formatDateIndo, playSoundEffect } from '@/lib/utils';
import RoleGuard from '@/components/auth/RoleGuard';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  notes?: string;
  modifiersJson?: string;
}

interface KdsOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';
  createdAt: string;
  items: OrderItem[];
}

function KdsContent() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [audioAlert, setAudioAlert] = useState<boolean>(true);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const prevOrderCountRef = useRef<number>(0);

  const fetchKdsOrders = async () => {
    try {
      const res = await fetch('/api/orders?status=PENDING,IN_PROGRESS,READY');
      if (res.ok) {
        const data: KdsOrder[] = await res.json();

        // Trigger chime on new orders
        if (prevOrderCountRef.current > 0 && data.length > prevOrderCountRef.current && audioAlert) {
          playSoundEffect('bell');
        }
        prevOrderCountRef.current = data.length;

        // FIFO sorting
        data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setOrders(data);
      }
    } catch (err) {
      console.error('KDS fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKdsOrders();
    const interval = setInterval(fetchKdsOrders, 5000);
    return () => clearInterval(interval);
  }, [audioAlert]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      playSoundEffect('beep');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        if (nextStatus === 'READY') {
          playSoundEffect('success');
        }
        fetchKdsOrders();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getElapsedMinutes = (dateStr: string) => {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ACTIVE') return o.status !== 'COMPLETED';
    return o.status === statusFilter;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const inProgressCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F6F2] overflow-hidden select-none">
      {/* KDS Top Bar */}
      <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-stone-200/60 bg-white/80 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-[#C2552D] via-[#B54B24] to-[#8E3615] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(194,85,45,0.28)] border-t border-white/25 shrink-0">
            <ChefHat className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-bold text-[16px] sm:text-[18px] text-[#181615] flex items-center gap-2 tracking-tight">
              <span>Barista Kitchen Display</span>
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#736B66] font-medium">
              Antrean pembuatan pesanan realtime (Auto-refresh 5s)
            </p>
          </div>
        </div>

        {/* Filter Pills & Audio Toggle (Apple HIG Segmented Control) */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center bg-[#767680]/[0.08] p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all whitespace-nowrap ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Semua ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                statusFilter === 'PENDING'
                  ? 'bg-white text-[#FF9500] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Menunggu ({pendingCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-white text-[#0071E3] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Dibuat ({inProgressCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('READY')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                statusFilter === 'READY'
                  ? 'bg-white text-[#34C759] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Siap ({readyCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAudioAlert(!audioAlert)}
            className="w-9 h-9 rounded-xl bg-white hover:bg-black/[0.04] text-[#1D1D1F] border border-black/[0.08] flex items-center justify-center shadow-xs active:scale-95 transition-all"
            title={audioAlert ? 'Bunyi Lonceng Aktif' : 'Lonceng Senyap'}
          >
            {audioAlert ? (
              <BellRing className="w-4 h-4 text-[#C2552D]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#AEAEC2]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playSoundEffect('tap');
              setIsRecipeModalOpen(true);
            }}
            className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            title="Buku Resep & Standar Takaran Minuman"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Panduan Resep</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[#86868B] gap-2.5">
            <RefreshCw className="w-5 h-5 animate-spin text-[#C2552D]" />
            <span className="text-[14px] font-semibold">Memuat antrean dapur...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#86868B] space-y-3 py-16">
            <div className="w-16 h-16 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#34C759] shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[1.8]" />
            </div>
            <p className="text-[17px] font-bold text-[#1D1D1F]">Semua Pesanan Selesai!</p>
            <p className="text-[13px] text-[#6E6E73]">Belum ada pesanan aktif dalam antrean dapur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4 pb-20 sm:pb-8">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isLongWait = elapsed >= 10;
              const isMediumWait = elapsed >= 5 && elapsed < 10;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all overflow-hidden ${
                    order.status === 'READY'
                      ? 'border-[#34C759]/40 ring-2 ring-[#34C759]/20'
                      : order.status === 'IN_PROGRESS'
                      ? 'border-[#0071E3]/40 ring-2 ring-[#0071E3]/20'
                      : isLongWait
                      ? 'border-[#FF3B30] ring-2 ring-[#FF3B30]/20'
                      : 'border-black/[0.06]'
                  }`}
                >
                  {/* Card Header (Apple Inset Header) */}
                  <div
                    className={`p-4 border-b flex items-center justify-between ${
                      order.status === 'READY'
                        ? 'bg-[#34C759]/5 border-[#34C759]/15'
                        : order.status === 'IN_PROGRESS'
                        ? 'bg-[#0071E3]/5 border-[#0071E3]/15'
                        : 'bg-[#F2F2F7] border-black/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[22px] font-extrabold font-mono tracking-tight text-[#1D1D1F]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white border border-black/[0.06] text-[#1D1D1F] shadow-xs">
                          {order.orderType}
                        </span>
                      </div>
                      <p className="text-[12px] font-semibold text-[#6E6E73] mt-0.5 truncate max-w-[160px]">
                        {order.customerName || 'Walk-In'}
                      </p>
                    </div>

                    {/* Timer Badge */}
                    <div
                      className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-lg border ${
                        isLongWait
                          ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
                          : isMediumWait
                          ? 'bg-[#FF9500]/10 border-[#FF9500]/30 text-[#FF9500]'
                          : 'bg-white border-black/[0.06] text-[#6E6E73]'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{elapsed} mnt</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[300px] no-scrollbar">
                    {order.items.map((item, idx) => {
                      let parsedMods: { optionName: string }[] = [];
                      if (item.modifiersJson) {
                        try {
                          parsedMods = JSON.parse(item.modifiersJson);
                        } catch {
                          // ignore
                        }
                      }

                      return (
                        <div
                          key={idx}
                          className="bg-[#F2F2F7] border border-black/[0.04] rounded-xl p-2.5 space-y-1.5"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-[#C2552D] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                              {item.quantity}
                            </span>
                            <span className="font-bold text-[13px] text-[#1D1D1F] leading-snug">
                              {item.productName}
                            </span>
                          </div>

                          {/* Modifiers List with High Contrast Badges */}
                          {parsedMods.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-7">
                              {parsedMods.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white border border-black/[0.06] text-[#C2552D]"
                                >
                                  {m.optionName}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-[11px] text-[#C2552D] font-medium italic pl-7">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 border-t border-black/[0.06] bg-[#F8F8FA]">
                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#0071E3] hover:bg-[#005bb5] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Mulai Buat</span>
                      </button>
                    )}

                    {order.status === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#34C759] hover:bg-[#28a745] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pesanan Siap!</span>
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#1D1D1F] hover:bg-black text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Selesai Diserahkan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECIPE GUIDE MODAL FOR BARISTA */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200/80 max-h-[85vh] flex flex-col animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[#181615]">Buku Resep & Standar Barista</h3>
                  <p className="text-[11px] text-[#736B66]">Panduan takaran gramasi & rasio seduh resmi cafe</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-[#736B66] active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar">
              {[
                {
                  name: 'Espresso (Double Shot)',
                  dose: '18 gr biji kopi Arabica',
                  yield: '36 ml cairan espresso',
                  time: '25 - 28 detik',
                  notes: 'Suhu air 92°C, tamp tekanan 15kg flat.',
                },
                {
                  name: 'Cappuccino (Hot 8 oz)',
                  dose: '18 gr kopi (Double Shot 36ml)',
                  yield: '120 ml fresh milk steamed',
                  time: 'Microfoam 1.5 cm tebal',
                  notes: 'Susu dipanaskan ke suhu 60-65°C, tuang latte art kontras.',
                },
                {
                  name: 'Caffe Latte (Hot/Iced 12 oz)',
                  dose: '18 gr kopi (Double Shot 36ml)',
                  yield: '160 ml fresh milk (Iced: 140ml + es batu)',
                  time: 'Microfoam 0.5 cm lembut',
                  notes: 'Rasa seimbang, creamy dan manis alami laktosa.',
                },
                {
                  name: 'Kopi Susu Gula Aren (Signature)',
                  dose: '18 gr kopi (Double Shot 36ml)',
                  yield: '100 ml fresh milk + 25 ml sirup aren organik',
                  time: 'Es batu kristal 120 gr',
                  notes: 'Layering: sirup aren di dasar, es batu, susu, tuang espresso di atas.',
                },
                {
                  name: 'Americano / Long Black (Iced)',
                  dose: '18 gr kopi (Double Shot 36ml)',
                  yield: '180 ml air mineral dingin',
                  time: 'Es batu kristal 100 gr',
                  notes: 'Tuang air & es terlebih dahulu, lalu tuang espresso agar crema tetap utuh.',
                },
                {
                  name: 'Manual Brew V60 (Filter)',
                  dose: '15 gr biji kopi gilingan medium-fine',
                  yield: '225 ml air mineral 91°C (Rasio 1:15)',
                  time: '2 menit 30 detik total pour',
                  notes: 'Blooming 45ml (40s), pour 1 ke 130ml, pour 2 ke 225ml.',
                },
              ].map((r, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/70 space-y-1.5">
                  <div className="font-bold text-[14px] text-[#181615] flex items-center justify-between">
                    <span>{r.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-200/80 text-[#57534E]">
                      {r.time}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#57534E] pt-0.5">
                    <div>
                      <span className="font-semibold text-[#181615]">Dose:</span> {r.dose}
                    </div>
                    <div>
                      <span className="font-semibold text-[#181615]">Rasio/Susu:</span> {r.yield}
                    </div>
                  </div>
                  <div className="text-[10.5px] text-[#78716C] italic pt-0.5">
                    Tips Barista: {r.notes}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200/60 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-[#181615] hover:bg-black text-white text-xs font-bold transition-all active:scale-95"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KdsPage() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'BARISTA']}>
      <KdsContent />
    </RoleGuard>
  );
}
