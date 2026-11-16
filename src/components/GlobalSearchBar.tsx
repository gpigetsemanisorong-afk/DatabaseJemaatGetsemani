import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Jemaat } from '../types';
import {
  Search,
  X,
  User,
  CreditCard,
  Users,
  FileText,
  ArrowRight,
  MapPin,
  Phone,
  Command,
} from 'lucide-react';

interface GlobalSearchBarProps {
  variant?: 'dashboard' | 'header';
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ variant = 'dashboard' }) => {
  const {
    jemaat,
    setActiveMenu,
    setSelectedNkkForKK,
    setSelectedJemaatForKtp,
    setGlobalSearchQuery,
  } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);

  // Close inline dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut for header search palette
  useEffect(() => {
    if (variant !== 'header') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
        setTimeout(() => paletteInputRef.current?.focus(), 40);
      } else if (e.key === 'Escape' && isPaletteOpen) {
        setIsPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [variant, isPaletteOpen]);

  const trimmedQuery = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!trimmedQuery) return [];
    const scored = jemaat
      .map((item) => {
        const nama = item.nama.toLowerCase();
        const nik = item.nik.toLowerCase();
        const nkk = item.nkk.toLowerCase();

        let score = 0;
        if (nik === trimmedQuery || nkk === trimmedQuery || nama === trimmedQuery) {
          score = 100;
        } else if (nama.startsWith(trimmedQuery) || nik.startsWith(trimmedQuery) || nkk.startsWith(trimmedQuery)) {
          score = 80;
        } else if (nama.includes(trimmedQuery)) {
          score = 60;
        } else if (nik.includes(trimmedQuery) || nkk.includes(trimmedQuery)) {
          score = 50;
        }
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.nama.localeCompare(b.item.nama));

    return scored.map((s) => s.item);
  }, [jemaat, trimmedQuery]);

  const displayedResults = useMemo(() => matches.slice(0, 10), [matches]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery]);

  const closeAll = () => {
    setIsOpen(false);
    setIsPaletteOpen(false);
  };

  const handleOpenDataJemaat = (item: Jemaat) => {
    setGlobalSearchQuery(item.nik || item.nama);
    setActiveMenu('kelola-data-jemaat');
    closeAll();
  };

  const handleOpenAllInDataJemaat = () => {
    setGlobalSearchQuery(query.trim());
    setActiveMenu('kelola-data-jemaat');
    closeAll();
  };

  const handleOpenKK = (e: React.MouseEvent, item: Jemaat) => {
    e.stopPropagation();
    setSelectedNkkForKK(item.nkk);
    setActiveMenu('kelola-data-kk');
    closeAll();
  };

  const handleOpenKtp = (e: React.MouseEvent, item: Jemaat) => {
    e.stopPropagation();
    setSelectedJemaatForKtp(item);
    setActiveMenu('kelola-kartu-anggota');
    closeAll();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      closeAll();
      return;
    }
    if (!displayedResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % displayedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + displayedResults.length) % displayedResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = displayedResults[activeIndex];
      if (chosen) handleOpenDataJemaat(chosen);
    }
  };

  const renderResultsList = (maxHeightClass = 'max-h-[420px]') => {
    if (!trimmedQuery) {
      return (
        <div className="p-5 text-center space-y-2">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Ketik minimal 1 huruf atau angka untuk mencari dari{' '}
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {jemaat.length} data jemaat
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Contoh:</span>
            {['Huliselan', 'Malessy', 'Leatemia', 'JG0101'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setQuery(sample)}
                className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500/20 text-zinc-700 dark:text-amber-300 border border-zinc-200 dark:border-amber-500/25 font-mono transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <div className="p-6 text-center space-y-1.5">
          <Search className="w-7 h-7 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
            Jemaat tidak ditemukan untuk "{query}"
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Pastikan Nama lengkap/marga, NIK (16 digit), atau Nomor KK (18 karakter) sesuai.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="px-3.5 py-2 bg-zinc-50 dark:bg-[#0e0e12] border-b border-zinc-200/80 dark:border-amber-500/20 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">
            Ditemukan{' '}
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
              {matches.length}
            </span>{' '}
            jemaat cocok
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            ↑↓ Pilih · Enter Buka Data · Esc Tutup
          </span>
        </div>

        <div className={`${maxHeightClass} overflow-y-auto divide-y divide-zinc-100 dark:divide-amber-500/10`}>
          {displayedResults.map((item, idx) => {
            const isHighlighted = idx === activeIndex;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleOpenDataJemaat(item)}
                className={`px-3.5 py-3 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isHighlighted
                    ? 'bg-amber-50/90 dark:bg-amber-500/12'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/70'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-900 dark:text-amber-50 truncate">
                      {item.nama}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      {item.hubunganKeluarga}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {item.wadahKategorial}
                    </span>
                    {item.statusKeanggotaan !== 'Jemaat Tetap' && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          item.statusKeanggotaan === 'Simpatisan'
                            ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {item.statusKeanggotaan}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                    <span>NIK: {item.nik}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-amber-700 dark:text-amber-400/90 font-semibold">
                      NKK: {item.nkk}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500/80" />
                      Sektor {item.sektor} ({item.unit})
                    </span>
                    <span>· {item.umur} thn</span>
                    {item.noHp && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        {item.noHp}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Cross-App Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleOpenKK(e, item)}
                    title="Lihat Kartu Keluarga (KK) Dukcapil"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-amber-500/20 dark:bg-zinc-800 dark:hover:bg-amber-500/20 text-zinc-800 dark:text-amber-200 border border-zinc-200 dark:border-amber-500/25 transition-colors"
                  >
                    <Users className="w-3 h-3 text-amber-500" />
                    <span>KK</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOpenKtp(e, item)}
                    title="Cetak / Lihat Kartu Anggota (e-KTP)"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-amber-500/20 dark:bg-zinc-800 dark:hover:bg-amber-500/20 text-zinc-800 dark:text-amber-200 border border-zinc-200 dark:border-amber-500/25 transition-colors"
                  >
                    <CreditCard className="w-3 h-3 text-amber-500" />
                    <span>KTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDataJemaat(item);
                    }}
                    title="Buka di Data Jemaat"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Data</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {matches.length > 10 && (
          <div className="p-2.5 bg-zinc-50 dark:bg-[#0e0e12] border-t border-zinc-200/80 dark:border-amber-500/20 flex justify-center">
            <button
              type="button"
              onClick={handleOpenAllInDataJemaat}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300"
            >
              <span>Tampilkan semua {matches.length} hasil di Data Jemaat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ================= VARIANT 1: GLOBAL HEADER BAR + CTRL+K PALETTE =================
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setIsPaletteOpen(true);
            setTimeout(() => paletteInputRef.current?.focus(), 40);
          }}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs bg-zinc-100 hover:bg-amber-500/15 dark:bg-[#141418] dark:hover:bg-[#1c1c23] text-zinc-600 dark:text-zinc-300 border border-amber-900/15 dark:border-amber-500/25 transition-colors group"
          title="Pencarian Global Jemaat (Ctrl+K)"
          aria-label="Buka Pencarian Global"
        >
          <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="hidden md:inline text-[11px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-amber-200 truncate max-w-[160px]">
            Cari Nama / NIK / NKK...
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-[#09090c] text-zinc-500 dark:text-amber-400/90 border border-zinc-200 dark:border-amber-500/25">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {isPaletteOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/75 backdrop-blur-xs"
            onClick={() => setIsPaletteOpen(false)}
          >
            <div
              className="w-full max-w-2xl bg-white dark:bg-[#121216] rounded-2xl shadow-2xl border border-amber-500/35 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3.5 bg-[#0a0a0d] border-b border-amber-500/30 flex items-center gap-3">
                <Search className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  ref={paletteInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Pencarian Global: Ketik Nama Jemaat / Marga, NIK (16 digit), atau No. KK (18 karakter)..."
                  className="flex-1 bg-[#141418] border border-amber-500/25 rounded-xl px-3 py-1.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      paletteInputRef.current?.focus();
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
                    title="Bersihkan pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(false)}
                  className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold text-zinc-400 hover:text-amber-300 bg-zinc-900 border border-zinc-700"
                >
                  ESC
                </button>
              </div>

              {renderResultsList('max-h-[62vh]')}
            </div>
          </div>
        )}
      </>
    );
  }

  // ================= VARIANT 2: DASHBOARD TOP GLOBAL SEARCH BAR =================
  return (
    <div ref={containerRef} className="relative z-30">
      <div className="bg-white dark:bg-[#121216] p-3 sm:p-4 rounded-2xl border border-amber-900/15 dark:border-amber-500/30 shadow-sm dark:shadow-lg dark:shadow-black/30 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 shrink-0 px-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-amber-100 leading-tight">
                Pencarian Global Jemaat
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Cari cepat Nama, NIK, atau NKK ({jemaat.length} jiwa)
              </div>
            </div>
          </div>

          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Ketik Nama / Marga (mis. Huliselan), NIK 16 digit, atau Nomor KK (JG...)..."
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm bg-zinc-50 dark:bg-[#18181d] border border-zinc-200 dark:border-amber-500/25 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-colors"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  title="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {trimmedQuery && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {matches.length} hasil
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Live Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#121216] rounded-2xl shadow-2xl border border-amber-500/35 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {renderResultsList('max-h-[380px]')}
        </div>
      )}
    </div>
  );
};
