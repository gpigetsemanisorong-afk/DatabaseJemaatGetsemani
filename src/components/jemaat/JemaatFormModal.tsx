import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Jemaat,
  JenisKelamin,
  GolonganDarah,
  Pendidikan,
  PekerjaanUtama,
  StatusSosial,
  HubunganKeluarga,
  StatusKeanggotaan,
  StatusMutasi,
  SektorName,
  UnitName,
  JabatanStruktural,
  JabatanPelayan,
  WadahKategorial,
  JabatanWadah,
} from '../../types';
import {
  calculateAge,
  determineWadahKategorial,
  generateNKK,
  UNIT_OPTIONS,
} from '../../services/nkkGenerator';
import { BarcodeRenderer } from '../BarcodeRenderer';
import { X, Sparkles, AlertCircle, Save, Lock, Info } from 'lucide-react';

interface JemaatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Jemaat | null;
}

export const JemaatFormModal: React.FC<JemaatFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { jemaat, addJemaat, updateJemaat } = useApp();

  // List of registered Kepala Keluarga to inherit NKK, Sektor, Unit, and Alamat from
  const kepalaKeluargaList = jemaat.filter(
    (j) => j.hubunganKeluarga === 'Kepala Keluarga' && j.nkk
  );

  // Form states
  const [nik, setNik] = useState('');
  const [nkk, setNkk] = useState('');
  const [selectedParentKKNkk, setSelectedParentKKNkk] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>('Laki-laki');
  const [tempatLahir, setTempatLahir] = useState('Sorong');
  const [tanggalLahir, setTanggalLahir] = useState('1990-01-01');
  const [umur, setUmur] = useState(0);
  const [golonganDarah, setGolonganDarah] = useState<GolonganDarah>('-');
  const [pendidikan, setPendidikan] = useState<Pendidikan>('SMA');
  const [pekerjaan, setPekerjaan] = useState<PekerjaanUtama>('Karyawan Swasta');
  const [pekerjaanLainnya, setPekerjaanLainnya] = useState('');
  const [disabilitas, setDisabilitas] = useState<'Tidak' | 'Fisik' | 'Netra' | 'Rungu' | 'Mental' | 'Lainnya'>('Tidak');
  const [disabilitasDetail, setDisabilitasDetail] = useState('');
  const [statusSosial, setStatusSosial] = useState<StatusSosial>('Umum');
  const [hubunganKeluarga, setHubunganKeluarga] = useState<HubunganKeluarga>('Kepala Keluarga');
  const [statusKeanggotaan, setStatusKeanggotaan] = useState<StatusKeanggotaan>('Jemaat Tetap');
  const [statusMutasi, setStatusMutasi] = useState<StatusMutasi>('Normal');
  const [rencanaMutasiDetail, setRencanaMutasiDetail] = useState('');
  const [sektor, setSektor] = useState<SektorName>('Filadelfia');
  const [unit, setUnit] = useState<UnitName>('Rehobot');
  const [tglBaptis, setTglBaptis] = useState('');
  const [tglSidi, setTglSidi] = useState('');
  const [tglNikah, setTglNikah] = useState('');
  const [jabatanStruktural, setJabatanStruktural] = useState<JabatanStruktural>('None');
  const [jabatanPelayan, setJabatanPelayan] = useState<JabatanPelayan>('None');
  const [wadahKategorial, setWadahKategorial] = useState<WadahKategorial>('PERPRI');
  const [pengurusIntiWadah, setPengurusIntiWadah] = useState<JabatanWadah>('None');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [formError, setFormError] = useState('');

  // Is field locked (non-KK members lock Sektor, Unit, and Alamat to selected KK)
  const isLockedToKK = hubunganKeluarga !== 'Kepala Keluarga';

  // Find the selected KK object
  const currentSelectedKK = kepalaKeluargaList.find((k) => k.nkk === selectedParentKKNkk);

  // Pre-fill when editing or reset when adding
  useEffect(() => {
    if (initialData) {
      setNik(initialData.nik || '');
      setNkk(initialData.nkk || '');
      setSelectedParentKKNkk(initialData.nkk || '');
      setNama(initialData.nama || '');
      setJenisKelamin(initialData.jenisKelamin || 'Laki-laki');
      setTempatLahir(initialData.tempatLahir || 'Sorong');
      setTanggalLahir(initialData.tanggalLahir || '1990-01-01');
      setUmur(initialData.umur || calculateAge(initialData.tanggalLahir));
      setGolonganDarah(initialData.golonganDarah || '-');
      setPendidikan(initialData.pendidikan || 'SMA');
      setPekerjaan(initialData.pekerjaan || 'Karyawan Swasta');
      setPekerjaanLainnya(initialData.pekerjaanLainnya || '');
      setDisabilitas(initialData.disabilitas || 'Tidak');
      setDisabilitasDetail(initialData.disabilitasDetail || '');
      setStatusSosial(initialData.statusSosial || 'Umum');
      setHubunganKeluarga(initialData.hubunganKeluarga || 'Kepala Keluarga');
      setStatusKeanggotaan(initialData.statusKeanggotaan || 'Jemaat Tetap');
      setStatusMutasi(initialData.statusMutasi || 'Normal');
      setRencanaMutasiDetail(initialData.rencanaMutasiDetail || '');
      setSektor(initialData.sektor || 'Filadelfia');
      setUnit(initialData.unit || 'Rehobot');
      setTglBaptis(initialData.tglBaptis || '');
      setTglSidi(initialData.tglSidi || '');
      setTglNikah(initialData.tglNikah || '');
      setJabatanStruktural(initialData.jabatanStruktural || 'None');
      setJabatanPelayan(initialData.jabatanPelayan || 'None');
      setWadahKategorial(initialData.wadahKategorial || 'PERPRI');
      setPengurusIntiWadah(initialData.pengurusIntiWadah || 'None');
      setNoHp(initialData.noHp || '');
      setEmail(initialData.email || '');
      setAlamat(initialData.alamat || '');
      setKeterangan(initialData.keterangan || '');
    } else {
      // New record defaults
      setNik('');
      setNama('');
      setJenisKelamin('Laki-laki');
      setTempatLahir('Sorong');
      setTanggalLahir('1990-01-01');
      setUmur(calculateAge('1990-01-01'));
      setGolonganDarah('-');
      setPendidikan('SMA');
      setPekerjaan('Karyawan Swasta');
      setPekerjaanLainnya('');
      setDisabilitas('Tidak');
      setDisabilitasDetail('');
      setStatusSosial('Umum');
      setHubunganKeluarga('Kepala Keluarga');
      setStatusKeanggotaan('Jemaat Tetap');
      setStatusMutasi('Normal');
      setRencanaMutasiDetail('');
      setSektor('Filadelfia');
      setUnit('Rehobot');
      setTglBaptis('');
      setTglSidi('');
      setTglNikah('');
      setJabatanStruktural('None');
      setJabatanPelayan('None');
      setPengurusIntiWadah('None');
      setNoHp('');
      setEmail('');
      setAlamat('');
      setKeterangan('');

      // Auto-generate NKK for new KK
      const initialNkk = generateNKK('Filadelfia', 'Rehobot', '1990-01-01', 'Laki-laki', jemaat);
      setNkk(initialNkk);
      if (kepalaKeluargaList.length > 0) {
        setSelectedParentKKNkk(kepalaKeluargaList[0].nkk);
      }
    }
    setFormError('');
  }, [initialData, isOpen]);

  // Recalculate age and suggested wadah on birthdate change
  useEffect(() => {
    if (tanggalLahir) {
      const calculatedAge = calculateAge(tanggalLahir);
      setUmur(calculatedAge);
      if (!initialData) {
        const autoWadah = determineWadahKategorial(calculatedAge, jenisKelamin, !!tglNikah);
        setWadahKategorial(autoWadah);
      }
    }
  }, [tanggalLahir, jenisKelamin, tglNikah]);

  // Handle Hubungan Keluarga change & automatic locking to selected KK
  const handleHubunganKeluargaChange = (newRelation: HubunganKeluarga) => {
    setHubunganKeluarga(newRelation);
    if (newRelation === 'Kepala Keluarga') {
      const autoNkk = generateNKK(sektor, unit, tanggalLahir, jenisKelamin, jemaat);
      setNkk(autoNkk);
    } else {
      // Non-KK: lock Sektor, Unit, Alamat to the selected Kepala Keluarga
      let targetKK = currentSelectedKK;
      if (!targetKK && kepalaKeluargaList.length > 0) {
        targetKK = kepalaKeluargaList[0];
        setSelectedParentKKNkk(targetKK.nkk);
      }

      if (targetKK) {
        setNkk(targetKK.nkk);
        setSektor(targetKK.sektor);
        setUnit(targetKK.unit);
        setAlamat(targetKK.alamat);
      }
    }
  };

  // Re-generate NKK if user modifies Sektor/Unit/TanggalLahir while HubunganKeluarga is Kepala Keluarga
  const handleRegenerateNkk = () => {
    if (hubunganKeluarga === 'Kepala Keluarga') {
      const autoNkk = generateNKK(sektor, unit, tanggalLahir, jenisKelamin, jemaat);
      setNkk(autoNkk);
    }
  };

  // When picking a parent KK (inheriting NKK, Sektor, Unit, and Alamat)
  const handleSelectParentKK = (chosenNkk: string) => {
    setSelectedParentKKNkk(chosenNkk);
    setNkk(chosenNkk);
    const parent = kepalaKeluargaList.find((k) => k.nkk === chosenNkk);
    if (parent) {
      setSektor(parent.sektor);
      setUnit(parent.unit);
      setAlamat(parent.alamat);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nik.trim() || nik.trim().length !== 16 || !/^\d+$/.test(nik.trim())) {
      setFormError('NIK harus berupa 16 digit angka sesuai standar KTP RI.');
      return;
    }

    if (!nama.trim()) {
      setFormError('Nama lengkap jemaat wajib diisi.');
      return;
    }

    if (!nkk.trim()) {
      setFormError('Nomor Kartu Keluarga (NKK) belum terisi.');
      return;
    }

    // Determine final values (strictly lock to KK if non-KK)
    let finalSektor = sektor;
    let finalUnit = unit;
    let finalAlamat = alamat;
    let finalNkk = nkk;

    if (hubunganKeluarga !== 'Kepala Keluarga') {
      const parent = kepalaKeluargaList.find((k) => k.nkk === selectedParentKKNkk);
      if (parent) {
        finalSektor = parent.sektor;
        finalUnit = parent.unit;
        finalAlamat = parent.alamat;
        finalNkk = parent.nkk;
      }
    }

    const payload: Omit<Jemaat, 'id'> = {
      nik: nik.trim(),
      nkk: finalNkk.trim(),
      nama: nama.trim(),
      jenisKelamin,
      tempatLahir: tempatLahir.trim(),
      tanggalLahir,
      umur,
      golonganDarah,
      pendidikan,
      pekerjaan,
      pekerjaanLainnya: pekerjaan === 'Lain-lain' ? pekerjaanLainnya.trim() : undefined,
      disabilitas,
      disabilitasDetail: disabilitas !== 'Tidak' ? disabilitasDetail.trim() : undefined,
      statusSosial,
      hubunganKeluarga,
      statusKeanggotaan,
      statusMutasi,
      rencanaMutasiDetail: statusMutasi === 'Akan Mutasi' ? rencanaMutasiDetail.trim() : undefined,
      sektor: finalSektor,
      unit: finalUnit,
      tglBaptis: tglBaptis || undefined,
      tglSidi: tglSidi || undefined,
      tglNikah: tglNikah || undefined,
      jabatanStruktural,
      jabatanPelayan,
      wadahKategorial,
      pengurusIntiWadah,
      noHp: noHp.trim(),
      email: email.trim(),
      alamat: finalAlamat.trim(),
      keterangan: keterangan.trim(),
    };

    let success = false;
    if (initialData?.id) {
      success = await updateJemaat(initialData.id, payload);
    } else {
      success = await addJemaat(payload);
    }

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a0a0d] border-b border-amber-500/30 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              {initialData ? 'Perbarui Biodata Jemaat' : 'Pendaftaran Anggota Baru'}
            </span>
            <h3 className="text-base font-bold text-amber-100">
              {initialData ? `Edit Data: ${initialData.nama}` : 'Formulir Registrasi Jemaat'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION 1: POSISI KELUARGA & NKK (DENGAN LOCK OTOMATIS) */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Posisi Keluarga & Nomor Kartu Keluarga (NKK 18 Digit)
              </h4>
              <span className="text-[11px] text-amber-700 font-medium">
                Sistem Penomoran Resmi GPI Getsemani
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hubungan Keluarga <span className="text-rose-500">*</span>
                </label>
                <select
                  value={hubunganKeluarga}
                  onChange={(e) => handleHubunganKeluargaChange(e.target.value as HubunganKeluarga)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-semibold text-slate-900"
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Pasangan">Pasangan (Istri / Suami)</option>
                  <option value="Anak">Anak</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Saudara">Saudara / Kerabat Lainnya</option>
                </select>
              </div>

              {hubunganKeluarga === 'Kepala Keluarga' ? (
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      NKK Otomatis (Generator Kode 18 Karakter)
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateNkk}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Generate Ulang</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={nkk}
                    onChange={(e) => setNkk(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white text-slate-900 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="JG0101DDMMYYYY0101"
                  />
                  <p className="text-[10px] text-slate-500">
                    Format: JG + Sektor(2) + Unit(2) + Tgl Lahir(8) + JK(2) + No Urut(2)
                  </p>
                </div>
              ) : (
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pilih Kepala Keluarga (NKK, Sektor, Unit, dan Alamat Akan Terkunci Otomatis)</span>
                  </label>
                  {kepalaKeluargaList.length > 0 ? (
                    <select
                      value={selectedParentKKNkk}
                      onChange={(e) => handleSelectParentKK(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
                    >
                      {kepalaKeluargaList.map((kk) => (
                        <option key={kk.id} value={kk.nkk}>
                          {kk.nkk} - Kel. {kk.nama} (Sektor {kk.sektor} - {kk.unit})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={nkk}
                      onChange={(e) => setNkk(e.target.value)}
                      placeholder="Masukkan NKK Kepala Keluarga"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  )}
                  {currentSelectedKK && (
                    <div className="p-2 bg-amber-100/60 rounded-md text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Terkunci ke <strong>Kel. {currentSelectedKK.nama}</strong>: Sektor {currentSelectedKK.sektor}, Unit {currentSelectedKK.unit}, {currentSelectedKK.alamat}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Barcode Preview of NKK */}
            {nkk && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Barcode NKK Code128:</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                  <BarcodeRenderer value={nkk} width={1.2} height={28} fontSize={10} />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: BIODATA UTAMA */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              2. Data Pribadi & Kependudukan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK (16 Digit KTP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 9271011504780001"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap (Beserta Gelar jika ada) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Pdt. Marthen Wanma, S.Th"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <select
                  value={jenisKelamin}
                  onChange={(e) => {
                    setJenisKelamin(e.target.value as JenisKelamin);
                    if (hubunganKeluarga === 'Kepala Keluarga') {
                      setTimeout(handleRegenerateNkk, 50);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  placeholder="Sorong / Biak / Serui dll"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir & Umur <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => {
                      setTanggalLahir(e.target.value);
                      if (hubunganKeluarga === 'Kepala Keluarga') {
                        setTimeout(handleRegenerateNkk, 50);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <div className="px-2.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 shrink-0">
                    {umur} thn
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Golongan Darah
                </label>
                <select
                  value={golonganDarah}
                  onChange={(e) => setGolonganDarah(e.target.value as GolonganDarah)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="-">- (Belum Tahu)</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pendidikan Terakhir
                </label>
                <select
                  value={pendidikan}
                  onChange={(e) => setPendidikan(e.target.value as Pendidikan)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Tidak sekolah">Tidak sekolah</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA / SMK</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                  <option value="S1">S1 / Sarjana</option>
                  <option value="S2">S2 / Magister</option>
                  <option value="S3">S3 / Doktoral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pekerjaan
                </label>
                <select
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value as PekerjaanUtama)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ASN">ASN (PNS / PPPK)</option>
                  <option value="TNI">TNI</option>
                  <option value="POLRI">POLRI</option>
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="Karyawan BUMN/BUMD">Karyawan BUMN/BUMD</option>
                  <option value="Wirausaha">Wirausaha / Pedagang</option>
                  <option value="Petani">Petani</option>
                  <option value="Peternak">Peternak</option>
                  <option value="Nelayan">Nelayan</option>
                  <option value="Tukang/Buruh">Tukang / Buruh</option>
                  <option value="Driver">Driver / Sopir</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Pelajar">Pelajar</option>
                  <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                  <option value="Pensiunan">Pensiunan</option>
                  <option value="Pendeta/Pelayan Firman">Pendeta / Pelayan Firman</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              {pekerjaan === 'Lain-lain' && (
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-amber-800 mb-1">
                    Sebutkan Pekerjaan Lainnya <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pekerjaanLainnya}
                    onChange={(e) => setPekerjaanLainnya(e.target.value)}
                    placeholder="Tuliskan profesi pekerjaan jemaat..."
                    className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disabilitas
                </label>
                <select
                  value={disabilitas}
                  onChange={(e) => setDisabilitas(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Tidak">Tidak Ada</option>
                  <option value="Fisik">Disabilitas Fisik</option>
                  <option value="Netra">Disabilitas Netra</option>
                  <option value="Rungu">Disabilitas Rungu / Wicara</option>
                  <option value="Mental">Disabilitas Mental / Intelektual</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {disabilitas !== 'Tidak' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detail Kebutuhan Khusus / Disabilitas
                  </label>
                  <input
                    type="text"
                    value={disabilitasDetail}
                    onChange={(e) => setDisabilitasDetail(e.target.value)}
                    placeholder="Contoh: Menggunakan kursi roda..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Sosial
                </label>
                <select
                  value={statusSosial}
                  onChange={(e) => setStatusSosial(e.target.value as StatusSosial)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Umum">Umum</option>
                  <option value="Duda">Duda</option>
                  <option value="Janda">Janda</option>
                  <option value="Yatim">Yatim</option>
                  <option value="Piatu">Piatu</option>
                  <option value="Yatim Piatu">Yatim Piatu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Keanggotaan
                </label>
                <select
                  value={statusKeanggotaan}
                  onChange={(e) => setStatusKeanggotaan(e.target.value as StatusKeanggotaan)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold ${
                    statusKeanggotaan === 'Dinonaktifkan'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-white text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="Jemaat Tetap">Jemaat Tetap (Aktif)</option>
                  <option value="Simpatisan">Simpatisan</option>
                  <option value="Dinonaktifkan">Dinonaktifkan (Tidak Aktif)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Rencana Mutasi
                </label>
                <select
                  value={statusMutasi}
                  onChange={(e) => setStatusMutasi(e.target.value as StatusMutasi)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold ${
                    statusMutasi === 'Akan Mutasi'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="Normal">Normal (Tidak Ada Mutasi)</option>
                  <option value="Akan Mutasi">⚠️ Akan Segera Mutasi</option>
                  <option value="Sudah Mutasi">Sudah Mutasi</option>
                </select>
              </div>

              {statusMutasi === 'Akan Mutasi' && (
                <div className="md:col-span-3 bg-amber-50/80 p-3 rounded-xl border border-amber-300 space-y-1">
                  <label className="block text-xs font-bold text-amber-900">
                    Catatan Rencana Mutasi (Peringatan Admin)
                  </label>
                  <input
                    type="text"
                    value={rencanaMutasiDetail}
                    onChange={(e) => setRencanaMutasiDetail(e.target.value)}
                    placeholder="Contoh: Rencana pindah ke Klasis Jayapura akhir bulan ini / Menikah bulan depan..."
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800 placeholder-slate-400"
                  />
                  <p className="text-[11px] text-amber-700">
                    Indikator ini akan memberikan notifikasi cepat pada profil anggota dan daftar jemaat agar admin dapat memonitor berkas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: WILAYAH GEREJAWI & WADAH (SEKTOR & UNIT TERKUNCI OTOMATIS JIKA BUKAN KK) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Penempatan Sektor, Unit & Wadah Kategorial
              </h4>
              {isLockedToKK && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                  <Lock className="w-3 h-3" />
                  Sektor & Unit Terkunci Mengikuti Kepala Keluarga
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Sektor Pelayanan <span className="text-rose-500">*</span></span>
                  {isLockedToKK && <Lock className="w-3 h-3 text-amber-600" />}
                </label>
                <select
                  value={sektor}
                  disabled={isLockedToKK}
                  onChange={(e) => {
                    const newSektor = e.target.value as SektorName;
                    setSektor(newSektor);
                    const availableUnits = UNIT_OPTIONS[newSektor];
                    setUnit(availableUnits[0]);
                    if (hubunganKeluarga === 'Kepala Keluarga') {
                      setTimeout(handleRegenerateNkk, 50);
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs border rounded-lg ${
                    isLockedToKK
                      ? 'bg-slate-100 text-slate-600 border-slate-300 cursor-not-allowed font-semibold'
                      : 'bg-white border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                >
                  <option value="Filadelfia">Sektor Filadelfia</option>
                  <option value="Petra">Sektor Petra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Unit Pelayanan <span className="text-rose-500">*</span></span>
                  {isLockedToKK && <Lock className="w-3 h-3 text-amber-600" />}
                </label>
                <select
                  value={unit}
                  disabled={isLockedToKK}
                  onChange={(e) => {
                    setUnit(e.target.value as UnitName);
                    if (hubunganKeluarga === 'Kepala Keluarga') {
                      setTimeout(handleRegenerateNkk, 50);
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs border rounded-lg ${
                    isLockedToKK
                      ? 'bg-slate-100 text-slate-600 border-slate-300 cursor-not-allowed font-semibold'
                      : 'bg-white border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                >
                  {UNIT_OPTIONS[sektor].map((u) => (
                    <option key={u} value={u}>
                      Unit {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wadah Kategorial
                </label>
                <select
                  value={wadahKategorial}
                  onChange={(e) => setWadahKategorial(e.target.value as WadahKategorial)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                >
                  <option value="PAR">PAR (Anak & Remaja)</option>
                  <option value="PP">PP (Persekutuan Pemuda)</option>
                  <option value="PERPRI">PERPRI (Persekutuan Pria)</option>
                  <option value="PERWATA">PERWATA (Persekutuan Wanita)</option>
                  <option value="LANSIA">LANSIA (Lanjut Usia)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pengurus Inti Wadah
                </label>
                <select
                  value={pengurusIntiWadah}
                  onChange={(e) => setPengurusIntiWadah(e.target.value as JabatanWadah)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="None">None (Anggota Biasa)</option>
                  <option value="Ketua">Ketua Pengurus</option>
                  <option value="Sekretaris">Sekretaris Pengurus</option>
                  <option value="Bendahara">Bendahara Pengurus</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: SAKRAMEN & JABATAN GEREJAWI */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              4. Sakramen & Jabatan Struktural / Pelayan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Baptisan Kudus
                </label>
                <input
                  type="date"
                  value={tglBaptis}
                  onChange={(e) => setTglBaptis(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Peneguhan Sidi
                </label>
                <input
                  type="date"
                  value={tglSidi}
                  onChange={(e) => setTglSidi(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pernikahan Kudus
                </label>
                <input
                  type="date"
                  value={tglNikah}
                  onChange={(e) => setTglNikah(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Struktural (PHMJ)
                </label>
                <select
                  value={jabatanStruktural}
                  onChange={(e) => setJabatanStruktural(e.target.value as JabatanStruktural)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="None">None</option>
                  <option value="Ketua PHMJ">Ketua PHMJ</option>
                  <option value="Waket PHMJ">Wakil Ketua PHMJ</option>
                  <option value="Sekretaris PHMJ">Sekretaris PHMJ</option>
                  <option value="Wasek PHMJ">Wakil Sekretaris PHMJ</option>
                  <option value="Bendahara PHMJ">Bendahara PHMJ</option>
                  <option value="Bendahara Barang PHMJ">Bendahara Barang PHMJ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Pelayan Firman / Meja
                </label>
                <select
                  value={jabatanPelayan}
                  onChange={(e) => setJabatanPelayan(e.target.value as JabatanPelayan)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="None">None</option>
                  <option value="Penatua">Penatua (Pnt.)</option>
                  <option value="Syamas">Syamas (Sym.)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 5: KONTAK & ALAMAT (ALAMAT TERKUNCI OTOMATIS JIKA BUKAN KK) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                5. Kontak & Alamat Domisili
              </h4>
              {isLockedToKK && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                  <Lock className="w-3 h-3" />
                  Alamat Terkunci Mengikuti Kepala Keluarga
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jemaat@email.com"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Alamat Domisili Lengkap <span className="text-rose-500">*</span></span>
                  {isLockedToKK && <Lock className="w-3 h-3 text-amber-600" />}
                </label>
                <textarea
                  rows={2}
                  value={alamat}
                  disabled={isLockedToKK}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. ..., RT/RW, Kelurahan, Kota Sorong"
                  className={`w-full px-3 py-2 text-xs border rounded-lg ${
                    isLockedToKK
                      ? 'bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed font-medium'
                      : 'bg-white border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan / Keterangan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Keterangan khusus, status sakramen, dll..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Daftarkan Jemaat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
