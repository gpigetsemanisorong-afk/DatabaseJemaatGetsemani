import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Mutasi, JenisMutasi, Jemaat } from '../../types';
import { generateNKK } from '../../services/nkkGenerator';
import { exportMutasiToExcel } from '../../services/exportService';
import { DualConfirmModal } from '../DualConfirmModal';
import { BarcodeRenderer } from '../BarcodeRenderer';
import {
  UserMinus,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  X,
  Sparkles,
  Heart,
  UserX,
  MapPin,
  Trash2,
} from 'lucide-react';

export const MutasiView: React.FC = () => {
  const {
    mutasi,
    addMutasi,
    deleteMutasi,
    jemaat,
    canEditMutasi,
    canDelete,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJemaatId, setSelectedJemaatId] = useState('');
  const [tanggalMutasi, setTanggalMutasi] = useState(new Date().toISOString().slice(0, 10));
  const [jenisMutasi, setJenisMutasi] = useState<JenisMutasi>('Menikah (KK Baru)');
  const [isCreatingNewKK, setIsCreatingNewKK] = useState(true);
  const [generatedNewNkk, setGeneratedNewNkk] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Mutasi | null>(null);

  // Active jemaat options for mutasi
  const activeJemaatOptions = useMemo(() => {
    return jemaat.filter((j) => j.statusKeanggotaan !== 'Dinonaktifkan');
  }, [jemaat]);

  const selectedJemaat = useMemo(() => {
    return jemaat.find((j) => j.id === selectedJemaatId) || null;
  }, [jemaat, selectedJemaatId]);

  const handleOpenAdd = () => {
    if (activeJemaatOptions.length > 0) {
      const defaultJem = activeJemaatOptions[0];
      setSelectedJemaatId(defaultJem.id);
      const newNkk = generateNKK(defaultJem.sektor, defaultJem.unit, defaultJem.tanggalLahir, defaultJem.jenisKelamin, jemaat);
      setGeneratedNewNkk(newNkk);
    } else {
      setSelectedJemaatId('');
      setGeneratedNewNkk('');
    }
    setTanggalMutasi(new Date().toISOString().slice(0, 10));
    setJenisMutasi('Menikah (KK Baru)');
    setIsCreatingNewKK(true);
    setKeterangan('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleJemaatSelect = (id: string) => {
    setSelectedJemaatId(id);
    const target = jemaat.find((j) => j.id === id);
    if (target) {
      const newNkk = generateNKK(target.sektor, target.unit, target.tanggalLahir, target.jenisKelamin, jemaat);
      setGeneratedNewNkk(newNkk);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedJemaat) {
      setFormError('Harap pilih anggota jemaat yang akan dimutasi.');
      return;
    }

    if (!keterangan.trim()) {
      setFormError('Harap berikan keterangan mutasi.');
      return;
    }

    const payload: Omit<Mutasi, 'id'> = {
      tanggalMutasi,
      nik: selectedJemaat.nik,
      nama: selectedJemaat.nama,
      nkkLama: selectedJemaat.nkk,
      jenisMutasi,
      keterangan: keterangan.trim(),
    };

    const newNkkParam = (jenisMutasi === 'Menikah (KK Baru)' && isCreatingNewKK) ? generatedNewNkk : undefined;
    const ok = await addMutasi(payload, newNkkParam);
    if (ok) {
      setIsModalOpen(false);
    }
  };

  // Filtered mutasi list
  const filteredMutasi = useMemo(() => {
    return mutasi.filter((m) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        m.nama.toLowerCase().includes(q) ||
        m.nik.includes(q) ||
        m.nkkLama.toLowerCase().includes(q) ||
        m.keterangan.toLowerCase().includes(q);

      const matchJenis = filterJenis === 'all' || m.jenisMutasi === filterJenis;
      return matchSearch && matchJenis;
    });
  }, [mutasi, searchTerm, filterJenis]);

  const getMutasiBadge = (jenis: JenisMutasi) => {
    if (jenis === 'Menikah (KK Baru)') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
          <Heart className="w-3 h-3" />
          Menikah (KK Baru)
        </span>
      );
    }
    if (jenis === 'Meninggal Dunia') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
          <UserX className="w-3 h-3" />
          Meninggal Dunia
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
        <MapPin className="w-3 h-3" />
        {jenis}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pengelolaan Status Keanggotaan
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Mutasi Anggota Jemaat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan peristiwa pernikahan (KK baru), kedukaan/meninggal, dan atestasi pindah domisili.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMutasiToExcel(filteredMutasi)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          {canEditMutasi && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Proses Mutasi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama anggota, NIK, NKK lama..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
          >
            <option value="all">Semua Jenis Mutasi</option>
            <option value="Menikah (KK Baru)">Menikah (KK Baru)</option>
            <option value="Meninggal Dunia">Meninggal Dunia</option>
            <option value="Atestasi Keluar">Atestasi Keluar</option>
            <option value="Pindah Domisili">Pindah Domisili</option>
            <option value="Pindah Agama">Pindah Agama</option>
          </select>
        </div>
      </div>

      {/* Mutasi Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5 w-12 text-center">No</th>
                <th className="py-3 px-3.5">Tanggal Mutasi</th>
                <th className="py-3 px-3.5">Nama & NIK</th>
                <th className="py-3 px-3.5">Jenis Mutasi</th>
                <th className="py-3 px-3.5">NKK Lama / Baru</th>
                <th className="py-3 px-3.5">Keterangan / Dokumen</th>
                {canDelete && <th className="py-3 px-3.5 text-right w-16">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMutasi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserMinus className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Belum ada riwayat mutasi anggota tercatat.</p>
                  </td>
                </tr>
              ) : (
                filteredMutasi.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 text-center font-mono tabular-nums text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {item.tanggalMutasi}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{item.nama}</div>
                      <div className="text-[11px] font-mono text-slate-500">NIK: {item.nik}</div>
                    </td>

                    <td className="py-3 px-3.5">
                      {getMutasiBadge(item.jenisMutasi)}
                    </td>

                    <td className="py-3 px-3.5 font-mono">
                      <div className="text-slate-600 text-[11px]">Lama: {item.nkkLama}</div>
                      {item.nkkBaru && (
                        <div className="text-emerald-700 font-bold text-[11px]">
                          Baru: {item.nkkBaru}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-slate-700 max-w-xs">
                      {item.keterangan}
                    </td>

                    {canDelete && (
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Catatan Mutasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mutasi Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0a0a0d] border-b border-amber-500/30 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                  Prosedur Administrasi
                </span>
                <h3 className="font-bold text-sm text-amber-100">Catat Mutasi Anggota Jemaat</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Jemaat Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Anggota Jemaat yang Dimutasi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedJemaatId}
                  onChange={(e) => handleJemaatSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {activeJemaatOptions.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nama} (NIK: {j.nik} - Sektor {j.sektor})
                    </option>
                  ))}
                </select>
              </div>

              {selectedJemaat && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{selectedJemaat.nama}</div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    NIK: {selectedJemaat.nik} · NKK Saat Ini: {selectedJemaat.nkk}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Sektor {selectedJemaat.sektor} ({selectedJemaat.unit}) · Hubungan: {selectedJemaat.hubunganKeluarga}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Mutasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalMutasi}
                    onChange={(e) => setTanggalMutasi(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Mutasi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={jenisMutasi}
                    onChange={(e) => setJenisMutasi(e.target.value as JenisMutasi)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Menikah (KK Baru)">Menikah (KK Baru)</option>
                    <option value="Meninggal Dunia">Meninggal Dunia</option>
                    <option value="Atestasi Keluar">Atestasi Keluar</option>
                    <option value="Pindah Domisili">Pindah Domisili</option>
                    <option value="Pindah Agama">Pindah Agama</option>
                  </select>
                </div>
              </div>

              {/* Automatic New NKK Generator for Menikah */}
              {jenisMutasi === 'Menikah (KK Baru)' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Pemekaran Kartu Keluarga Baru
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-amber-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCreatingNewKK}
                        onChange={(e) => setIsCreatingNewKK(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Generate NKK Baru</span>
                    </label>
                  </div>

                  {isCreatingNewKK && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nomor NKK Baru Terbuat Otomatis (18 Karakter)
                      </label>
                      <input
                        type="text"
                        value={generatedNewNkk}
                        onChange={(e) => setGeneratedNewNkk(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-amber-300 rounded-lg"
                      />
                      <p className="text-[10px] text-amber-700 mt-1">
                        Anggota ini akan otomatis diperbarui menjadi Kepala Keluarga di KK barunya.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Alasan Mutasi / Surat Bukti <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Pemberkatan nikah kudus / No. Surat Atestasi / Dimakamkan di TPU..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  required
                />
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
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs"
                >
                  Proses & Update Status Jemaat
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
            await deleteMutasi(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Hapus Riwayat Mutasi"
        description={`Apakah Anda yakin ingin menghapus catatan mutasi untuk ${deleteTarget?.nama}?`}
        confirmKeyword="HAPUS"
        confirmButtonText="Hapus Mutasi"
        isDestructive={true}
      />
    </div>
  );
};
