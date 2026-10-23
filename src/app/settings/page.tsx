'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Store, Printer, LayoutGrid, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { playSoundEffect } from '@/lib/utils';
import RoleGuard from '@/components/auth/RoleGuard';

interface StoreSettings {
  id: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptFooter: string;
  printerPaperSize: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

function SettingsContent() {
  const router = useRouter();
  const { activeUser, effectiveRole } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'store' | 'receipt' | 'categories'>('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    id: 'default',
    storeName: '',
    storeAddress: '',
    storePhone: '',
    receiptFooter: '',
    printerPaperSize: '58mm',
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSet, resCat] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/categories')
      ]);
      
      if (resSet.ok) {
        const data = await resSet.json();
        setSettings(data);
      }
      if (resCat.ok) {
        const data = await resCat.json();
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {}
  };

  const handleSaveSettings = async () => {
    playSoundEffect('beep');
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': effectiveRole || '',
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        playSoundEffect('success');
        alert('Pengaturan berhasil disimpan!');
      } else {
        throw new Error('Gagal menyimpan');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory?.name) return;
    playSoundEffect('beep');
    setSaving(true);
    
    try {
      const method = editingCategory.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });
      
      if (res.ok) {
        playSoundEffect('success');
        setEditingCategory(null);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan kategori');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini? Pastikan tidak ada produk yang terhubung.')) return;
    playSoundEffect('beep');
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        playSoundEffect('success');
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F2F2F7] overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-black/[0.05] bg-white/75 backdrop-blur-3xl sticky top-0 z-10 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1D1D1F] tracking-tight">Pengaturan</h1>
          <p className="text-[12px] sm:text-[13px] text-[#86868B] font-medium mt-1">Konfigurasi toko, struk, dan kategori menu</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 sm:p-8 relative pb-24 sm:pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[#C2552D] animate-spin" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-8">
            
            {/* Sidebar Tabs */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-row overflow-x-auto no-scrollbar lg:flex-col gap-1.5">
                <button
                  onClick={() => { playSoundEffect('tap'); setActiveTab('store'); }}
                  className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[13px] sm:text-[14px] font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeTab === 'store' ? 'bg-[#1D1D1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.03]'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  Informasi Toko
                </button>
                <button
                  onClick={() => { playSoundEffect('tap'); setActiveTab('receipt'); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-200 ${
                    activeTab === 'receipt' ? 'bg-[#1D1D1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.03]'
                  }`}
                >
                  <Printer className="w-5 h-5" />
                  Struk & Printer
                </button>
                <button
                  onClick={() => { playSoundEffect('tap'); setActiveTab('categories'); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-200 ${
                    activeTab === 'categories' ? 'bg-[#1D1D1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.03]'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  Kategori Menu
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              
              {/* Tab: Store Info */}
              {activeTab === 'store' && (
                <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-6 border-b border-black/[0.05]">
                    <h2 className="text-[17px] font-bold text-[#1D1D1F]">Informasi Toko</h2>
                    <p className="text-[13px] text-[#86868B] mt-1">Data ini akan tampil di bagian atas cetakan struk kasir.</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">Nama Restoran/Toko</label>
                      <input 
                        type="text" 
                        value={settings.storeName}
                        onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                        className="w-full px-4 py-3 bg-[#767680]/[0.06] hover:bg-[#767680]/[0.09] focus:bg-white border border-transparent focus:border-black/[0.08] focus:ring-2 focus:ring-[#C2552D]/15 rounded-2xl text-[15px] font-medium text-[#1D1D1F] transition-all outline-none"
                        placeholder="Contoh: BrewPoint Cafe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">Alamat Lengkap</label>
                      <textarea 
                        value={settings.storeAddress}
                        onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                        className="w-full px-4 py-3 bg-[#767680]/[0.06] hover:bg-[#767680]/[0.09] focus:bg-white border border-transparent focus:border-black/[0.08] focus:ring-2 focus:ring-[#C2552D]/15 rounded-2xl text-[15px] font-medium text-[#1D1D1F] transition-all outline-none resize-none min-h-[100px]"
                        placeholder="Contoh: Jl. Sudirman No. 123..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">Nomor Telepon/WA</label>
                      <input 
                        type="text" 
                        value={settings.storePhone}
                        onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                        className="w-full px-4 py-3 bg-[#767680]/[0.06] hover:bg-[#767680]/[0.09] focus:bg-white border border-transparent focus:border-black/[0.08] focus:ring-2 focus:ring-[#C2552D]/15 rounded-2xl text-[15px] font-medium text-[#1D1D1F] transition-all outline-none"
                        placeholder="Contoh: 081234567890"
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-[#F5F5F7]/50 border-t border-black/[0.05] flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C2552D] to-[#B04720] hover:from-[#B04720] hover:to-[#963915] text-white font-semibold rounded-2xl shadow-[0_2px_8px_rgba(194,85,45,0.28)] hover:shadow-[0_4px_14px_rgba(194,85,45,0.36)] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Receipt Info */}
              {activeTab === 'receipt' && (
                <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-6 border-b border-black/[0.05]">
                    <h2 className="text-[17px] font-bold text-[#1D1D1F]">Struk & Printer</h2>
                    <p className="text-[13px] text-[#86868B] mt-1">Konfigurasi ukuran cetak dan catatan pelanggan.</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">Ukuran Kertas Thermal (Printer)</label>
                      <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${settings.printerPaperSize === '58mm' ? 'border-[#C2552D] bg-[#C2552D]/5' : 'border-transparent bg-[#767680]/[0.06] hover:bg-[#767680]/[0.09]'}`}>
                          <input type="radio" name="paperSize" className="hidden" checked={settings.printerPaperSize === '58mm'} onChange={() => setSettings({...settings, printerPaperSize: '58mm'})} />
                          <span className={`font-semibold ${settings.printerPaperSize === '58mm' ? 'text-[#C2552D]' : 'text-[#1D1D1F]'}`}>Kertas 58mm (Kecil)</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${settings.printerPaperSize === '80mm' ? 'border-[#C2552D] bg-[#C2552D]/5' : 'border-transparent bg-[#767680]/[0.06] hover:bg-[#767680]/[0.09]'}`}>
                          <input type="radio" name="paperSize" className="hidden" checked={settings.printerPaperSize === '80mm'} onChange={() => setSettings({...settings, printerPaperSize: '80mm'})} />
                          <span className={`font-semibold ${settings.printerPaperSize === '80mm' ? 'text-[#C2552D]' : 'text-[#1D1D1F]'}`}>Kertas 80mm (Besar)</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">Pesan Penutup Struk (Footer)</label>
                      <textarea 
                        value={settings.receiptFooter}
                        onChange={(e) => setSettings({...settings, receiptFooter: e.target.value})}
                        className="w-full px-4 py-3 bg-[#767680]/[0.06] hover:bg-[#767680]/[0.09] focus:bg-white border border-transparent focus:border-black/[0.08] focus:ring-2 focus:ring-[#C2552D]/15 rounded-2xl text-[15px] font-medium text-[#1D1D1F] transition-all outline-none resize-none min-h-[80px]"
                        placeholder="Contoh: Terima kasih atas kunjungan Anda! Password Wifi: brewpoint123"
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-[#F5F5F7]/50 border-t border-black/[0.05] flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C2552D] to-[#B04720] hover:from-[#B04720] hover:to-[#963915] text-white font-semibold rounded-2xl shadow-[0_2px_8px_rgba(194,85,45,0.28)] hover:shadow-[0_4px_14px_rgba(194,85,45,0.36)] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Categories */}
              {activeTab === 'categories' && (
                <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-[600px]">
                  <div className="p-6 border-b border-black/[0.06] flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-[17px] font-bold text-[#1D1D1F]">Kategori Menu</h2>
                      <p className="text-[13px] text-[#86868B] mt-1">Atur urutan dan nama kategori produk Anda.</p>
                    </div>
                    <button 
                      onClick={() => { playSoundEffect('tap'); setEditingCategory({ name: '', icon: 'Coffee', sortOrder: categories.length }); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#34C759] text-white font-semibold text-[13px] rounded-full hover:bg-[#28A745] transition-colors"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      Tambah Kategori
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2">
                    {categories.length === 0 ? (
                      <div className="text-center py-12 text-[#86868B] text-[14px]">Belum ada kategori.</div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-[12px] font-semibold text-[#86868B] uppercase tracking-wider border-b border-black/[0.04]">Nama Kategori</th>
                            <th className="px-4 py-3 text-[12px] font-semibold text-[#86868B] uppercase tracking-wider border-b border-black/[0.04] w-24 text-center">Urutan</th>
                            <th className="px-4 py-3 text-[12px] font-semibold text-[#86868B] uppercase tracking-wider border-b border-black/[0.04] w-32 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat, idx) => (
                            <tr key={cat.id} className={`group hover:bg-[#F5F5F7]/60 transition-colors ${idx !== categories.length - 1 ? 'border-b border-black/[0.04]' : ''}`}>
                              <td className="px-4 py-3.5 font-semibold text-[#1D1D1F] text-[14px]">{cat.name}</td>
                              <td className="px-4 py-3.5 text-center text-[#86868B] text-[14px] tabular-nums">{cat.sortOrder}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setEditingCategory(cat)} className="p-1.5 text-[#0071E3] hover:bg-[#0071E3]/10 rounded-md">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-md">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Category Editor Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-[#F5F5F7]/50">
              <h3 className="font-semibold text-[#1D1D1F]">
                {editingCategory.id ? 'Ubah Kategori' : 'Tambah Kategori'}
              </h3>
              <button onClick={() => setEditingCategory(null)} className="p-1 text-[#86868B] hover:text-[#1D1D1F] transition-colors rounded-full hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#86868B]">Nama Kategori</label>
                <input 
                  type="text" 
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/5 rounded-lg text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#86868B]">Urutan (Angka)</label>
                <input 
                  type="number" 
                  value={editingCategory.sortOrder || 0}
                  onChange={(e) => setEditingCategory({...editingCategory, sortOrder: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/5 rounded-lg text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 tabular-nums"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-[#F5F5F7]/50 border-t border-black/[0.06] flex justify-end gap-2">
              <button onClick={() => setEditingCategory(null)} className="px-4 py-2 font-medium text-[#86868B] hover:text-[#1D1D1F]">Batal</button>
              <button 
                onClick={handleSaveCategory}
                disabled={!editingCategory.name || saving}
                className="px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <SettingsContent />
    </RoleGuard>
  );
}
