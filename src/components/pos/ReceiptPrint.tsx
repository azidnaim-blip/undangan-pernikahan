'use client';

import React, { useState } from 'react';
import { Printer, Download, CheckCircle, X } from 'lucide-react';
import { formatRupiah, formatDateIndo, playSoundEffect } from '@/lib/utils';
import jsPDF from 'jspdf';

export interface ReceiptData {
  orderNumber: string;
  customerName: string;
  orderType: string;
  paymentMethod: string;
  createdAt: string | Date;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    modifiersJson?: string;
    notes?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  change: number;
  cashierName?: string;
}

interface ReceiptPrintProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptPrint({
  receipt,
  isOpen,
  onClose,
}: ReceiptPrintProps) {
  if (!isOpen || !receipt) return null;

  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [storeSettings, setStoreSettings] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/settings').then(r => r.json()).then(data => {
        setStoreSettings(data);
        if (data.printerPaperSize) setPaperWidth(data.printerPaperSize);
      }).catch(() => {});
    }
  }, [isOpen]);

  const handlePrint = () => {
    playSoundEffect('beep');
    window.print();
  };

  const handleDownloadPdf = () => {
    playSoundEffect('success');
    const doc = new jsPDF({
      unit: 'mm',
      format: [paperWidth === '58mm' ? 58 : 80, 180],
    });

    const left = 4;
    const pageWidth = paperWidth === '58mm' ? 58 : 80;
    const right = pageWidth - 4;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text(storeSettings?.storeName?.toUpperCase() || 'BREWPOINT COFFEE', pageWidth / 2, 8, { align: 'center' });

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    if (storeSettings?.storeAddress) {
      const addressLines = doc.splitTextToSize(storeSettings.storeAddress, right - left);
      doc.text(addressLines, pageWidth / 2, 12, { align: 'center' });
      // adjust starting y
    }
    // Simplification for address and phone in PDF
    doc.text(storeSettings?.storePhone || '', pageWidth / 2, 16, { align: 'center' });

    doc.text('-'.repeat(36), pageWidth / 2, 18, { align: 'center' });

    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text(`ANTREAN: ${receipt.orderNumber}`, pageWidth / 2, 24, { align: 'center' });

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.text(`Tgl : ${formatDateIndo(receipt.createdAt)}`, left, 29);
    doc.text(`Nama: ${receipt.customerName || 'Pelanggan'} (${receipt.orderType})`, left, 33);
    doc.text(`Kasir: ${receipt.cashierName || 'Kasir 1'}`, left, 37);

    doc.text('-'.repeat(36), pageWidth / 2, 40, { align: 'center' });

    let y = 44;
    receipt.items.forEach((it) => {
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.text(`${it.quantity}x ${it.productName.slice(0, 16)}`, left, y);
      doc.text(formatRupiah(it.subtotal), right, y, { align: 'right' });
      y += 4;

      if (it.modifiersJson) {
        try {
          const mods = JSON.parse(it.modifiersJson);
          if (Array.isArray(mods) && mods.length > 0) {
            doc.setFont('courier', 'italic');
            doc.setFontSize(6.5);
            const modNames = mods.map((m: { optionName: string }) => m.optionName).join(', ');
            doc.text(`   + ${modNames.slice(0, 26)}`, left, y);
            y += 3.5;
          }
        } catch {
          // ignore
        }
      }

      if (it.notes) {
        doc.setFont('courier', 'italic');
        doc.setFontSize(6.5);
        doc.text(`   * ${it.notes.slice(0, 26)}`, left, y);
        y += 3.5;
      }
    });

    doc.text('-'.repeat(36), pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text('Subtotal:', left, y);
    doc.text(formatRupiah(receipt.subtotal), right, y, { align: 'right' });
    y += 4;

    if (receipt.discount > 0) {
      doc.text('Diskon:', left, y);
      doc.text(`-${formatRupiah(receipt.discount)}`, right, y, { align: 'right' });
      y += 4;
    }

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.text('TOTAL:', left, y);
    doc.text(formatRupiah(receipt.total), right, y, { align: 'right' });
    y += 4.5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Bayar (${receipt.paymentMethod}):`, left, y);
    doc.text(formatRupiah(receipt.amountPaid), right, y, { align: 'right' });
    y += 4;

    doc.text('Kembalian:', left, y);
    doc.text(formatRupiah(receipt.change), right, y, { align: 'right' });
    y += 6;

    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    const footerText = storeSettings?.receiptFooter || 'Terima Kasih Atas Kunjungan Anda!';
    const footerLines = doc.splitTextToSize(footerText, right - left);
    doc.text(footerLines, pageWidth / 2, y, { align: 'center' });

    doc.save(`Struk-${receipt.orderNumber.replace('#', '')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white border border-[#EDE3D6] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header Dialog */}
        <div className="p-4 border-b border-[#EDE3D6] flex items-center justify-between bg-[#FAF5EF]">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Transaksi Sukses!</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper width selector */}
            <div className="flex rounded-xl bg-white p-0.5 border border-[#EDE3D6] text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paperWidth === '58mm'
                    ? 'bg-terracotta-600 text-white'
                    : 'text-[#8C7A72] hover:text-darkbrown-900'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paperWidth === '80mm'
                    ? 'bg-terracotta-600 text-white'
                    : 'text-[#8C7A72] hover:text-darkbrown-900'
                }`}
              >
                80mm
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8C7A72] hover:text-darkbrown-900 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Paper Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F5EDE4] flex justify-center">
          <div
            id="thermal-receipt"
            className={`bg-white text-darkbrown-900 shadow-sm p-4 font-mono text-[11px] leading-tight rounded-xl select-text border border-[#EDE3D6] ${
              paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
            }`}
          >
            {/* Store Info */}
            <div className="text-center mb-3">
              <h4 className="font-bold text-sm tracking-wider uppercase">{storeSettings?.storeName || 'BREWPOINT COFFEE'}</h4>
              <p className="text-[10px] text-stone-600 whitespace-pre-wrap">{storeSettings?.storeAddress || 'Alamat Toko'}</p>
              <p className="text-[10px] text-stone-600">{storeSettings?.storePhone || ''}</p>
              <div className="border-b border-dashed border-stone-300 my-2" />
              <div className="font-extrabold text-xl my-1 tracking-widest text-darkbrown-900">
                {receipt.orderNumber}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                • {receipt.orderType} •
              </div>
              <div className="border-b border-dashed border-stone-300 my-2" />
            </div>

            {/* Metadata */}
            <div className="text-[10px] space-y-0.5 text-stone-700 mb-2">
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatDateIndo(receipt.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{receipt.customerName || 'Walk-In Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{receipt.cashierName || 'Kasir 1'}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-stone-300 my-2" />

            {/* Items */}
            <div className="space-y-2 mb-2">
              {receipt.items.map((it, idx) => {
                let parsedMods: { optionName: string }[] = [];
                if (it.modifiersJson) {
                  try {
                    parsedMods = JSON.parse(it.modifiersJson);
                  } catch {
                    // ignore
                  }
                }

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span className="truncate max-w-[180px]">
                        {it.quantity}x {it.productName}
                      </span>
                      <span>{formatRupiah(it.subtotal)}</span>
                    </div>

                    {parsedMods.length > 0 && (
                      <div className="text-[9.5px] text-stone-500 pl-3 italic">
                        + {parsedMods.map((m) => m.optionName).join(', ')}
                      </div>
                    )}

                    {it.notes && (
                      <div className="text-[9.5px] text-stone-500 pl-3 italic">
                        * {it.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-b border-dashed border-stone-300 my-2" />

            {/* Totals */}
            <div className="space-y-1 text-[11px] mb-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatRupiah(receipt.subtotal)}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon</span>
                  <span className="tabular-nums">-{formatRupiah(receipt.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-200">
                <span>TOTAL</span>
                <span className="tabular-nums">{formatRupiah(receipt.total)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-700 pt-0.5">
                <span>Bayar ({receipt.paymentMethod})</span>
                <span className="tabular-nums">{formatRupiah(receipt.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-700">
                <span>Kembalian</span>
                <span className="font-semibold tabular-nums">{formatRupiah(receipt.change)}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-stone-300 my-2" />

            {/* Footer */}
            <div className="text-center text-[9px] text-stone-500 space-y-0.5 pt-1 whitespace-pre-wrap">
              <p className="font-bold">{storeSettings?.receiptFooter || 'Terima Kasih Atas Kunjungan Anda!'}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#EDE3D6] bg-[#FAF5EF] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="py-2.5 px-3 rounded-xl border border-[#EDE3D6] bg-white text-[#695852] hover:text-darkbrown-900 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-terracotta-600" />
            <span>Unduh PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white border border-[#EDE3D6] hover:bg-cream-100 text-darkbrown-900 font-bold text-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
