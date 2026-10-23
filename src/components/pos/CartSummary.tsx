'use client';

import React, { useState } from 'react';
import {
  Bike,
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  User,
  ArrowRight,
  Coffee,
  Percent,
  Sparkles,
  X
} from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';
import { SelectedModifier } from './ModifierModal';

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  image?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  modifiers: SelectedModifier[];
  notes: string;
}

interface CartSummaryProps {
  cart: CartItem[];
  orderType: 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';
  customerName: string;
  discount: number;
  subtotal: number;
  grandTotal: number;
  onOrderTypeChange: (type: 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY') => void;
  onCustomerNameChange: (name: string) => void;
  onDiscountChange: (discount: number) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function CartSummary({
  cart,
  orderType,
  customerName,
  discount,
  subtotal,
  grandTotal,
  onOrderTypeChange,
  onCustomerNameChange,
  onDiscountChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isMobileOpen = false,
  onCloseMobile,
}: CartSummaryProps) {
  const [isCustomDiscountOpen, setIsCustomDiscountOpen] = useState(false);
  const [customDiscountInput, setCustomDiscountInput] = useState('');

  const orderTypeButtons = [
    { type: 'DINE_IN' as const, label: 'Dine In', icon: Utensils },
    { type: 'TAKEAWAY' as const, label: 'Take Away', icon: ShoppingBag },
    { type: 'DELIVERY' as const, label: 'Delivery', icon: Bike },
  ];

  const quickTables = ['Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Barista Bar', 'VIP'];

  const quickDiscounts = [
    { label: '5%', calc: () => Math.round(subtotal * 0.05) },
    { label: '10%', calc: () => Math.round(subtotal * 0.10) },
    { label: '15%', calc: () => Math.round(subtotal * 0.15) },
    { label: 'Rp 10k', calc: () => 10000 },
  ];

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCustomDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customDiscountInput);
    if (!isNaN(val) && val >= 0) {
      playSoundEffect('beep');
      onDiscountChange(val);
      setIsCustomDiscountOpen(false);
      setCustomDiscountInput('');
    }
  };

  const renderContent = (isMobileSheet = false) => (
    <>
      {/* Docket Header */}
      <div className="p-4 sm:p-5 pb-3.5 space-y-3 border-b border-black/[0.05] bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">
              Pesanan Kasir
            </h2>
            {cart.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#1D1D1F] text-white text-[11px] font-bold font-mono">
                {totalQuantity} item
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('tap');
                  onClearCart();
                }}
                className="text-[12px] text-[#FF3B30] hover:text-red-700 font-semibold flex items-center gap-1 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan</span>
              </button>
            )}

            {isMobileSheet && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-[#736B66] hover:text-[#181615] flex items-center justify-center active:scale-90 transition-all"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>

        {/* Apple Segmented Control for Order Types */}
        <div className="grid grid-cols-3 bg-[#767680]/[0.08] p-1 rounded-2xl border border-black/[0.02]">
          {orderTypeButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = orderType === btn.type;
            return (
              <button
                key={btn.type}
                type="button"
                onClick={() => {
                  playSoundEffect('tap');
                  onOrderTypeChange(btn.type);
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[12px] font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-bold'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-[#C2552D]' : 'text-[#86868B]'
                  }`}
                />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Customer / Table Input */}
        <div className="space-y-1.5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#86868B]">
              <User className="w-4 h-4 stroke-[2]" />
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Nama Pelanggan / No. Meja"
              className="w-full pl-9 pr-3.5 py-2 bg-stone-100/80 rounded-xl text-[13px] text-[#1D1D1F] placeholder-[#86868B] border border-stone-200/80 focus:outline-none focus:bg-white focus:border-[#C2552D]/60 focus:ring-4 focus:ring-[#C2552D]/10 transition-all font-medium"
            />
          </div>

          {/* Quick Table Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {quickTables.map((tbl) => (
              <button
                key={tbl}
                type="button"
                onClick={() => {
                  playSoundEffect('tap');
                  onCustomerNameChange(tbl);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-medium whitespace-nowrap transition-all ${
                  customerName === tbl
                    ? 'bg-[#1D1D1F] text-white shadow-xs'
                    : 'bg-[#767680]/[0.08] hover:bg-[#767680]/[0.14] text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                {tbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#86868B]">
            <div className="w-14 h-14 rounded-2xl bg-stone-100/90 flex items-center justify-center text-[#C2552D] mb-3 border border-black/[0.04]">
              <ShoppingBag className="w-6 h-6 stroke-[1.6]" />
            </div>
            <p className="font-bold text-[14.5px] text-[#1D1D1F]">
              Keranjang Masih Kosong
            </p>
            <p className="text-[11.5px] text-[#86868B] max-w-[200px] mt-1 leading-relaxed">
              Sentuh menu di katalog untuk mulai menambahkan pesanan.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.cartItemId}
              className="p-3 rounded-2xl bg-white/90 border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-black/[0.1] hover:shadow-xs transition-all flex items-start gap-3 relative group"
            >
              {/* Product Thumbnail */}
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F5F5F7] shrink-0 border border-black/[0.04] flex items-center justify-center text-[#86868B] shadow-inner">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Coffee className="w-5 h-5 stroke-[1.5] text-[#C2552D]" />
                )}
              </div>

              {/* Info & Modifiers */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-[13.5px] text-[#1D1D1F] truncate leading-tight">
                    {item.productName}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      playSoundEffect('tap');
                      onRemoveItem(item.cartItemId);
                    }}
                    className="text-[#86868B] hover:text-[#FF3B30] p-0.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Modifiers Chips */}
                {item.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.modifiers.map((m) => (
                      <span
                        key={m.optionId}
                        className="px-1.5 py-0.5 rounded-md bg-stone-100 text-[#736B66] text-[9.5px] font-medium"
                      >
                        {m.optionName}
                      </span>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[10.5px] text-[#86868B] italic mt-0.5">
                    "{item.notes}"
                  </p>
                )}

                {/* Price & Stepper Row */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-black/[0.03]">
                  <span className="font-bold font-mono tabular-nums text-[13.5px] text-[#1D1D1F]">
                    {formatRupiah(item.subtotal)}
                  </span>

                  {/* Stepper */}
                  <div className="flex items-center bg-[#767680]/[0.08] rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('tap');
                        onUpdateQuantity(item.cartItemId, -1);
                      }}
                      className="w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[#1D1D1F] hover:bg-white active:scale-90 transition-all"
                    >
                      <Minus className="w-3 h-3 stroke-[2.4]" />
                    </button>
                    <span className="w-5 text-center font-bold font-mono text-[11.5px] text-[#1D1D1F]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playSoundEffect('tap');
                        onUpdateQuantity(item.cartItemId, 1);
                      }}
                      className="w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[#1D1D1F] hover:bg-white active:scale-90 transition-all"
                    >
                      <Plus className="w-3 h-3 stroke-[2.4]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: Quick Discount Pills, Totals & Action */}
      <div className="p-4 sm:p-5 border-t border-black/[0.05] bg-white/60 space-y-3">
        {/* Quick Discount Pills Row */}
        {cart.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              <span>Diskon Cepat</span>
              {discount > 0 && (
                <button
                  type="button"
                  onClick={() => onDiscountChange(0)}
                  className="text-[#FF3B30] hover:underline font-bold capitalize text-[11px]"
                >
                  Hapus Diskon
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickDiscounts.map((qd) => {
                const amt = qd.calc();
                const isSelected = discount === amt && discount > 0;
                return (
                  <button
                    key={qd.label}
                    type="button"
                    onClick={() => {
                      playSoundEffect('tap');
                      onDiscountChange(amt);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#34C759] text-white shadow-xs'
                        : 'bg-[#767680]/[0.08] hover:bg-[#767680]/[0.15] text-[#1D1D1F]'
                    }`}
                  >
                    {qd.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  playSoundEffect('tap');
                  setIsCustomDiscountOpen(!isCustomDiscountOpen);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                  isCustomDiscountOpen
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-[#767680]/[0.08] hover:bg-[#767680]/[0.15] text-[#1D1D1F]'
                }`}
              >
                Kustom
              </button>
            </div>

            {/* Inline Custom Discount Input */}
            {isCustomDiscountOpen && (
              <form onSubmit={handleApplyCustomDiscount} className="flex items-center gap-1.5 pt-1 animate-fade-in">
                <input
                  type="number"
                  value={customDiscountInput}
                  onChange={(e) => setCustomDiscountInput(e.target.value)}
                  placeholder="Nominal Rp (cth: 5000)"
                  className="flex-1 px-3 py-1 bg-white rounded-xl text-[12px] border border-stone-300 focus:outline-none focus:border-[#C2552D] font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-xl bg-[#1D1D1F] text-white font-bold text-[11px] hover:bg-black"
                >
                  Terapkan
                </button>
              </form>
            )}
          </div>
        )}

        {/* Calculation Rows */}
        <div className="space-y-1 text-[12.5px]">
          <div className="flex items-center justify-between text-[#86868B]">
            <span>Subtotal</span>
            <span className="font-semibold font-mono tabular-nums text-[#1D1D1F]">
              {formatRupiah(subtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-[#34C759]">
              <span>Diskon</span>
              <span className="font-bold font-mono tabular-nums">
                -{formatRupiah(discount)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-black/[0.05] flex items-baseline justify-between">
            <div>
              <span className="text-[14px] font-bold text-[#1D1D1F] block">
                Total Tagihan
              </span>
              <span className="text-[10.5px] text-[#86868B]">
                Termasuk Pajak & Layanan
              </span>
            </div>
            <span className="text-[26px] font-black font-mono tabular-nums text-[#1D1D1F] tracking-tight">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {/* Primary Checkout Button */}
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            playSoundEffect('tap');
            if (isMobileSheet && onCloseMobile) {
              onCloseMobile();
            }
            onCheckout();
          }}
          className="w-full h-12 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-bold text-[14px] flex items-center justify-between px-5 shadow-[0_6px_20px_rgba(0,0,0,0.14)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-white/20 text-white text-[11px] font-mono font-bold flex items-center justify-center">
              {totalQuantity}
            </span>
            <span>Bayar Sekarang</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[15px] font-extrabold">
            <span>{formatRupiah(grandTotal)}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.4]" />
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT RIGHT PANEL (>= lg) */}
      <div className="hidden lg:flex w-[380px] xl:w-[420px] bg-white/80 backdrop-blur-3xl border-l border-black/[0.06] flex-col h-full shrink-0 shadow-[-10px_0_35px_rgba(0,0,0,0.03)] select-none">
        {renderContent(false)}
      </div>

      {/* 2. MOBILE SLIDE-UP BOTTOM SHEET MODAL (< lg) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fade-in select-none">
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl z-10 animate-slide-up overflow-hidden">
            <div className="pt-2.5 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-black/20" />
            </div>
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
