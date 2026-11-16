import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  username: string;
  nama: string;
  role: string;
  actionType: 
    | 'TAMBAH_JEMAAT' 
    | 'EDIT_JEMAAT' 
    | 'HAPUS_JEMAAT' 
    | 'EDIT_KK' 
    | 'TAMBAH_KUNJUNGAN' 
    | 'TAMBAH_MUTASI' 
    | 'BACKUP_DB' 
    | 'RESTORE_DB' 
    | 'LOGIN';
  description: string;
}

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('SEMUA');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchAction = selectedActionType === 'SEMUA' || log.actionType === selectedActionType;
      const matchSearch =
        !searchQuery.trim() ||
        log.username.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        log.nama.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchAction && matchSearch;
    });
  }, [auditLogs, selectedActionType, searchQuery]);

  // Export Audit Logs to CSV
  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;
    const headers = ['ID', 'Waktu (ISO)', 'Username', 'Nama Admin', 'Role', 'Jenis Aktivitas', 'Keterangan'];
    const rows = auditLogs.map((l) => [
      l.id,
      l.timestamp,
      l.username,
      `"${l.nama}"`,
      `"${l.role}"`,
      l.actionType,
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Log_Aktivitas_Admin_Getsemani_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: AuditLog['actionType']) => {
    switch (action) {
      case 'TAMBAH_JEMAAT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">Tambah Jemaat</span>;
      case 'EDIT_JEMAAT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300">Edit Jemaat</span>;
      case 'HAPUS_JEMAAT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">Hapus Jemaat</span>;
      case 'EDIT_KK':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">Ubah Data KK</span>;
      case 'TAMBAH_KUNJUNGAN':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300">Kunjungan Pastoral</span>;
      case 'TAMBAH_MUTASI':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300">Mutasi Anggota</span>;
      case 'BACKUP_DB':
      case 'RESTORE_DB':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-400">Arsip Database</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">Aktivitas Sistem</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#09090b] via-[#1a140a] to-[#0b0b0e] text-white p-6 rounded-2xl shadow-lg border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit Internal & Keamanan Sistem
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1 text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            <span>Riwayat Aktivitas Admin (Audit Trail)</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            Pencatatan waktu real-time, identitas administrator, dan jenis perubahan data terakhir (seperti penambahan jemaat atau pengubahan KK) untuk keperluan audit integritas data gereja.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Laporan Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Log Tercatat
            </span>
            <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
              {auditLogs.length}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Integritas sistem aktif</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Admin Sesi Aktif
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate max-w-[180px]">
              {currentUser?.nama || 'Super Admin'}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Role: {currentUser?.role || 'Super Admin'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Status Penyimpanan
            </span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Terenkripsi & Tersinkron
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Penyimpanan lokal & backup siap
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Kategori:</span>
          </div>

          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            aria-label="Filter jenis aktivitas"
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="SEMUA">Semua Jenis Aktivitas</option>
            <option value="TAMBAH_JEMAAT">Tambah Jemaat</option>
            <option value="EDIT_JEMAAT">Edit Jemaat</option>
            <option value="HAPUS_JEMAAT">Hapus Jemaat</option>
            <option value="EDIT_KK">Ubah Data KK</option>
            <option value="TAMBAH_KUNJUNGAN">Kunjungan Pastoral</option>
            <option value="TAMBAH_MUTASI">Mutasi Anggota</option>
            <option value="BACKUP_DB">Arsip / Backup DB</option>
            <option value="RESTORE_DB">Restore DB</option>
          </select>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari admin, username, atau deskripsi aksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daftar Log Aktivitas & Perubahan Data Sistem
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
            Menampilkan {filteredLogs.length} dari {auditLogs.length} Log
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-zinc-400">
            <History className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Tidak Ada Log Aktivitas Ditemukan
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
              Tidak ada catatan aktivitas admin yang cocok dengan kriteria filter atau pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu (Timestamp)</th>
                  <th className="py-3 px-4">Administrator / User</th>
                  <th className="py-3 px-4">Jenis Aktivitas</th>
                  <th className="py-3 px-4">Keterangan Perubahan Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = !isNaN(dateObj.getTime())
                    ? `${dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} · ${dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                    : log.timestamp;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-zinc-300 whitespace-nowrap flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {log.nama}
                        </div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          @{log.username} · {log.role}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.actionType)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-200 font-medium">
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
