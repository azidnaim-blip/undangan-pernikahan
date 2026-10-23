'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { playSoundEffect } from '@/lib/utils';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackRoute?: string;
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallbackRoute,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeUser, effectiveRole, isLocked, isLoaded, hasRole } = useAuth();
  const [countdown, setCountdown] = useState<number>(3);

  // Determine user's home route based on their effective role
  const getHomeRoute = (role: string) => {
    if (fallbackRoute) return fallbackRoute;
    if (role === 'OWNER') return '/dashboard';
    if (role === 'CASHIER') return '/pos';
    if (role === 'BARISTA') return '/kds';
    return '/pos';
  };

  const targetHome = getHomeRoute(effectiveRole);
  const isAuthorized = hasRole(allowedRoles);

  // Auto redirect countdown if unauthorized
  useEffect(() => {
    if (isLoaded && !isLocked && activeUser && !isAuthorized) {
      playSoundEffect('alert');
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.replace(targetHome);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoaded, isLocked, activeUser, isAuthorized, router, targetHome]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8F6F2]">
        <div className="w-8 h-8 border-3 border-[#C2552D]/20 border-t-[#C2552D] rounded-full animate-spin" />
      </div>
    );
  }

  // Bypass for customer display
  if (pathname === '/customer-display') {
    return <>{children}</>;
  }

  // If locked or no active user, the global LockScreen in layout handles it
  if (isLocked || !activeUser) {
    return null;
  }

  // If unauthorized for this specific route
  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F8F6F2] select-none text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FF453A]/10 text-[#FF453A] flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-8 h-8 stroke-[2]" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">Akses Dibatasi (Security Guard)</h2>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              Halaman ini dikhususkan untuk role{' '}
              <span className="font-bold text-[#1D1D1F]">{allowedRoles.join(' / ')}</span>.
              Profil Anda saat ini adalah{' '}
              <span className="font-bold text-[#C2552D]">
                {activeUser.name} ({effectiveRole})
              </span>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F2F2F7] text-xs text-[#6E6E73] w-full flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-[#C2552D]" />
            <span>Mengalihkan otomatis dalam {countdown} detik...</span>
          </div>

          <button
            type="button"
            onClick={() => router.replace(targetHome)}
            className="w-full py-3 px-5 rounded-2xl bg-[#1D1D1F] hover:bg-[#333] text-white font-semibold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Anda ({targetHome})</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
