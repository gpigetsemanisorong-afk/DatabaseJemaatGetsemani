import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Jemaat, SektorName, UnitName, StatusSosial } from '../../types';
import {
  Heart,
  Users,
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  CreditCard,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Accessibility,
} from 'lucide-react';

export const DiakoniaView: React.FC = () => {
  const { jemaat, setActiveMenu, setSelectedJemaatForKtp } = useApp();

  const [selectedSocialStatus, setSelectedSocialStatus] = useState<string>('SEMUA');
  const [selectedSektor, setSelectedSektor] = useState<string>('SEMUA');
  const [selectedUnit, setSelectedUnit] = useState<string>('SEMUA');
  const [selectedKeanggotaan, setSelectedKeanggotaan] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter Diakonia candidates: Duda, Janda, Yatim, Piatu, Yatim Piatu, or any Disability
  const diakoniaList = useMemo(() => {
    return jemaat.filter((j) => {
      if (j.statusKeanggotaan === 'Dinonaktifkan') return false;

      const isSocialDiakonia = ['Duda', 'Janda', 'Yatim', 'Piatu', 'Yatim Piatu'].includes(j.statusSosial);
      const isDisability = j.disabilitas && j.disabilitas !== 'Tidak';

      // Must belong to diakonia target categories
      if (!isSocialDiakonia && !isDisability) return false;

      // Filter by specific social status if selected
      if (selectedSocialStatus !== 'SEMUA') {
        if (selectedSocialStatus === 'Disabilitas') {
          if (!isDisability) return false;
        } else {
          if (j.statusSosial !== selectedSocialStatus) return false;
        }
      }

      // Filter by Sektor
      if (selectedSektor !== 'SEMUA' && j.sektor !== selectedSektor) return false;

      // Filter by Unit
      if (selectedUnit !== 'SEMUA' && j.unit !== selectedUnit) return false;

      // Filter by Tingkat / Status Keanggotaan
      if (selectedKeanggotaan !== 'SEMUA' && j.statusKeanggotaan !== selectedKeanggotaan) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = j.nama.toLowerCase().includes(q);
        const matchNik = j.nik.toLowerCase().includes(q);
        const matchAlamat = j.alamat.toLowerCase().includes(q);
        if (!matchName && !matchNik && !matchAlamat) return false;
      }

      return true;
    });
  }, [jemaat, selectedSocialStatus, selectedSektor, selectedUnit, selectedKeanggotaan, searchQuery]);

  // Summary statistics
  const stats = useMemo(() => {
    const activeDiakonia = jemaat.filter((j) => {
      if (j.statusKeanggotaan === 'Dinonaktifkan') return false;
      return ['Duda', 'Janda', 'Yatim', 'Piatu', 'Yatim Piatu'].includes(j.statusSosial) || (j.disabilitas && j.disabilitas !== 'Tidak');
    });

    return {
      total: activeDiakonia.length,
      janda: activeDiakonia.filter((j) => j.statusSosial === 'Janda').length,
      duda: activeDiakonia.filter((j) => j.statusSosial === 'Duda').length,
      yatimPiatu: activeDiakonia.filter((j) => ['Yatim', 'Piatu', 'Yatim Piatu'].includes(j.statusSosial)).length,
      disabilitas: activeDiakonia.filter((j) => j.disabilitas && j.disabilitas !== 'Tidak').length,
    };
  }, [jemaat]);

  // Export Diakonia Report to CSV
  const handleExportCSV = () => {
    if (diakoniaList.length === 0) return;
    const headers = ['NIK', 'Nama', 'Jenis Kelamin', 'Status Sosial', 'Disabilitas', 'Sektor', 'Unit', 'Status Keanggotaan', 'No HP', 'Alamat'];
    const rows = diakoniaList.map((j) => [
      `"${j.nik}"`,
      `"${j.nama}"`,
      j.jenisKelamin,
      j.statusSosial,
      j.disabilitas !== 'Tidak' ? `${j.disabilitas} (${j.disabilitasDetail || ''})` : 'Tidak',
      j.sektor,
      j.unit,
      j.statusKeanggotaan,
      `"${j.noHp}"`,
      `"${j.alamat.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Diakonia_Getsemani_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createWhatsAppLink = (j: Jemaat) => {
    if (!j.noHp) return '';
    let phone = j.noHp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const message = encodeURIComponent(
      `Syalom ${j.jenisKelamin === 'Laki-laki' ? 'Bapak' : 'Ibu'} ${j.nama},\n\nSegenap Majelis Jemaat dan Bidang Diakonia GPI Getsemani Sorong menyampaikan salam kasih dalam Tuhan Yesus Kristus.\n\nKami senantiasa mendoakan kesehatan dan kiranya penyertaan Tuhan Yesus melimpah atas Bapak/Ibu sekeluarga.\n\nSalam Kasih & Doa,\nBidang Diakonia GPI Getsemani`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#09090b] via-[#1a140a] to-[#0b0b0e] text-white p-6 rounded-2xl shadow-lg border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Pelayanan Kasih & Sosial Jemaat
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1 text-white flex items-center gap-2">
            <span>Data Diakonia Jemaat Getsemani</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            Pusat data pelayanan diakonia untuk warga jemaat berstatus Duda, Janda, Yatim, Piatu, Yatim Piatu, serta penyandang disabilitas terintegrasi lintas sektor dan unit.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Laporan Diakonia (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Total Diakonia</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {stats.total} <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Janda & Duda</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {stats.janda + stats.duda} <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Yatim / Piatu</span>
            <ShieldAlert className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {stats.yatimPiatu} <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Disabilitas</span>
            <Accessibility className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {stats.disabilitas} <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-amber-300 pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Filter className="w-4 h-4 text-amber-600" />
          <span>Filter Kategori Diakonia, Sektor, Unit, & Tingkat Jemaat</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Status Sosial / Kategori Diakonia */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Kategori Diakonia
            </label>
            <select
              value={selectedSocialStatus}
              onChange={(e) => setSelectedSocialStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Kategori Diakonia</option>
              <option value="Janda">Janda</option>
              <option value="Duda">Duda</option>
              <option value="Yatim">Yatim</option>
              <option value="Piatu">Piatu</option>
              <option value="Yatim Piatu">Yatim Piatu</option>
              <option value="Disabilitas">Penyandang Disabilitas</option>
            </select>
          </div>

          {/* Sektor Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Sektor Jemaat
            </label>
            <select
              value={selectedSektor}
              onChange={(e) => setSelectedSektor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Sektor</option>
              <option value="Filadelfia">Sektor Filadelfia</option>
              <option value="Petra">Sektor Petra</option>
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Unit Pelayanan
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Unit</option>
              <option value="Rehobot">Rehobot (Filadelfia)</option>
              <option value="Silo">Silo (Filadelfia)</option>
              <option value="Pniel">Pniel (Petra)</option>
              <option value="Siloam">Siloam (Petra)</option>
            </select>
          </div>

          {/* Tingkat Jemaat / Status Keanggotaan */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Tingkat / Status Jemaat
            </label>
            <select
              value={selectedKeanggotaan}
              onChange={(e) => setSelectedKeanggotaan(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Tingkat Keanggotaan</option>
              <option value="Jemaat Tetap">Jemaat Tetap</option>
              <option value="Simpatisan">Simpatisan</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
              Cari Nama / NIK
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jemaat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diakonia Results List / Cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-amber-500/20 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daftar Warga Jemaat Sasaran Diakonia
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-1 rounded-lg">
            {diakoniaList.length} Jiwa Ditampilkan
          </span>
        </div>

        {diakoniaList.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Tidak Ada Jemaat yang Sesuai Filter Diakonia
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ditemukan data jemaat berstatus Duda, Janda, Yatim, Piatu, Yatim Piatu, atau Disabilitas dengan filter sektor/unit yang dipilih.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-5">
            {diakoniaList.map((j) => {
              const isDisability = j.disabilitas && j.disabilitas !== 'Tidak';
              return (
                <div
                  key={j.id}
                  className="bg-slate-50 dark:bg-[#141418] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-amber-400 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {j.nama}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                          NIK: {j.nik} · {j.umur} Thn ({j.jenisKelamin})
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
                          {j.statusSosial}
                        </span>
                        {isDisability && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                            Disabilitas: {j.disabilitas}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Sektor {j.sektor} ({j.unit}) · {j.alamat}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Lahir: {j.tanggalLahir}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {j.statusKeanggotaan}
                    </span>

                    <div className="flex items-center gap-2">
                      {j.noHp && (
                        <a
                          href={createWhatsAppLink(j)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] transition-colors"
                          title="Kirim pesan WhatsApp sapaan diakonia"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedJemaatForKtp(j);
                          setActiveMenu('kelola-kartu-anggota');
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-amber-600 transition-colors"
                        title="Lihat KTP Jemaat"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
