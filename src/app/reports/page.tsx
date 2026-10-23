'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  PieChart,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Award,
  CreditCard,
  Banknote,
  ShoppingBag,
  Percent
} from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/lib/AuthContext';

interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalEstimatedHpp: number;
  grossProfit: number;
  profitMarginPercent: number;
  totalCashSales: number;
  totalQrisSales: number;
  totalDiscount: number;
}

interface PeakHourItem {
  hour: string;
  count: number;
  revenue: number;
}

interface BestSellerItem {
  name: string;
  categoryName: string;
  quantity: number;
  revenue: number;
  hpp: number;
}

interface CategoryItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  paymentMethod: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
  itemsSummary: string;
}

function ReportsContent() {
  const { effectiveRole } = useAuth();
  const isOwner = effectiveRole === 'OWNER';
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHourItem[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerItem[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?range=${range}`, {
        headers: {
          'x-user-role': effectiveRole || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setPeakHours(data.peakHours);
        setBestSellers(data.bestSellers);
        setCategoryBreakdown(data.categoryBreakdown);
        setRecentOrders(data.recentOrders);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  // Export to PDF
  const handleExportPdf = () => {
    playSoundEffect('success');
    if (!summary) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header Cafe
    doc.setFillColor(194, 85, 45); // Terracotta brand
    doc.rect(0, 0, 210, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('BREWPOINT COFFEE - PURR COFFEE ROASTERS', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(253, 238, 231);
    doc.text('Laporan Eksekutif Penjualan, Margin HPP & Analisis Jam Sibuk', 14, 18);

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const rangeLabel =
      range === 'today'
        ? 'Hari Ini'
        : range === 'week'
        ? '7 Hari Terakhir'
        : range === 'month'
        ? '30 Hari Terakhir'
        : 'Semua Waktu';
    doc.text(`Periode: ${rangeLabel} | Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 23);

    // Summary KPI Grid Table
    autoTable(doc, {
      startY: 34,
      head: [['Total Omset', 'Laba Kotor (Gross)', 'Margin (%)', 'Total Transaksi', 'Rata-rata (AOV)']],
      body: [
        [
          formatRupiah(summary.totalRevenue),
          formatRupiah(summary.grossProfit),
          `${summary.profitMarginPercent}%`,
          `${summary.totalOrders} Pesanan`,
          formatRupiah(summary.averageOrderValue),
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [194, 85, 45], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontStyle: 'bold', fontSize: 10 },
    });

    // Payment Breakdown Table
    // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
    const afterKpiY = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: afterKpiY,
      head: [['Metode Pembayaran', 'Total Penerimaan', 'Porsi (% Total)']],
      body: [
        [
          'Tunai (Cash)',
          formatRupiah(summary.totalCashSales),
          summary.totalRevenue > 0
            ? `${Math.round((summary.totalCashSales / summary.totalRevenue) * 100)}%`
            : '0%',
        ],
        [
          'QRIS & E-Wallet',
          formatRupiah(summary.totalQrisSales),
          summary.totalRevenue > 0
            ? `${Math.round((summary.totalQrisSales / summary.totalRevenue) * 100)}%`
            : '0%',
        ],
        ['Diskon Terpakai', `-${formatRupiah(summary.totalDiscount)}`, '-'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [110, 47, 28], textColor: [255, 255, 255] },
    });

    // Best Sellers Table
    // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
    const afterPayY = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(36, 21, 17);
    doc.text('Peringkat Menu Terlaris (Best Sellers)', 14, afterPayY);

    const bestSellerRows = bestSellers.map((item, idx) => [
      `#${idx + 1}`,
      item.name,
      item.categoryName,
      `${item.quantity} porsi`,
      formatRupiah(item.revenue),
      formatRupiah(item.revenue - item.hpp),
    ]);

    autoTable(doc, {
      startY: afterPayY + 3,
      head: [['Rank', 'Nama Menu', 'Kategori', 'Terjual', 'Total Omset', 'Est. Laba Kotor']],
      body: bestSellerRows.length > 0 ? bestSellerRows : [['-', 'Belum ada transaksi', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [194, 85, 45], textColor: [255, 255, 255] },
    });

    // Recent Orders Table
    // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
    const afterBestY = doc.lastAutoTable.finalY + 8;

    if (afterBestY < 240) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(36, 21, 17);
      doc.text('Rincian Transaksi Terakhir', 14, afterBestY);

      const orderRows = recentOrders.slice(0, 15).map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        o.customerName,
        o.orderType,
        o.paymentMethod,
        formatRupiah(o.total),
      ]);

      autoTable(doc, {
        startY: afterBestY + 3,
        head: [['No. Order', 'Jam', 'Pelanggan', 'Tipe', 'Metode', 'Total Tagihan']],
        body: orderRows,
        theme: 'striped',
        headStyles: { fillColor: [69, 45, 38], textColor: [255, 255, 255] },
      });
    }

    doc.save(`Laporan-Penjualan-BrewPoint-${range}.pdf`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    playSoundEffect('success');
    if (!recentOrders || recentOrders.length === 0) {
      alert('Tidak ada data transaksi untuk diexport');
      return;
    }

    const headers = [
      'Nomor Order',
      'Tanggal',
      'Nama Pelanggan',
      'Tipe Pesanan',
      'Metode Pembayaran',
      'Total Rupiah',
      'Status',
      'Rincian Menu',
    ];

    const rows = recentOrders.map((o) => [
      o.orderNumber,
      `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
      `"${o.customerName}"`,
      o.orderType,
      o.paymentMethod,
      o.total,
      o.status,
      `"${o.itemsSummary.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transaksi-BrewPoint-${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxPeakCount = Math.max(...peakHours.map((p) => p.count), 1);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F6F2] overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-24 sm:pb-8 select-none font-sans">
      {/* Top Header & Range Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#181615] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#C2552D]" />
            <span>Analitik & Laporan Eksekutif</span>
          </h2>
          <p className="text-xs text-[#736B66] font-medium mt-0.5">
            Analisis omset penjualan, distribusi jam sibuk, margin HPP, serta ekspor laporan PDF & Excel
          </p>
        </div>

        {/* Range Selector & Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Apple Segmented Control */}
          <div className="flex bg-[#767680]/12 p-1 rounded-xl border border-black/[0.04]">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'week', label: '7 Hari' },
              { id: 'month', label: '30 Hari' },
              { id: 'all', label: 'Semua' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  playSoundEffect('beep');
                  setRange(t.id as 'today' | 'week' | 'month' | 'all');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === t.id
                    ? 'bg-white text-[#1D1D1F] shadow-sm'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1D1D1F] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] active:scale-95"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0071E3]' : ''}`} />
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1D1D1F] font-semibold text-xs flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 text-[#FF3B30]" />
            <span>Export PDF</span>
          </button>

          {/* Export CSV / Excel */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards (Apple Health / Stocks Widgets) */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Omset */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
              Total Omset Penjualan
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-[#1D1D1F]">
              {formatRupiah(summary.totalRevenue)}
            </div>
            <div className="text-[11px] text-[#86868B] font-medium">
              {summary.totalOrders} Transaksi Selesai
            </div>
          </div>

          {/* Laba Kotor & Margin (OWNER ONLY) or Total Diskon (CASHIER) */}
          {isOwner ? (
            <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                  Laba Kotor (Gross)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20">
                  Margin {summary.profitMarginPercent}%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-[#34C759]">
                {formatRupiah(summary.grossProfit)}
              </div>
              <div className="text-[11px] text-[#86868B]">
                Estimasi HPP: {formatRupiah(summary.totalEstimatedHpp)}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                  Diskon Diberikan
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20">
                  Promo Shift
                </span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-[#FF9500]">
                {formatRupiah(summary.totalDiscount || 0)}
              </div>
              <div className="text-[11px] text-[#86868B]">
                Total potongan harga & promo kasir
              </div>
            </div>
          )}

          {/* Rata-rata Transaksi (AOV) */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
              Rata-rata Order (AOV)
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-[#1D1D1F]">
              {formatRupiah(summary.averageOrderValue)}
            </div>
            <div className="text-[11px] text-[#86868B]">Nilai keranjang rata-rata per pelanggan</div>
          </div>

          {/* Pembayaran Tunai vs QRIS */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
              Metode Pembayaran
            </span>
            <div className="space-y-1.5 text-xs font-mono pt-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[#6E6E73] flex items-center gap-1.5 font-sans font-medium">
                  <Banknote className="w-3.5 h-3.5 text-[#34C759]" /> Tunai
                </span>
                <span className="text-[#1D1D1F] font-bold tabular-nums">
                  {formatRupiah(summary.totalCashSales)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6E6E73] flex items-center gap-1.5 font-sans font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-[#0071E3]" /> QRIS
                </span>
                <span className="text-[#0071E3] font-bold tabular-nums">
                  {formatRupiah(summary.totalQrisSales)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS & PEAK HOURS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PEAK HOURS BAR CHART (Apple Activity Chart Style) */}
        <div className="lg:col-span-2 bg-white border border-black/[0.06] rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0071E3]" />
                <span>Distribusi Jam Sibuk (Peak Hours)</span>
              </h3>
              <p className="text-[11px] text-[#86868B] mt-0.5">
                Frekuensi transaksi pelanggan per jam operasional (07:00 – 22:00)
              </p>
            </div>
          </div>

          {/* Hourly Visual Bars */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[440px] grid grid-cols-16 gap-2 pt-6 items-end h-44 border-b border-black/[0.06] pb-2">
              {peakHours.map((item) => {
                const heightPercent =
                  maxPeakCount > 0 ? Math.round((item.count / maxPeakCount) * 100) : 0;
                const isPeak = item.count === maxPeakCount && item.count > 0;

                return (
                  <div key={item.hour} className="flex flex-col items-center h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono font-semibold bg-[#1D1D1F] text-white px-1.5 py-0.5 rounded-md mb-1 text-center pointer-events-none shadow-sm">
                      {item.count}
                    </div>

                    <div
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isPeak
                          ? 'bg-[#0071E3] shadow-[0_2px_8px_rgba(0,113,227,0.3)]'
                          : item.count > 0
                          ? 'bg-[#0071E3]/45 hover:bg-[#0071E3]/70'
                          : 'bg-[#F2F2F7]'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono mt-1.5 ${
                        isPeak ? 'text-[#0071E3] font-bold' : 'text-[#86868B]'
                      }`}
                    >
                      {item.hour.split(':')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div>
            <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#0071E3]" />
              <span>Kontribusi Kategori</span>
            </h3>
            <p className="text-[11px] text-[#86868B] mt-0.5">
              Proporsi pendapatan berdasarkan kategori menu
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#86868B] italic">Belum ada data kategori.</p>
            ) : (
              categoryBreakdown.map((cat) => {
                const percent =
                  summary && summary.totalRevenue > 0
                    ? Math.round((cat.revenue / summary.totalRevenue) * 100)
                    : 0;

                return (
                  <div key={cat.name} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#1D1D1F] font-semibold">
                      <span>{cat.name}</span>
                      <span className="font-mono text-[#6E6E73]">
                        {formatRupiah(cat.revenue)} <span className="text-[#0071E3] font-bold">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F2F2F7] overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-[#0071E3] rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* BEST SELLERS & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BEST SELLER RANKINGS */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF9500]" />
            <span>Menu Terlaris (Top Best Sellers)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] text-[#86868B]">
                  <th className="py-2.5 px-2 font-semibold text-[11px] uppercase tracking-wider">#</th>
                  <th className="py-2.5 px-3 font-semibold text-[11px] uppercase tracking-wider">Menu</th>
                  <th className="py-2.5 px-2 text-center font-semibold text-[11px] uppercase tracking-wider">Terjual</th>
                  <th className="py-2.5 px-3 text-right font-semibold text-[11px] uppercase tracking-wider">Omset</th>
                  {isOwner && (
                    <th className="py-2.5 px-3 text-right font-semibold text-[11px] uppercase tracking-wider">Est. Laba</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {bestSellers.map((item, idx) => (
                  <tr key={item.name} className="text-[#1D1D1F] hover:bg-[#F2F2F7]/50 transition-colors">
                    <td className="py-3 px-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          idx === 0
                            ? 'bg-[#FF9500]/15 text-[#FF9500]'
                            : idx === 1
                            ? 'bg-[#8E8E93]/20 text-[#1D1D1F]'
                            : idx === 2
                            ? 'bg-[#C2552D]/15 text-[#C2552D]'
                            : 'bg-[#F2F2F7] text-[#86868B]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#1D1D1F]">{item.name}</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-[#0071E3]">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold text-[#1D1D1F]">
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-[10px] text-[#86868B] font-sans font-normal select-none">Rp</span>
                        <span>{item.revenue.toLocaleString('id-ID')}</span>
                      </div>
                    </td>
                    {isOwner && (
                      <td className="py-3 px-3 font-mono tabular-nums text-[#34C759] font-semibold">
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-[10px] font-sans font-normal select-none">+Rp</span>
                          <span>{(item.revenue - item.hpp).toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT ORDERS LOG */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#0071E3]" />
            <span>Riwayat Transaksi Terakhir</span>
          </h3>

          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] text-[#86868B]">
                  <th className="py-2.5 px-2 font-semibold text-[11px] uppercase tracking-wider">No. Order</th>
                  <th className="py-2.5 px-2 font-semibold text-[11px] uppercase tracking-wider">Waktu</th>
                  <th className="py-2.5 px-3 font-semibold text-[11px] uppercase tracking-wider">Pelanggan</th>
                  <th className="py-2.5 px-2 font-semibold text-[11px] uppercase tracking-wider">Metode</th>
                  <th className="py-2.5 px-3 text-right font-semibold text-[11px] uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {recentOrders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="text-[#1D1D1F] hover:bg-[#F2F2F7]/50 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-[#1D1D1F]">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-2 font-mono text-[#86868B] text-[11px]">
                      {new Date(o.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-medium truncate max-w-[120px] text-[#1D1D1F]">
                      {o.customerName}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          o.paymentMethod === 'CASH'
                            ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                            : 'bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20'
                        }`}
                      >
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold text-[#1D1D1F]">
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-[10px] text-[#86868B] font-sans font-normal select-none">Rp</span>
                        <span>{o.total.toLocaleString('id-ID')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'CASHIER']}>
      <ReportsContent />
    </RoleGuard>
  );
}
