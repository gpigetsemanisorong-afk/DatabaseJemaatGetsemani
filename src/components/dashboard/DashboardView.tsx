import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Home,
  UserMinus,
  Baby,
  Smile,
  Shield,
  Heart,
  Award,
  ChevronRight,
  TrendingUp,
  UserPlus,
  CreditCard,
  HeartHandshake,
  Calendar,
  PieChart,
  BarChart3,
  Activity,
  Gift,
  PartyPopper,
  AlertTriangle,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

import { BirthdayListCard } from './BirthdayListCard';
import { GlobalSearchBar } from '../GlobalSearchBar';

interface DonutSlice {
  label: string;
  count: number;
  color: string;
  pct: number;
}

export const DashboardView: React.FC = () => {
  const { jemaat, mutasi, kunjungan, setActiveMenu, setSelectedJemaatForKtp } = useApp();

  // Metrics computation
  const jemaatTetap = jemaat.filter((j) => j.statusKeanggotaan === 'Jemaat Tetap');
  const totalJiwaTetap = jemaatTetap.length;

  const kkSet = new Set(
    jemaat
      .filter((j) => j.hubunganKeluarga === 'Kepala Keluarga' && j.statusKeanggotaan !== 'Dinonaktifkan')
      .map((j) => j.nkk)
  );
  const totalKK = kkSet.size;

  // Mutasi bulan ini
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const mutasiBulanIni = mutasi.filter((m) => m.tanggalMutasi.startsWith(currentMonthPrefix));

  const mutasiMenikah = mutasiBulanIni.filter((m) => m.jenisMutasi === 'Menikah (KK Baru)').length;
  const mutasiMeninggal = mutasiBulanIni.filter((m) => m.jenisMutasi === 'Meninggal Dunia').length;
  const mutasiPindah = mutasiBulanIni.filter(
    (m) => m.jenisMutasi !== 'Menikah (KK Baru)' && m.jenisMutasi !== 'Meninggal Dunia'
  ).length;

  // Unsur Kategorial counts
  const countPAR = jemaat.filter((j) => j.wadahKategorial === 'PAR' && j.statusKeanggotaan !== 'Dinonaktifkan').length;
  const countPP = jemaat.filter((j) => j.wadahKategorial === 'PP' && j.statusKeanggotaan !== 'Dinonaktifkan').length;
  const countPERPRI = jemaat.filter((j) => j.wadahKategorial === 'PERPRI' && j.statusKeanggotaan !== 'Dinonaktifkan').length;
  const countPERWATA = jemaat.filter((j) => j.wadahKategorial === 'PERWATA' && j.statusKeanggotaan !== 'Dinonaktifkan').length;
  const countLANSIA = jemaat.filter((j) => j.wadahKategorial === 'LANSIA' && j.statusKeanggotaan !== 'Dinonaktifkan').length;

  // Jemaat pending mutasi alert
  const akanMutasiList = jemaat.filter((j) => j.statusMutasi === 'Akan Mutasi');

  // Sektor & Unit breakdown
  const filadelfiaJemaat = jemaat.filter((j) => j.sektor === 'Filadelfia' && j.statusKeanggotaan !== 'Dinonaktifkan');
  const petraJemaat = jemaat.filter((j) => j.sektor === 'Petra' && j.statusKeanggotaan !== 'Dinonaktifkan');

  const rehobotCount = filadelfiaJemaat.filter((j) => j.unit === 'Rehobot').length;
  const siloCount = filadelfiaJemaat.filter((j) => j.unit === 'Silo').length;
  const pnielCount = petraJemaat.filter((j) => j.unit === 'Pniel').length;
  const siloamCount = petraJemaat.filter((j) => j.unit === 'Siloam').length;

  const activeTotal = Math.max(1, filadelfiaJemaat.length + petraJemaat.length);

  // DONUT 1: Sektor & Unit Slices
  const sektorSlices: DonutSlice[] = [
    { label: 'Filadelfia (Rehobot)', count: rehobotCount, color: '#2563eb', pct: Math.round((rehobotCount / activeTotal) * 100) },
    { label: 'Filadelfia (Silo)', count: siloCount, color: '#60a5fa', pct: Math.round((siloCount / activeTotal) * 100) },
    { label: 'Petra (Pniel)', count: pnielCount, color: '#d97706', pct: Math.round((pnielCount / activeTotal) * 100) },
    { label: 'Petra (Siloam)', count: siloamCount, color: '#f59e0b', pct: Math.round((siloamCount / activeTotal) * 100) },
  ];

  // DONUT 2: Wadah Kategorial Slices
  const wadahSlices: DonutSlice[] = [
    { label: 'PAR (Anak & Remaja)', count: countPAR, color: '#f97316', pct: Math.round((countPAR / activeTotal) * 100) },
    { label: 'PP (Pemuda)', count: countPP, color: '#3b82f6', pct: Math.round((countPP / activeTotal) * 100) },
    { label: 'PERPRI (Pria)', count: countPERPRI, color: '#059669', pct: Math.round((countPERPRI / activeTotal) * 100) },
    { label: 'PERWATA (Wanita)', count: countPERWATA, color: '#e11d48', pct: Math.round((countPERWATA / activeTotal) * 100) },
    { label: 'LANSIA (Senior 60+)', count: countLANSIA, color: '#9333ea', pct: Math.round((countLANSIA / activeTotal) * 100) },
  ];

  // Hover state for interactive donuts
  const [hoveredSektorSlice, setHoveredSektorSlice] = useState<DonutSlice | null>(null);
  const [hoveredWadahSlice, setHoveredWadahSlice] = useState<DonutSlice | null>(null);

  // SVG Donut calculation constants
  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Helper to render SVG Donut circles
  const renderDonutCircles = (slices: DonutSlice[], setHovered: (s: DonutSlice | null) => void) => {
    let accumulatedPct = 0;
    return slices.map((slice) => {
      const strokeDashoffset = circumference - (slice.pct / 100) * circumference;
      const rotation = (accumulatedPct / 100) * 360 - 90;
      accumulatedPct += slice.pct;

      if (slice.count === 0) return null;

      return (
        <circle
          key={slice.label}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={slice.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
          onMouseEnter={() => setHovered(slice)}
          onMouseLeave={() => setHovered(null)}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Quick Search Bar at Top of Dashboard */}
      <GlobalSearchBar variant="dashboard" />

      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-[#09090b] via-[#18140c] to-[#0b0b0e] text-white p-6 rounded-2xl shadow-lg border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Sistem Informasi Gerejawi Terintegrasi
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1 text-white">
            Portal Database Jemaat Getsemani
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            Pengelolaan terpadu jemaat, nomor kartu keluarga otomatis, barcode identitas, sakramen, kunjungan pastoral, dan inventaris jemaat GPI Getsemani Klasis Sorong.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => setActiveMenu('kelola-data-jemaat')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-105 text-zinc-950 transition-all shadow-md shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Kelola Jemaat</span>
          </button>
          <button
            onClick={() => setActiveMenu('kelola-kartu-anggota')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-100 border border-amber-500/30 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Cetak KTP Jemaat</span>
          </button>
          <button
            onClick={() => setActiveMenu('kunjungan')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-100 border border-amber-500/30 transition-colors"
          >
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Kunjungan Pastoral</span>
          </button>
          <button
            onClick={() => setActiveMenu('diakonia')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Diakonia</span>
          </button>
        </div>
      </div>

      {/* WIDGET NOTIFIKASI ULANG TAHUN BULAN BERJALAN */}
      <div className="bg-gradient-to-r from-amber-950/90 via-zinc-900 to-amber-950/90 text-amber-100 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Gift className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25">
                Notifikasi Warta Jemaat
              </span>
              <span className="text-xs text-amber-200 font-mono">
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][new Date().getMonth()]} {new Date().getFullYear()}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
              {jemaat.filter((j) => {
                if (!j.tanggalLahir || j.statusKeanggotaan === 'Dinonaktifkan') return false;
                const p = j.tanggalLahir.split('-').map(Number);
                return p.length >= 3 && p[1] - 1 === new Date().getMonth();
              }).length} Warga Jemaat Berulang Tahun Bulan Ini
              {jemaat.filter((j) => {
                if (!j.tanggalLahir || j.statusKeanggotaan === 'Dinonaktifkan') return false;
                const p = j.tanggalLahir.split('-').map(Number);
                return p.length >= 3 && p[1] - 1 === new Date().getMonth() && p[2] === new Date().getDate();
              }).length > 0 && (
                <span className="ml-2 text-xs bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <PartyPopper className="w-3 h-3" /> {jemaat.filter((j) => {
                    if (!j.tanggalLahir || j.statusKeanggotaan === 'Dinonaktifkan') return false;
                    const p = j.tanggalLahir.split('-').map(Number);
                    return p.length >= 3 && p[1] - 1 === new Date().getMonth() && p[2] === new Date().getDate();
                  }).length} Orang Ulang Tahun Hari Ini!
                </span>
              )}
            </h4>
            <p className="text-xs text-zinc-300 mt-0.5">
              {jemaat.filter((j) => {
                if (!j.tanggalLahir || j.statusKeanggotaan === 'Dinonaktifkan') return false;
                const p = j.tanggalLahir.split('-').map(Number);
                return p.length >= 3 && p[1] - 1 === new Date().getMonth() && p[2] === new Date().getDate();
              }).length > 0
                ? `Hari ini ada warga jemaat yang merayakan pertambahan usia. Segera kirimkan ucapan kasih & doa pastoral!`
                : `Periksa daftar warta ulang tahun di bawah untuk mengirimkan ucapan kasih & doa pastoral via WhatsApp.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#birthday-list-card"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('birthday-list-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md"
          >
            <span>Lihat Daftar & Ucapan WA</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* NOTIFIKASI CEPAT: JEMAAT AKAN MUTASI */}
      {akanMutasiList.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-500/15 border-2 border-amber-500/50 text-amber-950 dark:text-amber-200 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
                  NOTIFIKASI CEPAT ADMIN
                </span>
                <span className="text-xs font-bold">
                  {akanMutasiList.length} Jemaat Sedang Dalam Rencana / Persiapan Mutasi
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                {akanMutasiList.map((j) => j.nama).slice(0, 3).join(', ')}
                {akanMutasiList.length > 3 ? ` dan ${akanMutasiList.length - 3} lainnya` : ''} telah ditandai untuk persiapan atestasi / mutasi pelayanan.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveMenu('kelola-data-jemaat')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>Tinjau di Data Jemaat</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BARIS 1: 3 KARTU UTAMA */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-amber-100 mb-3 flex items-center gap-2">
          <span>01. Indikator Utama Jemaat</span>
          <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">· Status Real-Time</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Jumlah Jemaat Tetap */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Jemaat Tetap
              </span>
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {totalJiwaTetap}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Terdaftar & terverifikasi dalam database
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Jumlah Kepala Keluarga */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Kepala Keluarga (KK)
              </span>
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {totalKK}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Keluarga terdaftar dengan NKK resmi
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Home className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Mutasi Bulan Ini */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Mutasi Bulan Ini
              </span>
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {mutasiBulanIni.length}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <span>+{mutasiMenikah} nikah</span>
                <span className="text-slate-300">·</span>
                <span>{mutasiMeninggal} duka</span>
                <span className="text-slate-300">·</span>
                <span>{mutasiPindah} pindah</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <UserMinus className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* BARIS 2: 5 KARTU DISTRIBUSI UNSUR KATEGORIAL */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-amber-100 flex items-center gap-2">
            <span>02. Distribusi Unsur Kategorial Jemaat</span>
            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">· 5 Wadah Pelayanan</span>
          </h3>
          <button
            onClick={() => setActiveMenu('struktur-kategorial')}
            className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>Detail Wadah</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* PAR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">PAR</span>
              <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Baby className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
              {countPAR}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Anak & Remaja</p>
          </div>

          {/* PP */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">PP</span>
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
              {countPP}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Persekutuan Pemuda</p>
          </div>

          {/* PERPRI */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">PERPRI</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
              {countPERPRI}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Persekutuan Pria</p>
          </div>

          {/* PERWATA */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">PERWATA</span>
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
              {countPERWATA}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Persekutuan Wanita</p>
          </div>

          {/* LANSIA */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">LANSIA</span>
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
              {countLANSIA}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Lanjut Usia (60+)</p>
          </div>
        </div>
      </div>

      {/* BARIS 3: KOMPONEN ULANG TAHUN BULAN INI (WARTA HUT JEMAAT) */}
      <div>
        <BirthdayListCard
          jemaat={jemaat}
          onOpenKtp={(j) => {
            setSelectedJemaatForKtp(j);
            setActiveMenu('kelola-kartu-anggota');
          }}
        />
      </div>

      {/* BARIS 4: 2 GRAFIK DONAT (DONUT CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAFIK DONAT 1: STATISTIK JEMAAT PER SEKTOR & UNIT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>Grafik Donat: Jemaat Sektor & Unit</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribusi proporsional anggota menurut Sektor Filadelfia & Petra
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {activeTotal} Jiwa
            </div>
          </div>

          {/* Donut Chart Display & Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut Visual */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth={strokeWidth}
                />
                {/* Donut Slices */}
                {renderDonutCircles(sektorSlices, setHoveredSektorSlice)}
              </svg>

              {/* Center Donut Hole Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {hoveredSektorSlice ? (
                  <>
                    <span className="text-xl font-black font-mono text-slate-900 leading-none">
                      {hoveredSektorSlice.count}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      {hoveredSektorSlice.pct}% Total
                    </span>
                    <span className="text-[9px] text-slate-700 font-bold max-w-[90px] truncate">
                      {hoveredSektorSlice.label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                      {activeTotal}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
                      Jiwa Aktif
                    </span>
                    <span className="text-[9px] text-blue-700 font-bold">
                      2 Sektor
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {sektorSlices.map((s) => (
                <div
                  key={s.label}
                  onMouseEnter={() => setHoveredSektorSlice(s)}
                  onMouseLeave={() => setHoveredSektorSlice(null)}
                  className={`p-2 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                    hoveredSektorSlice?.label === s.label ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-slate-700">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{s.count} Jiwa</span>
                    <span className="text-slate-400 font-mono text-[11px]">({s.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRAFIK DONAT 2: KOMPOSISI WADAH KATEGORIAL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Grafik Donat: Unsur Kategorial</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Proporsi anggota menurut tahapan hidup wadah (PAR, PP, PERPRI, PERWATA, LANSIA)
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>5 Wadah</span>
            </div>
          </div>

          {/* Donut Chart Display & Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut Visual */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth={strokeWidth}
                />
                {/* Donut Slices */}
                {renderDonutCircles(wadahSlices, setHoveredWadahSlice)}
              </svg>

              {/* Center Donut Hole Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {hoveredWadahSlice ? (
                  <>
                    <span className="text-xl font-black font-mono text-slate-900 leading-none">
                      {hoveredWadahSlice.count}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      {hoveredWadahSlice.pct}%
                    </span>
                    <span className="text-[9px] text-slate-800 font-bold max-w-[90px] truncate">
                      {hoveredWadahSlice.label.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                      {activeTotal}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
                      Total Jiwa
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">
                      Kategorial
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex-1 w-full space-y-1.5 text-xs">
              {wadahSlices.map((w) => (
                <div
                  key={w.label}
                  onMouseEnter={() => setHoveredWadahSlice(w)}
                  onMouseLeave={() => setHoveredWadahSlice(null)}
                  className={`p-1.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                    hoveredWadahSlice?.label === w.label ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: w.color }}
                    />
                    <span className="text-slate-700 truncate max-w-[130px]">{w.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{w.count} Jiwa</span>
                    <span className="text-slate-400 font-mono text-[10px]">({w.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BARIS 5: RECHARTS VISUALISASI DATA (PERTUMBUHAN BULANAN & DISTRIBUSI USIA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECHARTS 1: Grafik Pertumbuhan Jemaat Bulanan */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-amber-300 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Statistik Pertumbuhan Jemaat Bulanan</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Grafik tren perkembangan jumlah jiwa dan Kepala Keluarga (KK) per bulan
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-500/30">
              6 Bulan Terakhir
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { bulan: 'Nov 2025', jemaat: Math.max(10, totalJiwaTetap - 18), keluarga: Math.max(5, totalKK - 6) },
                  { bulan: 'Des 2025', jemaat: Math.max(12, totalJiwaTetap - 12), keluarga: Math.max(8, totalKK - 4) },
                  { bulan: 'Jan 2026', jemaat: Math.max(15, totalJiwaTetap - 8), keluarga: Math.max(10, totalKK - 3) },
                  { bulan: 'Feb 2026', jemaat: Math.max(18, totalJiwaTetap - 5), keluarga: Math.max(12, totalKK - 2) },
                  { bulan: 'Mar 2026', jemaat: Math.max(22, totalJiwaTetap - 2), keluarga: Math.max(14, totalKK - 1) },
                  { bulan: 'Apr 2026', jemaat: totalJiwaTetap, keluarga: totalKK },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#d97706', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="jemaat" name="Total Jemaat" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="keluarga" name="Kepala Keluarga" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECHARTS 2: Grafik Distribusi Usia Jemaat */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-amber-300 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Distribusi Kelompok Usia Jemaat</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Klasifikasi demografi jemaat berdasarkan rentang usia (Balita hingga Lansia)
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
              Demografi
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Balita (0-5)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) <= 5).length },
                  { name: 'Anak (6-12)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 6 && (j.umur || 25) <= 12).length },
                  { name: 'Remaja (13-17)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 13 && (j.umur || 25) <= 17).length },
                  { name: 'Pemuda (18-35)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 18 && (j.umur || 25) <= 35).length },
                  { name: 'Dewasa (36-59)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 36 && (j.umur || 25) <= 59).length },
                  { name: 'Lansia (60+)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 60).length },
                ]}
                layout="vertical"
                margin={{ top: 10, right: 15, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#64748b" width={95} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#059669', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Jumlah Jiwa" fill="#059669" radius={[0, 4, 4, 0]}>
                  {[
                    { name: 'Balita (0-5)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) <= 5).length },
                    { name: 'Anak (6-12)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 6 && (j.umur || 25) <= 12).length },
                    { name: 'Remaja (13-17)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 13 && (j.umur || 25) <= 17).length },
                    { name: 'Pemuda (18-35)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 18 && (j.umur || 25) <= 35).length },
                    { name: 'Dewasa (36-59)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 36 && (j.umur || 25) <= 59).length },
                    { name: 'Lansia (60+)', count: jemaat.filter(j => j.statusKeanggotaan !== 'Dinonaktifkan' && (j.umur || 25) >= 60).length },
                  ].map((entry, index) => {
                    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Pastoral Visits & Church Updates */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-slate-900">
              Jurnal Kunjungan Pastoral Terakhir
            </h4>
          </div>
          <button
            onClick={() => setActiveMenu('kunjungan')}
            className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>Semua Jurnal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {kunjungan.slice(0, 3).map((k) => (
            <div key={k.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{k.keluargaTujuan}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {k.jenisKunjungan}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">
                    Sektor {k.sektor} ({k.unit})
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                  "{k.catatanDoa}"
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {k.tanggal}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    k.statusTindakLanjut === 'Selesai'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {k.statusTindakLanjut}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
