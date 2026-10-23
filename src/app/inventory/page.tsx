'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Scale,
  RefreshCw,
  Search,
  BookOpen,
  Layers,
  Edit3,
  X
} from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';
import MenuFormModal from '@/components/pos/MenuFormModal';
import { ProductItem } from '@/components/pos/ModifierModal';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/lib/AuthContext';

interface IngredientItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  stockStatus: 'NORMAL' | 'LOW' | 'EMPTY';
  totalValuation: number;
  usedInCount: number;
}

interface ProductWithRecipe {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  description?: string | null;
  categoryId?: string;
  calculatedHpp: number;
  grossMargin: number;
  category: { id: string; name: string };
  recipes: {
    id: string;
    quantity: number;
    ingredient: {
      id: string;
      name: string;
      unit: string;
      costPerUnit: number;
    };
  }[];
}

function InventoryContent() {
  const { effectiveRole } = useAuth();
  const isOwner = effectiveRole === 'OWNER';
  const [activeTab, setActiveTab] = useState<'STOCK' | 'RECIPES'>('STOCK');
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [recipes, setRecipes] = useState<ProductWithRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isRestockModal, setIsRestockModal] = useState<boolean>(false);
  const [selectedIng, setSelectedIng] = useState<IngredientItem | null>(null);
  const [addStockAmount, setAddStockAmount] = useState<number>(0);

  const [isAddIngModal, setIsAddIngModal] = useState<boolean>(false);
  const [newIngName, setNewIngName] = useState<string>('');
  const [newIngUnit, setNewIngUnit] = useState<string>('gr');
  const [newIngStock, setNewIngStock] = useState<number>(1000);
  const [newIngMin, setNewIngMin] = useState<number>(200);
  const [newIngCost, setNewIngCost] = useState<number>(100);

  const [isEditRecipeModal, setIsEditRecipeModal] = useState<boolean>(false);
  const [selectedProductRecipe, setSelectedProductRecipe] = useState<ProductWithRecipe | null>(null);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [recipeQuantity, setRecipeQuantity] = useState<number>(0);

  // Menu Form Modal (Add / Edit Menu)
  const [isMenuFormOpen, setIsMenuFormOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<(ProductItem & { image?: string | null; categoryId?: string }) | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingRes, recipeRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/recipes'),
      ]);

      if (ingRes.ok) {
        const data = await ingRes.json();
        setIngredients(data);
      }
      if (recipeRes.ok) {
        const data = await recipeRes.json();
        setRecipes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Restock
  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIng || addStockAmount <= 0) return;

    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedIng.id,
          addStock: addStockAmount,
        }),
      });

      if (res.ok) {
        playSoundEffect('success');
        setIsRestockModal(false);
        setSelectedIng(null);
        setAddStockAmount(0);
        fetchData();
      }
    } catch {
      alert('Gagal menambah stok');
    }
  };

  // Add New Ingredient
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newIngName,
          unit: newIngUnit,
          currentStock: newIngStock,
          minStock: newIngMin,
          costPerUnit: newIngCost,
        }),
      });

      if (res.ok) {
        playSoundEffect('success');
        setIsAddIngModal(false);
        setNewIngName('');
        fetchData();
      }
    } catch {
      alert('Gagal menambah bahan baku');
    }
  };

  // Save Recipe Item
  const handleSaveRecipeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductRecipe || !selectedIngredientId || recipeQuantity <= 0) return;

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductRecipe.id,
          ingredientId: selectedIngredientId,
          quantity: recipeQuantity,
        }),
      });

      if (res.ok) {
        playSoundEffect('success');
        setIsEditRecipeModal(false);
        setSelectedIngredientId('');
        setRecipeQuantity(0);
        fetchData();
      }
    } catch {
      alert('Gagal menyimpan resep');
    }
  };

  const [stockStatusFilter, setStockStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const lowStockCount = ingredients.filter(
    (i) => i.stockStatus === 'LOW' || i.stockStatus === 'EMPTY'
  ).length;

  const totalInventoryValuation = ingredients.reduce(
    (acc, i) => acc + i.totalValuation,
    0
  );

  const filteredIngredients = ingredients.filter((i) => {
    // 1. Search
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status
    let matchesStatus = true;
    if (stockStatusFilter === 'AMAN') matchesStatus = i.stockStatus === 'NORMAL';
    else if (stockStatusFilter === 'LOW') matchesStatus = i.stockStatus === 'LOW';
    else if (stockStatusFilter === 'EMPTY') matchesStatus = i.stockStatus === 'EMPTY';

    // 3. Category (Heuristic based on name)
    let matchesCategory = true;
    if (categoryFilter !== 'ALL') {
      const name = i.name.toLowerCase();
      if (categoryFilter === 'COFFEE') matchesCategory = name.includes('kopi') || name.includes('arabica') || name.includes('robusta') || name.includes('espresso');
      else if (categoryFilter === 'DAIRY') matchesCategory = name.includes('milk') || name.includes('susu') || name.includes('oat');
      else if (categoryFilter === 'POWDER') matchesCategory = name.includes('powder') || name.includes('sirup') || name.includes('syrup') || name.includes('matcha') || name.includes('caramel');
      else if (categoryFilter === 'PACKAGING') matchesCategory = name.includes('cup') || name.includes('lid') || name.includes('sedotan') || name.includes('paper');
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract unique categories for MenuFormModal
  const uniqueCategories = Array.from(
    new Map(recipes.map((r) => [r.category.id, { id: r.category.id, name: r.category.name }])).values()
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F2F2F7] overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-24 sm:pb-8 select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0071E3]" />
            <span>Inventaris, Resep & HPP</span>
          </h2>
          <p className="text-xs text-[#86868B] font-normal mt-0.5">
            Pantau stok bahan baku otomatis, ambang batas minimum, dan margin laba kotor per menu
          </p>
        </div>

        {/* Tab Selector & Actions */}
        <div className="flex items-center gap-3">
          {/* Apple Segmented Control */}
          <div className="flex bg-[#767680]/12 p-1 rounded-xl border border-black/[0.04]">
            <button
              type="button"
              onClick={() => {
                playSoundEffect('beep');
                setActiveTab('STOCK');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'STOCK'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Bahan Baku ({ingredients.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSoundEffect('beep');
                setActiveTab('RECIPES');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'RECIPES'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resep & HPP ({recipes.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1D1D1F] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] active:scale-95"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0071E3]' : ''}`} />
          </button>

          {isOwner && (
            activeTab === 'STOCK' ? (
              <button
                type="button"
                onClick={() => setIsAddIngModal(true)}
                className="py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Bahan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setProductToEdit(null);
                  setIsMenuFormOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu Baru</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Apple Health / Numbers KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#86868B] font-semibold uppercase tracking-wider">
            {isOwner ? 'Total Nilai Aset Stok' : 'Status Inventaris'}
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-[#1D1D1F]">
            {isOwner ? formatRupiah(totalInventoryValuation) : `${ingredients.length} Bahan`}
          </div>
          <div className="text-[11px] text-[#86868B]">
            {isOwner ? 'Estimasi valuasi seluruh bahan baku tersedia' : 'Bahan baku operasional aktif'}
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1">
          <span className="text-[11px] text-[#86868B] font-semibold uppercase tracking-wider">
            Bahan Baku Terdaftar
          </span>
          <div className="text-2xl font-bold font-mono tracking-tight text-[#0071E3]">
            {ingredients.length} <span className="text-sm font-normal text-[#86868B]">Item</span>
          </div>
          <div className="text-[11px] text-[#86868B]">Kopi beans, susu, sirup, cup packaging</div>
        </div>

        <div
          className={`border rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1 transition-all ${
            lowStockCount > 0
              ? 'bg-[#FF9500]/10 border-[#FF9500]/30 text-[#1D1D1F]'
              : 'bg-[#34C759]/10 border-[#34C759]/30 text-[#1D1D1F]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              Status Inventaris
            </span>
            {lowStockCount > 0 ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF9500]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Peringatan
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#34C759]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aman
              </span>
            )}
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${lowStockCount > 0 ? 'text-[#FF9500]' : 'text-[#34C759]'}`}>
            {lowStockCount > 0 ? `${lowStockCount} Bahan Menipis` : 'Semua Stok Aman'}
          </div>
          <div className="text-[11px] text-[#86868B]">
            {lowStockCount > 0 ? 'Perlu tindakan restock segera' : 'Semua bahan di atas ambang batas'}
          </div>
        </div>
      </div>

      {/* Apple Search Input & Filters */}
      <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between bg-white border border-black/[0.06] p-3 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative w-full xl:max-w-md">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'STOCK' ? 'Cari bahan baku...' : 'Cari resep produk...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F2F2F7] border border-transparent text-xs font-medium text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
          />
        </div>

        {activeTab === 'STOCK' && (
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Category Filter */}
            <div className="flex bg-[#767680]/12 p-0.5 rounded-lg border border-black/[0.04]">
              {['ALL', 'COFFEE', 'DAIRY', 'POWDER', 'PACKAGING'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playSoundEffect('beep');
                    setCategoryFilter(cat);
                  }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                    categoryFilter === cat 
                      ? 'bg-white text-[#1D1D1F] shadow-sm' 
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua' : cat === 'COFFEE' ? 'Kopi' : cat === 'DAIRY' ? 'Susu' : cat === 'POWDER' ? 'Bubuk/Sirup' : 'Cup/Packaging'}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-black/[0.06] hidden xl:block" />

            {/* Status Filter */}
            <div className="flex bg-[#767680]/12 p-0.5 rounded-lg border border-black/[0.04]">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'AMAN', label: 'Aman' },
                { id: 'LOW', label: 'Menipis' },
                { id: 'EMPTY', label: 'Habis' }
              ].map(stat => (
                <button
                  key={stat.id}
                  onClick={() => {
                    playSoundEffect('beep');
                    setStockStatusFilter(stat.id);
                  }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1.5 ${
                    stockStatusFilter === stat.id 
                      ? 'bg-white text-[#1D1D1F] shadow-sm' 
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  {stat.id !== 'ALL' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${stat.id === 'AMAN' ? 'bg-[#34C759]' : stat.id === 'LOW' ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'}`} />
                  )}
                  {stat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: STOCK LIST (Apple Numbers Table Style) */}
      {activeTab === 'STOCK' && (
        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F9F9FB] border-b border-black/[0.06] text-[#86868B]">
                  <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider">Nama Bahan Baku</th>
                  <th className="py-3 px-4 text-right font-semibold text-[11px] uppercase tracking-wider">Stok Saat Ini</th>
                  <th className="py-3 px-4 text-center font-semibold text-[11px] uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-right font-semibold text-[11px] uppercase tracking-wider">Ambang Min.</th>
                  <th className="py-3 px-4 text-right font-semibold text-[11px] uppercase tracking-wider">Biaya / Satuan</th>
                  <th className="py-3 px-4 text-right font-semibold text-[11px] uppercase tracking-wider">Total Nilai</th>
                  <th className="py-3 px-4 text-center font-semibold text-[11px] uppercase tracking-wider">Dipakai di</th>
                  <th className="py-3 px-4 text-center font-semibold text-[11px] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredIngredients.map((ing) => (
                  <tr key={ing.id} className="text-[#1D1D1F] hover:bg-[#F2F2F7]/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1D1D1F]">{ing.name}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="font-mono tabular-nums font-bold text-sm text-[#1D1D1F]">
                          {ing.currentStock.toLocaleString('id-ID')}{' '}
                          <span className="text-xs font-sans font-normal text-[#86868B]">{ing.unit}</span>
                        </div>
                        {/* Mini Status Indicator Bar */}
                        <div className="w-12 h-1 rounded-full overflow-hidden bg-[#F2F2F7]">
                          <div 
                            className={`h-full w-full rounded-full ${
                              ing.stockStatus === 'EMPTY' 
                                ? 'bg-[#FF3B30]' 
                                : ing.stockStatus === 'LOW' 
                                ? 'bg-[#FF9500]' 
                                : 'bg-[#34C759]'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          ing.stockStatus === 'EMPTY'
                            ? 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'
                            : ing.stockStatus === 'LOW'
                            ? 'bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20'
                            : 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                        }`}
                      >
                        {ing.stockStatus === 'EMPTY'
                          ? 'HABIS'
                          : ing.stockStatus === 'LOW'
                          ? 'MENIPIS'
                          : 'AMAN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#86868B] tabular-nums">
                      {ing.minStock.toLocaleString('id-ID')} <span className="font-sans text-xs font-normal">{ing.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6E6E73] tabular-nums">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] text-[#86868B] font-sans select-none">Rp</span>
                        <span>{ing.costPerUnit.toLocaleString('id-ID')} <span className="font-sans text-xs font-normal">/{ing.unit}</span></span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1D1D1F] tabular-nums">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] text-[#86868B] font-sans font-normal select-none">Rp</span>
                        <span>{ing.totalValuation.toLocaleString('id-ID')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-[#0071E3]">
                      {ing.usedInCount} Menu
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIng(ing);
                          setAddStockAmount(ing.unit === 'gr' ? 1000 : ing.unit === 'ml' ? 1000 : 50);
                          setIsRestockModal(true);
                        }}
                        className="py-1 px-3 rounded-lg bg-[#F2F2F7] hover:bg-[#E5E5EA] border border-black/[0.06] text-[#1D1D1F] font-semibold text-[11px] transition-all active:scale-95"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPES & HPP */}
      {activeTab === 'RECIPES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">
                    {prod.category.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        prod.grossMargin >= 60
                          ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                          : 'bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20'
                      }`}
                    >
                      Margin {prod.grossMargin}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setProductToEdit({
                          id: prod.id,
                          name: prod.name,
                          price: prod.price,
                          description: prod.description,
                          image: prod.image,
                          categoryId: prod.category.id,
                        });
                        setIsMenuFormOpen(true);
                      }}
                      title="Edit Menu & Foto"
                      className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {prod.image && (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-black/[0.06] shadow-2xs"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-[#1D1D1F] leading-snug">
                      {prod.name}
                    </h4>
                  </div>
                </div>

                {/* Price vs HPP Inset */}
                <div className="p-3 rounded-xl bg-[#F2F2F7]/80 border border-black/[0.04] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#86868B] block text-[10px] font-medium">Harga Jual:</span>
                    <span className="font-bold font-mono tabular-nums text-[#1D1D1F]">
                      {formatRupiah(prod.price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#86868B] block text-[10px] font-medium">HPP Estimasi:</span>
                    <span className="font-bold font-mono tabular-nums text-[#0071E3]">
                      {formatRupiah(prod.calculatedHpp)}
                    </span>
                  </div>
                </div>

                {/* Recipe Ingredients list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-[#86868B] flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#0071E3]" />
                    <span>Komposisi Resep (per porsi):</span>
                  </span>
                  {prod.recipes.length === 0 ? (
                    <p className="text-[11px] text-[#86868B] italic">Belum ada takaran resep</p>
                  ) : (
                    <div className="space-y-1">
                      {prod.recipes.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between text-[11px] text-[#1D1D1F] bg-[#F2F2F7]/60 px-3 py-1.5 rounded-lg border border-black/[0.04]"
                        >
                          <span className="font-medium text-[#1D1D1F]">{r.ingredient.name}</span>
                          <span className="font-mono font-bold text-[#0071E3]">
                            {r.quantity} {r.ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProductRecipe(prod);
                  setIsEditRecipeModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] border border-black/[0.06] text-[#1D1D1F] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Atur Takaran Resep</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL MENU FORM */}
      <MenuFormModal
        isOpen={isMenuFormOpen}
        productToEdit={productToEdit}
        categories={uniqueCategories}
        onClose={() => {
          setIsMenuFormOpen(false);
          setProductToEdit(null);
        }}
        onSuccess={fetchData}
      />

      {/* MODAL RESTOCK (Apple Modal Sheet) */}
      {isRestockModal && selectedIng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.12)] p-6 space-y-4">
            <div className="w-10 h-1 bg-[#86868B]/30 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#0071E3]" />
                <span>Restock: {selectedIng.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRestockModal(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2F2F7] border border-black/[0.04] text-xs space-y-1">
              <div className="flex justify-between text-[#86868B]">
                <span>Stok Saat Ini:</span>
                <span className="font-mono font-bold text-[#1D1D1F]">
                  {selectedIng.currentStock.toLocaleString('id-ID')} {selectedIng.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleRestock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1D1D1F]">
                  Jumlah Tambahan Masuk ({selectedIng.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addStockAmount}
                  onChange={(e) => setAddStockAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-base font-mono font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsRestockModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] text-xs font-semibold text-[#6E6E73] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(0,113,227,0.25)] active:scale-[0.98] transition-all"
                >
                  Konfirmasi Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BAHAN BAKU (Apple Modal Sheet) */}
      {isAddIngModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.12)] p-6 space-y-4">
            <div className="w-10 h-1 bg-[#86868B]/30 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0071E3]" />
                <span>Tambah Bahan Baku Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddIngModal(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1D1F]">Nama Bahan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sirup Vanilla, Biji Kopi Arabica"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1D1F]">Satuan</label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                  >
                    <option value="gr">Gram (gr)</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="pack">Pack / Kantong</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1D1F]">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-xs font-mono font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1D1F]">Batas Min. (Alert)</label>
                  <input
                    type="number"
                    min="0"
                    value={newIngMin}
                    onChange={(e) => setNewIngMin(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-xs font-mono font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D1D1F]">Biaya Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-xs font-mono font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddIngModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] text-xs font-semibold text-[#6E6E73] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(0,113,227,0.25)] active:scale-[0.98] transition-all"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT RESEP ITEM (Apple Modal Sheet) */}
      {isEditRecipeModal && selectedProductRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.12)] p-6 space-y-4">
            <div className="w-10 h-1 bg-[#86868B]/30 rounded-full mx-auto" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0071E3]" />
                <span>Resep: {selectedProductRecipe.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditRecipeModal(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipeItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1D1F]">Pilih Bahan Baku</label>
                <select
                  required
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                >
                  <option value="">-- Pilih bahan baku --</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1D1F]">
                  Takaran per 1 Porsi ({ingredients.find(i => i.id === selectedIngredientId)?.unit || 'Satuan'}):
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  placeholder="Contoh: 18"
                  value={recipeQuantity || ''}
                  onChange={(e) => setRecipeQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-black/[0.06] text-sm font-mono font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsEditRecipeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] text-xs font-semibold text-[#6E6E73] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(0,113,227,0.25)] active:scale-[0.98] transition-all"
                >
                  Simpan Takaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <RoleGuard allowedRoles={['OWNER', 'BARISTA']}>
      <InventoryContent />
    </RoleGuard>
  );
}
