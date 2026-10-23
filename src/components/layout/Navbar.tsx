'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee,
  MonitorCheck,
  Wallet,
  Package,
  TrendingUp,
  Volume2,
  VolumeX,
  Clock,
  CircleDot,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [shiftData, setShiftData] = useState<{ status: string; userName?: string } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchShift = async () => {
    try {
      const res = await fetch('/api/shift');
      if (res.ok) {
        const data = await res.json();
        setShiftData(data);
      }
    } catch {
      // Offline / error
    }
  };

  useEffect(() => {
    fetchShift();
    const interval = setInterval(fetchShift, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navItems = [
    { href: '/pos', label: 'POS Kasir', icon: Coffee },
    { href: '/kds', label: 'Barista KDS', icon: MonitorCheck },
    { href: '/shift', label: 'Shift & Kas', icon: Wallet },
    { href: '/inventory', label: 'Stok & Resep', icon: Package },
    { href: '/reports', label: 'Laporan Owner', icon: TrendingUp },
  ];

  return (
    <header className="bg-[#191210] border-b border-[#2e1d17] text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand & Status */}
        <div className="flex items-center gap-4">
          <Link href="/pos" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center shadow-md border border-coffee-500/40 group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-cream-100">BREWPOINT</span>
                <span className="text-xs px-2 py-0.5 rounded bg-coffee-900 border border-coffee-700/50 text-coffee-300 font-semibold tracking-wider">
                  POS CAFE
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Lokal SQLite Ready
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-[#120e0d] p-1.5 rounded-xl border border-[#2e1d17]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-coffee-700 to-coffee-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-[#231814]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Info: Shift Status, Audio Toggle, Time */}
        <div className="flex items-center gap-3">
          {/* Shift Indicator */}
          <Link
            href="/shift"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              shiftData?.status === 'OPEN'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/70'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-950/70'
            }`}
          >
            {shiftData?.status === 'OPEN' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shift: <strong>{shiftData.userName || 'Kasir'}</strong></span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Shift Belum Dibuka</span>
              </>
            )}
          </Link>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              localStorage.setItem('pos_sound_muted', soundEnabled ? 'true' : 'false');
            }}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
            className="p-2 rounded-lg bg-[#231814] hover:bg-[#2f1f1a] text-stone-300 border border-[#3d2720] transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#120e0d] border border-[#2e1d17] text-stone-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-coffee-400" />
            <span>{timeStr || 'Memuat...'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
