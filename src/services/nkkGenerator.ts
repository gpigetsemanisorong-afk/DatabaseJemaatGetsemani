import { SektorName, UnitName, JenisKelamin, Jemaat, WadahKategorial } from '../types';

export const SEKTOR_CODES: Record<SektorName, string> = {
  Filadelfia: '01',
  Petra: '02',
};

export const UNIT_CODES: Record<UnitName, string> = {
  Rehobot: '01',
  Silo: '02',
  Pniel: '01',
  Siloam: '02',
};

export const UNIT_OPTIONS: Record<SektorName, UnitName[]> = {
  Filadelfia: ['Rehobot', 'Silo'],
  Petra: ['Pniel', 'Siloam'],
};

export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Determine default wadah kategorial based on age and gender
 * PAR: Anak & Remaja (< 17 or not married / in youth)
 * PP: Pemuda (17 - 35 or unmarried youth)
 * PERPRI: Persekutuan Pria (Men / married / adult male)
 * PERWATA: Persekutuan Wanita (Women / married / adult female)
 * LANSIA: 60+ years old
 */
export function determineWadahKategorial(
  age: number,
  jenisKelamin: JenisKelamin,
  isMarried: boolean = false
): WadahKategorial {
  if (age >= 60) return 'LANSIA';
  if (age < 17) return 'PAR';
  if (age >= 17 && age <= 35 && !isMarried) return 'PP';
  if (jenisKelamin === 'Laki-laki') return 'PERPRI';
  return 'PERWATA';
}

/**
 * Format NKK (18 characters):
 * "JG" + Kode Sektor (01/02) + Kode Unit (01/02) + DDMMYYYY + JK (01/02) + Urut (01..99)
 */
export function generateNKK(
  sektor: SektorName,
  unit: UnitName,
  tanggalLahir: string, // YYYY-MM-DD
  jenisKelamin: JenisKelamin,
  existingJemaatList: Jemaat[]
): string {
  const prefix = 'JG';
  const sektorCode = SEKTOR_CODES[sektor] || '01';
  const unitCode = UNIT_CODES[unit] || '01';

  // Format birthdate to DDMMYYYY
  let birthDateCode = '01011990';
  if (tanggalLahir) {
    const parts = tanggalLahir.split('-');
    if (parts.length === 3) {
      const year = parts[0].padStart(4, '0');
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      birthDateCode = `${day}${month}${year}`;
    }
  }

  const jkCode = jenisKelamin === 'Laki-laki' ? '01' : '02';
  const base16 = `${prefix}${sektorCode}${unitCode}${birthDateCode}${jkCode}`;

  // Find existing NKKs starting with this 16-character base
  const existingMatches = existingJemaatList
    .filter((j) => j.nkk && j.nkk.startsWith(base16))
    .map((j) => {
      const suffix = j.nkk.substring(16, 18);
      const num = parseInt(suffix, 10);
      return isNaN(num) ? 0 : num;
    });

  let nextSequence = 1;
  if (existingMatches.length > 0) {
    nextSequence = Math.max(...existingMatches) + 1;
  }

  const sequenceCode = nextSequence.toString().padStart(2, '0');
  return `${base16}${sequenceCode}`;
}
