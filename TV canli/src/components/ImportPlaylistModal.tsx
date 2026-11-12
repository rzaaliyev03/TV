import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, ListPlus } from 'lucide-react';
import { parseM3UPlaylist } from '../utils/m3uParser';
import { Channel } from '../types';

interface ImportPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportChannels: (newChannels: Channel[], replace: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({
  isOpen,
  onClose,
  onImportChannels,
  onShowToast,
}) => {
  const [playlistText, setPlaylistText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPlaylistText(text || '');
    };
    reader.onerror = () => {
      setError('Fayl oxunarkən xəta baş verdi');
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!playlistText.trim()) {
      setError('Zəhmət olmasa M3U faylı seçin və ya M3U mətnini daxil edin');
      return;
    }

    try {
      const parsed = parseM3UPlaylist(playlistText);
      if (parsed.length === 0) {
        setError('Heç bir canlı kanal tapılmadı. Zəhmət olmasa faylın formatını (#EXTM3U) yoxlayın.');
        return;
      }

      onImportChannels(parsed, replaceExisting);
      onShowToast(`${parsed.length} ədəd yeni kanal uğurla əlavə edildi!`);
      onClose();
      setPlaylistText('');
      setFileName('');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Pleylist emal edilərkən xəta baş verdi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">M3U Pleylist Yüklə</h3>
              <p className="text-xs text-slate-400">Öz IPTV kanal siyahınızı (.m3u / .m3u8) əlavə edin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {/* File input drag & drop style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              M3U / M3U8 Faylı Seçin
            </label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/15 hover:border-cyan-500/50 rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-8 h-8 text-cyan-400 mb-2" />
                <p className="text-xs text-slate-300">
                  {fileName ? (
                    <span className="font-bold text-cyan-300">{fileName}</span>
                  ) : (
                    <span>Kompüterdən və ya telefondan .m3u faylı seçin</span>
                  )}
                </p>
              </div>
              <input
                type="file"
                accept=".m3u,.m3u8,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Paste text area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Və ya M3U Mətnini Bura Yapışdırın
            </label>
            <textarea
              rows={4}
              value={playlistText}
              onChange={(e) => {
                setPlaylistText(e.target.value);
                setError('');
              }}
              placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-name=&quot;Kanal Adı&quot;,Kanal Adı&#10;https://.../stream.m3u8"
              className="w-full bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Replace option */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
              <span className="text-xs text-slate-300">
                Mövcud siyahını təmizlə və yalnız bu yeni pleylisti saxla
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
          >
            Ləğv Et
          </button>
          <button
            onClick={handleProcessImport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm transition cursor-pointer shadow-lg shadow-blue-500/25"
          >
            <ListPlus className="w-4 h-4" />
            Pleylisti Daxil Et
          </button>
        </div>
      </div>
    </div>
  );
};
