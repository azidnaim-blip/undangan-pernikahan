'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Plus, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { playSoundEffect } from '@/lib/utils';
import RoleGuard from '@/components/auth/RoleGuard';

interface UserItem {
  id: string;
  name: string;
  role: string;
  phone?: string | null;
  active: boolean;
}

function TeamContent() {
  const { activeUser, effectiveRole } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('CASHIER');
  const [newPin, setNewPin] = useState('');

  const [newPhone, setNewPhone] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?all=true');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    playSoundEffect('beep');
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': effectiveRole || '',
        },
        body: JSON.stringify({ id, active: !currentActive })
      });
      if (res.ok) {
        playSoundEffect('success');
        fetchUsers();
        
        // Notify via WA server
        const statusText = !currentActive ? 'DIAKTIFKAN' : 'DINONAKTIFKAN';
        const u = users.find(x => x.id === id);
        if (u && u.phone) {
          fetch('http://localhost:3001/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: u.phone,
              message: `[BrewPoint POS]\nHalo ${u.name}, akun sistem Anda telah ${statusText} oleh Owner.`
            })
          }).catch(console.error);
        }
      }
    } catch (e) {
      alert('Gagal mengubah status');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      alert('PIN harus 4 digit');
      return;
    }
    
    // Normalize phone number (e.g. 0812... to 62812...)
    let formattedPhone = newPhone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': effectiveRole || '',
        },
        body: JSON.stringify({ name: newName, role: newRole, pin: newPin, phone: formattedPhone })
      });
      if (res.ok) {
        playSoundEffect('success');
        setIsModalOpen(false);
        setNewName('');
        setNewRole('CASHIER');
        setNewPin('');
        setNewPhone('');
        fetchUsers();
      } else {
        alert('Gagal menambahkan karyawan');
      }
    } catch (e) {
      alert('Terjadi kesalahan server');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F2F2F7]">
        <div className="w-8 h-8 border-4 border-[#0071E3]/20 border-t-[#0071E3] rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = users.filter(u => u.active).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F2F2F7] overflow-hidden">
      {/* Top Bar */}
      <div className="px-8 py-6 border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Manajemen Tim</h1>
          <p className="text-[13px] text-[#86868B] font-medium mt-1">Kelola akses dan akun karyawan Anda</p>
        </div>
        
        <button
          onClick={() => {
            playSoundEffect('beep');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm shadow-[0_2px_10px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anggota</span>
        </button>
      </div>

      <div className="p-8 space-y-6 overflow-y-auto">
        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 inline-flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Karyawan Aktif</div>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F]">{activeCount} Orang</div>
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F9F9FB] border-b border-black/[0.06] text-[#86868B]">
                <th className="py-3.5 px-5 font-semibold text-[11px] uppercase tracking-wider">Nama Lengkap</th>
                <th className="py-3.5 px-5 font-semibold text-[11px] uppercase tracking-wider">Peran (Role)</th>
                <th className="py-3.5 px-5 font-semibold text-[11px] uppercase tracking-wider">No. WhatsApp</th>
                <th className="py-3.5 px-5 text-center font-semibold text-[11px] uppercase tracking-wider">Status Akses</th>
                <th className="py-3.5 px-5 text-right font-semibold text-[11px] uppercase tracking-wider">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {users.map(u => (
                <tr key={u.id} className={`text-[#1D1D1F] transition-colors hover:bg-[#F2F2F7]/50 ${!u.active ? 'opacity-60 grayscale' : ''}`}>
                  <td className="py-4 px-5 font-semibold text-[#1D1D1F]">{u.name}</td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      u.role === 'OWNER' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                      u.role === 'CASHIER' ? 'bg-[#0071E3]/10 text-[#0071E3]' :
                      'bg-[#AF52DE]/10 text-[#AF52DE]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-mono text-[#86868B]">{u.phone || '-'}</td>
                  <td className="py-4 px-5 text-center">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        AKTIF
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#86868B]/10 text-[#86868B] border border-[#86868B]/20 text-[10px] font-semibold">
                        <ShieldAlert className="w-3 h-3" />
                        NONAKTIF
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    {u.role !== 'OWNER' && (
                      <button
                        onClick={() => handleToggleActive(u.id, u.active)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
                          u.active 
                            ? 'text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border-transparent' 
                            : 'text-[#34C759] bg-[#34C759]/10 hover:bg-[#34C759]/20 border-transparent'
                        }`}
                      >
                        {u.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH TIM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.12)] p-6 space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
            >
              <X className="w-4 h-4 text-[#1D1D1F]" />
            </button>
            <h3 className="text-xl font-bold text-[#1D1D1F]">Tambah Anggota</h3>
            
            <form onSubmit={handleAddUser} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#86868B]">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Kasir"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-transparent text-sm font-medium focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#86868B]">Peran (Role)</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-transparent text-sm font-medium focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                >
                  <option value="CASHIER">CASHIER (Kasir Depan)</option>
                  <option value="BARISTA">BARISTA (Dapur/Bar)</option>
                  <option value="OWNER">OWNER (Pemilik)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#86868B]">Nomor WhatsApp</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812345678"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-transparent text-sm font-medium focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#86868B]">PIN Akses (4 Digit)</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  pattern="[0-9]{4}"
                  placeholder="1234"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F2F7] border border-transparent text-lg font-mono font-bold tracking-widest text-center focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={newPin.length !== 4 || !newName}
                  className="w-full py-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-[0_2px_10px_rgba(0,113,227,0.25)] transition-all active:scale-[0.98]"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <TeamContent />
    </RoleGuard>
  );
}
