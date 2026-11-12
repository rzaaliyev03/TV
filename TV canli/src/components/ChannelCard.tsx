import React, { useState } from 'react';
import {
  Play,
  Heart,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Tv,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  isPlaying: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteChannel: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isPlaying,
  onSelect,
  onToggleFavorite,
  onDeleteChannel,
  onShowToast,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(channel.streamUrl).then(() => {
      onShowToast(`Link kopyalandı: ${channel.name}`);
      setShowMenu(false);
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteChannel(channel.id);
    onShowToast(`Kanal silindi: ${channel.name}`);
    setShowMenu(false);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden border ${
        isPlaying
          ? 'bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/40 transform -translate-y-1'
          : 'bg-slate-900/60 hover:bg-slate-900 border-white/5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-black/60 hover:-translate-y-0.5'
      }`}
    >
      {/* Playing Neon Glow Line */}
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse" />
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Channel Icon or Fallback Initials */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-xl bg-slate-950 p-1 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/40 transition shadow-inner overflow-hidden">
            {channel.logoUrl && !imgError ? (
              <img
                src={channel.logoUrl}
                alt={channel.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-cyan-400 font-black text-sm tracking-wider">
                {getInitials(channel.name)}
              </div>
            )}
          </div>

          {/* Working Status Dot */}
          <div
            title={channel.isWorking ? 'Yayım işləyir' : 'Yayımda problem var'}
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
              channel.isWorking ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
            }`}
          />
        </div>

        {/* Favorite & Options */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            title={channel.isFavorite ? 'Sevimlilərdən çıxar' : 'Sevimlilərə əlavə et'}
            className={`p-2 rounded-xl transition cursor-pointer ${
              channel.isFavorite
                ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10 opacity-70 group-hover:opacity-100'
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={channel.isFavorite ? 'currentColor' : 'none'}
            />
          </button>

          {/* More actions button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="Əlavə seçimlər"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer opacity-70 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-10 w-44 bg-slate-800 border border-white/15 rounded-xl shadow-2xl z-40 py-1 backdrop-blur-md animate-fadeIn">
                  <button
                    onClick={copyUrl}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition text-left cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>M3U8 Linkini Kopyala</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/15 transition text-left cursor-pointer border-t border-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kanalı Sil</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Channel Details */}
      <div className="mt-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h3 className="font-bold text-white text-sm md:text-base group-hover:text-cyan-300 transition truncate tracking-tight">
            {channel.name}
          </h3>
          {channel.quality && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-white/10 text-slate-300 shrink-0">
              {channel.quality}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <div className="flex items-center gap-2 truncate">
            <span>{channel.country}</span>
            <span>•</span>
            <span className="text-cyan-400/90 truncate">{channel.category}</span>
          </div>

          {/* Playing soundwave or Play icon */}
          <div>
            {isPlaying ? (
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3" />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4 delay-75" />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2 delay-150" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition flex items-center justify-center transform group-hover:scale-110">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
