'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Check, SlidersHorizontal } from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  selectionType: 'SINGLE' | 'MULTIPLE' | string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  image?: string | null;
  category?: { name: string };
  modifierGroups?: { modifierGroup: ModifierGroup }[];
  isOutOfStock?: boolean;
  isBeverage?: boolean;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

interface ModifierModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: ProductItem,
    selectedModifiers: SelectedModifier[],
    quantity: number,
    notes: string,
    totalPrice: number
  ) => void;
}

export default function ModifierModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ModifierModalProps) {
  if (!isOpen || !product) return null;

  // Initialize selected options based on defaults
  const [selectedMap, setSelectedMap] = useState<Record<string, SelectedModifier[]>>(() => {
    const initial: Record<string, SelectedModifier[]> = {};
    if (product.modifierGroups) {
      for (const pmg of product.modifierGroups) {
        const mg = pmg.modifierGroup;
        const defaults = mg.options.filter((opt) => opt.isDefault);
        if (defaults.length > 0) {
          initial[mg.id] = defaults.map((opt) => ({
            groupId: mg.id,
            groupName: mg.name,
            optionId: opt.id,
            optionName: opt.name,
            price: opt.price,
          }));
        } else if (mg.isRequired && mg.options.length > 0) {
          initial[mg.id] = [
            {
              groupId: mg.id,
              groupName: mg.name,
              optionId: mg.options[0].id,
              optionName: mg.options[0].name,
              price: mg.options[0].price,
            },
          ];
        } else {
          initial[mg.id] = [];
        }
      }
    }
    return initial;
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  let modifierExtraTotal = 0;
  Object.values(selectedMap).forEach((mods) => {
    mods.forEach((m) => {
      modifierExtraTotal += m.price;
    });
  });

  const unitPrice = product.price + modifierExtraTotal;
  const totalPrice = unitPrice * quantity;

  const handleOptionToggle = (mg: ModifierGroup, opt: ModifierOption) => {
    playSoundEffect('beep');
    const isSingle = mg.selectionType === 'SINGLE';

    setSelectedMap((prev) => {
      const currentList = prev[mg.id] || [];
      const isAlreadySelected = currentList.some((item) => item.optionId === opt.id);

      if (isSingle) {
        return {
          ...prev,
          [mg.id]: [
            {
              groupId: mg.id,
              groupName: mg.name,
              optionId: opt.id,
              optionName: opt.name,
              price: opt.price,
            },
          ],
        };
      } else {
        if (isAlreadySelected) {
          return {
            ...prev,
            [mg.id]: currentList.filter((item) => item.optionId !== opt.id),
          };
        } else {
          if (mg.maxSelect && currentList.length >= mg.maxSelect) {
            return prev;
          }
          return {
            ...prev,
            [mg.id]: [
              ...currentList,
              {
                groupId: mg.id,
                groupName: mg.name,
                optionId: opt.id,
                optionName: opt.name,
                price: opt.price,
              },
            ],
          };
        }
      }
    });
  };

  const handleConfirm = () => {
    const allModifiers: SelectedModifier[] = [];
    Object.values(selectedMap).forEach((mods) => {
      allModifiers.push(...mods);
    });

    playSoundEffect('success');
    onAddToCart(product, allModifiers, quantity, notes, totalPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] flex flex-col max-h-[90vh] animate-scale-up">
        {/* Apple Sheet Grabber */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-black/20" />
        </div>

        {/* Modal Navigation Bar Header */}
        <div className="px-6 py-3 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-11 h-11 rounded-xl object-cover border border-black/[0.06]"
              />
            )}
            <div>
              <h3 className="text-[17px] font-bold text-[#1D1D1F] leading-tight tracking-tight">
                {product.name}
              </h3>
              <p className="text-[13px] text-[#C2552D] font-semibold mt-0.5">
                {formatRupiah(product.price)} (Harga Dasar)
              </p>
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

        {/* Content: Modifier Groups & Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {product.modifierGroups && product.modifierGroups.length > 0 ? (
            product.modifierGroups.map(({ modifierGroup: mg }) => {
              const selectedOpts = selectedMap[mg.id] || [];

              return (
                <div
                  key={mg.id}
                  className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#181615]">
                      {mg.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[#8C827A]">
                      {mg.selectionType === 'SINGLE' ? 'Pilih Satu' : 'Bisa Beberapa'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {mg.options.map((opt) => {
                      const isSelected = selectedOpts.some((item) => item.optionId === opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleOptionToggle(mg, opt)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all text-[13px] active:scale-[0.98] ${
                            isSelected
                              ? 'bg-white border-[#C2552D] text-[#181615] font-bold shadow-[0_2px_6px_rgba(194,85,45,0.12)]'
                              : 'bg-white/70 border-stone-200/80 text-[#736B66] hover:bg-white hover:text-[#181615]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className={`w-4 h-4 rounded-${
                                mg.selectionType === 'SINGLE' ? 'full' : 'md'
                              } border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-[#C2552D] bg-[#C2552D] text-white'
                                  : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="truncate">{opt.name}</span>
                          </div>

                          {opt.price > 0 && (
                            <span className="text-[11px] font-bold text-[#C2552D] font-mono ml-1">
                              +{formatRupiah(opt.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-[#8C827A] text-[13px]">
              Menu ini tidak memiliki pilihan kustomisasi tambahan.
            </div>
          )}

          {/* Catatan Khusus */}
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <label className="block text-[12px] font-bold text-[#736B66]">
              Catatan untuk Barista
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: ekstra sedotan, less sweet, jangan terlalu panas..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-[13px] text-[#181615] placeholder-[#8C827A] focus:border-[#C2552D]/60 focus:ring-4 focus:ring-[#C2552D]/10 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Modal Footer: Stepper & Confirm Action */}
        <div className="p-5 border-t border-stone-200/80 bg-[#FAF8F5] flex items-center justify-between gap-4">
          {/* Stepper */}
          <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200/80">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => {
                playSoundEffect('tap');
                setQuantity((prev) => Math.max(1, prev - 1));
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#181615] disabled:opacity-30 hover:bg-white active:scale-90 transition-all"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
            <span className="w-8 text-center font-bold font-mono text-[14px] text-[#181615]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setQuantity((prev) => prev + 1);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#181615] hover:bg-white active:scale-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-12 px-5 rounded-2xl bg-gradient-to-r from-[#C2552D] via-[#B54B24] to-[#A34220] hover:from-[#B54B24] hover:to-[#8E3615] text-white font-bold text-[14px] flex items-center justify-between shadow-[0_4px_14px_rgba(194,85,45,0.3)] border-t border-white/20 active:scale-[0.98] transition-all"
          >
            <span>Tambahkan ke Pesanan</span>
            <span className="font-mono tabular-nums">{formatRupiah(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
