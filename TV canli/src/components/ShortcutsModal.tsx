import React from 'react';
import { X, Keyboard, Tv, Play, Volume2, Maximize, PictureInPicture } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Boşluq (Space) / K', desc: 'Canlı yayımı oynat və ya dayandır' },
    { key: 'Sağ Ox (→)', desc: 'Növbəti kanala keç' },
    { key: 'Sol Ox (←)', desc: 'Əvvəlki kanala keç' },
    { key: 'Yuxarı Ox (↑)', desc: 'Səsi artır (+10%)' },
    { key: 'Aşağı Ox (↓)', desc: 'Səsi azalt (-10%)' },
    { key: 'M', desc: 'Səsi bağla / aç (Mute)' },
    { key: 'F', desc: 'Tam ekrana keç və ya çıx' },
    { key: 'P', desc: 'Pəncərədə izlə (Picture-in-Picture)' },
    { key: 'Esc', desc: 'Aktiv pleyeri və ya menyunu bağla' },
    { key: '1 - 9', desc: 'Siyahıdakı 1-9 nömrəli kanalları birbaşa aç' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">İdarəetmə Qısa Yolları</h3>
              <p className="text-xs text-slate-400">Smart TV pultu və klaviatura düymələri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-white/5 text-xs"
            >
              <span className="text-slate-300">{item.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-slate-950 text-cyan-300 border border-cyan-500/30 font-mono font-bold shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
