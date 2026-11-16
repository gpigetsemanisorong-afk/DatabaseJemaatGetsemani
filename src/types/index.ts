export type UserRole = 'Super Admin' | 'Admin / Sekretariat' | 'Pendeta / Majelis Jemaat';

export interface User {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: UserRole;
  jabatan?: string;
}

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type GolonganDarah = 'A' | 'B' | 'AB' | 'O' | '-';

export type Pendidikan = 
  | 'Tidak sekolah'
  | 'SD'
  | 'SMP'
  | 'SMA'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'S1'
  | 'S2'
  | 'S3';

export type PekerjaanUtama = 
  | 'ASN'
  | 'TNI'
  | 'POLRI'
  | 'Karyawan Swasta'
  | 'Karyawan BUMN/BUMD'
  | 'Wirausaha'
  | 'Petani'
  | 'Peternak'
  | 'Nelayan'
  | 'Tukang/Buruh'
  | 'Driver'
  | 'Mahasiswa'
  | 'Pelajar'
  | 'Ibu Rumah Tangga'
  | 'Pensiunan'
  | 'Pendeta/Pelayan Firman'
  | 'Lain-lain';

export type StatusSosial = 'Umum' | 'Duda' | 'Janda' | 'Yatim' | 'Piatu' | 'Yatim Piatu';

export type HubunganKeluarga = 
  | 'Kepala Keluarga'
  | 'Pasangan'
  | 'Anak'
  | 'Orang Tua'
  | 'Saudara';

export type StatusKeanggotaan = 'Jemaat Tetap' | 'Simpatisan' | 'Dinonaktifkan';

export type StatusMutasi = 'Normal' | 'Akan Mutasi' | 'Sudah Mutasi';

export type SektorName = 'Filadelfia' | 'Petra';
export type UnitName = 'Rehobot' | 'Silo' | 'Pniel' | 'Siloam';

export type JabatanStruktural = 
  | 'None'
  | 'Ketua PHMJ'
  | 'Waket PHMJ'
  | 'Sekretaris PHMJ'
  | 'Wasek PHMJ'
  | 'Bendahara PHMJ'
  | 'Bendahara Barang PHMJ';

export type JabatanPelayan = 'None' | 'Penatua' | 'Syamas';

export type WadahKategorial = 'PAR' | 'PP' | 'PERPRI' | 'PERWATA' | 'LANSIA';

export type JabatanWadah = 'None' | 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Anggota';

export interface Jemaat {
  id: string;
  nik: string; // 16 digits
  nkk: string; // 18 chars
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  umur: number;
  golonganDarah: GolonganDarah;
  pendidikan: Pendidikan;
  pekerjaan: PekerjaanUtama;
  pekerjaanLainnya?: string;
  disabilitas: 'Tidak' | 'Fisik' | 'Netra' | 'Rungu' | 'Mental' | 'Lainnya';
  disabilitasDetail?: string;
  statusSosial: StatusSosial;
  hubunganKeluarga: HubunganKeluarga;
  statusKeanggotaan: StatusKeanggotaan;
  statusMutasi?: StatusMutasi;
  rencanaMutasiDetail?: string;
  sektor: SektorName;
  unit: UnitName;
  tglBaptis?: string;
  tglSidi?: string;
  tglNikah?: string;
  jabatanStruktural: JabatanStruktural;
  jabatanPelayan: JabatanPelayan;
  wadahKategorial: WadahKategorial;
  pengurusIntiWadah: JabatanWadah;
  noHp: string;
  email: string;
  alamat: string;
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type JenisKunjungan = 'Rutin' | 'Sakit' | 'Kedukaan' | 'Syukur' | 'Khusus';
export type StatusTindakLanjut = 'Selesai' | 'Perlu Kunjungan Lanjutan' | 'Didoakan Khusus' | 'Dalam Perhatian Majelis';

export interface KunjunganPastoral {
  id: string;
  tanggal: string; // YYYY-MM-DD
  sektor: SektorName;
  unit: UnitName;
  nkkTujuan: string;
  keluargaTujuan: string;
  jenisKunjungan: JenisKunjungan;
  timPelayan: string;
  catatanDoa: string;
  statusTindakLanjut: StatusTindakLanjut;
  createdAt?: string;
}

export type KondisiBarang = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
export type KategoriBarang = 
  | 'Elektronik & Sound System'
  | 'Perabot & Mebel'
  | 'Peralatan Sakramen & Ibadah'
  | 'Kendaraan'
  | 'Bangunan & Sarana'
  | 'Dokumen & Arsip'
  | 'Lain-lain';

export interface Inventaris {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: KategoriBarang;
  lokasi: string;
  jumlah: number;
  satuan: string;
  tahunPerolehan: number;
  kondisi: KondisiBarang;
  keterangan: string;
  fotoBase64?: string;
  createdAt?: string;
}

export type JenisMutasi = 
  | 'Menikah (KK Baru)'
  | 'Meninggal Dunia'
  | 'Atestasi Keluar'
  | 'Pindah Agama'
  | 'Pindah Domisili';

export interface Mutasi {
  id: string;
  tanggalMutasi: string; // YYYY-MM-DD
  nik: string;
  nama: string;
  nkkLama: string;
  nkkBaru?: string;
  jenisMutasi: JenisMutasi;
  keterangan: string;
  createdAt?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
