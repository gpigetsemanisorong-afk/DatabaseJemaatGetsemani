import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Jemaat,
  KunjunganPastoral,
  Inventaris,
  Mutasi,
  ToastMessage,
  UserRole,
} from '../types';
import {
  loadDatabase,
  saveLocalDatabase,
  syncWithGoogleSheets,
  resetAllDataToSeed,
  postActionToAppsScript,
  checkAllSheetsHealth,
  pushLocalDataToGoogleSheets,
  SheetHealthStatus,
  AppDatabase,
} from '../services/api';
import { AuditLog } from '../components/audit/AuditLogView';

export type ActiveMenu =
  | 'dashboard'
  | 'kelola-data-jemaat'
  | 'kelola-data-kk'
  | 'kelola-kartu-anggota'
  | 'struktur-sektor'
  | 'struktur-kategorial'
  | 'kunjungan'
  | 'inventaris'
  | 'mutasi'
  | 'rekap-sektor'
  | 'rekap-kategorial'
  | 'kelola-users'
  | 'audit-aktivitas'
  | 'diakonia';

export type ThemeMode = 'dark' | 'light';

interface AppContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  currentUser: User | null;
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
  users: User[];
  jemaat: Jemaat[];
  kunjungan: KunjunganPastoral[];
  inventaris: Inventaris[];
  mutasi: Mutasi[];
  auditLogs: AuditLog[];
  addAuditLog: (actionType: AuditLog['actionType'], description: string) => void;
  lastSync: string | null;
  isOnline: boolean;
  isLoading: boolean;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  syncData: () => Promise<void>;
  resetAllData: () => Promise<boolean>;
  sheetHealth: SheetHealthStatus[];
  refreshSheetHealth: () => Promise<SheetHealthStatus[]>;
  pushToGoogleSheets: () => Promise<boolean>;
  restoreDatabase: (imported: Partial<AppDatabase>) => void;

  // Users actions
  addUser: (data: Omit<User, 'id'>) => Promise<boolean>;
  updateUser: (id: string, data: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;

  // Jemaat actions
  addJemaat: (data: Omit<Jemaat, 'id'>) => Promise<boolean>;
  updateJemaat: (id: string, data: Partial<Jemaat>) => Promise<boolean>;
  deleteJemaat: (id: string) => Promise<boolean>;

  // Kunjungan actions
  addKunjungan: (data: Omit<KunjunganPastoral, 'id'>) => Promise<boolean>;
  updateKunjungan: (id: string, data: Partial<KunjunganPastoral>) => Promise<boolean>;
  deleteKunjungan: (id: string) => Promise<boolean>;

  // Inventaris actions
  addInventaris: (data: Omit<Inventaris, 'id'>) => Promise<boolean>;
  updateInventaris: (id: string, data: Partial<Inventaris>) => Promise<boolean>;
  deleteInventaris: (id: string) => Promise<boolean>;

  // Mutasi actions
  addMutasi: (data: Omit<Mutasi, 'id'>, newNkkForMarriage?: string) => Promise<boolean>;
  deleteMutasi: (id: string) => Promise<boolean>;

  // Permissions helpers
  canDelete: boolean;
  canReset: boolean;
  canManageUsers: boolean;
  canEditJemaat: boolean;
  canEditKunjungan: boolean;
  canEditInventaris: boolean;
  canEditMutasi: boolean;

  // Selected entities for quick modal inspection
  selectedNkkForKK: string | null;
  setSelectedNkkForKK: (nkk: string | null) => void;
  selectedJemaatForKtp: Jemaat | null;
  setSelectedJemaatForKtp: (jemaat: Jemaat | null) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AUTH_USER_KEY = 'gpi_getsemani_auth_user_v1';
const THEME_STORAGE_KEY = 'gpi_getsemani_theme_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (t: ThemeMode) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jemaat, setJemaat] = useState<Jemaat[]>([]);
  const [kunjungan, setKunjungan] = useState<KunjunganPastoral[]>([]);
  const [inventaris, setInventaris] = useState<Inventaris[]>([]);
  const [mutasi, setMutasi] = useState<Mutasi[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sheetHealth, setSheetHealth] = useState<SheetHealthStatus[]>([]);

  const AUDIT_STORAGE_KEY = 'gpi_getsemani_audit_logs_v1';
  const INITIAL_AUDIT_LOGS: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      username: 'superadmin',
      nama: 'Pdt. Dr. J. Rumbiak, M.Th',
      role: 'Super Admin',
      actionType: 'BACKUP_DB',
      description: 'Melakukan backup arsip database JSON ke perangkat lokal.',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      username: 'admin1',
      nama: 'Dkn. Sarah Huliselan, S.E.',
      role: 'Admin / Sekretariat',
      actionType: 'TAMBAH_JEMAAT',
      description: 'Menambahkan data warga jemaat baru: Markus Malessy (Sektor Filadelfia).',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      username: 'admin2',
      nama: 'Pnt. Yosia Selanno, S.Kom',
      role: 'Admin / Sekretariat',
      actionType: 'EDIT_KK',
      description: 'Memperbarui data Kartu Keluarga (NKK: 9171012304920001 - Keluarga Huliselan).',
    },
  ];

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  const addAuditLog = (actionType: AuditLog['actionType'], description: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      username: currentUser?.username || 'superadmin',
      nama: currentUser?.nama || 'Pdt. Dr. J. Rumbiak, M.Th',
      role: currentUser?.role || 'Super Admin',
      actionType,
      description,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [selectedNkkForKK, setSelectedNkkForKK] = useState<string | null>(null);
  const [selectedJemaatForKtp, setSelectedJemaatForKtp] = useState<Jemaat | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Load database on mount & quietly try syncing from Google Sheets
  useEffect(() => {
    const db = loadDatabase();
    setUsers(db.users);
    setJemaat(db.jemaat);
    setKunjungan(db.kunjungan);
    setInventaris(db.inventaris);
    setMutasi(db.mutasi);
    setLastSync(db.lastSync);
    setIsOnline(db.isOnline);

    // Restore user session if exists, otherwise default to Super Admin for demo ease
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const matched = db.users.find((u) => u.username === parsed.username);
        setCurrentUser(matched || db.users[0] || null);
      } catch {
        setCurrentUser(db.users[0] || null);
      }
    } else {
      setCurrentUser(db.users[0] || null);
    }

    // Background sync on initial startup
    syncWithGoogleSheets(db).then((res) => {
      if (res.updatedDb) {
        setUsers(res.updatedDb.users);
        setJemaat(res.updatedDb.jemaat);
        setKunjungan(res.updatedDb.kunjungan);
        setInventaris(res.updatedDb.inventaris);
        setMutasi(res.updatedDb.mutasi);
        setLastSync(res.updatedDb.lastSync);
        setIsOnline(res.updatedDb.isOnline);
      }
    });
  }, []);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (username: string, password?: string): boolean => {
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase().trim() &&
        (!password || u.password === password)
    );
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(found));
      addToast('success', 'Login Berhasil', `Selamat datang, ${found.nama} (${found.role})`);
      return true;
    }
    addToast('error', 'Login Gagal', 'Username atau password tidak cocok');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    addToast('info', 'Logout', 'Anda telah keluar dari sistem.');
  };

  const syncData = async () => {
    setIsLoading(true);
    try {
      const currentDb = { users, jemaat, kunjungan, inventaris, mutasi, lastSync, isOnline };
      const res = await syncWithGoogleSheets(currentDb);
      if (res.updatedDb) {
        setUsers(res.updatedDb.users);
        setJemaat(res.updatedDb.jemaat);
        setKunjungan(res.updatedDb.kunjungan);
        setInventaris(res.updatedDb.inventaris);
        setMutasi(res.updatedDb.mutasi);
        setLastSync(res.updatedDb.lastSync);
        setIsOnline(res.updatedDb.isOnline);
      }
      addToast(res.success ? 'success' : 'warning', 'Sinkronisasi Sheets', res.message);
    } catch {
      addToast('error', 'Gagal Sinkron', 'Terjadi kesalahan saat sinkronisasi Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSheetHealth = async (): Promise<SheetHealthStatus[]> => {
    setIsLoading(true);
    try {
      const health = await checkAllSheetsHealth();
      setSheetHealth(health);
      return health;
    } finally {
      setIsLoading(false);
    }
  };

  const pushToGoogleSheets = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const currentDb = { users, jemaat, kunjungan, inventaris, mutasi, lastSync, isOnline };
      const res = await pushLocalDataToGoogleSheets(currentDb);
      const totalPushed = Object.values(res.pushedCounts).reduce((a, b) => a + b, 0);
      await refreshSheetHealth();

      if (res.errors.length === 0) {
        addToast(
          'success',
          'Kirim Data Berhasil',
          totalPushed > 0
            ? `Berhasil mengunggah ${totalPushed} data (User: ${res.pushedCounts.Users}, Jemaat: ${res.pushedCounts.Jemaat}) ke Google Sheets.`
            : 'Semua data lokal sudah ada di Google Sheets.'
        );
        return true;
      } else {
        addToast(
          'warning',
          'Sebagian Sheet Perlu Perbaikan Header',
          res.errors[0]
        );
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllData = async (): Promise<boolean> => {
    if (currentUser?.role !== 'Super Admin') {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang berhak mereset database.');
      return false;
    }
    setIsLoading(true);
    const res = await resetAllDataToSeed();
    if (res.success) {
      const db = loadDatabase();
      setUsers(db.users);
      setJemaat(db.jemaat);
      setKunjungan(db.kunjungan);
      setInventaris(db.inventaris);
      setMutasi(db.mutasi);
      setLastSync(db.lastSync);
      addToast('success', 'Reset Berhasil', res.message);
      setIsLoading(false);
      return true;
    } else {
      addToast('error', 'Reset Gagal', res.message);
      setIsLoading(false);
      return false;
    }
  };

  const restoreDatabase = (imported: Partial<AppDatabase>) => {
    if (currentUser?.role !== 'Super Admin') {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang berhak memulihkan arsip database.');
      return;
    }
    const db = loadDatabase();
    const newUsers = imported.users || db.users;
    const newJemaat = imported.jemaat || db.jemaat;
    const newKunjungan = imported.kunjungan || db.kunjungan;
    const newInventaris = imported.inventaris || db.inventaris;
    const newMutasi = imported.mutasi || db.mutasi;

    setUsers(newUsers);
    setJemaat(newJemaat);
    setKunjungan(newKunjungan);
    setInventaris(newInventaris);
    setMutasi(newMutasi);

    saveLocalDatabase({
      users: newUsers,
      jemaat: newJemaat,
      kunjungan: newKunjungan,
      inventaris: newInventaris,
      mutasi: newMutasi,
      lastSync: new Date().toISOString(),
    });

    addToast(
      'success',
      'Pemulihan Arsip Berhasil',
      `Berhasil memulihkan ${newJemaat.length} data jemaat, ${newKunjungan.length} kunjungan, dan ${newInventaris.length} inventaris dari arsip JSON.`
    );
    addAuditLog('RESTORE_DB', `Memulihkan arsip database JSON (${newJemaat.length} jemaat, ${newKunjungan.length} kunjungan)`);
  };

  // RBAC Permission gates
  const userRole: UserRole = currentUser?.role || 'Pendeta / Majelis Jemaat';
  const canDelete = userRole === 'Super Admin';
  const canReset = userRole === 'Super Admin';
  const canManageUsers = userRole === 'Super Admin';
  const canEditJemaat = userRole === 'Super Admin' || userRole === 'Admin / Sekretariat';
  const canEditKunjungan = true; // All roles (Pendeta/Majelis, Admin, Super Admin) can manage pastoral visits
  const canEditInventaris = userRole === 'Super Admin' || userRole === 'Admin / Sekretariat';
  const canEditMutasi = userRole === 'Super Admin' || userRole === 'Admin / Sekretariat';

  // USERS CRUD
  const addUser = async (data: Omit<User, 'id'>): Promise<boolean> => {
    if (!canManageUsers) {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang dapat mengelola akun user.');
      return false;
    }
    if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase().trim())) {
      addToast('error', 'Username Sudah Ada', `Username "${data.username}" sudah digunakan.`);
      return false;
    }
    const newId = `USR-0${users.length + 1}`;
    const newRecord: User = { ...data, id: newId };
    const updated = [...users, newRecord];
    setUsers(updated);
    saveLocalDatabase({ users: updated });
    const remoteRes = await postActionToAppsScript('ADD', 'Users', newRecord);
    if (remoteRes.success) {
      addToast('success', 'User Tersimpan', `Akun "${newRecord.username}" tersinkron ke sheet Users.`);
    } else {
      addToast('warning', 'Disimpan Lokal (Sheet Belum Siap)', `Akun "${newRecord.username}" disimpan lokal. Catatan Sheet: ${remoteRes.message}`);
    }
    return true;
  };

  const updateUser = async (id: string, data: Partial<User>): Promise<boolean> => {
    if (!canManageUsers) {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang dapat mengubah akun user.');
      return false;
    }
    const updated = users.map((u) => (u.id === id ? { ...u, ...data } : u));
    setUsers(updated);
    saveLocalDatabase({ users: updated });
    const target = updated.find((u) => u.id === id);
    if (currentUser?.id === id && target) {
      setCurrentUser(target);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(target));
    }
    const remoteRes = await postActionToAppsScript('UPDATE', 'Users', target);
    if (remoteRes.success) {
      addToast('success', 'User Diperbarui', `Akun "${target?.username}" diperbarui di Google Sheets.`);
    } else {
      addToast('success', 'User Diperbarui Lokal', `Akun "${target?.username}" diperbarui di aplikasi.`);
    }
    return true;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (!canManageUsers) {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang dapat menghapus akun user.');
      return false;
    }
    const target = users.find((u) => u.id === id);
    if (target?.id === currentUser?.id) {
      addToast('error', 'Tidak Diizinkan', 'Tidak dapat menghapus akun yang sedang aktif login.');
      return false;
    }
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    saveLocalDatabase({ users: updated });
    await postActionToAppsScript('DELETE', 'Users', { id, ID_User: id, Username: target?.username });
    addToast('info', 'User Dihapus', `Akun "${target?.username}" telah dihapus.`);
    return true;
  };

  // JEMAAT CRUD
  const addJemaat = async (data: Omit<Jemaat, 'id'>): Promise<boolean> => {
    if (!canEditJemaat) {
      addToast('error', 'Akses Terbatas', 'Role Anda tidak memiliki izin menambah data jemaat.');
      return false;
    }
    const newId = `jem-${Date.now()}`;
    const newRecord: Jemaat = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...jemaat];
    setJemaat(updated);
    saveLocalDatabase({ jemaat: updated });
    const remoteRes = await postActionToAppsScript('ADD', 'Jemaat', newRecord);
    if (remoteRes.success) {
      addToast('success', 'Data Disimpan & Tersinkron', `Anggota ${newRecord.nama} berhasil disimpan ke sheet Jemaat.`);
    } else {
      addToast('warning', 'Disimpan Lokal (Periksa Sheet Jemaat)', `${newRecord.nama} tersimpan di aplikasi, namun Google Sheet merespon: ${remoteRes.message}`);
    }
    addAuditLog('TAMBAH_JEMAAT', `Menambahkan data jemaat baru: ${newRecord.nama} (Sektor ${newRecord.sektor}, NIK: ${newRecord.nik})`);
    return true;
  };

  const updateJemaat = async (id: string, data: Partial<Jemaat>): Promise<boolean> => {
    if (!canEditJemaat) {
      addToast('error', 'Akses Terbatas', 'Role Anda tidak memiliki izin mengubah data jemaat.');
      return false;
    }
    const updated = jemaat.map((j) =>
      j.id === id ? { ...j, ...data, updatedAt: new Date().toISOString() } : j
    );
    setJemaat(updated);
    saveLocalDatabase({ jemaat: updated });
    const updatedTarget = updated.find((j) => j.id === id);
    const remoteRes = await postActionToAppsScript('UPDATE', 'Jemaat', updatedTarget);
    if (remoteRes.success) {
      addToast('success', 'Data Diperbarui', 'Perubahan biodata jemaat berhasil disimpan ke Google Sheets.');
    } else {
      addToast('success', 'Data Diperbarui Lokal', 'Perubahan biodata disimpan di aplikasi.');
    }
    addAuditLog('EDIT_JEMAAT', `Memperbarui data jemaat: ${updatedTarget?.nama || id} (NIK: ${updatedTarget?.nik})`);
    return true;
  };

  const deleteJemaat = async (id: string): Promise<boolean> => {
    if (!canDelete) {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang diizinkan menghapus data jemaat.');
      return false;
    }
    const target = jemaat.find((j) => j.id === id);
    const updated = jemaat.filter((j) => j.id !== id);
    setJemaat(updated);
    saveLocalDatabase({ jemaat: updated });
    await postActionToAppsScript('DELETE', 'Jemaat', { id, ID: id, nik: target?.nik, NIK: target?.nik });
    addToast('info', 'Data Dihapus', `Data jemaat ${target?.nama || ''} telah dihapus.`);
    addAuditLog('HAPUS_JEMAAT', `Menghapus data jemaat: ${target?.nama || id} (NIK: ${target?.nik})`);
    return true;
  };

  // KUNJUNGAN CRUD
  const addKunjungan = async (data: Omit<KunjunganPastoral, 'id'>): Promise<boolean> => {
    const newId = `kunj-${Date.now()}`;
    const newRecord: KunjunganPastoral = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...kunjungan];
    setKunjungan(updated);
    saveLocalDatabase({ kunjungan: updated });
    postActionToAppsScript('ADD', 'Kunjungan_Pastoral', newRecord);
    addToast('success', 'Kunjungan Dicatat', `Jurnal kunjungan ke ${newRecord.keluargaTujuan} berhasil dicatat.`);
    addAuditLog('TAMBAH_KUNJUNGAN', `Mencatat jurnal kunjungan pastoral ke keluarga ${newRecord.keluargaTujuan} (Sektor ${newRecord.sektor})`);
    return true;
  };

  const updateKunjungan = async (id: string, data: Partial<KunjunganPastoral>): Promise<boolean> => {
    const updated = kunjungan.map((k) => (k.id === id ? { ...k, ...data } : k));
    setKunjungan(updated);
    saveLocalDatabase({ kunjungan: updated });
    const target = updated.find((k) => k.id === id);
    postActionToAppsScript('UPDATE', 'Kunjungan_Pastoral', target);
    addToast('success', 'Kunjungan Diperbarui', 'Jurnal kunjungan pastoral berhasil diperbarui.');
    return true;
  };

  const deleteKunjungan = async (id: string): Promise<boolean> => {
    if (!canDelete) {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang dapat menghapus jurnal kunjungan.');
      return false;
    }
    const updated = kunjungan.filter((k) => k.id !== id);
    setKunjungan(updated);
    saveLocalDatabase({ kunjungan: updated });
    postActionToAppsScript('DELETE', 'Kunjungan_Pastoral', { id });
    addToast('info', 'Jurnal Dihapus', 'Catatan kunjungan pastoral telah dihapus.');
    return true;
  };

  // INVENTARIS CRUD
  const addInventaris = async (data: Omit<Inventaris, 'id'>): Promise<boolean> => {
    if (!canEditInventaris) {
      addToast('error', 'Akses Terbatas', 'Role Anda tidak memiliki izin menambah data inventaris.');
      return false;
    }
    const newId = `inv-${Date.now()}`;
    const newRecord: Inventaris = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...inventaris];
    setInventaris(updated);
    saveLocalDatabase({ inventaris: updated });
    postActionToAppsScript('ADD', 'Inventaris', newRecord);
    addToast('success', 'Inventaris Disimpan', `Barang ${newRecord.namaBarang} berhasil dicatat.`);
    return true;
  };

  const updateInventaris = async (id: string, data: Partial<Inventaris>): Promise<boolean> => {
    if (!canEditInventaris) {
      addToast('error', 'Akses Terbatas', 'Role Anda tidak memiliki izin mengubah inventaris.');
      return false;
    }
    const updated = inventaris.map((item) => (item.id === id ? { ...item, ...data } : item));
    setInventaris(updated);
    saveLocalDatabase({ inventaris: updated });
    const target = updated.find((item) => item.id === id);
    postActionToAppsScript('UPDATE', 'Inventaris', target);
    addToast('success', 'Inventaris Diperbarui', 'Data barang inventaris berhasil diupdate.');
    return true;
  };

  const deleteInventaris = async (id: string): Promise<boolean> => {
    if (!canDelete) {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang diizinkan menghapus data inventaris.');
      return false;
    }
    const target = inventaris.find((item) => item.id === id);
    const updated = inventaris.filter((item) => item.id !== id);
    setInventaris(updated);
    saveLocalDatabase({ inventaris: updated });
    postActionToAppsScript('DELETE', 'Inventaris', { id, kodeBarang: target?.kodeBarang });
    addToast('info', 'Inventaris Dihapus', `Barang ${target?.namaBarang || ''} telah dihapus.`);
    return true;
  };

  // MUTASI CRUD + Auto-Update Jemaat
  const addMutasi = async (data: Omit<Mutasi, 'id'>, newNkkForMarriage?: string): Promise<boolean> => {
    if (!canEditMutasi) {
      addToast('error', 'Akses Terbatas', 'Role Anda tidak memiliki izin mencatat mutasi.');
      return false;
    }
    const newId = `mut-${Date.now()}`;
    const newRecord: Mutasi = {
      ...data,
      id: newId,
      nkkBaru: newNkkForMarriage || data.nkkBaru,
      createdAt: new Date().toISOString(),
    };

    // Update status jemaat terkait
    let updatedJemaatList = [...jemaat];
    const targetJemaatIndex = updatedJemaatList.findIndex((j) => j.nik === data.nik);

    if (targetJemaatIndex !== -1) {
      const existing = updatedJemaatList[targetJemaatIndex];
      let newStatusKeanggotaan = existing.statusKeanggotaan;
      let newNkk = existing.nkk;
      let newHubungan = existing.hubunganKeluarga;

      if (data.jenisMutasi === 'Meninggal Dunia') {
        newStatusKeanggotaan = 'Dinonaktifkan';
      } else if (data.jenisMutasi === 'Atestasi Keluar' || data.jenisMutasi === 'Pindah Agama' || data.jenisMutasi === 'Pindah Domisili') {
        newStatusKeanggotaan = 'Dinonaktifkan';
      } else if (data.jenisMutasi === 'Menikah (KK Baru)' && newNkkForMarriage) {
        newNkk = newNkkForMarriage;
        newHubungan = 'Kepala Keluarga';
      }

      updatedJemaatList[targetJemaatIndex] = {
        ...existing,
        statusKeanggotaan: newStatusKeanggotaan,
        nkk: newNkk,
        hubunganKeluarga: newHubungan,
        keterangan: `${existing.keterangan ? existing.keterangan + ' | ' : ''}Mutasi: ${data.jenisMutasi} (${data.tanggalMutasi})`,
        updatedAt: new Date().toISOString(),
      };

      setJemaat(updatedJemaatList);
      saveLocalDatabase({ jemaat: updatedJemaatList });
      postActionToAppsScript('UPDATE', 'Jemaat', updatedJemaatList[targetJemaatIndex]);
    }

    const updatedMutasi = [newRecord, ...mutasi];
    setMutasi(updatedMutasi);
    saveLocalDatabase({ mutasi: updatedMutasi });
    postActionToAppsScript('ADD', 'Mutasi', newRecord);

    addToast('success', 'Mutasi Tercatat', `Mutasi ${newRecord.nama} (${newRecord.jenisMutasi}) berhasil diproses dan status jemaat disesuaikan.`);
    addAuditLog('TAMBAH_MUTASI', `Memproses mutasi anggota ${newRecord.nama} (${newRecord.jenisMutasi})`);
    return true;
  };

  const deleteMutasi = async (id: string): Promise<boolean> => {
    if (!canDelete) {
      addToast('error', 'Akses Ditolak', 'Hanya Super Admin yang berhak menghapus riwayat mutasi.');
      return false;
    }
    const updated = mutasi.filter((m) => m.id !== id);
    setMutasi(updated);
    saveLocalDatabase({ mutasi: updated });
    postActionToAppsScript('DELETE', 'Mutasi', { id });
    addToast('info', 'Mutasi Dihapus', 'Riwayat mutasi telah dihapus.');
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        currentUser,
        activeMenu,
        setActiveMenu,
        users,
        jemaat,
        kunjungan,
        inventaris,
        mutasi,
        auditLogs,
        addAuditLog,
        lastSync,
        isOnline,
        isLoading,
        toasts,
        addToast,
        removeToast,
        login,
        logout,
        syncData,
        resetAllData,
        sheetHealth,
        refreshSheetHealth,
        pushToGoogleSheets,
        restoreDatabase,
        addUser,
        updateUser,
        deleteUser,
        addJemaat,
        updateJemaat,
        deleteJemaat,
        addKunjungan,
        updateKunjungan,
        deleteKunjungan,
        addInventaris,
        updateInventaris,
        deleteInventaris,
        addMutasi,
        deleteMutasi,
        canDelete,
        canReset,
        canManageUsers,
        canEditJemaat,
        canEditKunjungan,
        canEditInventaris,
        canEditMutasi,
        selectedNkkForKK,
        setSelectedNkkForKK,
        selectedJemaatForKtp,
        setSelectedJemaatForKtp,
        globalSearchQuery,
        setGlobalSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
