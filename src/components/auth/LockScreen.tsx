'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, User } from '@/lib/AuthContext';
import { playSoundEffect } from '@/lib/utils';
import { Lock, ShieldCheck, Coffee, ChefHat, UserCheck, Delete, ArrowLeft } from 'lucide-react';

export default function LockScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLocked, activeUser, unlock } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Never lock the wedding invitation, pengantin editor, or public customer display kiosk
  if (!pathname || pathname === '/' || pathname.startsWith('/undangan') || pathname.startsWith('/pengantin') || pathname === '/customer-display') {
    return null;
  }

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch available users on mount or lock
  useEffect(() => {
    if (isLocked) {
      setPin('');
      setError('');
      fetch('/api/users')
        .then((res) => res.json())
        .then((data: User[]) => {
          setUsers(data);
          // If activeUser is already in session, pre-select them
          if (activeUser) {
            const found = data.find((u) => u.id === activeUser.id);
            if (found) setSelectedUser(found);
            else if (data.length > 0) setSelectedUser(data[0]);
          } else if (data.length > 0) {
            setSelectedUser(data[0]);
          }
        })
        .catch(() => {});
    }
  }, [isLocked, activeUser]);

  // Handle number click
  const handleNumber = (digit: string) => {
    if (pin.length >= 4 || loading) return;
    playSoundEffect('tap');
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    // Auto-submit when 4 digits reached
    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleBackspace = () => {
    playSoundEffect('tap');
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    playSoundEffect('beep');
    setPin('');
    setError('');
  };

  // Keyboard support for desktop
  useEffect(() => {
    if (!isLocked || !selectedUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, selectedUser, pin, loading]);

  const verifyPin = async (pinToVerify: string) => {
    if (!selectedUser) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, pin: pinToVerify }),
      });

      const data = await res.json();

      if (res.ok) {
        playSoundEffect('success');
        unlock(data);

        // Redirect to role-specific default home page
        if (data.role === 'OWNER') {
          router.push('/dashboard');
        } else if (data.role === 'CASHIER') {
          router.push('/pos');
        } else if (data.role === 'BARISTA') {
          router.push('/kds');
        } else {
          router.push('/pos');
        }
      } else {
        playSoundEffect('alert');
        setError(data.error || 'PIN Salah, coba lagi');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPin('');
      }
    } catch {
      setError('Gagal memverifikasi PIN. Periksa jaringan.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-between bg-gradient-to-b from-[#181615] via-[#231E1B] to-[#120F0D] text-white select-none p-4 sm:p-8 overflow-y-auto no-scrollbar font-sans">
      {/* Top Ambient Glow & Store Header */}
      <div className="w-full max-w-md flex flex-col items-center text-center pt-2 sm:pt-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-xs text-[#E5D7CE] font-medium shadow-inner">
          <ShieldCheck className="w-4 h-4 text-[#34C759]" />
          <span>Sistem POS Aman • BrewPoint Protected</span>
        </div>

        <div className="pt-2">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
            {currentTime || '08:00:00'}
          </div>
          <div className="text-xs sm:text-sm text-[#A89E97] mt-0.5 font-medium">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Main Lock Panel Card */}
      <div className="w-full max-w-md my-auto py-4">
        <div className="bg-white/[0.08] backdrop-blur-3xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] flex flex-col items-center">
          {/* User Selection Carousel / Pills */}
          <div className="w-full mb-6">
            <p className="text-[11px] font-semibold text-[#AEAEC2] uppercase tracking-wider text-center mb-3">
              Pilih Profil Pengguna
            </p>
            <div className="grid grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const isOwner = u.role === 'OWNER';
                const isBarista = u.role === 'BARISTA';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      playSoundEffect('tap');
                      setSelectedUser(u);
                      setPin('');
                      setError('');
                    }}
                    className={`relative p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center transition-all duration-200 border ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#C2552D] to-[#9E3915] border-white/30 text-white shadow-[0_4px_16px_rgba(194,85,45,0.4)] scale-105 ring-2 ring-[#C2552D]/50'
                        : 'bg-white/[0.05] border-white/10 text-[#AEAEC2] hover:bg-white/[0.1] hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm mb-1.5 ${
                        isSelected
                          ? 'bg-white/20 text-white border border-white/30'
                          : isOwner
                          ? 'bg-amber-500/20 text-amber-400'
                          : isBarista
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {isOwner ? (
                        <Coffee className="w-5 h-5" />
                      ) : isBarista ? (
                        <ChefHat className="w-5 h-5" />
                      ) : (
                        <UserCheck className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold truncate max-w-full leading-tight">
                      {u.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75 mt-0.5">
                      {u.role === 'OWNER' ? 'Owner' : u.role === 'CASHIER' ? 'Kasir' : 'Barista'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Greeting & Selected Status */}
          {selectedUser && (
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <span>Halo, {selectedUser.name}</span>
              </h3>
              <p className="text-xs text-[#AEAEC2] mt-0.5">
                Masukkan 4-digit PIN Anda untuk membuka sesi
              </p>
            </div>
          )}

          {/* 4-Digit PIN Indicators */}
          <div
            className={`flex items-center justify-center gap-4 my-3 transition-transform ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                    isFilled
                      ? 'bg-[#C2552D] border-[#C2552D] scale-125 shadow-[0_0_12px_rgba(194,85,45,0.8)]'
                      : 'border-white/30 bg-white/5'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs text-[#FF453A] font-semibold bg-[#FF453A]/15 border border-[#FF453A]/30 px-3 py-1.5 rounded-xl my-2 text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Tactile Numpad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mt-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleNumber(digit)}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] active:bg-[#C2552D] border border-white/10 active:scale-95 text-xl font-bold font-mono transition-all flex items-center justify-center shadow-xs"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || pin.length === 0}
              className="w-full h-14 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-xs font-bold text-[#AEAEC2] hover:text-white transition-all flex items-center justify-center disabled:opacity-30"
            >
              C
            </button>

            {/* Zero Button */}
            <button
              type="button"
              onClick={() => handleNumber('0')}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] active:bg-[#C2552D] border border-white/10 active:scale-95 text-xl font-bold font-mono transition-all flex items-center justify-center shadow-xs"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={loading || pin.length === 0}
              className="w-full h-14 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-sm font-semibold text-[#AEAEC2] hover:text-white transition-all flex items-center justify-center disabled:opacity-30"
              title="Hapus"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Role Hint */}
          {selectedUser && (
            <div className="text-[11px] text-[#AEAEC2]/80 text-center mt-5">
              Role: <span className="text-white font-bold">{selectedUser.role}</span> • Target:{' '}
              <span className="text-[#C2552D] font-bold">
                {selectedUser.role === 'OWNER'
                  ? '/dashboard'
                  : selectedUser.role === 'CASHIER'
                  ? '/pos'
                  : '/kds'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-md text-center pb-2 text-[11px] text-[#736B66]">
        BrewPoint POS Desktop & Android • v2.0 • Keamanan PIN Aktif
      </div>
    </div>
  );
}
