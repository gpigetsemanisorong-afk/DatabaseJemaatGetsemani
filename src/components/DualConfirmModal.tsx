import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DualConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmKeyword?: string;
  confirmButtonText?: string;
  isDestructive?: boolean;
}

export const DualConfirmModal: React.FC<DualConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmKeyword = 'RESET',
  confirmButtonText = 'Konfirmasi & Lanjutkan',
  isDestructive = true,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [typedKeyword, setTypedKeyword] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setTypedKeyword('');
    onClose();
  };

  const handleStep1Proceed = () => {
    if (confirmKeyword) {
      setStep(2);
    } else {
      onConfirm();
      handleClose();
    }
  };

  const handleFinalConfirm = () => {
    if (typedKeyword.trim().toUpperCase() === confirmKeyword.toUpperCase()) {
      onConfirm();
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Langkah {step} dari 2 Konfirmasi Pengamanan
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

            {step === 2 && (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-rose-800">
                  Ketik kata <span className="font-mono underline font-bold">{confirmKeyword}</span> di bawah ini untuk verifikasi otorisasi:
                </p>
                <input
                  type="text"
                  value={typedKeyword}
                  onChange={(e) => setTypedKeyword(e.target.value)}
                  placeholder={`Ketik ${confirmKeyword}`}
                  className="w-full px-3 py-2 text-sm bg-white border border-rose-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono uppercase"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            {step === 1 ? (
              <button
                onClick={handleStep1Proceed}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                  isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                Langkah Berikutnya &rarr;
              </button>
            ) : (
              <button
                onClick={handleFinalConfirm}
                disabled={typedKeyword.trim().toUpperCase() !== confirmKeyword.toUpperCase()}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                  typedKeyword.trim().toUpperCase() === confirmKeyword.toUpperCase()
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-rose-300 cursor-not-allowed'
                }`}
              >
                {confirmButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
