'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider } from '@/lib/AuthContext';
import LockScreen from '@/components/auth/LockScreen';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Jika sedang membuka halaman undangan (/ atau /undangan*) atau halaman pengantin (/pengantin*), sembunyikan seluruh sidebar, auth & layout POS
  const isWedding = !pathname || pathname === '/' || pathname.startsWith('/undangan') || pathname.startsWith('/pengantin');
  const isCustomerDisplay = pathname === '/customer-display';
  const isDownload = pathname === '/download';

  if (isDownload) {
    return <div className="w-full min-h-screen bg-[#F8F6F2]">{children}</div>;
  }

  if (isWedding) {
    return <div className="w-full min-h-screen bg-transparent">{children}</div>;
  }

  if (isCustomerDisplay) {
    return (
      <AuthProvider>
        <div className="w-full min-h-screen overflow-hidden">{children}</div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen text-[#181615] bg-[#F8F6F2] antialiased flex flex-col md:flex-row overflow-hidden font-sans selection:bg-[#C2552D]/15 selection:text-[#C2552D]">
        <LockScreen />
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
