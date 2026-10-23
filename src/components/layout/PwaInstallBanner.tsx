'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle, Info } from 'lucide-react';
import { playSoundEffect } from '@/lib/utils';

// BeforeInstallPromptEvent type definition
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallBanner({ isCompact = false }: { isCompact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS standalone property
        window.navigator.standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIos(/iphone|ipad|ipod/.test(userAgent));

      // Listen for Android & Desktop install prompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', () => {
        setInstalledSuccess(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    playSoundEffect('tap');
    if (isIos) {
      setShowIosGuide(!showIosGuide);
      return;
    }

    if (!deferredPrompt) {
      alert(
        'Untuk memasang aplikasi:\n1. Buka menu browser (titik tiga di kanan atas)\n2. Pilih "Tambahkan ke Layar Utama" atau "Install App"'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      playSoundEffect('success');
      setInstalledSuccess(true);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || installedSuccess) {
    return (
      <div className="p-2.5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] text-[11px] font-semibold flex items-center gap-2">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span className="truncate">Aplikasi Terpasang (Mode Mandiri)</span>
      </div>
    );
  }

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full py-2 px-3 rounded-xl bg-[#C2552D]/10 hover:bg-[#C2552D]/20 text-[#C2552D] text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#C2552D]/25 active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install di HP / Desktop</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#C2552D]/10 to-amber-500/10 border border-[#C2552D]/20 rounded-2xl p-3.5 text-xs select-none">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C2552D] to-[#8E3615] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Download className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#1D1D1F] flex items-center gap-1.5">
            <span>Install BrewPoint App</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C2552D] text-white font-mono uppercase">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-[#6E6E73] mt-0.5 leading-tight">
            Pasang di Android, iPhone atau Desktop tanpa address bar browser.
          </p>

          <button
            type="button"
            onClick={handleInstallClick}
            className="mt-2.5 w-full py-2 px-3 rounded-xl bg-[#C2552D] hover:bg-[#A8441E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pasang Sekarang</span>
          </button>

          {showIosGuide && (
            <div className="mt-2 p-2 rounded-xl bg-white border border-black/[0.08] text-[10px] text-[#6E6E73] space-y-1 animate-fade-in">
              <div className="font-bold text-[#1D1D1F] flex items-center gap-1">
                <Info className="w-3 h-3 text-[#0071E3]" /> Panduan Safari iOS:
              </div>
              <div>1. Ketuk tombol <strong>Share (Bagikan)</strong> di bawah browser</div>
              <div>2. Pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
