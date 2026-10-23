'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';
import { playSoundEffect } from '@/lib/utils';
import { User, useAuth } from '@/lib/AuthContext';

export default function UserSwitchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { setActiveUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'PIN'>('SELECT');

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setSelectedUser(null);
      setPin('');
      setError('');
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSelectUser = (user: User) => {
    playSoundEffect('beep');
    setSelectedUser(user);
    setStep('PIN');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || pin.length < 4) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, pin }),
      });

      const data = await res.json();
      if (res.ok) {
        playSoundEffect('success');
        setActiveUser(data);
        
        // Notify via WA server
        if (selectedUser.phone) {
          const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          fetch('http://localhost:3001/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: selectedUser.phone,
              message: `[BrewPoint POS]\nHalo ${selectedUser.name}, Anda telah berhasil login ke sistem pada jam ${time}. Selamat bertugas! ☕`
            })
          }).catch(() => {});
        }

        onClose();
      } else {
        playSoundEffect('alert');
        setError(data.error || 'PIN Salah');
        setPin('');
      }
    } catch {
      setError('Gagal verifikasi PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleNumpadClick = (num: string) => {
    if (pin.length < 4) {
      playSoundEffect('beep');
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    playSoundEffect('beep');
    setPin((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white/70 backdrop-blur-2xl border border-white/40 w-full max-w-sm rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] m-4 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
        >
          <X className="w-5 h-5 text-[#1D1D1F]" />
        </button>

        {step === 'SELECT' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1D1D1F]">Ganti Akun</h2>
              <p className="text-sm text-[#86868B]">Pilih profil Anda</p>
            </div>
            <div className="space-y-3">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-black/5 hover:bg-black/5 active:scale-95 transition-all shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071E3] to-[#0058B0] flex flex-col items-center justify-center text-white font-bold shadow-inner">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-[#1D1D1F]">{u.name}</div>
                    <div className="text-xs text-[#86868B]">{u.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#0071E3] to-[#0058B0] flex items-center justify-center text-white font-bold text-2xl shadow-inner mb-3">
                {selectedUser?.name[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-[#1D1D1F]">{selectedUser?.name}</h2>
              <p className="text-sm text-[#86868B]">Masukkan 4-digit PIN</p>
            </div>

            <form onSubmit={handlePinSubmit}>
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > i
                        ? 'bg-[#1D1D1F] border-[#1D1D1F]'
                        : 'border-[#AEAEC2] bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="text-center text-xs font-semibold text-[#FF3B30] mb-4 bg-[#FF3B30]/10 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumpadClick(num)}
                    className="h-14 rounded-2xl bg-white border border-black/5 hover:bg-black/5 active:scale-95 transition-all text-xl font-semibold shadow-sm text-[#1D1D1F]"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setStep('SELECT')}
                  className="h-14 rounded-2xl text-xs font-semibold text-[#86868B] hover:bg-black/5 active:scale-95 transition-all"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadClick('0')}
                  className="h-14 rounded-2xl bg-white border border-black/5 hover:bg-black/5 active:scale-95 transition-all text-xl font-semibold shadow-sm text-[#1D1D1F]"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-14 rounded-2xl text-xs font-semibold text-[#86868B] hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={pin.length < 4 || loading}
                className="w-full py-4 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-all text-white font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Masuk Aplikasi
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
