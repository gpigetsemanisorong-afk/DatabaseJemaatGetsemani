import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SektorName, UnitName, Jemaat } from '../../types';
import {
  Building2,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
  Home,
  UserCheck,
} from 'lucide-react';

export const StrukturSektorView: React.FC = () => {
  const { jemaat, setActiveMenu, setSelectedNkkForKK } = useApp();
  const [activeTab, setActiveTab] = useState<'struktur' | 'sektor'>('struktur');
  const [selectedSektor, setSelectedSektor] = useState<SektorName>('Filadelfia');
  const [selectedUnit, setSelectedUnit] = useState<UnitName>('Rehobot');

  // PHMJ and Majelis members
  const phmjMembers = jemaat.filter((j) => j.jabatanStruktural !== 'None');
  const pelayanMembers = jemaat.filter((j) => j.jabatanPelayan !== 'None');

  // Sektor and Unit breakdown
  const sektorFiladelfia = jemaat.filter((j) => j.sektor === 'Filadelfia' && j.statusKeanggotaan !== 'Dinonaktifkan');
  const sektorPetra = jemaat.filter((j) => j.sektor === 'Petra' && j.statusKeanggotaan !== 'Dinonaktifkan');

  const activeUnitJemaat = jemaat.filter(
    (j) => j.sektor === selectedSektor && j.unit === selectedUnit && j.statusKeanggotaan !== 'Dinonaktifkan'
  );

  const activeUnitKK = new Set(
    activeUnitJemaat.filter((j) => j.hubunganKeluarga === 'Kepala Keluarga').map((j) => j.nkk)
  ).size;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Struktur Organisasi & Kewilayahan
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Struktur PHMJ & Pembagian Sektor / Unit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kepengurusan Majelis Jemaat dan pembagian wilayah pelayanan Sektor Filadelfia & Petra.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('struktur')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'struktur'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Struktur PHMJ & Majelis
          </button>
          <button
            onClick={() => setActiveTab('sektor')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'sektor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wilayah Sektor & Unit
          </button>
        </div>
      </div>

      {activeTab === 'struktur' ? (
        /* TAB 1: STRUKTUR PHMJ & MAJELIS */
        <div className="space-y-6">
          {/* PHMJ Executive Cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Badan Pekerja Majelis Jemaat (PHMJ) Periode Pelayanan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { role: 'Ketua PHMJ', desc: 'Pemimpin Umum & Pelayan Firman Utama' },
                { role: 'Waket PHMJ', desc: 'Wakil Ketua Bidang Pembinaan & Teologi' },
                { role: 'Sekretaris PHMJ', desc: 'Penata Administrasi & Kesekretariatan' },
                { role: 'Wasek PHMJ', desc: 'Wakil Sekretaris Bidang Data & Arsip' },
                { role: 'Bendahara PHMJ', desc: 'Pengelola Keuangan & Anggaran Jemaat' },
                { role: 'Bendahara Barang PHMJ', desc: 'Penanggung Jawab Aset & Inventaris' },
              ].map((pos) => {
                const holder = phmjMembers.find((m) => m.jabatanStruktural === pos.role);
                return (
                  <div
                    key={pos.role}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                        {pos.role}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">{pos.desc}</p>

                      <div className="mt-3">
                        {holder ? (
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{holder.nama}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Sektor {holder.sektor} ({holder.unit}) · {holder.noHp || '-'}
                            </p>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">Belum Ditetapkan</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Status: Terverifikasi</span>
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Majelis Pelayan: Penatua & Syamas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Majelis Pelayan (Penatua & Syamas)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Total: {pelayanMembers.length} Pejabat Pelayan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pelayanMembers.map((pel) => (
                <div
                  key={pel.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{pel.nama}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          pel.jabatanPelayan === 'Penatua'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pel.jabatanPelayan}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sektor {pel.sektor} (Unit {pel.unit}) · HP: {pel.noHp || '-'}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    NIK: ...{pel.nik.slice(-4)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: WILAYAH SEKTOR & UNIT */
        <div className="space-y-6">
          {/* Sektor Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sektor Filadelfia */}
            <div
              onClick={() => {
                setSelectedSektor('Filadelfia');
                setSelectedUnit('Rehobot');
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedSektor === 'Filadelfia'
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Kode Sektor: 01
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">Sektor Filadelfia</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {sektorFiladelfia.length}
                  </div>
                  <span className="text-[11px] text-slate-500">Jiwa Terdaftar</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Mencakup 2 unit pelayanan aktif: <span className="font-semibold text-slate-800">Unit Rehobot</span> & <span className="font-semibold text-slate-800">Unit Silo</span>.
              </p>
            </div>

            {/* Sektor Petra */}
            <div
              onClick={() => {
                setSelectedSektor('Petra');
                setSelectedUnit('Pniel');
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedSektor === 'Petra'
                  ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Kode Sektor: 02
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">Sektor Petra</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {sektorPetra.length}
                  </div>
                  <span className="text-[11px] text-slate-500">Jiwa Terdaftar</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Mencakup 2 unit pelayanan aktif: <span className="font-semibold text-slate-800">Unit Pniel</span> & <span className="font-semibold text-slate-800">Unit Siloam</span>.
              </p>
            </div>
          </div>

          {/* Unit Switcher & Members in Unit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Daftar Anggota di Sektor {selectedSektor} · Unit {selectedUnit}
                </h4>
                <p className="text-xs text-slate-500">
                  {activeUnitJemaat.length} jiwa · {activeUnitKK} Kepala Keluarga
                </p>
              </div>

              {/* Unit Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {(selectedSektor === 'Filadelfia'
                  ? (['Rehobot', 'Silo'] as UnitName[])
                  : (['Pniel', 'Siloam'] as UnitName[])
                ).map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelectedUnit(u)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      selectedUnit === u
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unit {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Members in selected unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeUnitJemaat.map((j) => (
                <div
                  key={j.id}
                  className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{j.nama}</span>
                      <span className="text-[10px] text-slate-500">
                        ({j.hubunganKeluarga})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      NKK: {j.nkk} · Wadah: {j.wadahKategorial}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                      {j.alamat}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedNkkForKK(j.nkk);
                      setActiveMenu('kelola-data-kk');
                    }}
                    className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg text-xs font-medium"
                    title="Buka Kartu Keluarga"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
