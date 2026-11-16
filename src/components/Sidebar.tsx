import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CreditCard,
  Building2,
  HeartHandshake,
  Package,
  UserMinus,
  BarChart3,
  ChevronDown,
  RotateCcw,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  History,
  Heart,
} from 'lucide-react';

interface SidebarProps {
  onOpenResetModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenResetModal }) => {
  const {
    activeMenu,
    setActiveMenu,
    jemaat,
    inventaris,
    kunjungan,
    mutasi,
    users,
    canReset,
    currentUser,
  } = useApp();

  // Collapsible submenus
  const [kelolaDataOpen, setKelolaDataOpen] = useState(true);
  const [strukturOpen, setStrukturOpen] = useState(true);
  const [rekapOpen, setRekapOpen] = useState(true);

  // Compute family count
  const kkCount = new Set(jemaat.map((j) => j.nkk).filter(Boolean)).size;

  const isKelolaActive =
    activeMenu === 'kelola-data-jemaat' ||
    activeMenu === 'kelola-data-kk' ||
    activeMenu === 'kelola-kartu-anggota';

  const isStrukturActive =
    activeMenu === 'struktur-sektor' || activeMenu === 'struktur-kategorial';

  const isRekapActive =
    activeMenu === 'rekap-sektor' || activeMenu === 'rekap-kategorial';

  const activeMainBtn =
    'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold';
  const inactiveMainBtn =
    'text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10 dark:hover:bg-white/5 hover:text-amber-800 dark:hover:text-amber-300';

  const activeSubBtn =
    'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/35';
  const inactiveSubBtn =
    'text-zinc-600 dark:text-zinc-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-500/5 dark:hover:bg-white/5';

  return (
    <aside className="w-64 bg-white dark:bg-[#0d0d11] text-zinc-700 dark:text-zinc-300 flex flex-col shrink-0 border-r border-amber-900/15 dark:border-amber-500/20 min-h-[calc(100vh-64px)] shadow-lg select-none transition-colors duration-200">
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {/* 1. DASHBOARD */}
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMenu === 'dashboard' ? activeMainBtn : inactiveMainBtn
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </div>
        </button>

        {/* 2. KELOLA DATA (Submenu) */}
        <div>
          <button
            onClick={() => setKelolaDataOpen(!kelolaDataOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isKelolaActive
                ? 'bg-amber-500/10 dark:bg-zinc-900 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                : inactiveMainBtn
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Kelola Data</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                kelolaDataOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {kelolaDataOpen && (
            <div className="pl-4 pr-1 mt-1 space-y-1">
              <button
                onClick={() => setActiveMenu('kelola-data-jemaat')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeMenu === 'kelola-data-jemaat' ? activeSubBtn : inactiveSubBtn
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span>Data Jemaat</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-zinc-600 dark:text-amber-300/80 bg-zinc-100 dark:bg-zinc-900 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  {jemaat.length}
                </span>
              </button>

              <button
                onClick={() => setActiveMenu('kelola-data-kk')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeMenu === 'kelola-data-kk' ? activeSubBtn : inactiveSubBtn
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Data KK</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-zinc-600 dark:text-amber-300/80 bg-zinc-100 dark:bg-zinc-900 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  {kkCount}
                </span>
              </button>

              <button
                onClick={() => setActiveMenu('kelola-kartu-anggota')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeMenu === 'kelola-kartu-anggota' ? activeSubBtn : inactiveSubBtn
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Kartu Anggota (KTP)</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. STRUKTUR DAN OPERASIONAL (Submenu) */}
        <div>
          <button
            onClick={() => setStrukturOpen(!strukturOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isStrukturActive
                ? 'bg-amber-500/10 dark:bg-zinc-900 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                : inactiveMainBtn
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Struktur & Operasional</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                strukturOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {strukturOpen && (
            <div className="pl-4 pr-1 mt-1 space-y-1">
              <button
                onClick={() => setActiveMenu('struktur-sektor')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeMenu === 'struktur-sektor' ? activeSubBtn : inactiveSubBtn
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Jemaat Sektor & Unit</span>
              </button>

              <button
                onClick={() => setActiveMenu('struktur-kategorial')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeMenu === 'struktur-kategorial' ? activeSubBtn : inactiveSubBtn
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Unsur Kategorial</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. JURNAL KUNJUNGAN PASTORAL */}
        <button
          onClick={() => setActiveMenu('kunjungan')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMenu === 'kunjungan' ? activeMainBtn : inactiveMainBtn
          }`}
        >
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span>Kunjungan Pastoral</span>
          </div>
          <span
            className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
              activeMenu === 'kunjungan'
                ? 'bg-zinc-950/20 text-zinc-950 font-bold'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-amber-300/80 border border-amber-500/20'
            }`}
          >
            {kunjungan.length}
          </span>
        </button>

        {/* 5. INVENTARIS GEREJA */}
        <button
          onClick={() => setActiveMenu('inventaris')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMenu === 'inventaris' ? activeMainBtn : inactiveMainBtn
          }`}
        >
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 shrink-0" />
            <span>Inventaris Gereja</span>
          </div>
          <span
            className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
              activeMenu === 'inventaris'
                ? 'bg-zinc-950/20 text-zinc-950 font-bold'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-amber-300/80 border border-amber-500/20'
            }`}
          >
            {inventaris.length}
          </span>
        </button>

        {/* 6. MUTASI ANGGOTA JEMAAT */}
        <button
          onClick={() => setActiveMenu('mutasi')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMenu === 'mutasi' ? activeMainBtn : inactiveMainBtn
          }`}
        >
          <div className="flex items-center gap-3">
            <UserMinus className="w-4 h-4 shrink-0" />
            <span>Mutasi Anggota</span>
          </div>
          <span
            className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
              activeMenu === 'mutasi'
                ? 'bg-zinc-950/20 text-zinc-950 font-bold'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-amber-300/80 border border-amber-500/20'
            }`}
          >
            {mutasi.length}
          </span>
        </button>

        {/* 6.5. DIAKONIA JEMAAT */}
        <button
          onClick={() => setActiveMenu('diakonia')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMenu === 'diakonia' ? activeMainBtn : inactiveMainBtn
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Diakonia Jemaat</span>
          </div>
        </button>

        {/* 7. REKAPITULASI STATISTIK JEMAAT (Submenu) */}
        <div>
          <button
            onClick={() => setRekapOpen(!rekapOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isRekapActive
                ? 'bg-amber-500/10 dark:bg-zinc-900 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                : inactiveMainBtn
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Rekapitulasi Statistik</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                rekapOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {rekapOpen && (
            <div className="pl-4 pr-1 mt-1 space-y-1">
              <button
                onClick={() => setActiveMenu('rekap-sektor')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeMenu === 'rekap-sektor' ? activeSubBtn : inactiveSubBtn
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Rekap Sektor & Unit</span>
              </button>

              <button
                onClick={() => setActiveMenu('rekap-kategorial')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeMenu === 'rekap-kategorial' ? activeSubBtn : inactiveSubBtn
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Rekap Unsur Kategorial</span>
              </button>
            </div>
          )}
        </div>

        {/* 8. MANAJEMEN USER & GOOGLE SHEETS */}
        <button
          onClick={() => setActiveMenu('kelola-users')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMenu === 'kelola-users' ? activeMainBtn : inactiveMainBtn
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>User & Google Sheets</span>
          </div>
          <span
            className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
              activeMenu === 'kelola-users'
                ? 'bg-zinc-950/20 text-zinc-950 font-bold'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-amber-300/80 border border-amber-500/20'
            }`}
          >
            {users.length}
          </span>
        </button>

        {/* 9. AUDIT AKTIVITAS ADMIN */}
        <button
          onClick={() => setActiveMenu('audit-aktivitas')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMenu === 'audit-aktivitas' ? activeMainBtn : inactiveMainBtn
          }`}
        >
          <div className="flex items-center gap-3">
            <History className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Audit Aktivitas Admin</span>
          </div>
        </button>
      </nav>

      {/* Footer / Super Admin Reset Data Button */}
      <div className="p-3 border-t border-amber-900/15 dark:border-amber-500/20 bg-zinc-50/80 dark:bg-[#08080a]">
        {canReset ? (
          <button
            onClick={onOpenResetModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/50 transition-colors"
            title="Kembalikan semua tabel database ke data awal seed (Super Admin only)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Data</span>
          </button>
        ) : (
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center py-1 truncate">
            <span>{currentUser?.nama}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
