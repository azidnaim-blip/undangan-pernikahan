'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Coffee,
  SlidersHorizontal,
  Plus,
  X,
  Clock,
  Sparkles,
  Monitor,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { playSoundEffect, formatRupiah } from '@/lib/utils';
import ProductCard from '@/components/pos/ProductCard';
import CartSummary, { CartItem } from '@/components/pos/CartSummary';
import ModifierModal, {
  ProductItem,
  SelectedModifier,
} from '@/components/pos/ModifierModal';
import MenuFormModal from '@/components/pos/MenuFormModal';
import PaymentModal from '@/components/pos/PaymentModal';
import ReceiptPrint, { ReceiptData } from '@/components/pos/ReceiptPrint';
import CustomerDisplayModal from '@/components/pos/CustomerDisplayModal';
import {
  broadcastCustomerDisplay,
  CustomerDisplayState,
  initialCustomerDisplayState
} from '@/lib/customerDisplayChannel';
import RoleGuard from '@/components/auth/RoleGuard';

interface CategoryWithProducts {
  id: string;
  name: string;
  icon?: string;
  products: (ProductItem & { image?: string | null; categoryId?: string })[];
}

function PosContent() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [orderType, setOrderType] = useState<'DELIVERY' | 'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [discount, setDiscount] = useState<number>(0);

  // Modals
  const [activeProductForModifier, setActiveProductForModifier] = useState<ProductItem | null>(null);
  const [isMenuFormOpen, setIsMenuFormOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<(ProductItem & { image?: string | null; categoryId?: string }) | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isCustomerDisplayModalOpen, setIsCustomerDisplayModalOpen] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  const handleOpenCustomerDisplayWindow = () => {
    window.open(
      '/customer-display',
      'BrewPointCustomerDisplay',
      'width=1200,height=800,menubar=no,toolbar=no,location=no'
    );
  };

  // Fetch Products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCategoryEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('kopi') || n.includes('coffee') || n.includes('espresso')) return '☕';
    if (n.includes('teh') || n.includes('tea') || n.includes('matcha')) return '🍵';
    if (n.includes('roti') || n.includes('pastry') || n.includes('bakery') || n.includes('croissant')) return '🥐';
    if (n.includes('makan') || n.includes('food') || n.includes('rice') || n.includes('nasi') || n.includes('mie')) return '🍽️';
    if (n.includes('snack') || n.includes('cemilan')) return '🥨';
    if (n.includes('dessert') || n.includes('cake') || n.includes('kue')) return '🍰';
    return '✨';
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let prods: (ProductItem & { image?: string | null; categoryName: string; categoryId?: string })[] = [];
    categories.forEach((cat) => {
      cat.products.forEach((p) => {
        prods.push({ ...p, categoryName: cat.name, categoryId: cat.id });
      });
    });

    if (selectedCategory !== 'ALL') {
      prods = prods.filter((p) => {
        const cat = categories.find((c) => c.id === selectedCategory);
        return cat?.products.some((prod) => prod.id === p.id);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      prods = prods.filter((p) => p.name.toLowerCase().includes(q));
    }

    return prods;
  }, [categories, selectedCategory, searchQuery]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  // Realtime Broadcast to Customer-Facing Display
  const currentCustomerDisplayState: CustomerDisplayState = useMemo(() => {
    if (cart.length === 0) {
      return {
        ...initialCustomerDisplayState,
        status: 'IDLE',
      };
    }

    return {
      status: isPaymentOpen ? 'PAYMENT' : 'ACTIVE_ORDER',
      cart,
      customerName,
      orderType,
      subtotal,
      discount,
      grandTotal,
      paymentMethod: 'CASH',
    };
  }, [cart, customerName, orderType, subtotal, discount, grandTotal, isPaymentOpen]);

  useEffect(() => {
    broadcastCustomerDisplay(currentCustomerDisplayState);
  }, [currentCustomerDisplayState]);

  // Add from Card (Quick Add)
  const handleAddToCart = (
    product: ProductItem & { image?: string | null },
    selectedModifiers: SelectedModifier[],
    quantity: number,
    notes: string,
    totalPrice: number
  ) => {
    const modifierKey = selectedModifiers
      .map((m) => m.optionId)
      .sort()
      .join('-');
    const cartItemId = `${product.id}-${modifierKey}-${Date.now()}`;
    const unitPrice = totalPrice / quantity;

    setCart((prev) => [
      ...prev,
      {
        cartItemId,
        productId: product.id,
        productName: product.name,
        image: product.image,
        unitPrice,
        quantity,
        subtotal: totalPrice,
        modifiers: selectedModifiers,
        notes,
      },
    ]);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    playSoundEffect('beep');
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    playSoundEffect('beep');
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  // Submit Order & Checkout
  const handleConfirmPayment = async ({
    paymentMethod,
    amountPaid,
    change,
    autoPrint,
  }: {
    paymentMethod: 'CASH' | 'QRIS';
    amountPaid: number;
    change: number;
    autoPrint: boolean;
  }) => {
    try {
      const payload = {
        customerName: customerName.trim() || 'Walk-In Customer',
        orderType,
        paymentMethod,
        discount,
        amountPaid,
        items: cart.map((c) => ({
          productId: c.productId,
          productName: c.productName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal,
          notes: c.notes,
          modifiersJson: JSON.stringify(c.modifiers),
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Gagal memproses transaksi');
      }

      const data = await res.json();
      const orderResult = data.order || data; // backward compatible just in case

      const receipt: ReceiptData = {
        orderNumber: orderResult.orderNumber,
        customerName: orderResult.customerName,
        orderType: orderResult.orderType,
        paymentMethod: orderResult.paymentMethod,
        createdAt: orderResult.createdAt,
        items: orderResult.items,
        subtotal,
        discount,
        total: grandTotal,
        amountPaid,
        change,
        cashierName: 'Kasir 1',
      };

      setIsPaymentOpen(false);
      setIsMobileCartOpen(false);
      setReceiptData(receipt);
      setIsReceiptOpen(true);

      // Broadcast SUCCESS state to Customer Display
      broadcastCustomerDisplay({
        status: 'SUCCESS',
        cart: [],
        customerName: orderResult.customerName || customerName,
        orderType,
        subtotal,
        discount,
        grandTotal,
        paymentMethod,
        completedOrder: {
          orderNumber: orderResult.orderNumber,
          customerName: orderResult.customerName || customerName,
          total: grandTotal,
          change,
          itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        },
      });

      // Automatically reset Customer Display to IDLE after 6 seconds
      setTimeout(() => {
        broadcastCustomerDisplay({
          ...initialCustomerDisplayState,
          status: 'IDLE',
        });
      }, 6000);

      // Reset
      setCart([]);
      setCustomerName('');
      setDiscount(0);

      // Refresh stock
      loadProducts();

      if (autoPrint) {
        setTimeout(() => {
          window.print();
        }, 500);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memproses pesanan');
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#F8F6F2]">
      {/* CENTER SECTION: Search, Category Pills, & Product Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar (Boutique Glass Bar) */}
        <div className="px-3 sm:px-6 py-2 sm:py-3.5 bg-white/80 backdrop-blur-3xl border-b border-stone-200/60 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Spotlight Search Input */}
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#C2552D] transition-colors" />
              <input
                type="text"
                placeholder="Cari menu kopi, pastry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 sm:pr-16 py-2 sm:py-2.5 rounded-2xl bg-[#767680]/[0.06] hover:bg-[#767680]/[0.09] focus:bg-white border border-stone-200/60 focus:border-[#C2552D]/40 focus:ring-4 focus:ring-[#C2552D]/10 text-[13px] sm:text-[13.5px] font-medium text-[#181615] placeholder-[#8C827A] transition-all outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-200 text-[#736B66] hover:text-[#181615] flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-stone-200/60 text-[#8C827A] text-[10px] font-mono font-medium">
                  <span>⌘K</span>
                </div>
              )}
            </div>

            {/* Live Barista & Clock HUD */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/70 border border-stone-200/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
              <span className="text-[12px] font-bold text-[#181615]">Kasir 1 • Shift Pagi</span>
              {currentTime && (
                <span className="text-[11.5px] font-mono tabular-nums text-[#736B66] border-l border-stone-200 pl-2">
                  {currentTime}
                </span>
              )}
            </div>

            {/* Layar Pelanggan Button (Dual Screen / Customer Display Control) */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setIsCustomerDisplayModalOpen(true);
              }}
              className="py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200/80 text-[#181615] font-bold text-[13px] flex items-center gap-2 shadow-xs active:scale-95 transition-all group"
              title="Buka Layar Pelanggan (Monitor Kedua)"
            >
              <Monitor className="w-4 h-4 text-[#C2552D] group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline">Layar Pelanggan</span>
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            </button>

            {/* Filter / Reset Button */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200/80 text-[#181615] font-semibold text-[13px] flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#736B66]" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* + Tambah Menu Button */}
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setProductToEdit(null);
                setIsMenuFormOpen(true);
              }}
              className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-[#C2552D] via-[#B54B24] to-[#A34220] hover:from-[#B54B24] hover:to-[#8E3615] text-white font-bold text-[12.5px] sm:text-[13px] flex items-center gap-1.5 shadow-[0_2px_8px_rgba(194,85,45,0.28)] border-t border-white/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.4]" />
              <span className="hidden sm:inline">Tambah Menu</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>

        {/* Heading & Horizontal Category Capsules */}
        <div className="px-3.5 sm:px-6 pt-3 pb-2 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-[18px] sm:text-[22px] font-bold text-[#181615] tracking-tight">
                Katalog Menu Cafe
              </h2>
              <p className="text-[11px] sm:text-[12px] text-[#736B66] mt-0.5">
                Pilih menu spesial untuk pesanan pelanggan
              </p>
            </div>
            <span className="text-[11px] sm:text-[12px] font-semibold text-[#8C827A] font-mono tabular-nums">
              {filteredProducts.length} menu
            </span>
          </div>

          {/* Category Capsules (Boutique Horizontal Picker) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap');
                setSelectedCategory('ALL');
              }}
              className={`px-4 py-2 rounded-full text-[13px] whitespace-nowrap transition-all duration-200 active:scale-95 flex items-center gap-2 font-semibold ${
                selectedCategory === 'ALL'
                  ? 'bg-[#181615] text-white shadow-[0_3px_12px_rgba(24,22,21,0.22)]'
                  : 'bg-white/80 hover:bg-white text-[#736B66] border border-stone-200/60 hover:text-[#181615] hover:shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
              }`}
            >
              <span>☕</span>
              <span>Semua Menu</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-black/[0.04] text-[#8C827A]'}`}>
                {categories.reduce((acc, c) => acc + c.products.length, 0)}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    playSoundEffect('tap');
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-full text-[13px] whitespace-nowrap transition-all duration-200 active:scale-95 flex items-center gap-2 font-semibold ${
                    isSelected
                      ? 'bg-[#181615] text-white shadow-[0_3px_12px_rgba(24,22,21,0.22)]'
                      : 'bg-white/80 hover:bg-white text-[#736B66] border border-stone-200/60 hover:text-[#181615] hover:shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <span>{getCategoryEmoji(cat.name)}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-black/[0.04] text-[#8C827A]'}`}>
                    {cat.products.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center text-[#8C827A] gap-2.5 text-[14px]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#C2552D]" />
              <span>Memuat menu cafe...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#8C827A] gap-3 py-16">
              <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center border border-stone-200/60 shadow-sm">
                <Coffee className="w-8 h-8 stroke-[1.5] text-[#C2552D]" />
              </div>
              <div className="text-center">
                <p className="font-bold text-[16px] text-[#181615]">
                  Tidak ada menu ditemukan
                </p>
                <p className="text-[13px] text-[#736B66] mt-1">
                  Coba kata kunci lain atau tambahkan menu baru
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProductToEdit(null);
                  setIsMenuFormOpen(true);
                }}
                className="mt-2 py-2.5 px-4.5 rounded-2xl bg-[#C2552D] hover:bg-[#A8441E] text-white text-[13px] font-bold shadow-md active:scale-95 transition-all"
              >
                + Tambah Menu Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-4 pb-28 lg:pb-12">
              {filteredProducts.map((product) => {
                const totalInCart = cart
                  .filter((c) => c.productId === product.id)
                  .reduce((sum, c) => sum + c.quantity, 0);

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inCartQuantity={totalInCart}
                    onAddToCart={handleAddToCart}
                    onQuickQuantityChange={(productId, delta) => {
                      const item = cart.slice().reverse().find((c) => c.productId === productId);
                      if (item) {
                        handleUpdateQuantity(item.cartItemId, delta);
                      }
                    }}
                    onOpenCustomizer={(p) => setActiveProductForModifier(p)}
                    onEditMenu={(p) => {
                      setProductToEdit(p);
                      setIsMenuFormOpen(true);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart Summary Inspector (Desktop & Mobile Bottom Sheet) */}
      <CartSummary
        cart={cart}
        orderType={orderType}
        customerName={customerName}
        discount={discount}
        subtotal={subtotal}
        grandTotal={grandTotal}
        onOrderTypeChange={setOrderType}
        onCustomerNameChange={setCustomerName}
        onDiscountChange={setDiscount}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={() => {
          setIsMobileCartOpen(false);
          setIsPaymentOpen(true);
        }}
        isMobileOpen={isMobileCartOpen}
        onCloseMobile={() => setIsMobileCartOpen(false)}
      />

      {/* FLOATING MOBILE CART BAR (< lg screens) */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 animate-slide-up select-none">
          <button
            type="button"
            onClick={() => {
              playSoundEffect('tap');
              setIsMobileCartOpen(true);
            }}
            className="w-full bg-[#1D1D1F] hover:bg-black text-white p-3 sm:p-3.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/15 flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold font-mono text-[13px]">
                {cart.reduce((sum, c) => sum + c.quantity, 0)}
              </div>
              <div className="text-left">
                <div className="text-[11px] text-white/70 font-medium leading-none mb-0.5">
                  Keranjang ({cart.reduce((sum, c) => sum + c.quantity, 0)} item)
                </div>
                <div className="text-[15px] font-mono font-bold leading-tight">
                  {formatRupiah(grandTotal)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C2552D] text-white text-[12px] font-bold shadow-xs">
              <span>Lihat & Bayar</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
            </div>
          </button>
        </div>
      )}

      {/* MODALS */}
      <MenuFormModal
        isOpen={isMenuFormOpen}
        productToEdit={productToEdit}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        onClose={() => {
          setIsMenuFormOpen(false);
          setProductToEdit(null);
        }}
        onSuccess={() => {
          loadProducts();
        }}
      />

      <ModifierModal
        product={activeProductForModifier}
        isOpen={!!activeProductForModifier}
        onClose={() => setActiveProductForModifier(null)}
        onAddToCart={handleAddToCart}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        total={grandTotal}
        subtotal={subtotal}
        discount={discount}
        customerName={customerName}
        orderType={orderType}
        onClose={() => setIsPaymentOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />

      <ReceiptPrint
        isOpen={isReceiptOpen}
        receipt={receiptData}
        onClose={() => setIsReceiptOpen(false)}
      />

      <CustomerDisplayModal
        isOpen={isCustomerDisplayModalOpen}
        onClose={() => setIsCustomerDisplayModalOpen(false)}
        displayState={currentCustomerDisplayState}
        onOpenExternalWindow={handleOpenCustomerDisplayWindow}
      />
    </div>
  );
}

export default function PosPage() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'CASHIER']}>
      <PosContent />
    </RoleGuard>
  );
}
