import React from 'react';
import { useApp } from '../../context/AppContext';
import { Jemaat } from '../../types';
import { BarcodeRenderer } from '../BarcodeRenderer';
import {
  X,
  User,
  AlertTriangle,
  UserX,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  CreditCard,
  Home,
  Edit,
  ArrowRightLeft,
  Sparkles,
  MessageCircle,
  Clock,
} from 'lucide-react';

interface JemaatProfileModalProps {
  isOpen?: boolean;
  onClose: () => void;
  jemaat: Jemaat | null;
  onEdit?: (j: Jemaat) => void;
}

export const JemaatProfileModal: React.FC<JemaatProfileModalProps> = ({
  isOpen = true,
  onClose,
  jemaat,
  onEdit,
}) => {
  const {
    updateJemaat,
    setSelectedNkkForKK,
    setSelectedJemaatForKtp,
    setActiveMenu,
    addToast,
    canEditJemaat,
  } = useApp();

  if (!isOpen || !jemaat) return null;

  const isAkanMutasi = jemaat.statusMutasi === 'Akan Mutasi';
  const isTidakAktif = jemaat.statusKeanggotaan === 'Dinonaktifkan';

  const handleToggleAkanMutasi = async () => {
    if (!canEditJemaat) {
      addToast('error', 'Akses Ditolak', 'Anda tidak memiliki hak akses mengubah status jemaat.');
      return;
    }
    const newStatus = isAkanMutasi ? 'Normal' : 'Akan Mutasi';
    const detail = isAkanMutasi ? '' : 'Ditandai oleh admin untuk persiapan surat atestasi/mutasi';
    await updateJemaat(jemaat.id, {
      statusMutasi: newStatus,
      rencanaMutasiDetail: detail,
    });
    addToast(
      'success',
      'Status Mutasi Diperbarui',
      isAkanMutasi
        ? `Tanda mutasi untuk ${jemaat.nama} telah dicabut (Status: Normal).`
        : `Anggota ${jemaat.nama} berhasil ditandai "Akan Segera Mutasi".`
    );
  };

  const handleOpenKtp = () => {
    setSelectedJemaatForKtp(jemaat);
    setActiveMenu('kelola-kartu-anggota');
    onClose();
  };

  const handleOpenKK = () => {
    setSelectedNkkForKK(jemaat.nkk);
    setActiveMenu('kelola-data-kk');
    onClose();
  };

  const handleOpenMutasi = () => {
    setActiveMenu('mutasi');
    onClose();
  };

  const createWhatsAppLink = () => {
    if (!jemaat.noHp) return '';
    let phone = jemaat.noHp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const msg = encodeURIComponent(
      `Syalom ${jemaat.jenisKelamin === 'Laki-laki' ? 'Bapak/Sdr.' : 'Ibu/Sdri.'} ${jemaat.nama},\n\nSalam damai sejahtera dari Sekretariat GPI Getsemani Sorong.\n\n`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111116] text-slate-900 dark:text-zinc-100 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-amber-500/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#09090b] via-[#1a140a] to-[#0b0b0e] text-white p-5 sm:p-6 border-b border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border-2 border-amber-400/40 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
              {jemaat.nama.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Profil Anggota Jemaat
                </span>
                <span className="text-xs text-zinc-300">
                  Sektor {jemaat.sektor} ({jemaat.unit})
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                {jemaat.nama}
              </h3>
              <p className="text-xs text-zinc-300 font-mono mt-0.5">
                NIK: {jemaat.nik} · NKK: {jemaat.nkk}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. NOTIFIKASI INDIKATOR STATUS CEPAT (HIGH PRIORITY ALERT BANNER) */}
          {isAkanMutasi && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-500/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      ⚠️ Notifikasi Cepat: Jemaat Akan Segera Melakukan Mutasi
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                    Jemaat ini telah ditandai dalam status persiapan mutasi (pindah domisili, atestasi keluar, atau pernikahan). Segera lakukan koordinasi administrasi dengan Sekretariat & PHMJ.
                  </p>
                  {jemaat.rencanaMutasiDetail && (
                    <p className="text-xs font-medium text-amber-950 dark:text-amber-100 mt-1 italic">
                      Catatan: "{jemaat.rencanaMutasiDetail}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenMutasi}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Proses Mutasi</span>
                </button>
              </div>
            </div>
          )}

          {isTidakAktif && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-500/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                    ⛔ Notifikasi Cepat: Status Jemaat Tidak Aktif (Dinonaktifkan)
                  </span>
                  <p className="text-xs text-rose-800 dark:text-rose-300/90 mt-0.5 leading-relaxed">
                    Warga jemaat ini saat ini dinonaktifkan dalam database jemaat Getsemani dan tidak tercatat dalam kuorum pelayanan aktif gerejawi (misal karena meninggal dunia, atestasi keluar, atau pindah agama).
                  </p>
                  {jemaat.keterangan && (
                    <p className="text-xs font-medium text-rose-950 dark:text-rose-100 mt-1 italic">
                      Riwayat/Keterangan: "{jemaat.keterangan}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isAkanMutasi && !isTidakAktif && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Status Keanggotaan Aktif ({jemaat.statusKeanggotaan}) · Terverifikasi dalam sheet resmi database Jemaat.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono">
                AKTIF
              </span>
            </div>
          )}

          {/* 2. BARCODE & SUMMARY STRIP */}
          <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                Barcode Identitas Anggota
              </span>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200 inline-block shadow-2xs">
                <BarcodeRenderer value={jemaat.nik} height={32} width={1.4} fontSize={10} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300">
                Wadah: {jemaat.wadahKategorial}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-300">
                Hubungan: {jemaat.hubunganKeluarga}
              </span>
              {jemaat.statusSosial !== 'Umum' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300">
                  Sosial: {jemaat.statusSosial}
                </span>
              )}
            </div>
          </div>

          {/* 3. RINCIAN DATA BIODATA & KEPENDUDUKAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kolom Kiri: Biodata Pribadi */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-amber-300 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Biodata Kependudukan</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Tempat, Tanggal Lahir:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 text-right">
                    {jemaat.tempatLahir}, {jemaat.tanggalLahir}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Umur & Jenis Kelamin:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {jemaat.umur} Tahun ({jemaat.jenisKelamin})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Golongan Darah:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                    {jemaat.golonganDarah}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Pendidikan Terakhir:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {jemaat.pendidikan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Pekerjaan:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 text-right">
                    {jemaat.pekerjaan === 'Lain-lain' ? jemaat.pekerjaanLainnya || 'Lain-lain' : jemaat.pekerjaan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Penyandang Disabilitas:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {jemaat.disabilitas === 'Tidak' ? 'Tidak Ada' : `${jemaat.disabilitas} (${jemaat.disabilitasDetail || ''})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Data Pelayanan Gerejawi */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-amber-300 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Pelayanan & Sakramen</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Sektor & Unit:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Sektor {jemaat.sektor} · Unit {jemaat.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Wadah Kategorial:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {jemaat.wadahKategorial} {jemaat.pengurusIntiWadah !== 'None' ? `(${jemaat.pengurusIntiWadah})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Jabatan Struktural:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {jemaat.jabatanStruktural !== 'None' ? jemaat.jabatanStruktural : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Jabatan Pelayan:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {jemaat.jabatanPelayan !== 'None' ? jemaat.jabatanPelayan : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Tanggal Baptis:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                    {jemaat.tglBaptis || 'Belum'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Tanggal Sidi:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                    {jemaat.tglSidi || 'Belum'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Tanggal Nikah Gereja:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                    {jemaat.tglNikah || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. KONTAK & ALAMAT DOMISILI */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-amber-300 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kontak & Domisili Tempat Tinggal</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Nomor Handphone / WA:</span>
                {jemaat.noHp ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{jemaat.noHp}</span>
                    <a
                      href={createWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Kirim pesan WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Belum diisi</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Email Jemaat:</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">
                  {jemaat.email || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">Alamat Tempat Tinggal:</span>
                <span className="text-slate-800 dark:text-zinc-200 font-medium">
                  {jemaat.alamat}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 dark:bg-zinc-900/80 p-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canEditJemaat && (
              <button
                onClick={handleToggleAkanMutasi}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  isAkanMutasi
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 hover:bg-amber-200'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-300 dark:border-zinc-700 hover:border-amber-400'
                }`}
                title="Tandai atau batalkan tanda rencana mutasi jemaat ini"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${isAkanMutasi ? 'text-amber-700' : 'text-slate-400'}`} />
                <span>{isAkanMutasi ? 'Batalkan Tanda "Akan Mutasi"' : 'Tandai "Akan Segera Mutasi"'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenKK}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-sky-400 text-sky-700 dark:text-sky-300 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Lihat KK</span>
            </button>

            <button
              onClick={handleOpenKtp}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-amber-400 text-amber-800 dark:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cetak e-KTP</span>
            </button>

            {onEdit && canEditJemaat && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(jemaat);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Biodata</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
