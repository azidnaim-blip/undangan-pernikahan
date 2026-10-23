'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import UserSwitchModal from './UserSwitchModal';
import PwaInstallBanner from './PwaInstallBanner';
import {
  Coffee,
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Package,
  TrendingUp,
  LogOut,
  Volume2,
  VolumeX,
  ChevronRight,
  Sparkles,
  Users,
  Settings,
  Monitor,
  Menu,
  X,
  Lock,
  Eye,
  Shield,
  ChefHat,
  UserCheck
} from 'lucide-react';
import { playSoundEffect } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { activeUser, effectiveRole, previewRole, setPreviewRole, lockScreen, logout } = useAuth();
  const [activeOrderCount, setActiveOrderCount] = useState<number>(0);
  const [shiftData, setShiftData] = useState<{ status: string; userName?: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      const [orderRes, shiftRes] = await Promise.all([
        fetch('/api/orders?status=PENDING,IN_PROGRESS'),
        fetch('/api/shift'),
      ]);

      if (orderRes.ok) {
        const orders = await orderRes.json();
        setActiveOrderCount(orders.length);
      }
      if (shiftRes.ok) {
        const s = await shiftRes.json();
        setShiftData(s);
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    if (pathname === '/customer-display') return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true, roles: ['OWNER'] },
    { href: '/pos', label: 'Menu POS', icon: Coffee, exact: true, roles: ['OWNER', 'CASHIER'] },
    {
      href: '/kds',
      label: 'Kitchen KDS',
      icon: ShoppingBag,
      badge: activeOrderCount > 0 ? activeOrderCount : undefined,
      roles: ['OWNER', 'BARISTA']
    },
    { href: '/shift', label: 'Shift & Kas Laci', icon: Wallet, roles: ['OWNER', 'CASHIER'] },
    { href: '/inventory', label: 'Stok & Resep', icon: Package, roles: ['OWNER', 'BARISTA'] },
    {
      href: '/reports',
      label: effectiveRole === 'CASHIER' ? 'Riwayat Transaksi' : 'Laporan Owner',
      icon: TrendingUp,
      roles: ['OWNER', 'CASHIER']
    },
    { href: '/customer-display', label: 'Layar Pelanggan', icon: Monitor, target: '_blank', roles: ['OWNER', 'CASHIER'] },
    { href: '/team', label: 'Manajemen Tim', icon: Users, roles: ['OWNER'] },
    { href: '/settings', label: 'Pengaturan Toko', icon: Settings, roles: ['OWNER'] },
  ];

  const visibleLinks = navLinks.filter(link => link.roles.includes(effectiveRole || 'OWNER'));

  if (pathname === '/customer-display') {
    return null;
  }

  const roleLabel =
    effectiveRole === 'OWNER'
      ? 'Owner / Manager'
      : effectiveRole === 'CASHIER'
      ? 'Kasir'
      : effectiveRole === 'BARISTA'
      ? 'Barista'
      : 'Staff';

  const roleColorBadge =
    effectiveRole === 'OWNER'
      ? 'bg-amber-500/15 text-amber-800 border-amber-300/60'
      : effectiveRole === 'CASHIER'
      ? 'bg-sky-500/15 text-sky-800 border-sky-300/60'
      : 'bg-emerald-500/15 text-emerald-800 border-emerald-300/60';

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MOBILE TOP APP BAR (< md screens)                          */}
      {/* ============================================================== */}
      <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white/90 backdrop-blur-2xl border-b border-stone-200/80 sticky top-0 z-40 select-none shrink-0 shadow-xs">
        <Link href={effectiveRole === 'BARISTA' ? '/kds' : effectiveRole === 'CASHIER' ? '/pos' : '/dashboard'} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#C2552D] via-[#B54B24] to-[#8E3615] flex items-center justify-center text-white shadow-xs">
            <Coffee className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-[15px] text-[#181615] tracking-tight">
                BrewPoint
              </span>
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase border ${roleColorBadge}`}>
                {effectiveRole}
              </span>
            </div>
            <span className="text-[10px] text-[#8C827A] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
              {activeUser?.name || 'Staff'}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          {/* Quick Lock Button on Mobile */}
          <button
            type="button"
            onClick={() => lockScreen()}
            className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 flex items-center justify-center active:scale-95 transition-all shadow-2xs"
            title="Kunci Layar (Lock)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {activeOrderCount > 0 && effectiveRole !== 'CASHIER' && (
            <Link
              href="/kds"
              className="px-2 py-1 rounded-xl bg-[#C2552D] text-white text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{activeOrderCount}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              playSoundEffect('tap');
              setIsMobileDrawerOpen(true);
            }}
            className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#181615] flex items-center justify-center active:scale-95 transition-all"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MOBILE SLIDE-OUT DRAWER                                     */}
      {/* ============================================================== */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex select-none font-sans">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#FAF8F5] h-full shadow-2xl flex flex-col z-10 animate-slide-right">
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-[#C2552D] via-[#B54B24] to-[#8E3615] flex items-center justify-center text-white shadow-xs">
                  <Coffee className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[16px] text-[#181615] tracking-tight">BrewPoint</h3>
                  <p className="text-[11px] text-[#8C827A] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                    POS & Kitchen System
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#181615] flex items-center justify-center active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active User Card & Quick Role Badge */}
            <div className="p-3 border-b border-stone-200/60 bg-white/60">
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#181615] to-[#36322E] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                      {activeUser?.name ? activeUser.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#181615] leading-tight">
                        {activeUser?.name || 'Kasir'}
                      </div>
                      <div className="text-[11px] font-medium text-[#8C827A] mt-0.5">
                        {roleLabel}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleColorBadge}`}>
                    {effectiveRole}
                  </span>
                </div>

                {/* Owner Role Switcher on Mobile Drawer */}
                {activeUser?.role === 'OWNER' && (
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-1 text-[11px]">
                    <span className="text-[#8C827A] font-medium flex items-center gap-1 shrink-0">
                      <Eye className="w-3 h-3 text-[#C2552D]" /> Preview:
                    </span>
                    <select
                      value={previewRole || 'OWNER'}
                      onChange={(e) => {
                        const val = e.target.value === 'OWNER' ? null : e.target.value;
                        setPreviewRole(val);
                      }}
                      className="bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-xs font-semibold text-[#181615] focus:outline-none"
                    >
                      <option value="OWNER">Owner (Penuh)</option>
                      <option value="CASHIER">Kasir Mode</option>
                      <option value="BARISTA">Barista Mode</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">
                Menu {roleLabel}
              </div>

              {visibleLinks.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/reports' ? pathname.startsWith('/reports') : pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.target}
                    onClick={() => {
                      playSoundEffect('tap');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-white text-[#181615] font-bold shadow-xs border border-stone-200/80'
                        : 'text-[#736B66] hover:text-[#181615] hover:bg-black/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-[#C2552D]/10 text-[#C2552D]' : 'text-[#8C827A]'
                      }`}>
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-[#C2552D] text-white text-[11px] font-bold font-mono">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* PWA Install Banner */}
              <div className="pt-2">
                <PwaInstallBanner />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3 border-t border-stone-200/80 bg-white/80 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  lockScreen();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200/80 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Kunci Layar Terminal</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsUserModalOpen(true);
                  }}
                  className="py-2 px-3 rounded-xl bg-stone-100 text-[#181615] text-[11px] font-bold text-center active:scale-95 transition-all"
                >
                  Ganti Akun
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    logout();
                  }}
                  className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-[11px] font-bold text-center active:scale-95 transition-all"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DESKTOP SIDEBAR (>= md screens)                             */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-64 bg-[#FAF8F5] border-r border-stone-200/70 flex-col h-full shrink-0 select-none font-sans">
        {/* Brand Header */}
        <div className="p-4 border-b border-stone-200/60 bg-white/50 backdrop-blur-xl">
          <Link
            href={effectiveRole === 'BARISTA' ? '/kds' : effectiveRole === 'CASHIER' ? '/pos' : '/dashboard'}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#C2552D] via-[#B54B24] to-[#8E3615] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(194,85,45,0.25)] border-t border-white/25 group-hover:scale-105 transition-transform duration-300">
              <Coffee className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-[18px] text-[#181615] tracking-tight leading-none">
                  BrewPoint
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-[#C2552D]/10 text-[#C2552D] text-[10px] font-bold uppercase tracking-wider">
                  Cafe
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#8C827A] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                Specialty POS & KDS
              </p>
            </div>
          </Link>
        </div>

        {/* Role Identity Tag & Owner Preview Switcher */}
        <div className="px-4 py-2.5 border-b border-stone-200/50 bg-white/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider">
              Mode Akses:
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${roleColorBadge}`}>
              {effectiveRole}
            </span>
          </div>

          {activeUser?.role === 'OWNER' && (
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#736B66] font-medium flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#C2552D]" /> Switch:
              </span>
              <select
                value={previewRole || 'OWNER'}
                onChange={(e) => {
                  const val = e.target.value === 'OWNER' ? null : e.target.value;
                  setPreviewRole(val);
                }}
                className="bg-white border border-stone-200/80 rounded-lg px-2 py-0.5 text-[11px] font-bold text-[#181615] focus:outline-none"
              >
                <option value="OWNER">Owner (Full)</option>
                <option value="CASHIER">Kasir POS</option>
                <option value="BARISTA">Barista KDS</option>
              </select>
            </div>
          )}
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar">
          <div className="px-3 pb-2 text-[10.5px] font-bold text-[#8C827A] uppercase tracking-wider">
            Menu {roleLabel}
          </div>
          {visibleLinks.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.href === '/reports' ? pathname.startsWith('/reports') : pathname === item.href;

            return (
              <Link
                key={item.label + index}
                href={item.href}
                target={item.target}
                onClick={() => playSoundEffect('tap')}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl font-medium text-[13.5px] transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-white text-[#181615] font-bold shadow-[0_2px_10px_rgba(28,25,23,0.05),0_1px_2px_rgba(28,25,23,0.02)] border border-stone-200/70'
                    : 'text-[#736B66] hover:text-[#181615] hover:bg-black/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#C2552D]/10 text-[#C2552D]'
                        : 'text-[#8C827A] group-hover:text-[#181615]'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-[#C2552D] text-white text-[11px] font-bold shadow-[0_1px_4px_rgba(194,85,45,0.3)] font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Compact PWA Install Banner */}
          <div className="pt-3">
            <PwaInstallBanner isCompact />
          </div>
        </div>

        {/* Bottom User / Security Actions */}
        <div className="p-3 border-t border-stone-200/60 space-y-2 bg-[#FAF8F5]/80">
          <div className="p-3 rounded-2xl bg-white border border-stone-200/70 shadow-xs flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#181615] to-[#36322E] border border-white/20 text-white flex items-center justify-center font-bold text-xs shadow-inner font-mono">
                {activeUser?.name ? activeUser.name[0].toUpperCase() : 'B'}
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#181615] leading-tight">
                  {activeUser?.name || 'Kasir 1'}
                </div>
                <div className="text-[11px] text-[#8C827A] font-medium flex items-center gap-1 mt-0.5">
                  {roleLabel}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                localStorage.setItem('pos_sound_muted', soundEnabled ? 'true' : 'false');
              }}
              title={soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C827A] hover:text-[#181615] hover:bg-black/[0.04] transition-colors active:scale-95"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#C2552D]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#AEAEC2]" />
              )}
            </button>
          </div>

          {/* Quick Lock & Switch Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => lockScreen()}
              className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200/70 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Kunci Layar (Lock)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Kunci Layar</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#181615] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Keluar Akun"
            >
              <LogOut className="w-3.5 h-3.5 text-[#6E6E73]" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <UserSwitchModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
      />
    </>
  );
}
