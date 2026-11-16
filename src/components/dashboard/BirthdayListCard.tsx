import React, { useState, useMemo } from 'react';
import { Jemaat } from '../../types';
import {
  Cake,
  Gift,
  PartyPopper,
  Calendar,
  Phone,
  MessageCircle,
  Sparkles,
  Search,
  Filter,
  Copy,
  Check,
  ChevronRight,
  Heart,
  Baby,
  Smile,
  Shield,
  Award,
} from 'lucide-react';

interface BirthdayListCardProps {
  jemaat: Jemaat[];
  onSelectJemaat?: (j: Jemaat) => void;
  onOpenKtp?: (j: Jemaat) => void;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const BirthdayListCard: React.FC<BirthdayListCardProps> = ({
  jemaat,
  onOpenKtp,
}) => {
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);
  const [selectedSektor, setSelectedSektor] = useState<string>('SEMUA');
  const [selectedWadah, setSelectedWadah] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Compute birthday members
  const birthdayData = useMemo(() => {
    return jemaat
      .filter((j) => {
        if (!j.tanggalLahir || j.statusKeanggotaan === 'Dinonaktifkan') return false;
        const parts = j.tanggalLahir.split('-').map(Number);
        if (parts.length < 3 || isNaN(parts[1]) || isNaN(parts[2])) return false;
        const birthMonth = parts[1] - 1; // 0-indexed
        return birthMonth === selectedMonth;
      })
      .map((j) => {
        const parts = j.tanggalLahir.split('-').map(Number);
        const birthYear = parts[0];
        const birthMonth = parts[1] - 1;
        const birthDay = parts[2];
        const turningAge = currentYear - birthYear;
        const isToday =
          selectedMonth === currentMonthIdx && birthDay === currentDay;
        const isPast =
          selectedMonth === currentMonthIdx && birthDay < currentDay;
        const isUpcoming =
          selectedMonth === currentMonthIdx && birthDay > currentDay;

        return {
          ...j,
          birthDay,
          birthMonth,
          birthYear,
          turningAge,
          isToday,
          isPast,
          isUpcoming,
        };
      })
      .sort((a, b) => a.birthDay - b.birthDay);
  }, [jemaat, selectedMonth, currentMonthIdx, currentDay, currentYear]);

  // Filtered members for display
  const filteredBirthdays = useMemo(() => {
    return birthdayData.filter((item) => {
      const matchSektor =
        selectedSektor === 'SEMUA' || item.sektor === selectedSektor;
      const matchWadah =
        selectedWadah === 'SEMUA' || item.wadahKategorial === selectedWadah;
      const matchSearch =
        !searchQuery.trim() ||
        item.nama.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.unit.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchSektor && matchWadah && matchSearch;
    });
  }, [birthdayData, selectedSektor, selectedWadah, searchQuery]);

  // Celebrants today (if selected month is current month)
  const todayCelebrants = useMemo(() => {
    if (selectedMonth !== currentMonthIdx) return [];
    return birthdayData.filter((item) => item.isToday);
  }, [birthdayData, selectedMonth, currentMonthIdx]);

  // Wadah summary counts
  const wadahStats = useMemo(() => {
    return {
      PAR: birthdayData.filter((i) => i.wadahKategorial === 'PAR').length,
      PP: birthdayData.filter((i) => i.wadahKategorial === 'PP').length,
      PERPRI: birthdayData.filter((i) => i.wadahKategorial === 'PERPRI').length,
      PERWATA: birthdayData.filter((i) => i.wadahKategorial === 'PERWATA').length,
      LANSIA: birthdayData.filter((i) => i.wadahKategorial === 'LANSIA').length,
    };
  }, [birthdayData]);

  // Format WhatsApp greeting link
  const createWhatsAppLink = (j: typeof birthdayData[0]) => {
    if (!j.noHp) return '';
    let phone = j.noHp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const message = encodeURIComponent(
      `Syalom ${j.jenisKelamin === 'Laki-laki' ? 'Bapak' : 'Ibu'} ${j.nama},\n\nSegenap Majelis Jemaat dan seluruh Warga Jemaat GPI Getsemani Sorong mengucapkan:\n✨ Selamat Hari Ulang Tahun ke-${j.turningAge} Tahun ✨\n\nKiranya kasih karunia, damai sejahtera, kesehatan yang prima, dan berkat yang melimpah dari Tuhan Yesus Kristus senantiasa menyertai Bapak/Ibu dan seluruh keluarga.\n\n"TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi engkau kasih karunia." (Bilangan 6:24-25)\n\nSalam Kasih & Doa,\nPHMJ GPI Getsemani Sorong`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  // Copy Warta Jemaat text to clipboard
  const handleCopyWartaJemaat = () => {
    if (birthdayData.length === 0) return;
    const lines = [
      `WARTA ULANG TAHUN WARGA JEMAAT GPI GETSEMANI`,
      `Bulan: ${MONTH_NAMES[selectedMonth]} ${currentYear}`,
      `Total: ${birthdayData.length} Jiwa`,
      `----------------------------------------`,
      ...birthdayData.map((item, idx) => {
        const dateStr = `${String(item.birthDay).padStart(2, '0')} ${MONTH_NAMES[selectedMonth]}`;
        return `${idx + 1}. [${dateStr}] ${item.nama} (HUT Ke-${item.turningAge} Thn) - Sektor ${item.sektor} (${item.unit}), Wadah: ${item.wadahKategorial}`;
      }),
      `----------------------------------------`,
      `"Ajarlah kami menghitung hari-hari kami sedemikian, hingga kami beroleh hati yang bijaksana." (Mazmur 90:12)`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div id="birthday-list-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#09090b] via-[#1a140a] to-[#0b0b0e] text-white p-5 sm:p-6 border-b border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/35 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
              <Cake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Warta Gerejawi
                </span>
                <span className="text-xs text-slate-300">
                  GPI Getsemani Sorong
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
                <span>Ulang Tahun Bulan Ini</span>
                <span className="text-amber-400 font-serif">
                  ({MONTH_NAMES[selectedMonth]} {currentYear})
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Daftar warga jemaat yang merayakan hari ulang tahun kelahiran
                berdasarkan tanggal lahir di sheet database Jemaat.
              </p>
            </div>
          </div>

          {/* Month Selector & Copy Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
              <Calendar className="w-4 h-4 text-amber-300 ml-2 mr-1.5 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                aria-label="Pilih Bulan Ulang Tahun"
                className="bg-transparent text-white text-xs font-semibold focus:outline-none pr-3 py-1 cursor-pointer"
              >
                {MONTH_NAMES.map((monthName, idx) => (
                  <option
                    key={monthName}
                    value={idx}
                    className="text-slate-900 bg-white"
                  >
                    {monthName} {idx === currentMonthIdx ? '• (Bulan Ini)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCopyWartaJemaat}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                copiedText
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
              title="Salin teks warta jemaat untuk pengumuman ibadah Minggu"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Warta Jemaat</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Wadah Summary Badges in Header */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Distribusi Wadah:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/30 text-[11px] font-semibold">
              <Baby className="w-3 h-3" /> PAR: {wadahStats.PAR}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30 text-[11px] font-semibold">
              <Smile className="w-3 h-3" /> PP: {wadahStats.PP}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[11px] font-semibold">
              <Shield className="w-3 h-3" /> PERPRI: {wadahStats.PERPRI}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30 text-[11px] font-semibold">
              <Heart className="w-3 h-3" /> PERWATA: {wadahStats.PERWATA}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[11px] font-semibold">
              <Award className="w-3 h-3" /> LANSIA: {wadahStats.LANSIA}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold font-mono bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
            <Gift className="w-3.5 h-3.5" />
            <span>Total {birthdayData.length} Jiwa</span>
          </div>
        </div>
      </div>

      {/* SPECIAL SPOTLIGHT: IF SOMEONE IS CELEBRATING TODAY */}
      {todayCelebrants.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/35 dark:via-[#16130c] dark:to-amber-950/30 border-b border-amber-200 dark:border-amber-500/30 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <PartyPopper className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
              🎉 Hari Ini Berulang Tahun! ({currentDay} {MONTH_NAMES[currentMonthIdx]})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayCelebrants.map((celeb) => (
              <div
                key={celeb.id}
                className="bg-white dark:bg-[#141418] p-3.5 rounded-xl border-2 border-amber-300 dark:border-amber-500/40 shadow-sm flex items-center justify-between gap-3 hover:border-amber-400 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold flex flex-col items-center justify-center shrink-0 border border-amber-200 dark:border-amber-500/30 leading-none">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">HARI INI</span>
                    <span className="text-base font-extrabold font-mono text-amber-900 dark:text-amber-200 mt-0.5">
                      {celeb.birthDay}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {celeb.nama}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold mt-0.5">
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                        HUT Ke-{celeb.turningAge} Thn
                      </span>
                      <span>·</span>
                      <span className="text-slate-600 font-normal">
                        {celeb.sektor} ({celeb.unit})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {celeb.noHp && (
                    <a
                      href={createWhatsAppLink(celeb)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      title="Kirim Ucapan Ulang Tahun via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ucapkan</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Sektor Filter */}
          <select
            value={selectedSektor}
            onChange={(e) => setSelectedSektor(e.target.value)}
            aria-label="Filter berdasarkan Sektor"
            className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="SEMUA">Semua Sektor</option>
            <option value="Filadelfia">Sektor Filadelfia</option>
            <option value="Petra">Sektor Petra</option>
          </select>

          {/* Wadah Filter */}
          <select
            value={selectedWadah}
            onChange={(e) => setSelectedWadah(e.target.value)}
            aria-label="Filter berdasarkan Wadah Kategorial"
            className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="SEMUA">Semua Wadah Kategorial</option>
            <option value="PAR">PAR (Anak & Remaja)</option>
            <option value="PP">PP (Pemuda)</option>
            <option value="PERPRI">PERPRI (Pria)</option>
            <option value="PERWATA">PERWATA (Wanita)</option>
            <option value="LANSIA">LANSIA (60+)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama jemaat / unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* BIRTHDAYS LIST / GRID */}
      <div className="p-4 sm:p-5">
        {filteredBirthdays.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Cake className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-700">
              Tidak Ada Warga Jemaat yang Berulang Tahun
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ditemukan data jemaat yang berulang tahun di bulan{' '}
              {MONTH_NAMES[selectedMonth]} dengan filter yang dipilih. Silakan
              ganti pilihan bulan atau reset filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredBirthdays.map((item) => {
              const wadahBadgeColor =
                item.wadahKategorial === 'PAR'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : item.wadahKategorial === 'PP'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : item.wadahKategorial === 'PERPRI'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : item.wadahKategorial === 'PERWATA'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    item.isToday
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/40 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top info with Date Pill */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-13 rounded-xl flex flex-col items-center justify-center shrink-0 border leading-none ${
                        item.isToday
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-extrabold shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {item.isToday ? 'HARI INI' : MONTH_NAMES[selectedMonth].substring(0, 3)}
                      </span>
                      <span className="text-lg font-black font-mono mt-0.5">
                        {String(item.birthDay).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                          {item.nama}
                        </h4>
                        {item.isToday && (
                          <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full">
                            HARI INI!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded font-mono text-[11px]">
                          HUT Ke-{item.turningAge} Thn
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Lahir {item.tanggalLahir}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-semibold border ${wadahBadgeColor}`}
                        >
                          {item.wadahKategorial}
                        </span>
                        <span className="text-slate-500">
                          Sektor {item.sektor} ({item.unit})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                      {item.hubunganKeluarga}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.noHp ? (
                        <>
                          <a
                            href={createWhatsAppLink(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium transition-colors text-[11px]"
                            title="Kirim ucapan selamat ulang tahun via WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WA</span>
                          </a>
                          <a
                            href={`tel:${item.noHp}`}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                            title={`Telepon ${item.noHp}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                          </a>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          No HP belum ada
                        </span>
                      )}

                      {onOpenKtp && (
                        <button
                          onClick={() => onOpenKtp(item)}
                          className="p-1 rounded-lg hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors"
                          title="Lihat KTP Jemaat"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
