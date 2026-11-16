import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  exportToExcel,
  exportElementToPDF,
  exportJemaatToExcel,
  exportJemaatToCSV,
} from '../../services/exportService';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  Users,
  CheckCircle,
  Database,
  Sparkles,
} from 'lucide-react';

interface RekapitulasiViewProps {
  initialTab?: 'sektor' | 'kategorial';
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  initialTab = 'sektor',
}) => {
  const { jemaat, activeMenu, setActiveMenu, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'sektor' | 'kategorial'>(
    activeMenu === 'rekap-kategorial' ? 'kategorial' : initialTab
  );

  const [periodeType, setPeriodeType] = useState<'Bulanan' | 'Mingguan'>('Bulanan');
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'active'>('all');

  // Active jemaat dataset
  const activeJemaat = useMemo(() => {
    return jemaat.filter((j) => j.statusKeanggotaan !== 'Dinonaktifkan');
  }, [jemaat]);

  // Sektor & Unit Summary Computation
  const sektorUnitData = useMemo(() => {
    const list = [
      { sektor: 'Filadelfia', unit: 'Rehobot' },
      { sektor: 'Filadelfia', unit: 'Silo' },
      { sektor: 'Petra', unit: 'Pniel' },
      { sektor: 'Petra', unit: 'Siloam' },
    ];

    return list.map((item) => {
      const members = activeJemaat.filter(
        (j) => j.sektor === item.sektor && j.unit === item.unit
      );
      const totalKK = new Set(
        members.filter((j) => j.hubunganKeluarga === 'Kepala Keluarga').map((j) => j.nkk)
      ).size;
      const laki = members.filter((j) => j.jenisKelamin === 'Laki-laki').length;
      const perempuan = members.filter((j) => j.jenisKelamin === 'Perempuan').length;
      const sidi = members.filter((j) => !!j.tglSidi).length;
      const baptis = members.filter((j) => !!j.tglBaptis).length;

      return {
        ...item,
        totalJiwa: members.length,
        totalKK,
        laki,
        perempuan,
        sidi,
        baptis,
      };
    });
  }, [activeJemaat]);

  // Unsur Kategorial by Sektor Summary Computation
  const kategorialData = useMemo(() => {
    const wadahList = ['PAR', 'PP', 'PERPRI', 'PERWATA', 'LANSIA'] as const;

    return wadahList.map((wadah) => {
      const allWadah = activeJemaat.filter((j) => j.wadahKategorial === wadah);
      const filadelfia = allWadah.filter((j) => j.sektor === 'Filadelfia').length;
      const petra = allWadah.filter((j) => j.sektor === 'Petra').length;
      const laki = allWadah.filter((j) => j.jenisKelamin === 'Laki-laki').length;
      const perempuan = allWadah.filter((j) => j.jenisKelamin === 'Perempuan').length;

      return {
        wadah,
        total: allWadah.length,
        filadelfia,
        petra,
        laki,
        perempuan,
      };
    });
  }, [activeJemaat]);

  // Export Summary Table to Excel
  const handleExportSummaryExcel = () => {
    if (activeTab === 'sektor') {
      const data = sektorUnitData.map((row, idx) => ({
        No: idx + 1,
        Sektor: row.sektor,
        Unit: row.unit,
        'Kepala Keluarga (KK)': row.totalKK,
        'Laki-laki': row.laki,
        Perempuan: row.perempuan,
        'Total Jiwa': row.totalJiwa,
        'Sudah Baptis': row.baptis,
        'Sudah Sidi': row.sidi,
      }));
      exportToExcel(data, `Rekap_Statistik_Sektor_Unit_${selectedMonth}`, 'Rekap_Sektor');
      addToast('success', 'Ekspor Berhasil', 'Tabel rekapitulasi sektor berhasil diekspor ke Excel.');
    } else {
      const data = kategorialData.map((row, idx) => ({
        No: idx + 1,
        'Wadah Kategorial': row.wadah,
        'Sektor Filadelfia': row.filadelfia,
        'Sektor Petra': row.petra,
        'Laki-laki': row.laki,
        Perempuan: row.perempuan,
        'Total Anggota': row.total,
      }));
      exportToExcel(data, `Rekap_Statistik_Wadah_Kategorial_${selectedMonth}`, 'Rekap_Kategorial');
      addToast('success', 'Ekspor Berhasil', 'Tabel rekapitulasi wadah kategorial berhasil diekspor ke Excel.');
    }
  };

  // Export Raw Jemaat Data to Excel or CSV for external spreadsheets
  const handleExportJemaatRaw = (format: 'xlsx' | 'csv') => {
    const listToExport = exportScope === 'active' ? activeJemaat : jemaat;
    const scopeLabel = exportScope === 'active' ? 'Aktif' : 'Semua';
    const filename = `Data_Jemaat_GPI_Getsemani_${scopeLabel}_${selectedMonth}_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'xlsx') {
      exportJemaatToExcel(listToExport, filename);
      addToast(
        'success',
        'Ekspor Data Jemaat Berhasil',
        `${listToExport.length} data jemaat berhasil diekspor ke Excel (.xlsx) untuk spreadsheet eksternal.`
      );
    } else {
      exportJemaatToCSV(listToExport, filename);
      addToast(
        'success',
        'Ekspor Data Jemaat Berhasil',
        `${listToExport.length} data jemaat berhasil diekspor ke CSV (.csv) format UTF-8 BOM.`
      );
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    await exportElementToPDF(
      'rekap-sheet-container',
      `Laporan_Statistik_${activeTab}_Getsemani_${selectedMonth}`,
      'l',
      'a4'
    );
    setIsExportingPdf(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Laporan & Rekapitulasi Resmi
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Rekapitulasi Statistik & Ekspor Data
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan data berkala per sektor & unit, sebaran kategorial, serta ekspor data jemaat untuk aplikasi spreadsheet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Raw Data Jemaat Export Buttons */}
          <button
            onClick={() => handleExportJemaatRaw('xlsx')}
            title="Download seluruh data jemaat dalam format Excel .xlsx"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Jemaat (.xlsx)</span>
          </button>

          <button
            onClick={() => handleExportJemaatRaw('csv')}
            title="Download seluruh data jemaat dalam format CSV untuk Excel / Google Sheets"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Ekspor Jemaat (.csv)</span>
          </button>

          <button
            onClick={handleExportSummaryExcel}
            title="Download tabel ringkasan statistik yang aktif saat ini"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Rekap Tabel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Menyiapkan PDF...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Ekspor Data Jemaat untuk Spreadsheet Eksternal Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  Fitur Spreadsheet Eksternal
                </span>
                <span className="text-xs text-emerald-200 font-mono">
                  {exportScope === 'active' ? `${activeJemaat.length} Jemaat Aktif` : `${jemaat.length} Total Data Jemaat`}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                Ekspor Data Jemaat Lengkap (CSV / Excel) untuk Diolah di Aplikasi Spreadsheet
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Unduh file raw data jemaat berisi 30 kolom atribut (NIK, NKK, Tempat/Tgl Lahir, Status Mutasi, Pendidikan, Pekerjaan, Sakramen) siap diimpor ke Microsoft Excel, Google Sheets, atau SPSS.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Scope Filter Radio */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setExportScope('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  exportScope === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Semua ({jemaat.length})
              </button>
              <button
                onClick={() => setExportScope('active')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  exportScope === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Aktif ({activeJemaat.length})
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleExportJemaatRaw('xlsx')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-950" />
              <span>Unduh Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleExportJemaatRaw('csv')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-sky-100" />
              <span>Unduh CSV (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Period Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('sektor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'sektor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tab 1: Rekap Per Sektor & Unit</span>
          </button>

          <button
            onClick={() => setActiveTab('kategorial')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'kategorial'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tab 2: Rekap Unsur Kategorial</span>
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setPeriodeType('Bulanan')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                periodeType === 'Bulanan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setPeriodeType('Mingguan')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                periodeType === 'Mingguan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Mingguan
            </button>
          </div>

          <input
            type={periodeType === 'Bulanan' ? 'month' : 'date'}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-700"
          />
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div
        id="rekap-sheet-container"
        className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6"
      >
        {/* Kop Surat Laporan Resmi Gereja */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/church_emblem_1794476998536.jpg"
              alt="Logo"
              className="w-12 h-12 rounded-full border border-amber-600 object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-extrabold text-sm uppercase text-slate-900">
                Gereja Protestan Indonesia di Papua (GPI Papua)
              </h3>
              <h4 className="font-bold text-xs text-slate-700">
                Klasis Sorong · Jemaat Getsemani
              </h4>
              <p className="text-[10px] text-slate-500">
                Laporan Rekapitulasi Statistik Anggota Jemaat · Periode {selectedMonth}
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-500">
            Dicetak: {new Date().toLocaleDateString('id-ID')}
          </div>
        </div>

        {activeTab === 'sektor' ? (
          /* TAB 1: REKAPITULASI SEKTOR & UNIT */
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tabel Statistik Jumlah Jiwa, KK & Sakramen per Sektor dan Unit
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-center">
                    <th className="py-2.5 px-3 border-r border-slate-200 w-10">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Sektor</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Unit</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Jumlah KK</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Laki-laki</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Perempuan</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 bg-amber-50/50">Total Jiwa</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Baptis</th>
                    <th className="py-2.5 px-3">Sidi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sektorUnitData.map((row, idx) => (
                    <tr key={`${row.sektor}-${row.unit}`} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold border-r border-slate-200">{row.sektor}</td>
                      <td className="py-2.5 px-3 border-r border-slate-200">Unit {row.unit}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold border-r border-slate-200">{row.totalKK}</td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{row.laki}</td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{row.perempuan}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold bg-amber-50/30 text-amber-900 border-r border-slate-200">
                        {row.totalJiwa}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{row.baptis}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{row.sidi}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="py-2.5 px-3 text-center border-r border-slate-200">
                      TOTAL KESELURUHAN
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {sektorUnitData.reduce((acc, r) => acc + r.totalKK, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {sektorUnitData.reduce((acc, r) => acc + r.laki, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {sektorUnitData.reduce((acc, r) => acc + r.perempuan, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-900 bg-amber-100/50 border-r border-slate-200">
                      {sektorUnitData.reduce((acc, r) => acc + r.totalJiwa, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {sektorUnitData.reduce((acc, r) => acc + r.baptis, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {sektorUnitData.reduce((acc, r) => acc + r.sidi, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB 2: REKAPITULASI UNSUR KATEGORIAL */
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tabel Distribusi Anggota Wadah Kategorial (PAR, PP, PERPRI, PERWATA, LANSIA)
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-center">
                    <th className="py-2.5 px-3 border-r border-slate-200 w-10">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Wadah Kategorial</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Sektor Filadelfia</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Sektor Petra</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Laki-laki</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Perempuan</th>
                    <th className="py-2.5 px-3 bg-amber-50/50">Total Anggota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kategorialData.map((row, idx) => (
                    <tr key={row.wadah} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {row.wadah}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{row.filadelfia}</td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{row.petra}</td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{row.laki}</td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{row.perempuan}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold bg-amber-50/30 text-amber-900">
                        {row.total} Jiwa
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-2.5 px-3 text-center border-r border-slate-200">
                      TOTAL KESELURUHAN
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {kategorialData.reduce((acc, r) => acc + r.filadelfia, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {kategorialData.reduce((acc, r) => acc + r.petra, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {kategorialData.reduce((acc, r) => acc + r.laki, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                      {kategorialData.reduce((acc, r) => acc + r.perempuan, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-900 bg-amber-100/50">
                      {kategorialData.reduce((acc, r) => acc + r.total, 0)} Jiwa
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Signature Footprint */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-slate-900">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-semibold text-slate-800">Sekretaris PHMJ Getsemani</p>
            <div className="h-16 flex items-end justify-center font-bold underline">
              Pnt. Yan Kambuaya, S.Sos
            </div>
          </div>

          <div>
            <p className="text-slate-600">Sorong, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold text-slate-800">Ketua PHMJ Getsemani</p>
            <div className="h-16 flex items-end justify-center font-bold underline">
              Pdt. Marthen Wanma, S.Th
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
