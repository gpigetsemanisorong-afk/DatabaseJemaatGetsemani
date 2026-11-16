import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Jemaat, KunjunganPastoral, Inventaris, Mutasi } from '../types';

/**
 * Export table/array data to Excel (.xlsx)
 */
export function exportToExcel(data: Record<string, unknown>[], filename: string, sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export Jemaat List to Excel
 */
export function exportJemaatToExcel(jemaatList: Jemaat[], customFilename?: string) {
  const formatted = jemaatList.map((j, index) => ({
    No: index + 1,
    NIK: j.nik,
    NKK: j.nkk,
    Nama: j.nama,
    'Jenis Kelamin': j.jenisKelamin,
    'Tempat Lahir': j.tempatLahir,
    'Tanggal Lahir': j.tanggalLahir,
    Umur: j.umur,
    'Gol Darah': j.golonganDarah,
    Pendidikan: j.pendidikan,
    Pekerjaan: j.pekerjaan === 'Lain-lain' ? `Lain-lain (${j.pekerjaanLainnya || ''})` : j.pekerjaan,
    Disabilitas: j.disabilitas === 'Tidak' ? 'Tidak' : `Ya (${j.disabilitas} - ${j.disabilitasDetail || ''})`,
    'Status Sosial': j.statusSosial,
    'Hubungan Keluarga': j.hubunganKeluarga,
    'Status Keanggotaan': j.statusKeanggotaan,
    'Status Mutasi': j.statusMutasi || (j.statusKeanggotaan === 'Dinonaktifkan' ? 'Sudah Mutasi' : 'Normal'),
    'Rencana Mutasi': j.rencanaMutasiDetail || '-',
    Sektor: j.sektor,
    Unit: j.unit,
    'Wadah Kategorial': j.wadahKategorial,
    'Pengurus Wadah': j.pengurusIntiWadah,
    'Jabatan Struktural': j.jabatanStruktural,
    'Jabatan Pelayan': j.jabatanPelayan,
    'Tgl Baptis': j.tglBaptis || '-',
    'Tgl Sidi': j.tglSidi || '-',
    'Tgl Nikah': j.tglNikah || '-',
    'No HP': j.noHp || '-',
    Email: j.email || '-',
    Alamat: j.alamat,
    Keterangan: j.keterangan || '-',
  }));

  const fname = customFilename || `Data_Jemaat_GPI_Getsemani_${new Date().toISOString().slice(0, 10)}`;
  exportToExcel(formatted, fname, 'Jemaat');
}

/**
 * Export Jemaat List to CSV format (.csv) with UTF-8 BOM
 */
export function exportJemaatToCSV(jemaatList: Jemaat[], customFilename?: string) {
  const headers = [
    'No',
    'NIK',
    'NKK',
    'Nama Lengkap',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Umur',
    'Golongan Darah',
    'Pendidikan',
    'Pekerjaan',
    'Disabilitas',
    'Status Sosial',
    'Hubungan Keluarga',
    'Status Keanggotaan',
    'Status Mutasi',
    'Rencana Mutasi',
    'Sektor',
    'Unit',
    'Wadah Kategorial',
    'Pengurus Wadah',
    'Jabatan Struktural',
    'Jabatan Pelayan',
    'Tgl Baptis',
    'Tgl Sidi',
    'Tgl Nikah',
    'No HP',
    'Email',
    'Alamat',
    'Keterangan',
  ];

  const rows = jemaatList.map((j, index) => [
    index + 1,
    `"${j.nik}"`,
    `"${j.nkk}"`,
    `"${(j.nama || '').replace(/"/g, '""')}"`,
    `"${j.jenisKelamin}"`,
    `"${(j.tempatLahir || '').replace(/"/g, '""')}"`,
    `"${j.tanggalLahir}"`,
    j.umur,
    `"${j.golonganDarah}"`,
    `"${j.pendidikan}"`,
    `"${(j.pekerjaan === 'Lain-lain' ? `Lain-lain (${j.pekerjaanLainnya || ''})` : j.pekerjaan).replace(/"/g, '""')}"`,
    `"${j.disabilitas === 'Tidak' ? 'Tidak' : `${j.disabilitas} - ${j.disabilitasDetail || ''}`}"`,
    `"${j.statusSosial}"`,
    `"${j.hubunganKeluarga}"`,
    `"${j.statusKeanggotaan}"`,
    `"${j.statusMutasi || (j.statusKeanggotaan === 'Dinonaktifkan' ? 'Sudah Mutasi' : 'Normal')}"`,
    `"${(j.rencanaMutasiDetail || '-').replace(/"/g, '""')}"`,
    `"${j.sektor}"`,
    `"${j.unit}"`,
    `"${j.wadahKategorial}"`,
    `"${j.pengurusIntiWadah}"`,
    `"${j.jabatanStruktural}"`,
    `"${j.jabatanPelayan}"`,
    `"${j.tglBaptis || '-'}"`,
    `"${j.tglSidi || '-'}"`,
    `"${j.tglNikah || '-'}"`,
    `"${j.noHp || '-'}"`,
    `"${j.email || '-'}"`,
    `"${(j.alamat || '').replace(/"/g, '""')}"`,
    `"${(j.keterangan || '-').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${customFilename || `Data_Jemaat_GPI_Getsemani_${new Date().toISOString().slice(0, 10)}`}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Kunjungan Pastoral to Excel
 */
export function exportKunjunganToExcel(kunjunganList: KunjunganPastoral[]) {
  const formatted = kunjunganList.map((k, index) => ({
    No: index + 1,
    Tanggal: k.tanggal,
    Sektor: k.sektor,
    Unit: k.unit,
    NKK: k.nkkTujuan,
    'Keluarga Tujuan': k.keluargaTujuan,
    'Jenis Kunjungan': k.jenisKunjungan,
    'Tim Pelayan': k.timPelayan,
    'Catatan & Pokok Doa': k.catatanDoa,
    'Status Tindak Lanjut': k.statusTindakLanjut,
  }));

  exportToExcel(formatted, `Jurnal_Kunjungan_Pastoral_Getsemani_${new Date().toISOString().slice(0, 10)}`, 'Kunjungan');
}

/**
 * Export Inventaris to Excel
 */
export function exportInventarisToExcel(inventarisList: Inventaris[]) {
  const formatted = inventarisList.map((inv, index) => ({
    No: index + 1,
    'Kode Barang': inv.kodeBarang,
    'Nama Barang': inv.namaBarang,
    Kategori: inv.kategori,
    Lokasi: inv.lokasi,
    Jumlah: inv.jumlah,
    Satuan: inv.satuan,
    'Tahun Perolehan': inv.tahunPerolehan,
    Kondisi: inv.kondisi,
    Keterangan: inv.keterangan,
  }));

  exportToExcel(formatted, `Inventaris_Gereja_Getsemani_${new Date().toISOString().slice(0, 10)}`, 'Inventaris');
}

/**
 * Export Mutasi to Excel
 */
export function exportMutasiToExcel(mutasiList: Mutasi[]) {
  const formatted = mutasiList.map((m, index) => ({
    No: index + 1,
    'Tanggal Mutasi': m.tanggalMutasi,
    NIK: m.nik,
    Nama: m.nama,
    'NKK Lama': m.nkkLama,
    'Jenis Mutasi': m.jenisMutasi,
    'NKK Baru': m.nkkBaru || '-',
    Keterangan: m.keterangan,
  }));

  exportToExcel(formatted, `Mutasi_Anggota_Jemaat_Getsemani_${new Date().toISOString().slice(0, 10)}`, 'Mutasi');
}

/**
 * Export DOM element to PDF using html2canvas & jsPDF
 */
export async function exportElementToPDF(
  elementId: string,
  filename: string,
  orientation: 'p' | 'l' = 'p',
  format: 'a4' | 'letter' = 'a4'
): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found`);
      return false;
    }

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const ratio = imgProps.width / imgProps.height;

    let renderWidth = pdfWidth;
    let renderHeight = renderWidth / ratio;

    if (renderHeight > pdfHeight) {
      renderHeight = pdfHeight;
      renderWidth = renderHeight * ratio;
    }

    const x = (pdfWidth - renderWidth) / 2;
    const y = (pdfHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    return false;
  }
}

/**
 * Export full application database to local JSON file for backup & archiving
 */
export function exportDatabaseToJSON(db: {
  users: any[];
  jemaat: any[];
  kunjungan: any[];
  inventaris: any[];
  mutasi: any[];
}) {
  const backupPayload = {
    appName: "DATABASE JEMAAT GETSEMANI",
    organization: "GPI Papua Jemaat Getsemani Klasis Sorong",
    backupDate: new Date().toISOString(),
    version: "1.0",
    data: {
      users: db.users,
      jemaat: db.jemaat,
      kunjungan: db.kunjungan,
      inventaris: db.inventaris,
      mutasi: db.mutasi,
    },
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Backup_Database_Jemaat_Getsemani_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate uploaded backup JSON file
 */
export function parseDatabaseJSON(jsonText: string): {
  users?: any[];
  jemaat?: any[];
  kunjungan?: any[];
  inventaris?: any[];
  mutasi?: any[];
} | null {
  try {
    const parsed = JSON.parse(jsonText);
    if (parsed && parsed.data && Array.isArray(parsed.data.jemaat)) {
      return {
        users: Array.isArray(parsed.data.users) ? parsed.data.users : undefined,
        jemaat: parsed.data.jemaat,
        kunjungan: Array.isArray(parsed.data.kunjungan) ? parsed.data.kunjungan : undefined,
        inventaris: Array.isArray(parsed.data.inventaris) ? parsed.data.inventaris : undefined,
        mutasi: Array.isArray(parsed.data.mutasi) ? parsed.data.mutasi : undefined,
      };
    }
    if (parsed && Array.isArray(parsed.jemaat)) {
      return {
        users: Array.isArray(parsed.users) ? parsed.users : undefined,
        jemaat: parsed.jemaat,
        kunjungan: Array.isArray(parsed.kunjungan) ? parsed.kunjungan : undefined,
        inventaris: Array.isArray(parsed.inventaris) ? parsed.inventaris : undefined,
        mutasi: Array.isArray(parsed.mutasi) ? parsed.mutasi : undefined,
      };
    }
    return null;
  } catch (err) {
    console.error('Error parsing backup JSON:', err);
    return null;
  }
}

