import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  SHEET_HEADERS,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../../services/appsScriptTemplate';
import { getApiUrl, setApiUrl, DEFAULT_API_URL } from '../../services/api';
import {
  Users,
  Database,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Edit,
  Plus,
  Trash2,
  X,
  Code,
  Eye,
  EyeOff,
  Link2,
  Download,
  Upload,
} from 'lucide-react';
import { exportDatabaseToJSON, parseDatabaseJSON } from '../../services/exportService';

export const UsersAndSyncView: React.FC = () => {
  const {
    users,
    jemaat,
    kunjungan,
    inventaris,
    mutasi,
    currentUser,
    canManageUsers,
    addUser,
    updateUser,
    deleteUser,
    login,
    syncData,
    pushToGoogleSheets,
    sheetHealth,
    refreshSheetHealth,
    restoreDatabase,
    isLoading,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'sync'>('users');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [customApiUrl, setCustomApiUrl] = useState<string>(getApiUrl());

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Admin / Sekretariat');
  const [formJabatan, setFormJabatan] = useState('');

  useEffect(() => {
    if (activeTab === 'sync' && sheetHealth.length === 0) {
      refreshSheetHealth();
    }
  }, [activeTab]);

  const handleCopy = (id: string, text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('success', 'Disalin ke Clipboard', `${label} berhasil disalin.`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openAddUser = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormPassword('');
    setFormNama('');
    setFormRole('Admin / Sekretariat');
    setFormJabatan('');
    setIsUserModalOpen(true);
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormPassword(u.password || '');
    setFormNama(u.nama);
    setFormRole(u.role);
    setFormJabatan(u.jabatan || '');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formNama.trim()) return;
    if (editingUser) {
      await updateUser(editingUser.id, {
        username: formUsername.trim(),
        password: formPassword.trim() || editingUser.password,
        nama: formNama.trim(),
        role: formRole,
        jabatan: formJabatan.trim(),
      });
    } else {
      await addUser({
        username: formUsername.trim(),
        password: formPassword.trim() || '123456',
        nama: formNama.trim(),
        role: formRole,
        jabatan: formJabatan.trim(),
      });
    }
    setIsUserModalOpen(false);
  };

  const handleSaveApiUrl = () => {
    setApiUrl(customApiUrl);
    addToast('success', 'URL Endpoint Disimpan', 'URL Google Apps Script diperbarui. Menguji koneksi...');
    refreshSheetHealth();
  };

  const handleBackupJSON = () => {
    exportDatabaseToJSON({ users, jemaat, kunjungan, inventaris, mutasi });
    addToast('success', 'Cadangan JSON Diunduh', 'File backup database berhasil diunduh ke perangkat Anda.');
  };

  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseDatabaseJSON(content);
      if (parsed && (parsed.jemaat || parsed.users || parsed.inventaris)) {
        restoreDatabase(parsed);
      } else {
        addToast('error', 'Format File Tidak Valid', 'File JSON yang diunggah bukan format backup database Getsemani yang valid.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const getRoleIcon = (role: UserRole) => {
    if (role === 'Super Admin') return <ShieldCheck className="w-4 h-4 text-amber-600" />;
    if (role === 'Admin / Sekretariat') return <UserCheck className="w-4 h-4 text-sky-600" />;
    return <BookOpen className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Otorisasi & Integrasi Database
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen 4 User (RBAC) & Sinkronisasi Google Sheets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun Super Admin, Admin 1, Admin 2, dan PHMJ serta perbaiki sinkronisasi Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-bold shadow-sm'
                : 'bg-white dark:bg-[#121216] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-amber-500/25 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-zinc-950' : 'text-amber-500'}`} />
            <span>Akun User ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'sync'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-bold shadow-sm'
                : 'bg-white dark:bg-[#121216] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-amber-500/25 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === 'sync' ? 'text-zinc-950' : 'text-emerald-500'}`} />
            <span>Diagnostik & Perbaikan Sheets</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS (RBAC) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Akun Pengguna Resmi (Sheet "Users")
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terdiri dari 1 Super Admin, 2 Admin berbeda (Admin 1 & Admin 2), dan 1 akun PHMJ (Ketua PHMJ / Pendeta & Majelis Jemaat).
                </p>
              </div>
              {canManageUsers && (
                <button
                  onClick={openAddUser}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah User Baru</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">Username</th>
                    <th className="py-3 px-4 font-semibold">Password</th>
                    <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                    <th className="py-3 px-4 font-semibold">Role / Hak Akses</th>
                    <th className="py-3 px-4 font-semibold">Keterangan Jabatan</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isCurrent = currentUser?.id === u.id || currentUser?.username === u.username;
                    const visiblePw = showPasswords[u.id];
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/80 ${isCurrent ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{u.id}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {u.username}
                          </span>
                          {isCurrent && (
                            <span className="ml-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Aktif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>{visiblePw ? u.password || '-' : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                              }
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Tampilkan/Sembunyikan Password"
                            >
                              {visiblePw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{u.nama}</td>
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px]">
                            {getRoleIcon(u.role)}
                            <span>{u.role}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{u.jabatan}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {!isCurrent && (
                              <button
                                onClick={() => login(u.username, u.password)}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                                title="Masuk sebagai akun ini"
                              >
                                Pakai
                              </button>
                            )}
                            {canManageUsers && (
                              <>
                                <button
                                  onClick={() => openEditUser(u)}
                                  className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50"
                                  title="Edit User"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {!isCurrent && (
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                    title="Hapus User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Permission Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>1. Super Admin (superadmin)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Akses penuh: Lihat, Tambah, Edit, Hapus semua data, Kelola 4 User, Export PDF/Excel, serta Reset Semua Data.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-sky-900">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>2. Admin 1 & Admin 2 (admin1, admin2)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Dua akun admin terpisah untuk tim Sekretariat: Lihat, Tambah, Edit Jemaat, KK, KTP, Mutasi, Inventaris, Kunjungan & Export. Tidak bisa Hapus atau Reset Data.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>3. PHMJ & Majelis (phmj)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                Untuk Pendeta selaku Ketua PHMJ dan seluruh Anggota Majelis Jemaat: Lihat semua data & export laporan, serta tambah/edit Jurnal Kunjungan Pastoral.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNOSTIK & PERBAIKAN GOOGLE SHEETS */}
      {activeTab === 'sync' && (
        <div className="space-y-5">
          {/* Action Banner */}
          <div className="bg-gradient-to-r from-[#09090b] via-[#18140c] to-[#0b0b0e] text-white p-5 rounded-2xl shadow-lg border border-amber-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span>Pemeriksaan & Perbaikan Sinkronisasi Google Sheets</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Sistem mendeteksi status setiap tab pada Spreadsheet Anda. Jika sheet <strong>Users</strong> atau <strong>Jemaat</strong> belum memiliki baris judul kolom (Baris 1), gunakan alat perbaikan di bawah ini lalu klik <strong>Kirim Data Lokal ke Sheets</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={refreshSheetHealth}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Periksa Status Sheet</span>
              </button>
              <button
                onClick={pushToGoogleSheets}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Kirim {users.length} User & {jemaat.length} Jemaat ke Sheets</span>
              </button>
              <button
                onClick={syncData}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tarik dari Sheets</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Cards per Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hasil Diagnostik 5 Tab Google Sheets
              </h4>
              <span className="text-[11px] text-slate-500">
                Otomatis memeriksa baris header & isi data
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sheetHealth.length === 0 ? (
                <div className="col-span-full py-6 text-center text-xs text-slate-500">
                  Klik "Periksa Status Sheet" untuk mengecek kondisi Google Sheets secara langsung.
                </div>
              ) : (
                sheetHealth.map((s) => (
                  <div
                    key={s.sheet}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      s.status === 'ok'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{s.sheet}</span>
                      {s.status === 'ok' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Siap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Perlu Perbaikan
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{s.message}</p>
                    {SHEET_HEADERS[s.sheet] && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `hdr-${s.sheet}`,
                            SHEET_HEADERS[s.sheet].join('\t'),
                            `Header Baris 1 Sheet "${s.sheet}"`
                          )
                        }
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedId === `hdr-${s.sheet}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Header Tersalin! Tempel di Sel A1</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Salin Header Baris 1 ({SHEET_HEADERS[s.sheet].length} kolom)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* One-Click Apps Script Fix Guide */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-600" />
                  <span>Script Google Apps Script (Code.gs) Perbaikan Otomatis</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jika sheet <strong>Users</strong> atau <strong>Jemaat</strong> belum tersinkron, salin kode <code>Code.gs</code> ini ke editor Apps Script Google Spreadsheet Anda lalu jalankan fungsi <code>setupSemuaSheetDanUser</code> satu kali.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy('apps-script', GOOGLE_APPS_SCRIPT_CODE, 'Kode Google Apps Script (Code.gs)')
                }
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0a0a0d] hover:bg-zinc-900 border border-amber-500/35 text-amber-300 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedId === 'apps-script' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Code.gs Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Salin Code.gs Lengkap</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Langkah 1</span>
                <span className="text-slate-600">Buka Google Spreadsheet → Ekstensi → Apps Script → Ganti kode dengan script di samping.</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block">Langkah 2</span>
                <span className="text-slate-600">Pilih fungsi <code>setupSemuaSheetDanUser</code> lalu klik <strong>Run</strong> (otomatis membuat header 5 sheet & 4 User resmi).</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block">Langkah 3</span>
                <span className="text-slate-600">Deploy Web App (Who has access: Anyone), lalu klik tombol <strong>Kirim User & Jemaat ke Sheets</strong> di atas.</span>
              </div>
            </div>

            {/* Endpoint URL Config */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-500" />
                <span>URL Endpoint Google Apps Script (/exec):</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSaveApiUrl}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shrink-0"
                >
                  Simpan URL
                </button>
                {customApiUrl !== DEFAULT_API_URL && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomApiUrl(DEFAULT_API_URL);
                      setApiUrl(DEFAULT_API_URL);
                      addToast('info', 'URL Direset', 'Kembali menggunakan URL Apps Script default.');
                    }}
                    className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl shrink-0"
                  >
                    Default
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* JSON Database Backup & Restore Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Cadangan & Pemulihan Arsip Database (Format JSON)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unduh seluruh data jemaat, kartu keluarga (NKK), kunjungan pastoral, inventaris, dan mutasi ke perangkat Anda sebagai file arsip lokal berformat JSON, atau pulihkan data dari file cadangan sebelumnya.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBackupJSON}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Cadangan JSON</span>
                </button>

                <label className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Pulihkan Arsip JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-[#0a0a0d] border-b border-amber-500/30 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-300">
                {editingUser ? `Edit Akun: ${editingUser.username}` : 'Tambah Akun User Baru'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required={!editingUser}
                  placeholder={editingUser ? 'Isi password baru atau biarkan sama' : 'Masukkan password'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Hak Akses</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin / Sekretariat">Admin / Sekretariat</option>
                  <option value="Pendeta / Majelis Jemaat">Pendeta / Majelis Jemaat (PHMJ)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan / Keterangan</label>
                <input
                  type="text"
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  placeholder="Contoh: Admin Pengelola Data Jemaat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
