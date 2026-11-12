import React, { useState } from 'react';
import { X, Plus, Tv, Globe, Radio, Sparkles } from 'lucide-react';
import { Channel } from '../types';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: Channel) => void;
  onShowToast: (msg: string) => void;
}

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onAddChannel,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [category, setCategory] = useState('Azərbaycan');
  const [country, setCountry] = useState('🇦🇿 Azərbaycan');
  const [quality, setQuality] = useState('1080p');
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Zəhmət olmasa kanalın adını daxil edin');
      return;
    }
    if (!streamUrl.trim() || !streamUrl.startsWith('http')) {
      setError('Düzgün yayım linki (http:// və ya https://) daxil edin');
      return;
    }

    const newChannel: Channel = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      streamUrl: streamUrl.trim(),
      logoUrl: logoUrl.trim() || undefined,
      category,
      country,
      quality,
      isFavorite: true,
      isWorking: true,
      isCustom: true,
      addedAt: Date.now(),
    };

    onAddChannel(newChannel);
    onShowToast(`"${newChannel.name}" kanalı əlavə edildi!`);
    onClose();

    // Reset form
    setName('');
    setStreamUrl('');
    setLogoUrl('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Yeni Kanal Əlavə Et</h3>
              <p className="text-xs text-slate-400">Canlı HLS / M3U8 yayım linki daxil edin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kanalın Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Məsələn: Space TV, CBC Sport"
              className="w-full bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Yayım Linki (HLS / M3U8) *
            </label>
            <input
              type="url"
              required
              value={streamUrl}
              onChange={(e) => {
                setStreamUrl(e.target.value);
                setError('');
              }}
              placeholder="https://example.com/live/channel.m3u8"
              className="w-full bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kateqoriya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="Azərbaycan">Azərbaycan</option>
                <option value="Türkiyə">Türkiyə</option>
                <option value="Xəbər">Xəbər</option>
                <option value="İdman">İdman</option>
                <option value="Musiqi">Musiqi</option>
                <option value="Uşaq">Uşaq</option>
                <option value="Sənədli">Sənədli</option>
                <option value="Digər">Digər</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ölkə / Qrup
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="🇦🇿 Azərbaycan">🇦🇿 Azərbaycan</option>
                <option value="🇹🇷 Türkiyə">🇹🇷 Türkiyə</option>
                <option value="🌍 Dünya">🌍 Dünya</option>
                <option value="🇷🇺 Rusiya">🇷🇺 Rusiya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Keyfiyyət
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="4K">4K Ultra HD</option>
                <option value="HD">HD</option>
                <option value="SD">SD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Loqo Şəkil Linki (İstəyə görə)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
            >
              Ləğv Et
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition cursor-pointer shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4" />
              Kanalı Əlavə Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
