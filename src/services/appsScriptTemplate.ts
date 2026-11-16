export const SHEET_HEADERS: Record<string, string[]> = {
  Users: ['ID_User', 'Username', 'Password', 'Nama_Lengkap', 'Role', 'Jabatan'],
  Jemaat: [
    'ID',
    'NIK',
    'NKK',
    'Nama',
    'Jenis_Kelamin',
    'Tempat_Lahir',
    'Tanggal_Lahir',
    'Umur',
    'Golongan_Darah',
    'Pendidikan',
    'Pekerjaan',
    'Pekerjaan_Lainnya',
    'Disabilitas',
    'Disabilitas_Detail',
    'Status_Sosial',
    'Hubungan_Keluarga',
    'Status_Keanggotaan',
    'Sektor',
    'Unit',
    'Tgl_Baptis',
    'Tgl_Sidi',
    'Tgl_Nikah',
    'Jabatan_Struktural',
    'Jabatan_Pelayan',
    'Wadah_Kategorial',
    'Pengurus_Inti_Wadah',
    'No_HP',
    'Email',
    'Alamat',
    'Keterangan',
  ],
  Kunjungan_Pastoral: [
    'ID_Kunjungan',
    'Tanggal',
    'Sektor',
    'Unit',
    'NKK_Tujuan',
    'Keluarga_Tujuan',
    'Jenis_Kunjungan',
    'Tim_Pelayan',
    'Catatan_Doa',
    'Status_Tindak_Lanjut',
  ],
  Inventaris: [
    'Kode_Barang',
    'ID',
    'Nama_Barang',
    'Kategori',
    'Lokasi',
    'Jumlah',
    'Satuan',
    'Tahun_Perolehan',
    'Kondisi',
    'Keterangan',
    'Foto_Base64',
  ],
  Mutasi: [
    'ID_Mutasi',
    'Tanggal_Mutasi',
    'NIK',
    'Nama',
    'NKK_Lama',
    'NKK_Baru',
    'Jenis_Mutasi',
    'Keterangan',
  ],
};

export const GOOGLE_APPS_SCRIPT_CODE = `// =========================================================================
// GOOGLE APPS SCRIPT - DATABASE JEMAAT GETSEMANI (GPI PAPUA KLASIS SORONG)
// =========================================================================
// Cara Pasang:
// 1. Buka Google Spreadsheet Anda -> Menu Ekstensi (Extensions) -> Apps Script
// 2. Hapus kode lama, tempel (paste) seluruh kode ini, lalu Simpan (Ctrl+S)
// 3. Jalankan fungsi "setupSemuaSheetDanUser" SEKALI dari editor Apps Script
//    (Pilih fungsi "setupSemuaSheetDanUser" di toolbar atas -> klik Run / Jalankan)
// 4. Klik "Deploy" -> "New deployment" -> Web app:
//    - Execute as: Me
//    - Who has access: Anyone
// =========================================================================

var HEADERS_MAP = {
  Users: ['ID_User', 'Username', 'Password', 'Nama_Lengkap', 'Role', 'Jabatan'],
  Jemaat: [
    'ID', 'NIK', 'NKK', 'Nama', 'Jenis_Kelamin', 'Tempat_Lahir', 'Tanggal_Lahir',
    'Umur', 'Golongan_Darah', 'Pendidikan', 'Pekerjaan', 'Pekerjaan_Lainnya',
    'Disabilitas', 'Disabilitas_Detail', 'Status_Sosial', 'Hubungan_Keluarga',
    'Status_Keanggotaan', 'Sektor', 'Unit', 'Tgl_Baptis', 'Tgl_Sidi', 'Tgl_Nikah',
    'Jabatan_Struktural', 'Jabatan_Pelayan', 'Wadah_Kategorial', 'Pengurus_Inti_Wadah',
    'No_HP', 'Email', 'Alamat', 'Keterangan'
  ],
  Kunjungan_Pastoral: [
    'ID_Kunjungan', 'Tanggal', 'Sektor', 'Unit', 'NKK_Tujuan', 'Keluarga_Tujuan',
    'Jenis_Kunjungan', 'Tim_Pelayan', 'Catatan_Doa', 'Status_Tindak_Lanjut'
  ],
  Inventaris: [
    'Kode_Barang', 'ID', 'Nama_Barang', 'Kategori', 'Lokasi', 'Jumlah',
    'Satuan', 'Tahun_Perolehan', 'Kondisi', 'Keterangan', 'Foto_Base64'
  ],
  Mutasi: [
    'ID_Mutasi', 'Tanggal_Mutasi', 'NIK', 'Nama', 'NKK_Lama', 'NKK_Baru',
    'Jenis_Mutasi', 'Keterangan'
  ]
};

var DEFAULT_USERS = [
  ['USR-01', 'superadmin', 'admin123', 'Super Admin GPI Getsemani', 'Super Admin', 'Administrator Utama (Akses Penuh & Reset)'],
  ['USR-02', 'admin1', 'admin123', 'Admin 1 (Sekretariat I)', 'Admin / Sekretariat', 'Admin Pengelola Data Jemaat & Kartu Keluarga'],
  ['USR-03', 'admin2', 'admin123', 'Admin 2 (Sekretariat II)', 'Admin / Sekretariat', 'Admin Pengelola Mutasi, Kunjungan & Inventaris'],
  ['USR-04', 'phmj', 'phmj123', 'PHMJ & Majelis Jemaat', 'Pendeta / Majelis Jemaat', 'Pendeta (Ketua PHMJ) & Seluruh Anggota Majelis Jemaat']
];

function setupSemuaSheetDanUser() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS_MAP).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    var expectedHeaders = HEADERS_MAP[sheetName];
    var lastCol = sheet.getLastColumn();
    var firstRow = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

    // Jika baris 1 kosong atau tidak diawali header yang benar, perbaiki baris 1
    if (lastCol === 0 || String(firstRow[0]) !== expectedHeaders[0]) {
      if (sheetName === 'Users') {
        sheet.clearContents();
      } else if (sheet.getLastRow() > 0 && String(firstRow[0]) !== expectedHeaders[0]) {
        sheet.insertRowBefore(1);
      }
      sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
      sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold').setBackground('#0c1f38').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  });

  // Isi 4 User Resmi (1 Super Admin, 2 Admin, 1 PHMJ) jika sheet Users hanya punya header
  var usersSheet = ss.getSheetByName('Users');
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.getRange(2, 1, DEFAULT_USERS.length, DEFAULT_USERS[0].length).setValues(DEFAULT_USERS);
  }
  return 'Setup 5 Sheet & 4 User GPI Getsemani berhasil!';
}

function ensureSheetHeaders(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  var expected = HEADERS_MAP[sheetName];
  if (expected && sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    sheet.getRange(1, 1, 1, expected.length).setFontWeight('bold').setBackground('#0c1f38').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var action = (e.parameter.action || '').toUpperCase();
    var sheetName = e.parameter.sheet || '';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'INIT_SHEETS') {
      var msg = setupSemuaSheetDanUser();
      return jsonResponse({ status: 'success', message: msg });
    }

    if (action === 'GET_ALL') {
      var sheet = ensureSheetHeaders(ss, sheetName);
      var values = sheet.getDataRange().getValues();
      if (values.length <= 1) return jsonResponse({ status: 'success', data: [] });
      var headers = values[0];
      var rows = [];
      for (var i = 1; i < values.length; i++) {
        var rowObj = { _rowIndex: i + 1 };
        var hasContent = false;
        for (var j = 0; j < headers.length; j++) {
          var key = String(headers[j] || '').trim();
          if (!key) continue;
          var val = values[i][j];
          if (val !== '' && val !== null && val !== undefined) hasContent = true;
          rowObj[key] = val;
        }
        if (hasContent) rows.push(rowObj);
      }
      return jsonResponse({ status: 'success', data: rows });
    }

    return jsonResponse({ status: 'error', message: 'Aksi tidak dikenali' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var action = String(body.action || '').toUpperCase();
    var sheetName = body.sheet || '';
    var data = body.data || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'INIT_SHEETS') {
      var msg = setupSemuaSheetDanUser();
      return jsonResponse({ status: 'success', message: msg });
    }

    var sheet = ensureSheetHeaders(ss, sheetName);
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Upload Foto Base64 ke Google Drive jika ada
    if (data.Foto_Base64 && String(data.Foto_Base64).indexOf('data:image') === 0) {
      try {
        var parts = data.Foto_Base64.split(',');
        var mime = parts[0].match(/:(.*?);/)[1];
        var bytes = Utilities.base64Decode(parts[1]);
        var blob = Utilities.newBlob(bytes, mime, (data.Kode_Barang || data.Nama || 'foto') + '.jpg');
        var file = DriveApp.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        data.Foto_Base64 = 'https://drive.google.com/uc?export=view&id=' + file.getId();
      } catch (imgErr) {}
    }

    if (action === 'ADD') {
      var newRow = headers.map(function(h) {
        var val = data[h];
        if (val === undefined || val === null) return '';
        // Pertahankan nol di depan untuk NIK, NKK, No_HP
        if ((h === 'NIK' || h === 'NKK' || h === 'NKK_Lama' || h === 'NKK_Baru' || h === 'No_HP') && val !== '') {
          return "'" + String(val).replace(/^'/, '');
        }
        return val;
      });
      sheet.appendRow(newRow);
      return jsonResponse({ status: 'success', message: 'Data berhasil disimpan', data: data });
    }

    if (action === 'UPDATE') {
      var allValues = sheet.getDataRange().getValues();
      var keyCol = headers[0];
      var targetVal = String(data[keyCol] || data.id || data.ID || data.ID_User || data.NIK || '').replace(/^'/, '');
      for (var r = 1; r < allValues.length; r++) {
        var cellVal = String(allValues[r][0]).replace(/^'/, '');
        if (cellVal === targetVal || (data._rowIndex && data._rowIndex === r + 1)) {
          var updatedRow = headers.map(function(h, idx) {
            if (data[h] === undefined) return allValues[r][idx];
            var val = data[h];
            if ((h === 'NIK' || h === 'NKK' || h === 'No_HP') && val !== '') return "'" + String(val).replace(/^'/, '');
            return val;
          });
          sheet.getRange(r + 1, 1, 1, headers.length).setValues([updatedRow]);
          return jsonResponse({ status: 'success', message: 'Data berhasil diperbarui' });
        }
      }
      return jsonResponse({ status: 'error', message: 'Data tidak ditemukan untuk update' });
    }

    if (action === 'DELETE') {
      var rows = sheet.getDataRange().getValues();
      var delId = String(data[headers[0]] || data.id || data.ID || data.ID_User || data.nik || data.kodeBarang || '').replace(/^'/, '');
      for (var d = rows.length - 1; d >= 1; d--) {
        if (String(rows[d][0]).replace(/^'/, '') === delId || String(rows[d][1]).replace(/^'/, '') === delId) {
          sheet.deleteRow(d + 1);
          return jsonResponse({ status: 'success', message: 'Data berhasil dihapus' });
        }
      }
      return jsonResponse({ status: 'error', message: 'Baris tidak ditemukan' });
    }

    return jsonResponse({ status: 'error', message: 'Aksi tidak dikenali' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) });
  }
}`;
