import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Inventaris,
  KategoriBarang,
  KondisiBarang,
} from '../../types';
import { exportInventarisToExcel } from '../../services/exportService';
import { DualConfirmModal } from '../DualConfirmModal';
import {
  Package,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Image as ImageIcon,
  Edit,
  Trash2,
  X,
  Upload,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

export const InventarisView: React.FC = () => {
  const {
    inventaris,
    addInventaris,
    updateInventaris,
    deleteInventaris,
    canEditInventaris,
    canDelete,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterKondisi, setFilterKondisi] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventaris | null>(null);

  // Form states
  const [kodeBarang, setKodeBarang] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [kategori, setKategori] = useState<KategoriBarang>('Elektronik & Sound System');
  const [lokasi, setLokasi] = useState('Gedung Gereja Utama');
  const [jumlah, setJumlah] = useState(1);
  const [satuan, setSatuan] = useState('Unit');
  const [tahunPerolehan, setTahunPerolehan] = useState(new Date().getFullYear());
  const [kondisi, setKondisi] = useState<KondisiBarang>('Baik');
  const [keterangan, setKeterangan] = useState('');
  const [fotoBase64, setFotoBase64] = useState<string>('');
  const [formError, setFormError] = useState('');

  // Photo viewer modal
  const [viewingPhotoItem, setViewingPhotoItem] = useState<Inventaris | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Inventaris | null>(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextNum = String(inventaris.length + 1).padStart(3, '0');
    setKodeBarang(`INV-BARANG-${nextNum}`);
    setNamaBarang('');
    setKategori('Elektronik & Sound System');
    setLokasi('Gedung Gereja Utama');
    setJumlah(1);
    setSatuan('Unit');
    setTahunPerolehan(new Date().getFullYear());
    setKondisi('Baik');
    setKeterangan('');
    setFotoBase64('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Inventaris) => {
    setEditingItem(item);
    setKodeBarang(item.kodeBarang);
    setNamaBarang(item.namaBarang);
    setKategori(item.kategori);
    setLokasi(item.lokasi);
    setJumlah(item.jumlah);
    setSatuan(item.satuan);
    setTahunPerolehan(item.tahunPerolehan);
    setKondisi(item.kondisi);
    setKeterangan(item.keterangan || '');
    setFotoBase64(item.fotoBase64 || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Convert uploaded image to Base64 (with client-side resize to avoid massive payloads)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Harap upload file gambar (JPG/PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setFotoBase64(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!namaBarang.trim()) {
      setFormError('Nama barang inventaris wajib diisi.');
      return;
    }

    const payload: Omit<Inventaris, 'id'> = {
      kodeBarang: kodeBarang.trim(),
      namaBarang: namaBarang.trim(),
      kategori,
      lokasi: lokasi.trim(),
      jumlah: Number(jumlah) || 1,
      satuan: satuan.trim(),
      tahunPerolehan: Number(tahunPerolehan) || new Date().getFullYear(),
      kondisi,
      keterangan: keterangan.trim(),
      fotoBase64: fotoBase64 || undefined,
    };

    let ok = false;
    if (editingItem) {
      ok = await updateInventaris(editingItem.id, payload);
    } else {
      ok = await addInventaris(payload);
    }

    if (ok) {
      setIsModalOpen(false);
    }
  };

  // Filtered inventory
  const filteredInventaris = useMemo(() => {
    return inventaris.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.namaBarang.toLowerCase().includes(q) ||
        item.kodeBarang.toLowerCase().includes(q) ||
        item.lokasi.toLowerCase().includes(q) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q));

      const matchKategori = filterKategori === 'all' || item.kategori === filterKategori;
      const matchKondisi = filterKondisi === 'all' || item.kondisi === filterKondisi;

      return matchSearch && matchKategori && matchKondisi;
    });
  }, [inventaris, searchTerm, filterKategori, filterKondisi]);

  const getConditionBadge = (kondisi: KondisiBarang) => {
    if (kondisi === 'Baik') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Baik
        </span>
      );
    }
    if (kondisi === 'Rusak Ringan') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          Rusak Ringan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
        <AlertCircle className="w-3 h-3" />
        Rusak Berat
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Manajemen Aset & Sarana Gereja
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventaris Aset GPI Getsemani
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan sarana ibadah, peralatan elektronik, mebel, kendaraan, dan dokumentasi foto ke Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportInventarisToExcel(filteredInventaris)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          {canEditInventaris && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama barang, kode, lokasi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
          >
            <option value="all">Semua Kategori</option>
            <option value="Elektronik & Sound System">Elektronik & Sound</option>
            <option value="Perabot & Mebel">Perabot & Mebel</option>
            <option value="Peralatan Sakramen & Ibadah">Peralatan Sakramen & Ibadah</option>
            <option value="Kendaraan">Kendaraan</option>
            <option value="Bangunan & Sarana">Bangunan & Sarana</option>
            <option value="Dokumen & Arsip">Dokumen & Arsip</option>
            <option value="Lain-lain">Lain-lain</option>
          </select>
        </div>

        <div>
          <select
            value={filterKondisi}
            onChange={(e) => setFilterKondisi(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-700"
          >
            <option value="all">Semua Kondisi</option>
            <option value="Baik">Kondisi Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
        </div>
      </div>

      {/* Cards View / Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventaris.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Photo Banner / Thumbnail */}
              <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                {item.fotoBase64 ? (
                  <img
                    src={item.fotoBase64}
                    alt={item.namaBarang}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setViewingPhotoItem(item)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <Package className="w-10 h-10 mb-1 opacity-40 text-slate-500" />
                    <span className="text-[11px]">Foto Belum Diupload</span>
                  </div>
                )}

                {/* Condition tag over image */}
                <div className="absolute top-3 right-3 shadow-xs">
                  {getConditionBadge(item.kondisi)}
                </div>

                <div className="absolute bottom-2 left-3 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                  {item.kodeBarang}
                </div>
              </div>

              {/* Item Info */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {item.kategori}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {item.namaBarang}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jumlah & Satuan</span>
                    <span className="font-semibold text-slate-800">
                      {item.jumlah} {item.satuan}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tahun Perolehan</span>
                    <span className="font-semibold text-slate-800">{item.tahunPerolehan}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block">Lokasi Penempatan</span>
                    <span className="font-medium text-slate-700 truncate block">{item.lokasi}</span>
                  </div>
                </div>

                {item.keterangan && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-2 pt-1 border-t border-slate-100">
                    "{item.keterangan}"
                  </p>
                )}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {item.fotoBase64 ? (
                <button
                  onClick={() => setViewingPhotoItem(item)}
                  className="text-xs text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Foto</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Tanpa foto</span>
              )}

              <div className="flex items-center gap-1">
                {canEditInventaris && (
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                    title="Edit Data"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded transition-colors"
                    title="Hapus Barang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-[#0a0a0d] border-b border-amber-500/30 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-amber-200">
                {editingItem ? 'Edit Barang Inventaris' : 'Tambah Inventaris Gereja Baru'}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Barang
                  </label>
                  <input
                    type="text"
                    value={kodeBarang}
                    onChange={(e) => setKodeBarang(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriBarang)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Elektronik & Sound System">Elektronik & Sound System</option>
                    <option value="Perabot & Mebel">Perabot & Mebel</option>
                    <option value="Peralatan Sakramen & Ibadah">Peralatan Sakramen & Ibadah</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Bangunan & Sarana">Bangunan & Sarana</option>
                    <option value="Dokumen & Arsip">Dokumen & Arsip</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  placeholder="Contoh: Sound System Yamaha DBR15 1000W"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={jumlah}
                    onChange={(e) => setJumlah(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    placeholder="Unit / Set / Buah"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Perolehan
                  </label>
                  <input
                    type="number"
                    value={tahunPerolehan}
                    onChange={(e) => setTahunPerolehan(parseInt(e.target.value, 10) || 2026)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    placeholder="Gedung Gereja / Pastori / Konsistori"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kondisi Barang
                  </label>
                  <select
                    value={kondisi}
                    onChange={(e) => setKondisi(e.target.value as KondisiBarang)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Baik">Baik (Berfungsi Normal)</option>
                    <option value="Rusak Ringan">Rusak Ringan (Perlu Servis)</option>
                    <option value="Rusak Berat">Rusak Berat (Tidak Berfungsi)</option>
                  </select>
                </div>
              </div>

              {/* Photo File Upload (Base64 for Apps Script Google Drive sync) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Upload Foto Fisik Barang (Base64)
                  </label>
                  {fotoBase64 && (
                    <button
                      type="button"
                      onClick={() => setFotoBase64('')}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Pilih Gambar...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {fotoBase64 ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={fotoBase64}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-300"
                      />
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Foto siap dikirim (Base64)
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Foto akan disimpan dalam payload Foto_Base64 ke Google Drive Apps Script
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Tambahan / Spesifikasi
                </label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Keterangan perolehan, nomor seri, masa garansi..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
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
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Catat Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {viewingPhotoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{viewingPhotoItem.namaBarang}</h4>
                <p className="text-xs text-slate-400 font-mono">{viewingPhotoItem.kodeBarang}</p>
              </div>
              <button
                onClick={() => setViewingPhotoItem(null)}
                className="p-1 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center">
              <img
                src={viewingPhotoItem.fotoBase64}
                alt={viewingPhotoItem.namaBarang}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DualConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteInventaris(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Hapus Barang Inventaris"
        description={`Apakah Anda yakin ingin menghapus data inventaris "${deleteTarget?.namaBarang}" (${deleteTarget?.kodeBarang})?`}
        confirmKeyword="HAPUS"
        confirmButtonText="Hapus Barang"
        isDestructive={true}
      />
    </div>
  );
};
