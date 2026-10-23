'use client';

import React, { useState } from 'react';
import { Plus, Minus, Coffee, SlidersHorizontal, Edit3, Check } from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';
import { ProductItem, SelectedModifier } from './ModifierModal';

interface ProductCardProps {
  product: ProductItem & { image?: string | null; categoryName?: string; categoryId?: string };
  inCartQuantity?: number;
  onAddToCart: (
    product: ProductItem,
    selectedModifiers: SelectedModifier[],
    quantity: number,
    notes: string,
    totalPrice: number
  ) => void;
  onQuickQuantityChange?: (productId: string, delta: number) => void;
  onOpenCustomizer: (product: ProductItem) => void;
  onEditMenu?: (product: ProductItem & { image?: string | null; categoryId?: string }) => void;
}

export default function ProductCard({
  product,
  inCartQuantity = 0,
  onAddToCart,
  onQuickQuantityChange,
  onOpenCustomizer,
  onEditMenu,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Large'>('Small');
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState<boolean>(false);

  const isOutOfStock = product.isOutOfStock;
  const sizeExtraPrice = selectedSize === 'Large' ? 5000 : 0;
  const currentUnitPrice = product.price + sizeExtraPrice;
  const currentTotalPrice = currentUnitPrice * quantity;

  const handleQuickAdd = () => {
    if (isOutOfStock) {
      playSoundEffect('alert');
      return;
    }
    playSoundEffect('success');

    const sizeModifier: SelectedModifier = {
      groupId: 'size-group',
      groupName: 'Ukuran Cup (Size)',
      optionId: selectedSize === 'Large' ? 'opt-large' : 'opt-regular',
      optionName: selectedSize === 'Large' ? 'Large (+5k)' : 'Regular (Small)',
      price: sizeExtraPrice,
    };

    onAddToCart(product, [sizeModifier], quantity, '', currentTotalPrice);
    setQuantity(1);
  };

  const handleStepQuantity = (delta: number) => {
    playSoundEffect('tap');
    if (inCartQuantity > 0 && onQuickQuantityChange) {
      onQuickQuantityChange(product.id, delta);
    } else {
      setQuantity((prev) => Math.max(1, prev + delta));
    }
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 group relative select-none ${
        inCartQuantity > 0
          ? 'bg-white/95 backdrop-blur-xl ring-2 ring-[#C2552D] shadow-[0_8px_25px_rgba(194,85,45,0.18),0_2px_8px_rgba(0,0,0,0.03)]'
          : 'bg-white/80 backdrop-blur-xl border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-black/[0.1] hover:bg-white'
      } ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div>
        {/* Apple 1:1 Gallery Image Frame */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F5F5F7] mb-2.5 border border-black/[0.03] shadow-inner group-hover:scale-[1.01] transition-transform duration-300">
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#86868B] gap-1.5 bg-gradient-to-b from-[#FAF8F5] to-[#EFECE6]">
              <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-xs border border-black/[0.04] flex items-center justify-center text-[#C2552D]">
                <Coffee className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-[11px] font-bold text-[#5C534E] tracking-tight">{product.name}</span>
            </div>
          )}

          {/* Top-Left: In-Cart Counter Pill */}
          {inCartQuantity > 0 && (
            <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-[#C2552D] text-white font-bold text-[11px] font-mono shadow-[0_2px_8px_rgba(194,85,45,0.4)] border border-white/25 flex items-center gap-1.5 backdrop-blur-md animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{inCartQuantity}x</span>
            </div>
          )}

          {/* Top-Right Action Controls (Varian / Edit Menu) */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            {onEditMenu && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playSoundEffect('tap');
                  onEditMenu(product);
                }}
                title="Edit Info Menu"
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#1D1D1F] shadow-xs border border-white/40 backdrop-blur-md flex items-center justify-center hover:text-[#C2552D] active:scale-90 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playSoundEffect('tap');
                onOpenCustomizer(product);
              }}
              title="Varian & Kustomisasi Rasa"
              className="px-2 py-1 rounded-full bg-white/90 hover:bg-white text-[#1D1D1F] shadow-xs border border-white/40 backdrop-blur-md flex items-center gap-1 text-[10.5px] font-bold hover:text-[#C2552D] active:scale-90 transition-all"
            >
              <SlidersHorizontal className="w-3 h-3 stroke-[2.2]" />
              <span className="hidden sm:inline">Varian</span>
            </button>
          </div>

          {/* Bottom Floating Price Glass Pill */}
          <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-xl bg-black/75 backdrop-blur-md text-white font-mono font-bold text-[12px] tabular-nums tracking-tight border border-white/15 shadow-xs flex items-center gap-1">
            <span>{formatRupiah(currentUnitPrice)}</span>
            {selectedSize === 'Large' && (
              <span className="text-[10px] text-amber-300 font-sans font-semibold">+5k</span>
            )}
          </div>

          {/* Out of Stock Notice */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="px-3 py-1 rounded-full bg-[#FF3B30] text-white font-bold text-[10.5px] shadow-md tracking-wider uppercase">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-0.5 px-0.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868B]">
              {product.categoryName || (product.isBeverage !== false ? 'Beverage' : 'Food')}
            </span>
          </div>

          <h3 className="font-bold text-[14.5px] text-[#1D1D1F] tracking-tight leading-snug line-clamp-1 group-hover:text-[#C2552D] transition-colors">
            {product.name}
          </h3>

          <p className="text-[11px] text-[#86868B] line-clamp-1 leading-relaxed">
            {product.description || (product.isBeverage ? 'Kopi & minuman racikan spesial' : 'Menu lezat pilihan')}
          </p>
        </div>
      </div>

      {/* Footer Controls: Size & Quick Stepper / Add Button */}
      <div className="mt-2.5 pt-2 border-t border-black/[0.04] space-y-2">
        {/* Apple Segmented Size Selector */}
        {product.isBeverage !== false && (
          <div className="grid grid-cols-2 bg-[#767680]/[0.08] p-0.5 rounded-xl border border-black/[0.02]">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                playSoundEffect('tap');
                setSelectedSize('Small');
              }}
              className={`py-0.5 rounded-[9px] text-[11.5px] transition-all font-medium flex items-center justify-center ${
                selectedSize === 'Small'
                  ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Small
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                playSoundEffect('tap');
                setSelectedSize('Large');
              }}
              className={`py-0.5 rounded-[9px] text-[11.5px] transition-all font-medium flex items-center justify-center ${
                selectedSize === 'Large'
                  ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Large <span className="text-[9.5px] ml-1 text-[#86868B]">+5k</span>
            </button>
          </div>
        )}

        {/* Dynamic Action: If item is in cart, show interactive quick stepper, else show 'Tambah' */}
        {inCartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-stone-100/90 rounded-xl p-1 border border-stone-200/80 animate-fade-in">
            <button
              type="button"
              onClick={() => handleStepQuantity(-1)}
              className="w-7 h-7 rounded-lg bg-white shadow-xs text-[#1D1D1F] hover:bg-stone-50 active:scale-90 flex items-center justify-center transition-all"
              title="Kurangi dari pesanan"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>

            <div className="flex items-center gap-1">
              <span className="font-extrabold font-mono text-[13px] sm:text-[13.5px] text-[#C2552D] tabular-nums">
                {inCartQuantity}
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-[#86868B]">di keranjang</span>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => handleStepQuantity(1)}
              className="w-7 h-7 rounded-lg bg-[#C2552D] text-white shadow-xs hover:bg-[#B54B24] active:scale-90 flex items-center justify-center transition-all"
              title="Tambah ke pesanan"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.6]" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Local Qty Stepper */}
            <div className="flex items-center bg-[#767680]/[0.08] rounded-xl p-0.5">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#1D1D1F] disabled:opacity-30 hover:bg-white active:scale-90 transition-all"
              >
                <Minus className="w-3 h-3 stroke-[2.4]" />
              </button>
              <span className="w-5 text-center font-bold font-mono text-[12px] text-[#1D1D1F]">
                {quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#1D1D1F] disabled:opacity-30 hover:bg-white active:scale-90 transition-all"
              >
                <Plus className="w-3 h-3 stroke-[2.4]" />
              </button>
            </div>

            {/* Apple Primary Add CTA */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleQuickAdd}
              className="flex-1 h-7.5 px-3 rounded-xl bg-[#1D1D1F] hover:bg-black text-white font-bold text-[12px] flex items-center justify-center gap-1 shadow-xs active:scale-[0.97] transition-all disabled:bg-stone-300"
            >
              <Plus className="w-3 h-3 stroke-[2.8]" />
              <span>Tambah</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
