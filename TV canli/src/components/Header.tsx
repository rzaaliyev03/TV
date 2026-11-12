import React from 'react';
import {
  Tv,
  Search,
  PlusCircle,
  Upload,
  Download,
  Trash2,
  Keyboard,
  X,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenCleanModal: () => void;
  onOpenShortcutsModal: () => void;
  onExportPlaylist: () => void;
  totalChannels: number;
  workingChannels: number;
  brokenCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenImportModal,
  onOpenCleanModal,
  onOpenShortcutsModal,
  onExportPlaylist,
  totalChannels,
  workingChannels,
  brokenCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 px-4 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.jpg"
                    alt="Smart IPTV"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Tv className="w-5 h-5 text-cyan-400 absolute" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white flex items-center">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">IPTV</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  Web TV
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <strong className="text-emerald-400 font-semibold">{workingChannels}</strong> aktiv
                </span>
                <span>•</span>
                <span>{totalChannels} kanal</span>
              </div>
            </div>
          </div>

          {/* Quick Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAddModal}
              title="Yeni Kanal"
              className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer border border-cyan-500/30"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenCleanModal}
              title="Xətalı kanalları sil"
              className={`p-2 rounded-xl transition cursor-pointer border ${
                brokenCount > 0
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-white/5 text-slate-400 border-white/5'
              }`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Kanal, kateqoriya və ya ölkə axtar..."
            className="w-full bg-slate-900/90 hover:bg-slate-900 border border-white/10 focus:border-cyan-500/60 rounded-xl pl-10 pr-9 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Actions bar for desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Add Channel */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm hover:shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Kanal Əlavə Et</span>
          </button>

          {/* Import M3U */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 rounded-xl text-xs font-medium transition cursor-pointer"
            title="M3U / M3U8 pleylist faylı və ya linki yüklə"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Pleylist</span>
          </button>

          {/* Export M3U */}
          <button
            onClick={onExportPlaylist}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 rounded-xl text-xs transition cursor-pointer"
            title="Kanalları M3U faylı kimi endir"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clean Broken Channels */}
          <button
            onClick={onOpenCleanModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
              brokenCount > 0
                ? 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border-red-500/30 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/10'
            }`}
            title="Açılmayan və ya xətalı kanalları siyahıdan təmizlə"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="hidden lg:inline">Xətalıları Təmizlə</span>
            {brokenCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500/30 text-red-200 font-mono text-[10px]">
                {brokenCount}
              </span>
            )}
          </button>

          {/* Shortcuts Guide */}
          <button
            onClick={onOpenShortcutsModal}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 rounded-xl transition cursor-pointer"
            title="Klaviatura və TV pult qısa yolları"
          >
            <Keyboard className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
