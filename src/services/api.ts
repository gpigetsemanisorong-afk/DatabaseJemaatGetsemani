import { Jemaat, User, KunjunganPastoral, Inventaris, Mutasi } from '../types';
import {
  INITIAL_USERS,
  INITIAL_JEMAAT,
  INITIAL_KUNJUNGAN,
  INITIAL_INVENTARIS,
  INITIAL_MUTASI,
} from './seedData';
import { SHEET_HEADERS } from './appsScriptTemplate';

export const DEFAULT_API_URL =
  'https://script.google.com/macros/s/AKfycbyIjf1FMbZoWbSpRm2JSloEhVhjWRTTrjjDLHq4-d9VhFuztpBS3QH_dK8yWOcZJLF1UQ/exec';

const STORAGE_KEYS = {
  USERS: 'gpi_getsemani_users_v2',
  JEMAAT: 'gpi_getsemani_jemaat_v1',
  KUNJUNGAN: 'gpi_getsemani_kunjungan_v1',
  INVENTARIS: 'gpi_getsemani_inventaris_v1',
  MUTASI: 'gpi_getsemani_mutasi_v1',
  LAST_SYNC: 'gpi_getsemani_last_sync_v1',
  API_URL_OVERRIDE: 'gpi_getsemani_api_url_v1',
};

export function getApiUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.API_URL_OVERRIDE);
    return saved && saved.startsWith('https://script.google.com/') ? saved : DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export function setApiUrl(url: string) {
  try {
    if (!url.trim() || url.trim() === DEFAULT_API_URL) {
      localStorage.removeItem(STORAGE_KEYS.API_URL_OVERRIDE);
    } else {
      localStorage.setItem(STORAGE_KEYS.API_URL_OVERRIDE, url.trim());
    }
  } catch (err) {
    console.error('Error saving API URL override:', err);
  }
}

export const API_URL = DEFAULT_API_URL;

export interface AppDatabase {
  users: User[];
  jemaat: Jemaat[];
  kunjungan: KunjunganPastoral[];
  inventaris: Inventaris[];
  mutasi: Mutasi[];
  lastSync: string | null;
  isOnline: boolean;
}

export interface SheetHealthStatus {
  sheet: string;
  rowCount: number;
  status: 'ok' | 'empty_no_header' | 'broken_header' | 'error';
  firstHeader: string;
  message: string;
}

function cleanStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/^'/, '').trim();
}

function normalizeDate(val: unknown, fallback = ''): string {
  if (val === null || val === undefined || val === '') return fallback;
  const s = cleanStr(val);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    // Handle ISO date from Google Sheets (compensate UTC+9 WIT shift if needed)
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return s.slice(0, 10);
  }
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  return s || fallback;
}

// Load database from localStorage, pre-seeded with initial Getsemani data
export function loadDatabase(): AppDatabase {
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const rawJemaat = localStorage.getItem(STORAGE_KEYS.JEMAAT);
    const rawKunjungan = localStorage.getItem(STORAGE_KEYS.KUNJUNGAN);
    const rawInventaris = localStorage.getItem(STORAGE_KEYS.INVENTARIS);
    const rawMutasi = localStorage.getItem(STORAGE_KEYS.MUTASI);
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

    let users: User[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;
    if (!Array.isArray(users) || users.length === 0) {
      users = INITIAL_USERS;
    } else {
      // Ensure all 4 required default slots (USR-01..USR-04) exist by ID
      const existingIds = new Set(users.map((u) => u.id));
      const missingDefaults = INITIAL_USERS.filter((du) => !existingIds.has(du.id));
      if (missingDefaults.length > 0) {
        users = [...users, ...missingDefaults];
        saveLocalDatabase({ users });
      }
    }

    let jemaat: Jemaat[] = rawJemaat ? JSON.parse(rawJemaat) : INITIAL_JEMAAT;
    const kunjungan = rawKunjungan ? JSON.parse(rawKunjungan) : INITIAL_KUNJUNGAN;
    const inventaris = rawInventaris ? JSON.parse(rawInventaris) : INITIAL_INVENTARIS;
    const mutasi = rawMutasi ? JSON.parse(rawMutasi) : INITIAL_MUTASI;

    // Merge any missing initial seed jemaat so new items appear even if previously loaded
    if (rawJemaat && Array.isArray(jemaat)) {
      const existingIds = new Set(jemaat.map((j) => j.id));
      const missingInitial = INITIAL_JEMAAT.filter((initJ) => !existingIds.has(initJ.id));
      let needsSave = false;

      if (missingInitial.length > 0) {
        jemaat = [...jemaat, ...missingInitial];
        needsSave = true;
      }

      // Ensure statusMutasi is populated for existing items
      jemaat = jemaat.map((j) => {
        if (j.id === 'jem-3' && !j.statusMutasi) {
          needsSave = true;
          return {
            ...j,
            statusMutasi: 'Akan Mutasi' as const,
            rencanaMutasiDetail: 'Rencana atestasi pindah studi perguruan tinggi ke Klasis Jayapura pada akhir bulan ini',
          };
        }
        if (!j.statusMutasi) {
          needsSave = true;
          return {
            ...j,
            statusMutasi: j.statusKeanggotaan === 'Dinonaktifkan' ? ('Sudah Mutasi' as const) : ('Normal' as const),
          };
        }
        return j;
      });

      if (needsSave) {
        saveLocalDatabase({ jemaat });
      }
    } else if (!rawJemaat) {
      saveLocalDatabase({ users, jemaat, kunjungan, inventaris, mutasi, lastSync: null, isOnline: true });
    }

    return {
      users,
      jemaat,
      kunjungan,
      inventaris,
      mutasi,
      lastSync,
      isOnline: true,
    };
  } catch (err) {
    console.error('Error loading local database:', err);
    return {
      users: INITIAL_USERS,
      jemaat: INITIAL_JEMAAT,
      kunjungan: INITIAL_KUNJUNGAN,
      inventaris: INITIAL_INVENTARIS,
      mutasi: INITIAL_MUTASI,
      lastSync: null,
      isOnline: false,
    };
  }
}

export function saveLocalDatabase(db: Partial<AppDatabase>) {
  try {
    if (db.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(db.users));
    if (db.jemaat) localStorage.setItem(STORAGE_KEYS.JEMAAT, JSON.stringify(db.jemaat));
    if (db.kunjungan) localStorage.setItem(STORAGE_KEYS.KUNJUNGAN, JSON.stringify(db.kunjungan));
    if (db.inventaris) localStorage.setItem(STORAGE_KEYS.INVENTARIS, JSON.stringify(db.inventaris));
    if (db.mutasi) localStorage.setItem(STORAGE_KEYS.MUTASI, JSON.stringify(db.mutasi));
    if (db.lastSync) localStorage.setItem(STORAGE_KEYS.LAST_SYNC, db.lastSync);
  } catch (err) {
    console.error('Error saving local database:', err);
  }
}

/**
 * Normalizes rows fetched from Google Sheets into our typed structures
 */
export function mapSheetUser(raw: Record<string, unknown>, index: number): User {
  const roleRaw = cleanStr(raw.Role || raw.role || 'Pendeta / Majelis Jemaat');
  let role: User['role'] = 'Pendeta / Majelis Jemaat';
  if (roleRaw.toLowerCase().includes('super')) role = 'Super Admin';
  else if (roleRaw.toLowerCase().includes('admin') || roleRaw.toLowerCase().includes('sekre'))
    role = 'Admin / Sekretariat';

  return {
    id: cleanStr(raw.ID_User || raw.id || `USR-0${index + 1}`),
    username: cleanStr(raw.Username || raw.username),
    password: cleanStr(raw.Password || raw.password),
    nama: cleanStr(raw.Nama_Lengkap || raw.nama || raw.Nama),
    role,
    jabatan: cleanStr(raw.Jabatan || raw.jabatan || role),
  };
}

export function mapSheetJemaat(raw: Record<string, unknown>, index: number): Jemaat {
  const tglLahir = normalizeDate(raw.Tanggal_Lahir || raw.tanggalLahir, '1990-01-01');
  let umur = Number(raw.Umur || raw.umur || 0);
  if (!umur && tglLahir) {
    const birth = new Date(tglLahir);
    if (!isNaN(birth.getTime())) {
      umur = Math.max(0, new Date().getFullYear() - birth.getFullYear());
    }
  }

  return {
    id: cleanStr(raw.ID || raw.ID_Jemaat || raw.id || `jem-${Date.now()}-${index}`),
    nik: cleanStr(raw.NIK || raw.nik),
    nkk: cleanStr(raw.NKK || raw.nkk),
    nama: cleanStr(raw.Nama || raw.nama || raw.Nama_Lengkap),
    jenisKelamin: (cleanStr(raw.Jenis_Kelamin || raw.jenisKelamin) || 'Laki-laki') as Jemaat['jenisKelamin'],
    tempatLahir: cleanStr(raw.Tempat_Lahir || raw.tempatLahir) || 'Sorong',
    tanggalLahir: tglLahir,
    umur,
    golonganDarah: (cleanStr(raw.Golongan_Darah || raw.golonganDarah) || '-') as Jemaat['golonganDarah'],
    pendidikan: (cleanStr(raw.Pendidikan || raw.pendidikan) || 'SMA') as Jemaat['pendidikan'],
    pekerjaan: (cleanStr(raw.Pekerjaan || raw.pekerjaan) || 'Lain-lain') as Jemaat['pekerjaan'],
    pekerjaanLainnya: cleanStr(raw.Pekerjaan_Lainnya || raw.pekerjaanLainnya),
    disabilitas: (cleanStr(raw.Disabilitas || raw.disabilitas) || 'Tidak') as Jemaat['disabilitas'],
    disabilitasDetail: cleanStr(raw.Disabilitas_Detail || raw.disabilitasDetail),
    statusSosial: (cleanStr(raw.Status_Sosial || raw.statusSosial) || 'Umum') as Jemaat['statusSosial'],
    hubunganKeluarga: (cleanStr(raw.Hubungan_Keluarga || raw.hubunganKeluarga) || 'Kepala Keluarga') as Jemaat['hubunganKeluarga'],
    statusKeanggotaan: (cleanStr(raw.Status_Keanggotaan || raw.statusKeanggotaan) || 'Jemaat Tetap') as Jemaat['statusKeanggotaan'],
    sektor: (cleanStr(raw.Sektor || raw.sektor) || 'Filadelfia') as Jemaat['sektor'],
    unit: (cleanStr(raw.Unit || raw.unit) || 'Rehobot') as Jemaat['unit'],
    tglBaptis: normalizeDate(raw.Tgl_Baptis || raw.tglBaptis),
    tglSidi: normalizeDate(raw.Tgl_Sidi || raw.tglSidi),
    tglNikah: normalizeDate(raw.Tgl_Nikah || raw.tglNikah),
    jabatanStruktural: (cleanStr(raw.Jabatan_Struktural || raw.jabatanStruktural) || 'None') as Jemaat['jabatanStruktural'],
    jabatanPelayan: (cleanStr(raw.Jabatan_Pelayan || raw.jabatanPelayan) || 'None') as Jemaat['jabatanPelayan'],
    wadahKategorial: (cleanStr(raw.Wadah_Kategorial || raw.wadahKategorial) || 'PAR') as Jemaat['wadahKategorial'],
    pengurusIntiWadah: (cleanStr(raw.Pengurus_Inti_Wadah || raw.pengurusIntiWadah) || 'None') as Jemaat['pengurusIntiWadah'],
    noHp: cleanStr(raw.No_HP || raw.noHp),
    email: cleanStr(raw.Email || raw.email),
    alamat: cleanStr(raw.Alamat || raw.alamat),
    keterangan: cleanStr(raw.Keterangan || raw.keterangan),
  };
}

export function mapSheetKunjungan(raw: Record<string, unknown>, index: number): KunjunganPastoral {
  return {
    id: cleanStr(raw.ID_Kunjungan || raw.ID || raw.id || `kunj-${index + 1}`),
    tanggal: normalizeDate(raw.Tanggal || raw.Tanggal_Kunjungan || raw.tanggal, new Date().toISOString().slice(0, 10)),
    sektor: (cleanStr(raw.Sektor || raw.sektor) || 'Filadelfia') as KunjunganPastoral['sektor'],
    unit: (cleanStr(raw.Unit || raw.unit) || 'Rehobot') as KunjunganPastoral['unit'],
    nkkTujuan: cleanStr(raw.NKK_Tujuan || raw.NKK || raw.nkkTujuan),
    keluargaTujuan: cleanStr(raw.Keluarga_Tujuan || raw.Keluarga || raw.keluargaTujuan),
    jenisKunjungan: (cleanStr(raw.Jenis_Kunjungan || raw.jenisKunjungan) || 'Rutin') as KunjunganPastoral['jenisKunjungan'],
    timPelayan: cleanStr(raw.Tim_Pelayan || raw.timPelayan),
    catatanDoa: cleanStr(raw.Catatan_Doa || raw.catatanDoa),
    statusTindakLanjut: (cleanStr(raw.Status_Tindak_Lanjut || raw.statusTindakLanjut) || 'Selesai') as KunjunganPastoral['statusTindakLanjut'],
  };
}

export function mapSheetInventaris(raw: Record<string, unknown>, index: number): Inventaris {
  return {
    id: cleanStr(raw.ID || raw.id || `inv-${index + 1}`),
    kodeBarang: cleanStr(raw.Kode_Barang || raw.kodeBarang || `INV-${index + 1}`),
    namaBarang: cleanStr(raw.Nama_Barang || raw.namaBarang),
    kategori: (cleanStr(raw.Kategori || raw.kategori) || 'Lain-lain') as Inventaris['kategori'],
    lokasi: cleanStr(raw.Lokasi || raw.lokasi),
    jumlah: Number(raw.Jumlah || raw.jumlah || 1),
    satuan: cleanStr(raw.Satuan || raw.satuan) || 'Unit',
    tahunPerolehan: Number(raw.Tahun_Perolehan || raw.tahunPerolehan || new Date().getFullYear()),
    kondisi: (cleanStr(raw.Kondisi || raw.kondisi) || 'Baik') as Inventaris['kondisi'],
    keterangan: cleanStr(raw.Keterangan || raw.keterangan),
    fotoBase64: cleanStr(raw.Foto_Base64 || raw.fotoBase64 || raw.Foto_URL),
  };
}

export function mapSheetMutasi(raw: Record<string, unknown>, index: number): Mutasi {
  return {
    id: cleanStr(raw.ID_Mutasi || raw.ID || raw.id || `mut-${index + 1}`),
    tanggalMutasi: normalizeDate(raw.Tanggal_Mutasi || raw.tanggalMutasi, new Date().toISOString().slice(0, 10)),
    nik: cleanStr(raw.NIK || raw.nik),
    nama: cleanStr(raw.Nama || raw.nama),
    nkkLama: cleanStr(raw.NKK_Lama || raw.nkkLama),
    nkkBaru: cleanStr(raw.NKK_Baru || raw.nkkBaru),
    jenisMutasi: (cleanStr(raw.Jenis_Mutasi || raw.jenisMutasi) || 'Pindah Domisili') as Mutasi['jenisMutasi'],
    keterangan: cleanStr(raw.Keterangan || raw.keterangan),
  };
}

/**
 * Converts frontend camelCase entities into Google Sheets Title_Snake_Case + alias payloads
 */
export function toSheetPayload(sheet: string, data: Record<string, unknown>): Record<string, unknown> {
  if (sheet === 'Users') {
    const u = data as Partial<User>;
    return {
      ...data,
      ID_User: u.id || (data as any).ID_User || '',
      Username: u.username || (data as any).Username || '',
      Password: u.password || (data as any).Password || '',
      Nama_Lengkap: u.nama || (data as any).Nama_Lengkap || '',
      Role: u.role || (data as any).Role || '',
      Jabatan: u.jabatan || (data as any).Jabatan || '',
      Foto_Base64: '',
    };
  }
  if (sheet === 'Jemaat') {
    const j = data as Partial<Jemaat>;
    return {
      ...data,
      ID: j.id || (data as any).ID || '',
      ID_Jemaat: j.id || (data as any).ID || '',
      NIK: j.nik || (data as any).NIK || '',
      NKK: j.nkk || (data as any).NKK || '',
      Nama: j.nama || (data as any).Nama || '',
      Nama_Lengkap: j.nama || (data as any).Nama || '',
      Jenis_Kelamin: j.jenisKelamin || (data as any).Jenis_Kelamin || '',
      Tempat_Lahir: j.tempatLahir || (data as any).Tempat_Lahir || '',
      Tanggal_Lahir: j.tanggalLahir || (data as any).Tanggal_Lahir || '',
      Umur: j.umur ?? (data as any).Umur ?? '',
      Golongan_Darah: j.golonganDarah || (data as any).Golongan_Darah || '',
      Pendidikan: j.pendidikan || (data as any).Pendidikan || '',
      Pekerjaan: j.pekerjaan || (data as any).Pekerjaan || '',
      Pekerjaan_Lainnya: j.pekerjaanLainnya || (data as any).Pekerjaan_Lainnya || '',
      Disabilitas: j.disabilitas || (data as any).Disabilitas || '',
      Disabilitas_Detail: j.disabilitasDetail || (data as any).Disabilitas_Detail || '',
      Status_Sosial: j.statusSosial || (data as any).Status_Sosial || '',
      Hubungan_Keluarga: j.hubunganKeluarga || (data as any).Hubungan_Keluarga || '',
      Status_Keanggotaan: j.statusKeanggotaan || (data as any).Status_Keanggotaan || '',
      Sektor: j.sektor || (data as any).Sektor || '',
      Unit: j.unit || (data as any).Unit || '',
      Tgl_Baptis: j.tglBaptis || (data as any).Tgl_Baptis || '',
      Tgl_Sidi: j.tglSidi || (data as any).Tgl_Sidi || '',
      Tgl_Nikah: j.tglNikah || (data as any).Tgl_Nikah || '',
      Jabatan_Struktural: j.jabatanStruktural || (data as any).Jabatan_Struktural || '',
      Jabatan_Pelayan: j.jabatanPelayan || (data as any).Jabatan_Pelayan || '',
      Wadah_Kategorial: j.wadahKategorial || (data as any).Wadah_Kategorial || '',
      Pengurus_Inti_Wadah: j.pengurusIntiWadah || (data as any).Pengurus_Inti_Wadah || '',
      No_HP: j.noHp || (data as any).No_HP || '',
      Email: j.email || (data as any).Email || '',
      Alamat: j.alamat || (data as any).Alamat || '',
      Keterangan: j.keterangan || (data as any).Keterangan || '',
      Foto_Base64: '',
    };
  }
  if (sheet === 'Kunjungan_Pastoral') {
    const k = data as Partial<KunjunganPastoral>;
    return {
      ...data,
      ID_Kunjungan: k.id || (data as any).ID_Kunjungan || '',
      ID: k.id || (data as any).ID || '',
      Tanggal: k.tanggal || (data as any).Tanggal || '',
      Tanggal_Kunjungan: k.tanggal || (data as any).Tanggal_Kunjungan || '',
      Sektor: k.sektor || (data as any).Sektor || '',
      Unit: k.unit || (data as any).Unit || '',
      NKK_Tujuan: k.nkkTujuan || (data as any).NKK_Tujuan || '',
      Keluarga_Tujuan: k.keluargaTujuan || (data as any).Keluarga_Tujuan || '',
      Jenis_Kunjungan: k.jenisKunjungan || (data as any).Jenis_Kunjungan || '',
      Tim_Pelayan: k.timPelayan || (data as any).Tim_Pelayan || '',
      Catatan_Doa: k.catatanDoa || (data as any).Catatan_Doa || '',
      Status_Tindak_Lanjut: k.statusTindakLanjut || (data as any).Status_Tindak_Lanjut || '',
      Foto_Base64: '',
    };
  }
  if (sheet === 'Inventaris') {
    const inv = data as Partial<Inventaris>;
    return {
      ...data,
      Kode_Barang: inv.kodeBarang || (data as any).Kode_Barang || '',
      ID: inv.id || (data as any).ID || '',
      Nama_Barang: inv.namaBarang || (data as any).Nama_Barang || '',
      Kategori: inv.kategori || (data as any).Kategori || '',
      Lokasi: inv.lokasi || (data as any).Lokasi || '',
      Jumlah: inv.jumlah ?? (data as any).Jumlah ?? 1,
      Satuan: inv.satuan || (data as any).Satuan || '',
      Tahun_Perolehan: inv.tahunPerolehan ?? (data as any).Tahun_Perolehan ?? '',
      Kondisi: inv.kondisi || (data as any).Kondisi || '',
      Keterangan: inv.keterangan || (data as any).Keterangan || '',
      Foto_Base64: inv.fotoBase64 || (data as any).Foto_Base64 || '',
    };
  }
  if (sheet === 'Mutasi') {
    const m = data as Partial<Mutasi>;
    return {
      ...data,
      ID_Mutasi: m.id || (data as any).ID_Mutasi || '',
      ID: m.id || (data as any).ID || '',
      Tanggal_Mutasi: m.tanggalMutasi || (data as any).Tanggal_Mutasi || '',
      NIK: m.nik || (data as any).NIK || '',
      Nama: m.nama || (data as any).Nama || '',
      NKK_Lama: m.nkkLama || (data as any).NKK_Lama || '',
      NKK_Baru: m.nkkBaru || (data as any).NKK_Baru || '',
      Jenis_Mutasi: m.jenisMutasi || (data as any).Jenis_Mutasi || '',
      Keterangan: m.keterangan || (data as any).Keterangan || '',
      Foto_Base64: '',
    };
  }
  return {
    ...data,
    Foto_Base64: (data as any).fotoBase64 || (data as any).Foto_Base64 || '',
  };
}

/**
 * Resets all database tables back to the initial church seed data
 */
export async function resetAllDataToSeed(): Promise<{ success: boolean; message: string }> {
  try {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.JEMAAT);
    localStorage.removeItem(STORAGE_KEYS.KUNJUNGAN);
    localStorage.removeItem(STORAGE_KEYS.INVENTARIS);
    localStorage.removeItem(STORAGE_KEYS.MUTASI);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);

    saveLocalDatabase({
      users: INITIAL_USERS,
      jemaat: INITIAL_JEMAAT,
      kunjungan: INITIAL_KUNJUNGAN,
      inventaris: INITIAL_INVENTARIS,
      mutasi: INITIAL_MUTASI,
      lastSync: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Database berhasil direset ke data default jemaat & 4 user GPI Getsemani.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal reset data';
    return { success: false, message: errorMsg };
  }
}

/**
 * Non-destructive health diagnostic for all 5 Google Sheets tabs
 */
export async function checkAllSheetsHealth(): Promise<SheetHealthStatus[]> {
  const sheets = ['Users', 'Jemaat', 'Kunjungan_Pastoral', 'Inventaris', 'Mutasi'];
  const apiUrl = getApiUrl();

  const checks = sheets.map(async (sheetName): Promise<SheetHealthStatus> => {
    try {
      const [getRes, probeRes] = await Promise.all([
        fetch(`${apiUrl}?action=GET_ALL&sheet=${sheetName}`),
        fetch(`${apiUrl}?action=UPDATE&sheet=${sheetName}`),
      ]);

      const getJson = await getRes.json().catch(() => ({ data: [] }));
      const probeJson = await probeRes.json().catch(() => ({ message: '' }));

      const rowCount = Array.isArray(getJson.data) ? getJson.data.length : 0;
      const probeMsg = String(probeJson.message || '');

      if (probeMsg.includes('number of columns in the range must be at least 1')) {
        return {
          sheet: sheetName,
          rowCount: 0,
          status: 'empty_no_header',
          firstHeader: '',
          message: `Baris 1 pada sheet "${sheetName}" masih kosong (belum ada header kolom).`,
        };
      }

      const headerMatch = probeMsg.match(/reading '([^']+)'/);
      const firstHeader = headerMatch ? headerMatch[1] : SHEET_HEADERS[sheetName]?.[0] || '';

      // Detect broken header in Users (e.g. data row USR-02/USR-03 sitting in row 1 instead of ID_User)
      if (sheetName === 'Users' && firstHeader && !['ID_User', 'ID', 'id', 'Username'].includes(firstHeader)) {
        return {
          sheet: sheetName,
          rowCount,
          status: 'broken_header',
          firstHeader,
          message: `Baris 1 sheet "Users" berisi data ("${firstHeader}"), bukan judul kolom (ID_User, Username, Password, Nama_Lengkap, Role, Jabatan).`,
        };
      }

      if (sheetName === 'Jemaat' && firstHeader && !['ID', 'ID_Jemaat', 'NIK', 'NKK', 'Nama'].includes(firstHeader)) {
        return {
          sheet: sheetName,
          rowCount,
          status: 'broken_header',
          firstHeader,
          message: `Baris 1 sheet "Jemaat" berisi "${firstHeader}", bukan judul kolom standar.`,
        };
      }

      return {
        sheet: sheetName,
        rowCount,
        status: 'ok',
        firstHeader,
        message: rowCount > 0 ? `Header valid (${firstHeader}) · ${rowCount} baris` : `Header valid (${firstHeader}) · Siap diisi`,
      };
    } catch (err) {
      return {
        sheet: sheetName,
        rowCount: 0,
        status: 'error',
        firstHeader: '',
        message: err instanceof Error ? err.message : 'Gagal menghubungi endpoint Google Apps Script',
      };
    }
  });

  return Promise.all(checks);
}

/**
 * Syncs with Google Sheets via Apps Script endpoint using ?action=GET_ALL&sheet=...
 */
export async function syncWithGoogleSheets(
  currentDb: AppDatabase
): Promise<{ success: boolean; message: string; updatedDb?: AppDatabase; warnings?: string[] }> {
  const apiUrl = getApiUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const sheetsToFetch = ['Users', 'Jemaat', 'Kunjungan_Pastoral', 'Inventaris', 'Mutasi'];
    const fetchPromises = sheetsToFetch.map(async (sheetName) => {
      try {
        const res = await fetch(`${apiUrl}?action=GET_ALL&sheet=${sheetName}`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!res.ok) return { sheet: sheetName, data: [] as Record<string, unknown>[] };
        const json = await res.json();
        return {
          sheet: sheetName,
          data: Array.isArray(json.data)
            ? (json.data as Record<string, unknown>[])
            : ([] as Record<string, unknown>[]),
          status: json.status,
        };
      } catch {
        return { sheet: sheetName, data: [] as Record<string, unknown>[] };
      }
    });

    const results = await Promise.all(fetchPromises);
    clearTimeout(timeoutId);

    const usersResult = results.find((r) => r.sheet === 'Users');
    const jemaatResult = results.find((r) => r.sheet === 'Jemaat');
    const kunjunganResult = results.find((r) => r.sheet === 'Kunjungan_Pastoral');
    const inventarisResult = results.find((r) => r.sheet === 'Inventaris');
    const mutasiResult = results.find((r) => r.sheet === 'Mutasi');

    let updatedUsers = currentDb.users;
    let updatedJemaat = currentDb.jemaat;
    let updatedKunjungan = currentDb.kunjungan;
    let updatedInventaris = currentDb.inventaris;
    let updatedMutasi = currentDb.mutasi;

    const statsInfo: string[] = [];
    const warnings: string[] = [];

    if (usersResult && usersResult.data.length > 0) {
      const mappedUsers = usersResult.data.map(mapSheetUser).filter((u) => u.username !== '');
      if (mappedUsers.length > 0) {
        // Ensure all 4 required user slots exist by ID if sheet only has partial rows
        const existingSheetIds = new Set(mappedUsers.map((u) => u.id));
        const missingLocal = INITIAL_USERS.filter((iu) => !existingSheetIds.has(iu.id));
        updatedUsers = [...mappedUsers, ...missingLocal];
        statsInfo.push(`${mappedUsers.length} pengguna dari Sheet`);
      } else {
        warnings.push('Sheet "Users" belum memiliki baris header yang sesuai (gunakan format ID_User, Username, Password, Nama_Lengkap, Role, Jabatan).');
      }
    } else {
      warnings.push('Sheet "Users" kosong atau baris 1 belum berupa header kolom.');
    }

    if (jemaatResult && jemaatResult.data.length > 0) {
      const mappedJemaat = jemaatResult.data.map(mapSheetJemaat).filter((j) => j.nama !== '');
      if (mappedJemaat.length > 0) {
        updatedJemaat = mappedJemaat;
        statsInfo.push(`${updatedJemaat.length} jemaat`);
      }
    } else {
      warnings.push('Sheet "Jemaat" di Google Sheet masih kosong (mempertahankan data lokal).');
    }

    if (kunjunganResult && kunjunganResult.data.length > 0) {
      const mappedKunjungan = kunjunganResult.data.map(mapSheetKunjungan).filter((k) => k.keluargaTujuan !== '');
      if (mappedKunjungan.length > 0) {
        updatedKunjungan = mappedKunjungan;
        statsInfo.push(`${updatedKunjungan.length} kunjungan`);
      }
    }

    if (inventarisResult && inventarisResult.data.length > 0) {
      const mappedInventaris = inventarisResult.data.map(mapSheetInventaris).filter((i) => i.namaBarang !== '');
      if (mappedInventaris.length > 0) {
        updatedInventaris = mappedInventaris;
        statsInfo.push(`${updatedInventaris.length} inventaris`);
      }
    }

    if (mutasiResult && mutasiResult.data.length > 0) {
      const mappedMutasi = mutasiResult.data.map(mapSheetMutasi).filter((m) => m.nama !== '');
      if (mappedMutasi.length > 0) {
        updatedMutasi = mappedMutasi;
        statsInfo.push(`${updatedMutasi.length} mutasi`);
      }
    }

    const now = new Date().toISOString();
    const updatedDb: AppDatabase = {
      users: updatedUsers,
      jemaat: updatedJemaat,
      kunjungan: updatedKunjungan,
      inventaris: updatedInventaris,
      mutasi: updatedMutasi,
      lastSync: now,
      isOnline: true,
    };

    saveLocalDatabase(updatedDb);

    const detailMsg = statsInfo.length > 0
      ? `Data tersinkron dari Google Sheets (${statsInfo.join(', ')}).`
      : 'Terhubung ke Google Sheets, namun sheet Users/Jemaat masih kosong atau belum memiliki header kolom. Buka menu "User & Google Sheet" untuk perbaikan.';

    return {
      success: statsInfo.length > 0,
      message: detailMsg,
      updatedDb,
      warnings,
    };
  } catch (error: unknown) {
    console.warn('Apps Script sync fallback to local cache:', error);
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
    return {
      success: false,
      message: 'Tidak dapat membaca respon Google Sheets, menggunakan penyimpanan lokal.',
      updatedDb: {
        ...currentDb,
        lastSync: now,
        isOnline: false,
      },
    };
  }
}

/**
 * Dispatch an action to Google Apps Script and inspect the JSON response
 */
export async function postActionToAppsScript(
  action: string,
  sheet: string,
  data: Record<string, unknown> | unknown
): Promise<{ success: boolean; message: string }> {
  const apiUrl = getApiUrl();
  try {
    const rawObj = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
    const safeData = toSheetPayload(sheet, rawObj);

    const res = await fetch(apiUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        sheet,
        data: safeData,
        timestamp: new Date().toISOString(),
      }),
    });

    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.status === 'error') {
        console.warn(`Apps Script error on ${sheet} (${action}):`, json.message);
        return { success: false, message: String(json.message || 'Gagal menulis ke Google Sheets') };
      }
      return { success: true, message: String(json.message || 'Berhasil disinkronkan ke Google Sheets') };
    } catch {
      return { success: res.ok, message: res.ok ? 'Terkirim ke Google Sheets' : 'Respon tidak valid' };
    }
  } catch (err) {
    console.warn('Background post to Apps Script error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gagal menghubungi Google Apps Script',
    };
  }
}

/**
 * Attempts to initialize sheets (if updated Code.gs supports INIT_SHEETS) and push missing local records to Google Sheets
 */
export async function pushLocalDataToGoogleSheets(db: AppDatabase): Promise<{
  success: boolean;
  pushedCounts: Record<string, number>;
  errors: string[];
}> {
  const apiUrl = getApiUrl();
  const pushedCounts: Record<string, number> = {
    Users: 0,
    Jemaat: 0,
    Kunjungan_Pastoral: 0,
    Inventaris: 0,
    Mutasi: 0,
  };
  const errors: string[] = [];

  // Step 1: Try calling INIT_SHEETS in case user updated Code.gs
  try {
    await fetch(`${apiUrl}?action=INIT_SHEETS`);
  } catch {
    // Ignore if older Code.gs returns "Aksi tidak dikenali"
  }

  // Step 2: Fetch current sheet contents to avoid duplicate rows
  const fetchExisting = async (sheet: string): Promise<Record<string, unknown>[]> => {
    try {
      const r = await fetch(`${apiUrl}?action=GET_ALL&sheet=${sheet}`);
      const j = await r.json();
      return Array.isArray(j.data) ? j.data : [];
    } catch {
      return [];
    }
  };

  // Push Users
  const existingUsers = await fetchExisting('Users');
  const existingUsernames = new Set(existingUsers.map((u) => cleanStr(u.Username || u.username).toLowerCase()));
  for (const user of db.users) {
    if (!existingUsernames.has(user.username.toLowerCase())) {
      const res = await postActionToAppsScript('ADD', 'Users', user as unknown as Record<string, unknown>);
      if (res.success) pushedCounts.Users += 1;
      else if (!errors.some((e) => e.includes('Users:'))) errors.push(`Users: ${res.message}`);
    }
  }

  // Push Jemaat
  const existingJemaat = await fetchExisting('Jemaat');
  const existingNiks = new Set(existingJemaat.map((j) => cleanStr(j.NIK || j.nik)));
  for (const item of db.jemaat) {
    if (!existingNiks.has(item.nik)) {
      const res = await postActionToAppsScript('ADD', 'Jemaat', item as unknown as Record<string, unknown>);
      if (res.success) pushedCounts.Jemaat += 1;
      else {
        if (!errors.some((e) => e.includes('Jemaat:'))) errors.push(`Jemaat: ${res.message}`);
        break; // Stop immediately if sheet lacks headers
      }
    }
  }

  // Push Kunjungan
  const existingKunj = await fetchExisting('Kunjungan_Pastoral');
  const existingKunjIds = new Set(existingKunj.map((k) => cleanStr(k.ID_Kunjungan || k.ID || k.id)));
  for (const k of db.kunjungan) {
    if (!existingKunjIds.has(k.id)) {
      const res = await postActionToAppsScript('ADD', 'Kunjungan_Pastoral', k as unknown as Record<string, unknown>);
      if (res.success) pushedCounts.Kunjungan_Pastoral += 1;
      else {
        if (!errors.some((e) => e.includes('Kunjungan_Pastoral:'))) errors.push(`Kunjungan_Pastoral: ${res.message}`);
        break;
      }
    }
  }

  // Push Inventaris
  const existingInv = await fetchExisting('Inventaris');
  const existingInvCodes = new Set(existingInv.map((i) => cleanStr(i.Kode_Barang || i.kodeBarang)));
  for (const inv of db.inventaris) {
    if (!existingInvCodes.has(inv.kodeBarang)) {
      const res = await postActionToAppsScript('ADD', 'Inventaris', inv as unknown as Record<string, unknown>);
      if (res.success) pushedCounts.Inventaris += 1;
      else {
        if (!errors.some((e) => e.includes('Inventaris:'))) errors.push(`Inventaris: ${res.message}`);
        break;
      }
    }
  }

  // Push Mutasi
  const existingMut = await fetchExisting('Mutasi');
  const existingMutIds = new Set(existingMut.map((m) => cleanStr(m.ID_Mutasi || m.ID || m.id)));
  for (const m of db.mutasi) {
    if (!existingMutIds.has(m.id)) {
      const res = await postActionToAppsScript('ADD', 'Mutasi', m as unknown as Record<string, unknown>);
      if (res.success) pushedCounts.Mutasi += 1;
      else {
        if (!errors.some((e) => e.includes('Mutasi:'))) errors.push(`Mutasi: ${res.message}`);
        break;
      }
    }
  }

  return {
    success: errors.length === 0,
    pushedCounts,
    errors,
  };
}
