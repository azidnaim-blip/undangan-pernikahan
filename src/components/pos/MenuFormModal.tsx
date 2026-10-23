'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Plus,
  Coffee,
  Check
} from 'lucide-react';
import { formatRupiah, playSoundEffect } from '@/lib/utils';
import { ProductItem } from './ModifierModal';

interface CategoryOption {
  id: string;
  name: string;
}

interface MenuFormModalProps {
  isOpen: boolean;
  productToEdit?: (ProductItem & { image?: string | null; categoryId?: string }) | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function MenuFormModal({
  isOpen,
  productToEdit,
  categories,
  onClose,
  onSuccess,
}: MenuFormModalProps) {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [isNewCategory, setIsNewCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [isBeverage, setIsBeverage] = useState<boolean>(true);

  // Image states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setPrice(productToEdit.price?.toString() || '');
      setDescription(productToEdit.description || '');
      setCategoryId(productToEdit.categoryId || (categories[0]?.id ?? ''));
      setPreviewUrl(productToEdit.image || '');
      setSelectedFile(null);
      setIsBeverage(true);
      setIsNewCategory(false);
      setNewCategoryName('');
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setPreviewUrl('');
      setSelectedFile(null);
      setIsBeverage(true);
      setIsNewCategory(false);
      setNewCategoryName('');
    }
  }, [productToEdit, categories]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      playSoundEffect('beep');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      playSoundEffect('beep');
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    playSoundEffect('beep');
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama menu wajib diisi');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Masukkan harga menu yang valid');
      return;
    }

    try {
      setIsUploading(true);

      let finalImageUrl = previewUrl;

      // 1. Upload file if a new file was chosen
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Gagal mengunggah foto menu');
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      // 2. Create or Update Product
      if (productToEdit) {
        // Edit existing product
        const res = await fetch(`/api/products/${productToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            price: numPrice,
            description: description.trim(),
            image: finalImageUrl,
            categoryId: isNewCategory ? undefined : categoryId,
          }),
        });

        if (!res.ok) throw new Error('Gagal memperbarui menu');
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            price: numPrice,
            description: description.trim(),
            image: finalImageUrl,
            categoryId: isNewCategory ? undefined : categoryId,
            newCategoryName: isNewCategory ? newCategoryName.trim() : undefined,
            isBeverage,
          }),
        });

        if (!res.ok) throw new Error('Gagal menambahkan menu baru');
      }

      playSoundEffect('success');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      alert((err as Error).message || 'Terjadi kesalahan');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Apple Modal Grabber */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-black/20" />
        </div>

        {/* Modal Header (Apple Navigation Bar style) */}
        <div className="px-6 py-3 border-b border-black/[0.06] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] active:scale-95 transition-all"
          >
            Batal
          </button>
          <h3 className="font-bold text-[17px] text-[#1D1D1F] tracking-tight">
            {productToEdit ? 'Edit Menu' : 'Tambah Menu Baru'}
          </h3>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="text-[15px] font-bold text-[#C2552D] hover:text-[#A8441E] active:scale-95 transition-all disabled:opacity-40"
          >
            {isUploading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section 1: Upload Foto Produk Langsung */}
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#1D1D1F]">
              Foto Menu <span className="text-[#86868B] font-normal">(File gambar langsung dari perangkat)</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#F2F2F7] border border-black/[0.08] group">
                <img
                  src={previewUrl}
                  alt="Preview Menu"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-white/95 text-[#1D1D1F] text-[12px] font-semibold shadow-sm hover:bg-white active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C2552D]" />
                    <span>Ganti Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FF3B30] text-white text-[12px] font-semibold shadow-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-[16/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#C2552D] bg-[#C2552D]/5 scale-[0.99]'
                    : 'border-black/[0.12] bg-[#F2F2F7]/70 hover:bg-[#F2F2F7] hover:border-[#C2552D]/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#C2552D] shadow-sm mb-2 border border-black/[0.04]">
                  <Upload className="w-6 h-6 stroke-[2]" />
                </div>
                <p className="text-[14px] font-semibold text-[#1D1D1F]">
                  Klik untuk pilih foto atau seret ke sini
                </p>
                <p className="text-[11px] text-[#86868B] mt-0.5">
                  Mendukung file PNG, JPG, atau WebP (Maksimal 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Data Informasi Menu (Apple Inset Grouped Fields) */}
          <div className="bg-[#F2F2F7] p-4 rounded-2xl border border-black/[0.05] space-y-3.5">
            {/* Nama Produk */}
            <div>
              <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1">
                Nama Menu *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Spanish Honey Latte"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[14px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15 outline-none transition-all font-medium"
              />
            </div>

            {/* Harga Dasar */}
            <div>
              <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1">
                Harga Jual (Rp) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[14px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15 outline-none transition-all font-bold"
              />
            </div>

            {/* Kategori Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] font-semibold text-[#6E6E73]">
                  Kategori
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCategory(!isNewCategory)}
                  className="text-[12px] text-[#0071E3] font-semibold hover:underline"
                >
                  {isNewCategory ? 'Pilih Kategori Yang Ada' : '+ Kategori Baru'}
                </button>
              </div>

              {isNewCategory ? (
                <input
                  type="text"
                  required={isNewCategory}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ketik nama kategori baru (cth: Artisanal Tea)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[14px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15 outline-none transition-all font-medium"
                />
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[14px] text-[#1D1D1F] focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15 outline-none transition-all font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Deskripsi Menu */}
            <div>
              <label className="block text-[12px] font-semibold text-[#6E6E73] mb-1">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan rasa, origin biji kopi, atau komposisi..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[13px] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C2552D] focus:ring-2 focus:ring-[#C2552D]/15 outline-none transition-all font-medium resize-none"
              />
            </div>
          </div>

          {/* Section 3: Toggle Opsi Modifier Minuman (Apple Switch) */}
          {!productToEdit && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F2F2F7] border border-black/[0.05]">
              <div>
                <p className="text-[14px] font-semibold text-[#1D1D1F]">
                  Sertakan Opsi Kustomisasi Minuman
                </p>
                <p className="text-[12px] text-[#6E6E73] mt-0.5">
                  Otomatis menambahkan opsi Suhu (Ice/Hot), Level Gula, Es, Susu Oat, dan Extra Shot.
                </p>
              </div>

              {/* Apple HIG Toggle Switch */}
              <button
                type="button"
                onClick={() => setIsBeverage(!isBeverage)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                  isBeverage ? 'bg-[#34C759]' : 'bg-[#AEAEC2]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    isBeverage ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
