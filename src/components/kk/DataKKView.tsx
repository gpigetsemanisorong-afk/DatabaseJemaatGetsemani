import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Jemaat } from '../../types';
import { BarcodeRenderer } from '../BarcodeRenderer';
import { exportElementToPDF } from '../../services/exportService';
import {
  Search,
  Printer,
  Download,
  Users,
  Home,
  ChevronRight,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export const DataKKView: React.FC = () => {
  const { jemaat, selectedNkkForKK, setSelectedNkkForKK, setSelectedJemaatForKtp, setActiveMenu } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKKModalNkk, setActiveKKModalNkk] = useState<string | null>(selectedNkkForKK || null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (selectedNkkForKK) {
      setActiveKKModalNkk(selectedNkkForKK);
    }
  }, [selectedNkkForKK]);

  // Group jemaat by NKK
  const kkGroups = useMemo(() => {
    const map = new Map<string, Jemaat[]>();
    jemaat.forEach((item) => {
      if (!item.nkk) return;
      const existing = map.get(item.nkk) || [];
      existing.push(item);
      map.set(item.nkk, existing);
    });

    const list = Array.from(map.entries()).map(([nkk, members]) => {
      const head = members.find((m) => m.hubunganKeluarga === 'Kepala Keluarga') || members[0];
      return {
        nkk,
        head,
        members,
        sektor: head.sektor,
        unit: head.unit,
        alamat: head.alamat,
        totalMembers: members.length,
      };
    });

    return list;
  }, [jemaat]);

  // Filtered KK list
  const filteredKK = useMemo(() => {
    if (!searchTerm) return kkGroups;
    const q = searchTerm.toLowerCase();
    return kkGroups.filter(
      (kk) =>
        kk.nkk.toLowerCase().includes(q) ||
        kk.head.nama.toLowerCase().includes(q) ||
        kk.sektor.toLowerCase().includes(q) ||
        kk.unit.toLowerCase().includes(q) ||
        kk.alamat.toLowerCase().includes(q)
    );
  }, [kkGroups, searchTerm]);

  // Active family for modal
  const selectedFamily = useMemo(() => {
    if (!activeKKModalNkk) return null;
    return kkGroups.find((g) => g.nkk === activeKKModalNkk) || null;
  }, [kkGroups, activeKKModalNkk]);

  // Lookup Ketua PHMJ dynamically from Data Jemaat
  const ketuaPhmj = useMemo(() => {
    return jemaat.find((j) => j.jabatanStruktural === 'Ketua PHMJ') || null;
  }, [jemaat]);

  const handlePrintKK = () => {
    window.print();
  };

  const handleDownloadKKPdf = async () => {
    if (!selectedFamily) return;
    setIsExportingPdf(true);
    await exportElementToPDF(
      'kk-dukcapil-sheet',
      `Kartu_Keluarga_DUKCAPIL_${selectedFamily.nkk}_${selectedFamily.head.nama.replace(/\s+/g, '_')}`,
      'l', // Landscape A4 format
      'a4'
    );
    setIsExportingPdf(false);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Dokumen Resmi Kependudukan Jemaat
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Kartu Keluarga (KK) Standar Dukcapil
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format dan proporsi cetak resmi Kartu Keluarga standar Dukcapil RI (A4 Landscape) dengan Barcode NKK Code128.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">
            Total Terdaftar: <span className="font-bold text-slate-900 font-mono">{kkGroups.length}</span> Kepala Keluarga
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan NKK, Nama Kepala Keluarga, Sektor, atau Alamat..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* KK Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredKK.map((item) => (
          <div
            key={item.nkk}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {item.nkk}
                    </span>
                    {item.members.some((m) => m.statusMutasi === 'Akan Mutasi') && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                        ⚠️ Rencana Mutasi
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-2 leading-tight">
                    Kel. {item.head.nama}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sektor {item.sektor} · Unit {item.unit}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <Home className="w-5 h-5" />
                </div>
              </div>

              {/* Members Count & Address */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    Jumlah Anggota:
                  </span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {item.totalMembers} Jiwa
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] line-clamp-1">
                  {item.alamat}
                </div>
              </div>

              {/* Barcode Preview in Card */}
              <div className="mt-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200 flex justify-center">
                <BarcodeRenderer value={item.nkk} width={1.1} height={24} fontSize={9} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => {
                  setSelectedNkkForKK(item.nkk);
                  setActiveKKModalNkk(item.nkk);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <span>Format Resmi Dukcapil</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL KARTU KELUARGA (KK) SESUAI TAMPILAN & UKURAN ASLI BLANKO DUKCAPIL RI */}
      {selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl border border-slate-300 overflow-hidden my-2 flex flex-col max-h-[96vh]">
            {/* Modal Controls Toolbar (No-Print) */}
            <div className="no-print px-6 py-3 bg-[#0a0a0d] border-b border-amber-500/30 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  Pratinjau Kartu Keluarga Standar Dukcapil (F-1.01)
                </span>
                <span className="text-xs text-zinc-300 font-mono">· No. {selectedFamily.nkk}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadKKPdf}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Menyiapkan PDF...' : 'Download PDF (A4)'}</span>
                </button>
                <button
                  onClick={handlePrintKK}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Langsung</span>
                </button>
                <button
                  onClick={() => {
                    setActiveKKModalNkk(null);
                    setSelectedNkkForKK(null);
                  }}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE KK CONTAINER (EXACT DUKCAPIL RI OFFICIAL PROPORTIONS) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200">
              <div
                id="kk-dukcapil-sheet"
                id-printable-area="true"
                className="bg-white p-6 sm:p-10 shadow-lg border-[3px] border-slate-900 text-slate-900 mx-auto space-y-4 relative print:p-0 print:border-none print:shadow-none"
                style={{
                  width: '100%',
                  maxWidth: '1080px',
                  minHeight: '760px',
                  aspectRatio: '1.414 / 1', // Exact A4 Landscape ratio (297mm x 210mm)
                  backgroundImage:
                    'radial-gradient(#dbeafe 0.8px, transparent 0.8px), radial-gradient(#e0f2fe 0.8px, #ffffff 0.8px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              >
                {/* Micro Border Line Inside */}
                <div className="border border-slate-800 p-4 relative">
                  {/* Official Header with Crest */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                    <div className="flex items-center gap-4">
                      <img
                        src="/src/assets/images/church_emblem_1794476998536.jpg"
                        alt="Logo Lambang Gereja"
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-600 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-900 font-serif">
                          Gereja Protestan Indonesia di Papua (GPI Papua)
                        </h2>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-serif">
                          Klasis Sorong · Jemaat Getsemani
                        </h3>
                        <p className="text-[10px] text-slate-600">
                          Sektor {selectedFamily.sektor} · Unit {selectedFamily.unit}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className="bg-white p-1 rounded border border-slate-400 inline-block shadow-2xs">
                        <BarcodeRenderer value={selectedFamily.nkk} width={1.2} height={28} fontSize={9} />
                      </div>
                    </div>
                  </div>

                  {/* Document Title & NKK */}
                  <div className="text-center py-2 space-y-0.5">
                    <h1 className="text-xl sm:text-2xl font-black tracking-[0.25em] uppercase text-slate-900 font-serif">
                      KARTU KELUARGA JEMAAT
                    </h1>
                    <div className="text-sm sm:text-base font-mono font-bold tracking-widest text-slate-900">
                      NKK. {selectedFamily.nkk}
                    </div>
                  </div>

                  {/* 2-Column Metadata Box (Hanya Field dari Data Jemaat) */}
                  <div className="grid grid-cols-2 gap-x-10 text-[11px] leading-tight pb-2 font-medium">
                    {/* Left Column */}
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">Nama Kepala Keluarga</span>
                        <span className="font-bold text-slate-950 uppercase">: {selectedFamily.head.nama}</span>
                      </div>
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">Alamat</span>
                        <span className="text-slate-900 uppercase">: {selectedFamily.alamat || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">No. HP</span>
                        <span className="text-slate-900 font-mono">: {selectedFamily.head.noHp || '-'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">Email</span>
                        <span className="text-slate-900">: {selectedFamily.head.email || '-'}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">Sektor / Unit</span>
                        <span className="font-bold text-slate-900 uppercase">: Sektor {selectedFamily.sektor} / Unit {selectedFamily.unit}</span>
                      </div>
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">Status Keanggotaan</span>
                        <span className="font-bold text-slate-900 uppercase">: {selectedFamily.head.statusKeanggotaan}</span>
                      </div>
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">Status Sosial</span>
                        <span className="text-slate-900 uppercase">: {selectedFamily.head.statusSosial}</span>
                      </div>
                      <div className="flex">
                        <span className="w-40 text-slate-700 shrink-0">Jumlah Anggota</span>
                        <span className="font-bold text-slate-900 font-mono">: {selectedFamily.totalMembers} Jiwa</span>
                      </div>
                    </div>
                  </div>

                  {/* TABEL I: DATA IDENTITAS ANGGOTA KELUARGA (HANYA DATA JEMAAT) */}
                  <div className="mt-2 border border-slate-900 overflow-hidden">
                    <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-200 text-slate-950 font-bold border-b border-slate-900 text-center">
                          <th className="p-1 border-r border-slate-900 w-8">No</th>
                          <th className="p-1 border-r border-slate-900">Nama Lengkap</th>
                          <th className="p-1 border-r border-slate-900">NIK</th>
                          <th className="p-1 border-r border-slate-900">Jenis Kelamin</th>
                          <th className="p-1 border-r border-slate-900">Tempat Lahir</th>
                          <th className="p-1 border-r border-slate-900">Tanggal Lahir</th>
                          <th className="p-1 border-r border-slate-900 w-12">Umur</th>
                          <th className="p-1 border-r border-slate-900">Pendidikan</th>
                          <th className="p-1 border-r border-slate-900">Pekerjaan</th>
                          <th className="p-1 w-10">Gol</th>
                        </tr>
                        <tr className="bg-slate-100 text-slate-600 text-[8px] sm:text-[9px] border-b border-slate-900 text-center">
                          <th className="p-0.5 border-r border-slate-900">(1)</th>
                          <th className="p-0.5 border-r border-slate-900">(2)</th>
                          <th className="p-0.5 border-r border-slate-900">(3)</th>
                          <th className="p-0.5 border-r border-slate-900">(4)</th>
                          <th className="p-0.5 border-r border-slate-900">(5)</th>
                          <th className="p-0.5 border-r border-slate-900">(6)</th>
                          <th className="p-0.5 border-r border-slate-900">(7)</th>
                          <th className="p-0.5 border-r border-slate-900">(8)</th>
                          <th className="p-0.5 border-r border-slate-900">(9)</th>
                          <th className="p-0.5">(10)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-400">
                        {selectedFamily.members.map((m, idx) => (
                          <tr key={m.id} className="text-slate-950 leading-tight">
                            <td className="p-1 text-center font-mono border-r border-slate-900">{idx + 1}</td>
                            <td className="p-1 font-bold border-r border-slate-900 uppercase">
                              {m.nama}
                              {m.statusMutasi === 'Akan Mutasi' && (
                                <span className="ml-1 text-[8px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-black">
                                  (AKAN MUTASI)
                                </span>
                              )}
                              {m.statusKeanggotaan === 'Dinonaktifkan' && (
                                <span className="ml-1 text-[8px] bg-rose-200 text-rose-900 px-1 py-0.2 rounded font-black">
                                  (NONAKTIF)
                                </span>
                              )}
                            </td>
                            <td className="p-1 font-mono border-r border-slate-900 text-center">{m.nik}</td>
                            <td className="p-1 text-center border-r border-slate-900">{m.jenisKelamin === 'Laki-laki' ? 'LAKI-LAKI' : 'PEREMPUAN'}</td>
                            <td className="p-1 border-r border-slate-900 uppercase">{m.tempatLahir}</td>
                            <td className="p-1 border-r border-slate-900 font-mono text-center">{m.tanggalLahir}</td>
                            <td className="p-1 border-r border-slate-900 font-mono text-center">{m.umur} thn</td>
                            <td className="p-1 border-r border-slate-900 uppercase text-center">{m.pendidikan}</td>
                            <td className="p-1 border-r border-slate-900 uppercase">{m.pekerjaan === 'Lain-lain' ? m.pekerjaanLainnya || 'LAIN-LAIN' : m.pekerjaan}</td>
                            <td className="p-1 text-center font-bold">{m.golonganDarah}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* TABEL II: STATUS HUBUNGAN, WADAH, JABATAN & SAKRAMEN (HANYA DATA JEMAAT) */}
                  <div className="mt-2.5 border border-slate-900 overflow-hidden">
                    <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-200 text-slate-950 font-bold border-b border-slate-900 text-center">
                          <th className="p-1 border-r border-slate-900 w-8">No</th>
                          <th className="p-1 border-r border-slate-900">Hubungan Keluarga</th>
                          <th className="p-1 border-r border-slate-900">Status Sosial</th>
                          <th className="p-1 border-r border-slate-900">Status Keanggotaan</th>
                          <th className="p-1 border-r border-slate-900">Wadah Kategorial</th>
                          <th className="p-1 border-r border-slate-900">Jabatan Gerejawi</th>
                          <th className="p-1 border-r border-slate-900">Tgl Baptis</th>
                          <th className="p-1 border-r border-slate-900">Tgl Sidi</th>
                          <th className="p-1 border-r border-slate-900">Tgl Nikah</th>
                          <th className="p-1">Disabilitas</th>
                        </tr>
                        <tr className="bg-slate-100 text-slate-600 text-[8px] sm:text-[9px] border-b border-slate-900 text-center">
                          <th className="p-0.5 border-r border-slate-900">(1)</th>
                          <th className="p-0.5 border-r border-slate-900">(11)</th>
                          <th className="p-0.5 border-r border-slate-900">(12)</th>
                          <th className="p-0.5 border-r border-slate-900">(13)</th>
                          <th className="p-0.5 border-r border-slate-900">(14)</th>
                          <th className="p-0.5 border-r border-slate-900">(15)</th>
                          <th className="p-0.5 border-r border-slate-900">(16)</th>
                          <th className="p-0.5 border-r border-slate-900">(17)</th>
                          <th className="p-0.5 border-r border-slate-900">(18)</th>
                          <th className="p-0.5">(19)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-400">
                        {selectedFamily.members.map((m, idx) => {
                          const jabatanList = [
                            m.jabatanStruktural !== 'None' ? m.jabatanStruktural : '',
                            m.jabatanPelayan !== 'None' ? m.jabatanPelayan : '',
                          ].filter(Boolean);
                          const wadahText =
                            m.pengurusIntiWadah !== 'None'
                              ? `${m.wadahKategorial} (${m.pengurusIntiWadah})`
                              : m.wadahKategorial;
                          const disabilitasText =
                            m.disabilitas === 'Tidak'
                              ? 'Tidak'
                              : m.disabilitasDetail
                              ? `${m.disabilitas} (${m.disabilitasDetail})`
                              : m.disabilitas;

                          return (
                            <tr key={m.id} className="text-slate-950 leading-tight">
                              <td className="p-1 text-center font-mono border-r border-slate-900">{idx + 1}</td>
                              <td className="p-1 font-bold border-r border-slate-900 uppercase">{m.hubunganKeluarga}</td>
                              <td className="p-1 border-r border-slate-900 uppercase text-center">{m.statusSosial}</td>
                              <td className="p-1 border-r border-slate-900 uppercase text-center">{m.statusKeanggotaan}</td>
                              <td className="p-1 border-r border-slate-900 uppercase text-center">{wadahText}</td>
                              <td className="p-1 border-r border-slate-900 uppercase text-center">
                                {jabatanList.length > 0 ? jabatanList.join(' / ') : '-'}
                              </td>
                              <td className="p-1 border-r border-slate-900 font-mono text-center">{m.tglBaptis || '-'}</td>
                              <td className="p-1 border-r border-slate-900 font-mono text-center">{m.tglSidi || '-'}</td>
                              <td className="p-1 border-r border-slate-900 font-mono text-center">{m.tglNikah || '-'}</td>
                              <td className="p-1 text-center uppercase">{disabilitasText}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Standard Signatures Zone (3-Column Footer) */}
                  <div className="grid grid-cols-3 gap-6 pt-5 text-center text-[11px] text-slate-950">
                    <div>
                      <p className="font-bold text-slate-800">KEPALA KELUARGA</p>
                      <div className="h-14 flex items-end justify-center font-bold underline uppercase">
                        {selectedFamily.head.nama}
                      </div>
                      <p className="text-[9px] text-slate-500">NKK: {selectedFamily.nkk}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="text-[10px] font-semibold text-slate-700 uppercase">
                        SEKTOR {selectedFamily.sektor} · UNIT {selectedFamily.unit}
                      </div>
                      <div className="w-24 h-10 border border-slate-400 rounded flex items-center justify-center text-[8px] text-slate-500 uppercase tracking-tighter">
                        JEMAAT GETSEMANI
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 uppercase">
                        KETUA MAJELIS JEMAAT (PHMJ)
                      </p>
                      <p className="text-[9px] text-slate-600">GPI PAPUA JEMAAT GETSEMANI</p>
                      <div className="h-12 flex items-end justify-center font-bold underline uppercase text-slate-950">
                        {ketuaPhmj ? ketuaPhmj.nama : 'KETUA PHMJ'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
