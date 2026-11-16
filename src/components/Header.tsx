import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  RefreshCw,
  LogOut,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Database,
  CheckCircle,
  HelpCircle,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentUser,
    logout,
    login,
    syncData,
    isLoading,
    lastSync,
    users,
    jemaat,
    kunjungan,
    inventaris,
    mutasi,
    setActiveMenu,
  } = useApp();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showSyncInfoModal, setShowSyncInfoModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format real-time clock in WIT (Papua Time UTC+9)
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime);

  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(currentTime);

  const getRoleBadge = (role?: string) => {
    if (role === 'Super Admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35">
          <ShieldCheck className="w-3.5 h-3.5" />
          Super Admin
        </span>
      );
    }
    if (role === 'Admin / Sekretariat') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-zinc-800 dark:text-amber-200 border border-amber-600/30">
          <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Sekretariat
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
        <BookOpen className="w-3.5 h-3.5" />
        PHMJ / Majelis
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#09090c]/95 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border-b border-amber-800/15 dark:border-amber-500/25 shadow-sm dark:shadow-lg dark:shadow-black/30 transition-colors duration-200">
      {/* Subtle Top Gold Hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-600/20 via-amber-400 to-amber-600/20" />
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Church Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-sm shadow-amber-500/20 shrink-0">
            <img
              src="/src/assets/images/church_emblem_1794476998536.jpg"
              alt="Logo GPI Papua Jemaat Getsemani"
              className="w-full h-full object-cover rounded-full bg-zinc-950"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm lg:text-base font-bold tracking-tight text-zinc-950 dark:text-amber-50 flex items-center gap-1.5">
                DATABASE JEMAAT GETSEMANI
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-bold tracking-wider text-amber-800 dark:text-amber-300 uppercase bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                GPI Papua
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 tracking-wide">
              Gereja Protestan Indonesia di Papua · Klasis Sorong
            </p>
          </div>
        </div>

        {/* Real-time Clock in Header */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100/90 dark:bg-[#141418] border border-amber-900/15 dark:border-amber-500/20 text-xs">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-medium">
            <span>{formattedDate}</span>
            <span className="text-zinc-400 dark:text-zinc-600 font-mono">·</span>
            <span className="font-mono tabular-nums font-semibold text-amber-700 dark:text-amber-300">
              {formattedTime} WIT
            </span>
          </div>
        </div>

        {/* Actions, Global Search, Theme Toggle, Sync & RBAC Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* App-wide Global Search Trigger (Ctrl+K) */}
          <GlobalSearchBar variant="header" />

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap (Hitam Keemasan)'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-amber-500/15 dark:bg-[#141418] dark:hover:bg-amber-500/15 text-zinc-800 dark:text-amber-300 border border-amber-900/15 dark:border-amber-500/25 transition-colors"
            aria-label="Ubah Mode Gelap/Terang"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline text-[11px]">Gelap</span>
              </>
            )}
          </button>

          {/* Sync Button & Info Modal Trigger */}
          <div className="flex items-center gap-1">
            <button
              onClick={syncData}
              disabled={isLoading}
              title={lastSync ? `Terakhir sinkron: ${new Date(lastSync).toLocaleTimeString('id-ID')}` : 'Sinkronkan Google Sheets'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#141418] dark:hover:bg-[#1c1c22] border border-amber-900/15 dark:border-amber-500/20 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline text-[11px]">
                {isLoading ? 'Sinkronisasi...' : 'Sinkron Sheets'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-xs" title="Tersambung" />
            </button>

            <button
              onClick={() => setShowSyncInfoModal(true)}
              title="Informasi Status & Tab Google Sheets"
              className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#141418] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Role Switcher (Dynamic 4 Official Users) */}
          <div className="hidden xl:flex items-center bg-zinc-100 dark:bg-[#141418] p-0.5 rounded-lg border border-amber-900/15 dark:border-amber-500/20 text-[11px]">
            {[
              { id: 'USR-01', fallbackUser: 'superadmin', fallbackPass: 'admin123', label: 'Super Admin', activeClass: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-bold' },
              { id: 'USR-02', fallbackUser: 'admin1', fallbackPass: 'admin123', label: 'Admin 1', activeClass: 'bg-zinc-900 dark:bg-amber-400/20 text-amber-300 border border-amber-500/40 font-semibold' },
              { id: 'USR-03', fallbackUser: 'admin2', fallbackPass: 'admin123', label: 'Admin 2', activeClass: 'bg-zinc-900 dark:bg-amber-400/20 text-amber-300 border border-amber-500/40 font-semibold' },
              { id: 'USR-04', fallbackUser: 'phmj', fallbackPass: 'phmj123', label: 'PHMJ', activeClass: 'bg-emerald-600 text-white font-semibold' },
            ].map((slot, idx) => {
              const matched = users.find((u) => u.id === slot.id) || users[idx];
              const targetUsername = matched?.username || slot.fallbackUser;
              const targetPassword = matched?.password || slot.fallbackPass;
              const isActive =
                currentUser?.id === slot.id || currentUser?.username === targetUsername;
              return (
                <button
                  key={slot.id}
                  onClick={() => login(targetUsername, targetPassword)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    isActive
                      ? `${slot.activeClass} shadow-xs`
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-amber-200'
                  }`}
                  title={`${matched?.nama || slot.label} (${targetUsername})`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          {/* User Profile & Role Info */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-amber-900/15 dark:border-amber-500/20">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-zinc-900 dark:text-amber-50 leading-tight max-w-[140px] truncate">
                  {currentUser.nama}
                </div>
                <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
              </div>

              <button
                onClick={logout}
                title="Keluar dari akun"
                className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sync Status & Google Sheets Info Modal */}
      {showSyncInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs text-slate-900">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden">
            <div className="px-5 py-3.5 bg-[#0a0a0d] border-b border-amber-500/30 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-amber-200">Status Sinkronisasi Google Sheets</h3>
              </div>
              <button
                onClick={() => setShowSyncInfoModal(false)}
                className="p-1 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Status Endpoint Apps Script:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Online & Terhubung
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate font-mono">
                  GET_ALL & ADD/UPDATE/DELETE aktif
                </div>
                {lastSync && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Terakhir Sinkron: {new Date(lastSync).toLocaleString('id-ID')}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Daftar Lembar Kerja (Sheets) yang Dikelola:
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden font-medium">
                  <div className="p-2.5 flex items-center justify-between bg-white">
                    <span>1. Sheet <strong>Users</strong> (Akun & Hak Akses)</span>
                    <span className="font-mono text-emerald-700 font-bold">{users.length} akun</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between bg-white">
                    <span>2. Sheet <strong>Jemaat</strong> (Data Jemaat & NKK)</span>
                    <span className="font-mono text-slate-800 font-bold">{jemaat.length} jiwa</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between bg-white">
                    <span>3. Sheet <strong>Kunjungan_Pastoral</strong></span>
                    <span className="font-mono text-slate-800 font-bold">{kunjungan.length} catatan</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between bg-white">
                    <span>4. Sheet <strong>Inventaris</strong> (Aset & Foto)</span>
                    <span className="font-mono text-slate-800 font-bold">{inventaris.length} barang</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between bg-white">
                    <span>5. Sheet <strong>Mutasi</strong> (Peristiwa Jemaat)</span>
                    <span className="font-mono text-slate-800 font-bold">{mutasi.length} riwayat</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed text-[11px]">
                <strong>Catatan Perbaikan Google Sheets:</strong> Jika sheet <strong>Users</strong> atau <strong>Jemaat</strong> belum tersinkron, pastikan baris 1 memiliki judul kolom resmi dan gunakan menu <strong>User & Google Sheets</strong> untuk mendiagnosis serta mengirim data ke Spreadsheet.
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowSyncInfoModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowSyncInfoModal(false);
                    setActiveMenu('kelola-users');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-300 bg-[#0a0a0d] border border-amber-500/35 hover:bg-zinc-900 rounded-lg transition-colors"
                >
                  Diagnostik & Kelola User
                </button>
                <button
                  onClick={async () => {
                    await syncData();
                    setShowSyncInfoModal(false);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
                >
                  {isLoading ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
