import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Jemaat } from '../../types';
import { BarcodeRenderer } from '../BarcodeRenderer';
import { exportElementToPDF } from '../../services/exportService';
import { JemaatProfileModal } from '../jemaat/JemaatProfileModal';
import {
  Search,
  Printer,
  Download,
  CreditCard,
  UserCheck,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  ArrowRightCircle,
} from 'lucide-react';

export const KartuAnggotaView: React.FC = () => {
  const { jemaat, selectedJemaatForKtp, setSelectedJemaatForKtp } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeJemaat, setActiveJemaat] = useState<Jemaat | null>(
    selectedJemaatForKtp || jemaat[0] || null
  );
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [photoColor, setPhotoColor] = useState<'blue' | 'red'>('blue');
  const [profileModalJemaat, setProfileModalJemaat] = useState<Jemaat | null>(null);

  useEffect(() => {
    if (selectedJemaatForKtp) {
      setActiveJemaat(selectedJemaatForKtp);
    }
  }, [selectedJemaatForKtp]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return jemaat.slice(0, 10);
    const q = searchTerm.toLowerCase();
    return jemaat.filter(
      (j) =>
        j.nama.toLowerCase().includes(q) ||
        j.nik.includes(q) ||
        j.nkk.toLowerCase().includes(q) ||
        j.sektor.toLowerCase().includes(q)
    );
  }, [jemaat, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!activeJemaat) return;
    setIsExportingPdf(true);
    await exportElementToPDF(
      'ktp-dukcapil-card',
      `eKTP_Jemaat_Dukcapil_${activeJemaat.nik}_${activeJemaat.nama.replace(/\s+/g, '_')}`,
      'p',
      'a4'
    );
    setIsExportingPdf(false);
  };

  // Format birthdate to DD-MM-YYYY
  const formattedBirthDate = useMemo(() => {
    if (!activeJemaat?.tanggalLahir) return '';
    const parts = activeJemaat.tanggalLahir.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return activeJemaat.tanggalLahir;
  }, [activeJemaat]);

  // Lookup Ketua PHMJ dynamically from Data Jemaat
  const ketuaPhmj = useMemo(() => {
    return jemaat.find((j) => j.jabatanStruktural === 'Ketua PHMJ') || null;
  }, [jemaat]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Identitas Resmi Kependudukan Jemaat
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kartu Tanda Penduduk (e-KTP) Jemaat Dukcapil
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dibuat persis mengikuti tampilan, proporsi, dan ukuran standar e-KTP Dukcapil RI (ID-1 / 85.6 × 53.98 mm).
          </p>
        </div>

        {activeJemaat && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Menyiapkan PDF...' : 'Download PDF e-KTP'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Ukuran KTP</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container: Search Panel + KTP Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Search & Member List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>Cari Anggota Jemaat</span>
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ketik NIK, NKK, atau Nama..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="text-[11px] text-slate-500">
              Menampilkan {searchResults.length} hasil jemaat
            </div>

            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveJemaat(item);
                    setSelectedJemaatForKtp(item);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl transition-all flex items-center justify-between ${
                    activeJemaat?.id === item.id
                      ? 'bg-amber-500/15 border border-amber-400/40 text-slate-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs leading-tight font-medium">{item.nama}</span>
                      {item.statusMutasi === 'Akan Mutasi' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          ⚠️ Akan Mutasi
                        </span>
                      )}
                      {item.statusKeanggotaan === 'Dinonaktifkan' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          ⛔ Tidak Aktif
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      NIK: {item.nik}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sektor {item.sektor} ({item.unit}) · {item.wadahKategorial}
                    </div>
                  </div>
                  {activeJemaat?.id === item.id && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Exact e-KTP Dukcapil Card Preview */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {activeJemaat ? (
            <div className="w-full space-y-4">
              {/* NOTIFIKASI CEPAT STATUS MUTASI / NONAKTIF */}
              {activeJemaat.statusMutasi === 'Akan Mutasi' && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-400 rounded-2xl flex items-start justify-between gap-3 text-amber-950 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/30 text-amber-800 flex items-center justify-center shrink-0 border border-amber-400/50">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold uppercase text-[11px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                          ⚠️ Notifikasi Cepat Admin: Jemaat Akan Segera Melakukan Mutasi
                        </span>
                      </div>
                      <p className="mt-1 text-slate-800 font-medium">
                        Anggota jemaat ini ditandai dalam proses persiapan atestasi / mutasi.
                        {activeJemaat.rencanaMutasiDetail && (
                          <span className="block mt-0.5 text-amber-900 font-semibold italic">
                            &quot;{activeJemaat.rencanaMutasiDetail}&quot;
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Verifikasi status pelayanan & iuran sebelum surat atestasi pindah disahkan.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileModalJemaat(activeJemaat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 border border-amber-300 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profil & Mutasi</span>
                  </button>
                </div>
              )}

              {activeJemaat.statusKeanggotaan === 'Dinonaktifkan' && (
                <div className="p-3.5 bg-gradient-to-r from-rose-50 via-rose-100/40 to-rose-50 border-2 border-rose-400 rounded-2xl flex items-start justify-between gap-3 text-rose-950 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 border border-rose-300">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold uppercase text-[11px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                          ⛔ Status Anggota: Tidak Aktif / Dinonaktifkan
                        </span>
                      </div>
                      <p className="mt-1 text-slate-800 font-medium">
                        Warga jemaat ini telah dinonaktifkan dari daftar aktif (telah mutasi keluar atau wafat). Kartu tanda anggota ini berstatus arsip administratif.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileModalJemaat(activeJemaat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-900 bg-rose-200 hover:bg-rose-300 border border-rose-300 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail Profil</span>
                  </button>
                </div>
              )}

              {/* Photo background color toggle */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    Warna Latar Pas Foto e-KTP Dukcapil:
                  </span>
                  <button
                    onClick={() => setProfileModalJemaat(activeJemaat)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors ml-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lihat Profil Lengkap</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPhotoColor('blue')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      photoColor === 'blue'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Biru (Tahun Genap)</span>
                  </button>
                  <button
                    onClick={() => setPhotoColor('red')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      photoColor === 'red'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Merah (Tahun Ganjil)</span>
                  </button>
                </div>
              </div>

              {/* THE AUTHENTIC DUKCAPIL E-KTP CARD */}
              <div
                id="ktp-dukcapil-card"
                className="w-full max-w-[580px] mx-auto rounded-[18px] shadow-2xl border-2 border-slate-300 p-5 text-slate-900 relative overflow-hidden select-none"
                style={{
                  aspectRatio: '85.6 / 53.98', // Exact ISO/IEC 7810 ID-1 standard ratio (1.586)
                  minHeight: '350px',
                  background: 'linear-gradient(135deg, #a7d3f2 0%, #6fb6e8 40%, #5097dc 70%, #87c5f5 100%)',
                  boxShadow: '0 12px 30px -4px rgba(12, 31, 56, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                }}
              >
                {/* Micro-guilloche security wave pattern lines in background */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 50% 50%, transparent 20%, rgba(14, 53, 107, 0.15) 21%, transparent 22%),
                      repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(30, 64, 175, 0.08) 4px, rgba(30, 64, 175, 0.08) 5px)
                    `,
                  }}
                />

                {/* Subtle Garuda / Church Seal Watermark Center */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <img
                    src="/src/assets/images/church_emblem_1794476998536.jpg"
                    alt="Watermark"
                    className="w-48 h-48 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* TOP HEADER KARTU ANGGOTA JEMAAT */}
                <div className="relative text-center border-b border-sky-900/40 pb-1.5">
                  <h3 className="text-xs sm:text-sm font-black tracking-widest uppercase text-slate-950 font-serif">
                    GPI PAPUA · KLASIS SORONG
                  </h3>
                  <h4 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-slate-900 font-serif">
                    JEMAAT GETSEMANI
                  </h4>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-sky-950 mt-0.5">
                    KARTU ANGGOTA JEMAAT
                  </div>
                </div>

                {/* NIK DISPLAY (OCR STYLE) */}
                <div className="relative mt-2 flex items-center text-xs sm:text-sm font-mono font-black text-slate-950 tracking-wider">
                  <span className="w-28 text-[11px] font-sans font-bold tracking-normal uppercase text-slate-900">
                    NIK
                  </span>
                  <span className="text-base sm:text-lg font-mono font-black tracking-widest text-slate-950">
                    : {activeJemaat.nik}
                  </span>
                </div>

                {/* MAIN CONTENT SPLIT: BIODATA DATA JEMAAT (LEFT) & PHOTO + CHIP (RIGHT) */}
                <div className="relative mt-1.5 grid grid-cols-12 gap-2 text-[10px] sm:text-[11px] leading-tight font-medium text-slate-950">
                  {/* Left Column: Hanya Field yang Ada di Data Jemaat */}
                  <div className="col-span-8 space-y-0.5 pt-0.5">
                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Nama</span>
                      <span className="font-bold uppercase truncate">: {activeJemaat.nama}</span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Tempat/Tgl Lahir</span>
                      <span className="uppercase truncate">: {activeJemaat.tempatLahir}, {formattedBirthDate} ({activeJemaat.umur} thn)</span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-28 text-slate-800 shrink-0">Jenis Kelamin</span>
                      <span className="uppercase">: {activeJemaat.jenisKelamin === 'Laki-laki' ? 'LAKI-LAKI' : 'PEREMPUAN'}</span>
                      <span className="ml-2 text-[10px] text-slate-800">Gol:</span>
                      <span className="font-bold ml-1">{activeJemaat.golonganDarah}</span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Alamat</span>
                      <span className="uppercase truncate">: {activeJemaat.alamat || '-'}</span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0 font-semibold text-sky-950">Sektor / Unit</span>
                      <span className="font-bold uppercase text-sky-950 truncate">: {activeJemaat.sektor} / {activeJemaat.unit}</span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Hubungan Kel.</span>
                      <span className="uppercase truncate">
                        : {activeJemaat.hubunganKeluarga}
                        {activeJemaat.statusSosial !== 'Umum' ? ` (${activeJemaat.statusSosial})` : ''}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Pendidikan</span>
                      <span className="uppercase truncate">: {activeJemaat.pendidikan}</span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Pekerjaan</span>
                      <span className="uppercase truncate">: {activeJemaat.pekerjaan === 'Lain-lain' ? activeJemaat.pekerjaanLainnya || 'LAIN-LAIN' : activeJemaat.pekerjaan}</span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Wadah Kategorial</span>
                      <span className="font-bold uppercase truncate">
                        : {activeJemaat.wadahKategorial}
                        {activeJemaat.pengurusIntiWadah !== 'None' ? ` (${activeJemaat.pengurusIntiWadah})` : ''}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Jabatan</span>
                      <span className="uppercase truncate">
                        : {[
                          activeJemaat.jabatanStruktural !== 'None' ? activeJemaat.jabatanStruktural : '',
                          activeJemaat.jabatanPelayan !== 'None' ? activeJemaat.jabatanPelayan : '',
                        ]
                          .filter(Boolean)
                          .join(' / ') || '-'}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">Baptis / Sidi</span>
                      <span className="font-mono text-[10px] truncate">
                        : {activeJemaat.tglBaptis || '-'} / {activeJemaat.tglSidi || '-'}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-slate-800 shrink-0">No. HP</span>
                      <span className="font-mono truncate">: {activeJemaat.noHp || '-'}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-28 text-slate-800 shrink-0">Status Anggota</span>
                      <span className="font-bold uppercase truncate flex items-center gap-1">
                        <span>: {activeJemaat.statusKeanggotaan}</span>
                        {activeJemaat.statusMutasi === 'Akan Mutasi' && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-amber-300 text-amber-950 font-black border border-amber-500">
                            AKAN MUTASI
                          </span>
                        )}
                        {activeJemaat.statusKeanggotaan === 'Dinonaktifkan' && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-rose-300 text-rose-950 font-black border border-rose-500">
                            NONAKTIF
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Smart Card Microchip + Pas Foto 3x4 + PHMJ */}
                  <div className="col-span-4 flex flex-col items-center justify-between">
                    {/* Simulated Gold Smart Card Microchip */}
                    <div className="w-10 h-8 rounded-sm bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-600 p-0.5 shadow-xs mb-1 flex items-center justify-center">
                      <div className="w-full h-full border border-amber-700/50 rounded-2xs flex flex-col justify-between p-0.5">
                        <div className="w-full h-0.5 bg-amber-700/40" />
                        <div className="flex justify-between">
                          <span className="w-1.5 h-1.5 rounded-full border border-amber-800" />
                          <span className="w-1.5 h-1.5 rounded-full border border-amber-800" />
                        </div>
                        <div className="w-full h-0.5 bg-amber-700/40" />
                      </div>
                    </div>

                    {/* Pas Foto 3x4 */}
                    <div
                      className={`w-24 h-32 rounded-md shadow-md border-2 border-white/80 overflow-hidden flex flex-col items-center justify-center text-white relative transition-colors ${
                        photoColor === 'blue'
                          ? 'bg-gradient-to-b from-blue-600 to-blue-800'
                          : 'bg-gradient-to-b from-rose-600 to-rose-800'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white mb-1 shadow-inner">
                        <UserCheck className="w-8 h-8" />
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white/90">
                        PAS FOTO 3X4
                      </span>
                      <span className="text-[7px] text-white/80 font-mono mt-0.5 uppercase">
                        {activeJemaat.wadahKategorial}
                      </span>

                      {/* Small Hologram Indicator at bottom corner of photo */}
                      <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-300 via-amber-200 to-indigo-400 opacity-80 border border-white/80" />
                    </div>

                    {/* Signature Area */}
                    <div className="text-center text-[8px] text-slate-900 mt-1 leading-tight">
                      <div className="font-bold uppercase">JEMAAT GETSEMANI</div>
                      <div className="font-semibold text-[7px] text-slate-700 uppercase">
                        KETUA PHMJ
                      </div>
                      <div className="font-bold underline text-[7.5px] mt-1.5 text-slate-950 uppercase max-w-[125px] truncate">
                        {ketuaPhmj ? ketuaPhmj.nama : 'PHMJ GETSEMANI'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM EDGE: BARCODE CODE128 NKK */}
                <div className="relative mt-2 pt-1 border-t border-sky-900/30 flex items-center justify-between px-2 bg-white/70 rounded-md backdrop-blur-2xs">
                  <div className="text-[8px] font-mono font-bold text-slate-800">
                    NKK: {activeJemaat.nkk}
                  </div>
                  <BarcodeRenderer value={activeJemaat.nkk} width={1.1} height={20} fontSize={8} />
                </div>
              </div>

              {/* Informative Guidance */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Ukuran blanko e-KTP di atas sesuai dengan standar Dukcapil RI (ISO ID-1 85.6 × 53.98 mm). Tombol <strong>Cetak Ukuran KTP</strong> akan menghasilkan cetakan dengan proporsi fisik kartu asli.
                </span>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Pilih anggota jemaat dari daftar di sebelah kiri untuk melihat kartu identitas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Detail & Mutation Action Modal */}
      {profileModalJemaat && (
        <JemaatProfileModal
          jemaat={profileModalJemaat}
          onClose={() => {
            // Refresh activeJemaat if it was edited
            const updated = jemaat.find((j) => j.id === profileModalJemaat.id) || profileModalJemaat;
            setActiveJemaat(updated);
            setProfileModalJemaat(null);
          }}
        />
      )}
    </div>
  );
};
