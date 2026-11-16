/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { LoginModal } from './components/auth/LoginModal';
import { DualConfirmModal } from './components/DualConfirmModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { DataJemaatView } from './components/jemaat/DataJemaatView';
import { DataKKView } from './components/kk/DataKKView';
import { KartuAnggotaView } from './components/ktp/KartuAnggotaView';
import { StrukturSektorView } from './components/struktur/StrukturSektorView';
import { UnsurKategorialView } from './components/struktur/UnsurKategorialView';
import { KunjunganView } from './components/kunjungan/KunjunganView';
import { InventarisView } from './components/inventaris/InventarisView';
import { MutasiView } from './components/mutasi/MutasiView';
import { RekapitulasiView } from './components/rekap/RekapitulasiView';
import { UsersAndSyncView } from './components/users/UsersAndSyncView';
import { AuditLogView } from './components/audit/AuditLogView';
import { DiakoniaView } from './components/diakonia/DiakoniaView';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeMenu, resetAllData } = useApp();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleConfirmReset = async () => {
    await resetAllData();
    setIsResetModalOpen(false);
  };

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView />;
      case 'kelola-data-jemaat':
        return <DataJemaatView />;
      case 'kelola-data-kk':
        return <DataKKView />;
      case 'kelola-kartu-anggota':
        return <KartuAnggotaView />;
      case 'struktur-sektor':
        return <StrukturSektorView />;
      case 'struktur-kategorial':
        return <UnsurKategorialView />;
      case 'kunjungan':
        return <KunjunganView />;
      case 'inventaris':
        return <InventarisView />;
      case 'mutasi':
        return <MutasiView />;
      case 'rekap-sektor':
        return <RekapitulasiView initialTab="sektor" />;
      case 'rekap-kategorial':
        return <RekapitulasiView initialTab="kategorial" />;
      case 'kelola-users':
        return <UsersAndSyncView />;
      case 'audit-aktivitas':
        return <AuditLogView />;
      case 'diakonia':
        return <DiakoniaView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] dark:bg-[#08080a] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Header />

      <div className="flex-1 flex relative">
        {/* Mobile menu overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar Desktop & Mobile drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out shrink-0`}
        >
          <div className="lg:hidden flex items-center justify-between p-3 bg-[#0a0a0d] border-b border-amber-500/20 text-white">
            <span className="text-xs font-bold text-amber-400">Navigasi Menu Gereja</span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 rounded text-zinc-400 hover:text-amber-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Sidebar onOpenResetModal={() => setIsResetModalOpen(true)} />
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Mobile hamburger toggle button */}
          <div className="lg:hidden mb-4 flex items-center justify-between bg-white dark:bg-[#121216] p-3 rounded-xl border border-amber-900/15 dark:border-amber-500/20 shadow-2xs">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-amber-300"
            >
              <Menu className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Buka Menu Navigasi</span>
            </button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono capitalize">
              {activeMenu.replace(/-/g, ' ')}
            </span>
          </div>

          {renderActiveView()}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Login Modal (if logged out) */}
      <LoginModal />

      {/* Super Admin Dual Confirmation Reset Modal */}
      <DualConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Seluruh Database Jemaat"
        description="Peringatan Super Admin: Tindakan ini akan mengembalikan seluruh data jemaat, nomor kartu keluarga, kunjungan pastoral, inventaris, dan mutasi ke dataset bawaan resmi GPI Getsemani. Seluruh penambahan data baru akan dihapus."
        confirmKeyword="RESET GETSEMANI"
        confirmButtonText="Ya, Reset Semua Data Sekarang"
        isDestructive={true}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
