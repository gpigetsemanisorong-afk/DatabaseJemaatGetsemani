import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WadahKategorial, Jemaat } from '../../types';
import {
  Baby,
  Smile,
  Shield,
  Heart,
  Award,
  Users,
  Search,
  CheckCircle,
  Phone,
} from 'lucide-react';

const WADAH_CONFIG: Record<
  WadahKategorial,
  {
    name: string;
    fullName: string;
    desc: string;
    color: string;
    badgeBg: string;
    icon: React.ReactNode;
  }
> = {
  PAR: {
    name: 'PAR',
    fullName: 'Persekutuan Anak dan Remaja',
    desc: 'Pelayanan pembinaan rohani anak sekolah minggu dan remaja jemaat',
    color: 'text-orange-600',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: <Baby className="w-5 h-5" />,
  },
  PP: {
    name: 'PP',
    fullName: 'Persekutuan Pemuda',
    desc: 'Wadah persekutuan, kesaksian, dan pelayanan pemuda-pemudi gereja',
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <Smile className="w-5 h-5" />,
  },
  PERPRI: {
    name: 'PERPRI',
    fullName: 'Persekutuan Pria',
    desc: 'Wadah persekutuan kaum bapa & pria gereja sebagai imam dalam keluarga',
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <Shield className="w-5 h-5" />,
  },
  PERWATA: {
    name: 'PERWATA',
    fullName: 'Persekutuan Wanita',
    desc: 'Wadah persekutuan kaum ibu & wanita gereja dalam doa dan diakonia kasih',
    color: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: <Heart className="w-5 h-5" />,
  },
  LANSIA: {
    name: 'LANSIA',
    fullName: 'Persekutuan Lanjut Usia',
    desc: 'Pelayanan penghiburan & keteladanan iman kaum lanjut usia (usia 60 tahun ke atas)',
    color: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: <Award className="w-5 h-5" />,
  },
};

export const UnsurKategorialView: React.FC = () => {
  const { jemaat } = useApp();
  const [selectedWadah, setSelectedWadah] = useState<WadahKategorial>('PAR');
  const [searchTerm, setSearchTerm] = useState('');

  const currentConfig = WADAH_CONFIG[selectedWadah];

  // Members in selected wadah
  const membersInWadah = jemaat.filter(
    (j) => j.wadahKategorial === selectedWadah && j.statusKeanggotaan !== 'Dinonaktifkan'
  );

  // Core officers of this wadah
  const ketua = membersInWadah.find((m) => m.pengurusIntiWadah === 'Ketua');
  const sekretaris = membersInWadah.find((m) => m.pengurusIntiWadah === 'Sekretaris');
  const bendahara = membersInWadah.find((m) => m.pengurusIntiWadah === 'Bendahara');

  // Filtered members by search
  const filteredMembers = membersInWadah.filter(
    (m) =>
      !searchTerm ||
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nik.includes(searchTerm) ||
      m.sektor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Pelayanan Kategorial Gerejawi
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Unsur Kategorial (Wadah Pelayanan)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pengelompokan 5 wadah pembinaan jemaat GPI Getsemani beserta susunan pengurus inti.
        </p>
      </div>

      {/* 5 Wadah Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(WADAH_CONFIG) as WadahKategorial[]).map((key) => {
          const cfg = WADAH_CONFIG[key];
          const count = jemaat.filter((j) => j.wadahKategorial === key && j.statusKeanggotaan !== 'Dinonaktifkan').length;
          const isSelected = selectedWadah === key;

          return (
            <button
              key={key}
              onClick={() => {
                setSelectedWadah(key);
                setSearchTerm('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-xl bg-slate-50 ${cfg.color}`}>
                  {cfg.icon}
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {count}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3">{cfg.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cfg.fullName}</p>
            </button>
          );
        })}
      </div>

      {/* Wadah Detail Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentConfig.badgeBg}`}>
                {currentConfig.name}
              </span>
              <h3 className="text-base font-bold text-slate-900">{currentConfig.fullName}</h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">{currentConfig.desc}</p>
          </div>

          <div className="text-xs text-slate-500">
            Total Anggota: <span className="font-bold text-slate-900 font-mono text-sm">{membersInWadah.length}</span> Jiwa
          </div>
        </div>

        {/* Pengurus Inti Wadah */}
        <div className="pt-4 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pengurus Inti Wadah {currentConfig.name}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Ketua */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Ketua</span>
              <div className="font-bold text-xs text-slate-900 mt-1">
                {ketua ? ketua.nama : <span className="text-slate-400 font-normal italic">Belum diisi</span>}
              </div>
              {ketua && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sektor {ketua.sektor} ({ketua.unit}) · {ketua.noHp || '-'}
                </p>
              )}
            </div>

            {/* Sekretaris */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-sky-800 uppercase">Sekretaris</span>
              <div className="font-bold text-xs text-slate-900 mt-1">
                {sekretaris ? sekretaris.nama : <span className="text-slate-400 font-normal italic">Belum diisi</span>}
              </div>
              {sekretaris && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sektor {sekretaris.sektor} ({sekretaris.unit}) · {sekretaris.noHp || '-'}
                </p>
              )}
            </div>

            {/* Bendahara */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Bendahara</span>
              <div className="font-bold text-xs text-slate-900 mt-1">
                {bendahara ? bendahara.nama : <span className="text-slate-400 font-normal italic">Belum diisi</span>}
              </div>
              {bendahara && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sektor {bendahara.sektor} ({bendahara.unit}) · {bendahara.noHp || '-'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member List of this Wadah */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-900">
            Daftar Seluruh Anggota Wadah {currentConfig.name}
          </h4>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau NIK..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Nama Anggota</th>
                <th className="py-2.5 px-3">NIK</th>
                <th className="py-2.5 px-3">L/P & Umur</th>
                <th className="py-2.5 px-3">Sektor / Unit</th>
                <th className="py-2.5 px-3">Jabatan di Wadah</th>
                <th className="py-2.5 px-3">Kontak HP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada anggota ditemukan dalam wadah ini.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.nama}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{m.nik}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {m.jenisKelamin === 'Laki-laki' ? 'L' : 'P'} · {m.umur} thn
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {m.sektor} ({m.unit})
                    </td>
                    <td className="py-2.5 px-3">
                      {m.pengurusIntiWadah !== 'None' ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          {m.pengurusIntiWadah}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Anggota</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {m.noHp || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
