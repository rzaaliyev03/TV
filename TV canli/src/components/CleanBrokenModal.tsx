import React from 'react';
import { X, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';

interface CleanBrokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanBroken: () => void;
  onResetDefaults: () => void;
  brokenCount: number;
}

export const CleanBrokenModal: React.FC<CleanBrokenModalProps> = ({
  isOpen,
  onClose,
  onCleanBroken,
  onResetDefaults,
  brokenCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">İşləməyən Kanalları Sil</h3>
              <p className="text-xs text-slate-400">Yayım ünvanı xətalı olan kanalların təmizlənməsi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Hazırda açılmayan və ya yayımı dayandırılmış{' '}
              <strong className="text-red-400 font-bold">{brokenCount} kanal</strong> aşkar edilmişdir.
              Bu kanalları siyahınızdan birdəfəlik silmək istəyirsiniz?
            </p>
          </div>

          <div className="pt-2 text-xs text-slate-400">
            İstədiyiniz vaxt ilkin standart kanalları bərpa edə bilərsiniz.
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition cursor-pointer"
            title="Bütün ilkin kanalları bərpa et"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            İlkin Kanalları Bərpa Et
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Ləğv Et
            </button>
            <button
              onClick={() => {
                onCleanBroken();
                onClose();
              }}
              disabled={brokenCount === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                brokenCount > 0
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bəli, Hamısını Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
