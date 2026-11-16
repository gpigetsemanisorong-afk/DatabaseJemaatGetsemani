import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KunjunganPastoral,
  JenisKunjungan,
  StatusTindakLanjut,
  SektorName,
  UnitName,
} from '../../types';
import { exportKunjunganToExcel } from '../../services/exportService';
import { UNIT_OPTIONS } from '../../services/nkkGenerator';
import { DualConfirmModal } from '../DualConfirmModal';
import {
  HeartHandshake,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const KunjunganView: React.FC = () => {
  const {
    kunjungan,
    addKunjungan,
    updateKunjungan,
    deleteKunjungan,
    canDelete,
    jemaat,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KunjunganPastoral | null>(null);

  // Form states
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [sektor, setSektor] = useState<SektorName>('Filadelfia');
  const [unit, setUnit] = useState<UnitName>('Rehobot');
  const [selectedNkk, setSelectedNkk] = useState('');
  const [keluargaTujuan, setKeluargaTujuan] = useState('');
  const [jenisKunjungan, setJenisKunjungan] = useState<JenisKunjungan>('Rutin');
  const [timPelayan, setTimPelayan] = useState('');
  const [catatanDoa, setCatatanDoa] = useState('');
  const [statusTindakLanjut, setStatusTindakLanjut] = useState<StatusTindakLanjut>('Selesai');
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<KunjunganPastoral | null>(null);

  // Registered Kepala Keluarga list for easy family picker
  const kkList = useMemo(() => {
    return jemaat.filter((j) => j.hubunganKeluarga === 'Kepala Keluarga' && j.nkk);
  }, [jemaat]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTanggal(new Date().toISOString().slice(0, 10));
    setSektor('Filadelfia');
    setUnit('Rehobot');
    if (kkList.length > 0) {
      setSelectedNkk(kkList[0].nkk);
      setKeluargaTujuan(`Kel. ${kkList[0].nama}`);
    } else {
      setSelectedNkk('');
      setKeluargaTujuan('');
    }
    setJenisKunjungan('Rutin');
    setTimPelayan('Pdt. Marthen Wanma & Majelis Sektor');
    setCatatanDoa('');
    setStatusTindakLanjut('Selesai');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KunjunganPastoral) => {
    setEditingItem(item);
    setTanggal(item.tanggal);
    setSektor(item.sektor);
    setUnit(item.unit);
    setSelectedNkk(item.nkkTujuan);
    setKeluargaTujuan(item.keluargaTujuan);
    setJenisKunjungan(item.jenisKunjungan);
    setTimPelayan(item.timPelayan);
    setCatatanDoa(item.catatanDoa);
    setStatusTindakLanjut(item.statusTindakLanjut);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSelectFamily = (nkk: string) => {
    setSelectedNkk(nkk);
    const target = kkList.find((k) => k.nkk === nkk);
    if (target) {
      setKeluargaTujuan(`Kel. ${target.nama}`);
      setSektor(target.sektor);
      setUnit(target.unit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!keluargaTujuan.trim()) {
      setFormError('Nama keluarga tujuan wajib diisi.');
      return;
    }

    if (!catatanDoa.trim()) {
      setFormError('Catatan doa dan pokok pergumulan jemaat wajib diisi.');
      return;
    }

    const payload: Omit<KunjunganPastoral, 'id'> = {
      tanggal,
      sektor,
      unit,
      nkkTujuan: selectedNkk || 'N/A',
      keluargaTujuan: keluargaTujuan.trim(),
      jenisKunjungan,
      timPelayan: timPelayan.trim() || 'Tim Pastoral',
      catatanDoa: catatanDoa.trim(),
      statusTindakLanjut,
    };

    let ok = false;
    if (editingItem) {
      ok = await updateKunjungan(editingItem.id, payload);
    } else {
      ok = await addKunjungan(payload);
    }

    if (ok) {
      setIsModalOpen(false);
    }
  };

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return kunjungan.filter((k) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        k.keluargaTujuan.toLowerCase().includes(q) ||
        k.catatanDoa.toLowerCase().includes(q) ||
        k.timPelayan.toLowerCase().includes(q) ||
        k.sektor.toLowerCase().includes(q);

      const matchJenis = filterJenis === 'all' || k.jenisKunjungan === filterJenis;
      const matchStatus = filterStatus === 'all' || k.statusTindakLanjut === filterStatus;

      return matchSearch && matchJenis && matchStatus;
    });
  }, [kunjungan, searchTerm, filterJenis, filterStatus]);

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pelayanan Diakonia & Penggembalaan
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Jurnal Kunjungan Pastoral
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi pelayanan perkunjungan jemaat, pokok doa, dan tindak lanjut pastoral.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportKunjunganToExcel(filteredVisits)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jurnal Kunjungan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari keluarga, pokok doa, pelayan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
          >
            <option value="all">Semua Jenis Kunjungan</option>
            <option value="Rutin">Rutin Bulanan</option>
            <option value="Sakit">Sakit / Rawat Inap</option>
            <option value="Kedukaan">Kedukaan / Penghiburan</option>
            <option value="Syukur">Ucapan Syukur</option>
            <option value="Khusus">Khusus / Khusus Majelis</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
          >
            <option value="all">Semua Status Tindak Lanjut</option>
            <option value="Selesai">Selesai</option>
            <option value="Perlu Kunjungan Lanjutan">Perlu Kunjungan Lanjutan</option>
            <option value="Didoakan Khusus">Didoakan Khusus</option>
            <option value="Dalam Perhatian Majelis">Dalam Perhatian Majelis</option>
          </select>
        </div>
      </div>

      {/* Visits List Cards */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <HeartHandshake className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Belum ada data jurnal kunjungan.</p>
          </div>
        ) : (
          filteredVisits.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {item.keluargaTujuan}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                    {item.jenisKunjungan}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-600">
                    Sektor {item.sektor} ({item.unit})
                  </span>
                  {item.nkkTujuan && item.nkkTujuan !== 'N/A' && (
                    <span className="text-[11px] font-mono text-slate-400">
                      NKK: {item.nkkTujuan}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                  "{item.catatanDoa}"
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.tanggal}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>Tim Pelayan: <strong className="text-slate-800">{item.timPelayan}</strong></span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.statusTindakLanjut === 'Selesai'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.statusTindakLanjut === 'Perlu Kunjungan Lanjutan'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.statusTindakLanjut}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Jurnal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Jurnal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0a0a0d] border-b border-amber-500/30 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-amber-200">
                {editingItem ? 'Edit Jurnal Kunjungan' : 'Tambah Jurnal Kunjungan Pastoral'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Kunjungan
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kunjungan
                  </label>
                  <select
                    value={jenisKunjungan}
                    onChange={(e) => setJenisKunjungan(e.target.value as JenisKunjungan)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Rutin">Rutin Bulanan</option>
                    <option value="Sakit">Sakit / Rawat Inap</option>
                    <option value="Kedukaan">Kedukaan / Penghiburan</option>
                    <option value="Syukur">Ucapan Syukur</option>
                    <option value="Khusus">Khusus / Khusus Majelis</option>
                  </select>
                </div>
              </div>

              {/* Pilih Keluarga Terdaftar atau Manual */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih dari Kepala Keluarga Terdaftar (Otomatis)
                </label>
                <select
                  value={selectedNkk}
                  onChange={(e) => handleSelectFamily(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value="">-- Ketik Manual atau Pilih KK di Bawah --</option>
                  {kkList.map((k) => (
                    <option key={k.id} value={k.nkk}>
                      Kel. {k.nama} (Sektor {k.sektor} - {k.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Keluarga Tujuan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={keluargaTujuan}
                  onChange={(e) => setKeluargaTujuan(e.target.value)}
                  placeholder="Contoh: Kel. Simon Rumbewas"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sektor
                  </label>
                  <select
                    value={sektor}
                    onChange={(e) => {
                      const newSektor = e.target.value as SektorName;
                      setSektor(newSektor);
                      setUnit(UNIT_OPTIONS[newSektor][0]);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Filadelfia">Filadelfia</option>
                    <option value="Petra">Petra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitName)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    {UNIT_OPTIONS[sektor].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tim Pelayan / Pendeta / Majelis
                </label>
                <input
                  type="text"
                  value={timPelayan}
                  onChange={(e) => setTimPelayan(e.target.value)}
                  placeholder="Nama pendeta atau majelis pendamping"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Doa & Pokok Pergumulan Jemaat <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={catatanDoa}
                  onChange={(e) => setCatatanDoa(e.target.value)}
                  placeholder="Tuliskan pokok doa, firman penguatan yang dibawakan, dan catatan penting..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Tindak Lanjut
                </label>
                <select
                  value={statusTindakLanjut}
                  onChange={(e) => setStatusTindakLanjut(e.target.value as StatusTindakLanjut)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Selesai">Selesai</option>
                  <option value="Perlu Kunjungan Lanjutan">Perlu Kunjungan Lanjutan</option>
                  <option value="Didoakan Khusus">Didoakan Khusus</option>
                  <option value="Dalam Perhatian Majelis">Dalam Perhatian Majelis</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Catat Kunjungan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DualConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteKunjungan(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Hapus Catatan Kunjungan Pastoral"
        description={`Apakah Anda yakin ingin menghapus catatan kunjungan ke ${deleteTarget?.keluargaTujuan}?`}
        confirmKeyword="HAPUS"
        confirmButtonText="Hapus Jurnal"
        isDestructive={true}
      />
    </div>
  );
};
