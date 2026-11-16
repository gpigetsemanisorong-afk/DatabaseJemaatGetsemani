import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User, Key } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { currentUser, login, users } = useApp();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('admin123');

  if (currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    login(u, p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#121216] rounded-3xl max-w-md w-full shadow-2xl border border-amber-500/35 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#09090b] to-[#12100b] text-white p-6 text-center space-y-2 border-b border-amber-500/30">
          <div className="w-16 h-16 rounded-full mx-auto p-0.5 bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 shadow-lg shadow-amber-500/20">
            <img
              src="/src/assets/images/church_emblem_1794476998536.jpg"
              alt="Logo Gereja"
              className="w-full h-full object-cover rounded-full bg-zinc-950"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-amber-300">
            DATABASE JEMAAT GETSEMANI
          </h2>
          <p className="text-xs text-amber-400/90 font-medium">
            GPI Papua · Klasis Sorong
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Username Akun
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-amber-500/80 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin / admin1 / admin2 / phmj"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#18181d] border border-slate-300 dark:border-amber-500/25 rounded-xl focus:bg-white dark:focus:bg-[#1c1c22] focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-amber-500/80 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#18181d] border border-slate-300 dark:border-amber-500/25 rounded-xl focus:bg-white dark:focus:bg-[#1c1c22] focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-105 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Database Gereja</span>
            </button>
          </form>

          {/* Quick Access Roles (4 Official Users) */}
          <div className="pt-4 border-t border-slate-100 dark:border-amber-500/20 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block text-center">
              Pilihan Cepat Akun Resmi (RBAC)
            </span>

            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 4).map((u) => {
                const style =
                  u.role === 'Super Admin'
                    ? 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                    : u.role === 'Admin / Sekretariat'
                    ? 'bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-200'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.username, u.password || '')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${style}`}
                  >
                    <div className="text-[11px] font-bold leading-tight truncate">{u.nama}</div>
                    <div className="text-[10px] opacity-80 mt-0.5 font-mono truncate">
                      @{u.username}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
