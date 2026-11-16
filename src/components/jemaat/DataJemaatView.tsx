import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Jemaat, SektorName, WadahKategorial, StatusKeanggotaan } from '../../types';
import { JemaatFormModal } from './JemaatFormModal';
import { JemaatProfileModal } from './JemaatProfileModal';
import { exportJemaatToExcel, exportJemaatToCSV } from '../../services/exportService';
import { DualConfirmModal } from '../DualConfirmModal';
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Edit,
  Trash2,
  CreditCard,
  FileText,
  Phone,
  MapPin,
  Eye,
  AlertTriangle,
  UserX,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export const DataJemaatView: React.FC = () => {
  const {
    jemaat,
    deleteJemaat,
    canDelete,
    canEditJemaat,
    setSelectedNkkForKK,
    setSelectedJemaatForKtp,
    setActiveMenu,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');
  const [filterSektor, setFilterSektor] = useState<string>('all');
  const [filterWadah, setFilterWadah] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchTerm(globalSearchQuery);
      setFilterSektor('all');
      setFilterWadah('all');
      setFilterStatus('all');
    }
  }, [globalSearchQuery]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJemaat, setEditingJemaat] = useState<Jemaat | null>(null);
  const [viewingProfileJemaat, setViewingProfileJemaat] = useState<Jemaat | null>(null);

  // Status statistics for admin notification
  const countAkanMutasi = useMemo(
    () => jemaat.filter((j) => j.statusMutasi === 'Akan Mutasi').length,
    [jemaat]
  );
  const countDinonaktifkan = useMemo(
    () => jemaat.filter((j) => j.statusKeanggotaan === 'Dinonaktifkan').length,
    [jemaat]
  );

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [targetDeleteJemaat, setTargetDeleteJemaat] = useState<Jemaat | null>(null);

  // Filtered dataset
  const filteredJemaat = useMemo(() => {
    return jemaat.filter((j) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        j.nama.toLowerCase().includes(q) ||
        j.nik.includes(q) ||
        j.nkk.toLowerCase().includes(q) ||
        (j.pekerjaan && j.pekerjaan.toLowerCase().includes(q)) ||
        (j.alamat && j.alamat.toLowerCase().includes(q));

      const matchSektor = filterSektor === 'all' || j.sektor === filterSektor;
      const matchWadah = filterWadah === 'all' || j.wadahKategorial === filterWadah;
      
      let matchStatus = true;
      if (filterStatus === 'akan-mutasi') {
        matchStatus = j.statusMutasi === 'Akan Mutasi';
      } else if (filterStatus !== 'all') {
        matchStatus = j.statusKeanggotaan === filterStatus;
      }

      return matchSearch && matchSektor && matchWadah && matchStatus;
    });
  }, [jemaat, searchTerm, filterSektor, filterWadah, filterStatus]);

  const handleOpenAdd = () => {
    setEditingJemaat(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: Jemaat) => {
    setEditingJemaat(item);
    setIsFormModalOpen(true);
  };

  const handlePromptDelete = (item: Jemaat) => {
    setTargetDeleteJemaat(item);
    setDeletingId(item.id);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteJemaat(deletingId);
      setDeletingId(null);
      setTargetDeleteJemaat(null);
    }
  };

  const handleViewKK = (nkk: string) => {
    setSelectedNkkForKK(nkk);
    setActiveMenu('kelola-data-kk');
  };

  const handleViewKtp = (item: Jemaat) => {
    setSelectedJemaatForKtp(item);
    setActiveMenu('kelola-kartu-anggota');
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Manajemen Database Jemaat
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Seluruh Anggota Jemaat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap jemaat GPI Getsemani terhubung dengan sheet "Jemaat".
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportJemaatToExcel(filteredJemaat)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Download file Excel data jemaat yang sedang difilter"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => exportJemaatToCSV(filteredJemaat)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
            title="Download file CSV data jemaat yang sedang difilter"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {canEditJemaat && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Jemaat</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Quick Notification Bar for Status Akan Mutasi & Dinonaktifkan */}
      {(countAkanMutasi > 0 || countDinonaktifkan > 0) && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border-2 border-amber-400/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-300 uppercase tracking-widest">
                  Notifikasi Cepat Admin
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Monitoring Perubahan Status Jemaat
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                Ditemukan{' '}
                <strong className="text-amber-900 font-bold underline cursor-pointer" onClick={() => setFilterStatus('akan-mutasi')}>
                  {countAkanMutasi} jemaat akan segera mutasi
                </strong>{' '}
                dan{' '}
                <strong className="text-rose-800 font-bold underline cursor-pointer" onClick={() => setFilterStatus('Dinonaktifkan')}>
                  {countDinonaktifkan} jemaat berstatus tidak aktif
                </strong>. Klik tombol pintas untuk memfilter.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {countAkanMutasi > 0 && (
              <button
                onClick={() => setFilterStatus('akan-mutasi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                  filterStatus === 'akan-mutasi'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400'
                    : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Akan Mutasi ({countAkanMutasi})</span>
              </button>
            )}
            {countDinonaktifkan > 0 && (
              <button
                onClick={() => setFilterStatus('Dinonaktifkan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                  filterStatus === 'Dinonaktifkan'
                    ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-400'
                    : 'bg-white hover:bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>Tidak Aktif ({countDinonaktifkan})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari NIK, NKK, Nama, Pekerjaan, Alamat..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Sektor Filter */}
          <div>
            <select
              value={filterSektor}
              onChange={(e) => setFilterSektor(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="all">Semua Sektor</option>
              <option value="Filadelfia">Sektor Filadelfia</option>
              <option value="Petra">Sektor Petra</option>
            </select>
          </div>

          {/* Wadah Kategorial Filter */}
          <div>
            <select
              value={filterWadah}
              onChange={(e) => setFilterWadah(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="all">Semua Wadah</option>
              <option value="PAR">PAR (Anak & Remaja)</option>
              <option value="PP">PP (Pemuda)</option>
              <option value="PERPRI">PERPRI (Pria)</option>
              <option value="PERWATA">PERWATA (Wanita)</option>
              <option value="LANSIA">LANSIA (Lansia)</option>
            </select>
          </div>

          {/* Status Keanggotaan Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold ${
                filterStatus === 'akan-mutasi'
                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                  : filterStatus === 'Dinonaktifkan'
                  ? 'bg-rose-100 text-rose-900 border-rose-400'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <option value="all">Semua Status</option>
              <option value="akan-mutasi">⚠️ Akan Segera Mutasi ({countAkanMutasi})</option>
              <option value="Jemaat Tetap">Jemaat Tetap (Aktif)</option>
              <option value="Simpatisan">Simpatisan</option>
              <option value="Dinonaktifkan">⛔ Dinonaktifkan ({countDinonaktifkan})</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Menampilkan <span className="font-semibold text-slate-800 font-mono tabular-nums">{filteredJemaat.length}</span> dari {jemaat.length} anggota
          </div>
          {(searchTerm || filterSektor !== 'all' || filterWadah !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setGlobalSearchQuery('');
                setFilterSektor('all');
                setFilterWadah('all');
                setFilterStatus('all');
              }}
              className="text-amber-700 hover:text-amber-800 font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5 w-12 text-center">No</th>
                <th className="py-3 px-3.5">Nama & NIK</th>
                <th className="py-3 px-3.5">NKK & Hubungan</th>
                <th className="py-3 px-3.5">L/P & Umur</th>
                <th className="py-3 px-3.5">Wilayah (Sektor/Unit)</th>
                <th className="py-3 px-3.5">Wadah & Jabatan</th>
                <th className="py-3 px-3.5">Pekerjaan & Kontak</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJemaat.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Tidak ada data jemaat yang cocok dengan kriteria pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredJemaat.map((j, idx) => (
                  <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* No */}
                    <td className="py-3 px-3.5 text-center font-mono tabular-nums text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Nama & NIK */}
                    <td className="py-3 px-3.5">
                      <button
                        onClick={() => setViewingProfileJemaat(j)}
                        className="font-semibold text-slate-900 hover:text-amber-700 hover:underline leading-tight text-left block"
                        title="Klik untuk membuka profil lengkap & indikator status"
                      >
                        {j.nama}
                      </button>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        NIK: {j.nik}
                      </div>
                      {j.statusSosial !== 'Umum' && (
                        <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-0.5">
                          Status: {j.statusSosial}
                        </span>
                      )}
                    </td>

                    {/* NKK & Hubungan */}
                    <td className="py-3 px-3.5">
                      <button
                        onClick={() => handleViewKK(j.nkk)}
                        className="text-[11px] font-mono font-semibold text-sky-700 hover:text-sky-900 hover:underline block"
                        title="Klik untuk membuka Kartu Keluarga"
                      >
                        {j.nkk}
                      </button>
                      <span className="text-[11px] text-slate-500">
                        {j.hubunganKeluarga}
                      </span>
                    </td>

                    {/* L/P & Umur */}
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-700">
                        {j.jenisKelamin === 'Laki-laki' ? 'L' : 'P'} · {j.umur} thn
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Gol: {j.golonganDarah}
                      </div>
                    </td>

                    {/* Sektor & Unit */}
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-800">
                        {j.sektor}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Unit {j.unit}
                      </div>
                    </td>

                    {/* Wadah & Jabatan */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {j.wadahKategorial}
                        </span>
                        {j.pengurusIntiWadah !== 'None' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            {j.pengurusIntiWadah}
                          </span>
                        )}
                      </div>
                      {(j.jabatanStruktural !== 'None' || j.jabatanPelayan !== 'None') && (
                        <div className="text-[11px] text-sky-700 mt-0.5">
                          {j.jabatanStruktural !== 'None' ? j.jabatanStruktural : j.jabatanPelayan}
                        </div>
                      )}
                    </td>

                    {/* Pekerjaan & Kontak */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-700 truncate max-w-[150px]">
                        {j.pekerjaan === 'Lain-lain' ? j.pekerjaanLainnya || 'Lain-lain' : j.pekerjaan}
                      </div>
                      {j.noHp ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{j.noHp}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>

                    {/* Status Keanggotaan & Indikator Mutasi */}
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        {j.statusMutasi === 'Akan Mutasi' && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs cursor-pointer hover:bg-amber-200"
                            onClick={() => setViewingProfileJemaat(j)}
                            title={j.rencanaMutasiDetail || 'Jemaat ditandai akan segera melakukan mutasi'}
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-700 animate-pulse" />
                            <span>Akan Mutasi</span>
                          </span>
                        )}
                        {j.statusKeanggotaan === 'Dinonaktifkan' ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 cursor-pointer hover:bg-rose-200"
                            onClick={() => setViewingProfileJemaat(j)}
                            title="Status jemaat dinonaktifkan / tidak aktif"
                          >
                            <UserX className="w-3 h-3 text-rose-700" />
                            <span>Tidak Aktif</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              j.statusKeanggotaan === 'Jemaat Tetap'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {j.statusKeanggotaan}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingProfileJemaat(j)}
                          title="Lihat Profil Lengkap & Indikator Status"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                        </button>

                        <button
                          onClick={() => handleViewKtp(j)}
                          title="Lihat / Cetak Kartu Anggota (KTP)"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {canEditJemaat && (
                          <button
                            onClick={() => handleOpenEdit(j)}
                            title="Edit Biodata"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handlePromptDelete(j)}
                            title="Hapus Data (Super Admin)"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jemaat Profile Detail Modal with Status Indicators */}
      <JemaatProfileModal
        isOpen={!!viewingProfileJemaat}
        onClose={() => setViewingProfileJemaat(null)}
        jemaat={viewingProfileJemaat}
        onEdit={handleOpenEdit}
      />

      {/* Jemaat Form Modal */}
      <JemaatFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingJemaat}
      />

      {/* Delete Confirmation Modal */}
      <DualConfirmModal
        isOpen={!!deletingId}
        onClose={() => {
          setDeletingId(null);
          setTargetDeleteJemaat(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Jemaat"
        description={`Apakah Anda yakin ingin menghapus data anggota "${targetDeleteJemaat?.nama}" (NIK: ${targetDeleteJemaat?.nik}) dari database jemaat Getsemani? Tindakan ini akan menghapus data secara permanen.`}
        confirmKeyword="HAPUS"
        confirmButtonText="Ya, Hapus Data"
        isDestructive={true}
      />
    </div>
  );
};
