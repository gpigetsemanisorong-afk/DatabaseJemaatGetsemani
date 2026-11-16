import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User, Key, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { currentUser, login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#060608] via-[#0d0d12] to-[#060608] backdrop-blur-md">
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
                  placeholder="Masukkan username"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-[#18181d] border border-slate-300 dark:border-amber-500/25 rounded-xl focus:bg-white dark:focus:bg-[#1c1c22] focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-zinc-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-105 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Database Gereja</span>
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Sistem Informasi Manajemen Terintegrasi GPI Getsemani</span>
          </div>
        </div>
      </div>
    </div>
  );
};
