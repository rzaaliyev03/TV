/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DEFAULT_CHANNELS } from './data/defaultChannels';
import { Channel, SortMode } from './types';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { AddChannelModal } from './components/AddChannelModal';
import { ImportPlaylistModal } from './components/ImportPlaylistModal';
import { CleanBrokenModal } from './components/CleanBrokenModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { RecentBar } from './components/RecentBar';
import { Toast } from './components/Toast';
import { exportToM3U } from './utils/m3uParser';
import { Tv, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'smart_iptv_channels_v2';
const RECENTS_KEY = 'smart_iptv_recents_v2';

export default function App() {
  // Load channels from localStorage or fallback to defaults
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved channels:', e);
    }
    return DEFAULT_CHANNELS;
  });

  // Recent channel IDs
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load recents:', e);
    }
    return [];
  });

  // Currently playing channel
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('Hamısı');
  const [selectedCountry, setSelectedCountry] = useState<string>('Bütün Ölkələr');
  const [onlyWorking, setOnlyWorking] = useState<boolean>(false);
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & UI
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCleanOpen, setIsCleanOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist channels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
    } catch (e) {
      console.error('Failed to save channels:', e);
    }
  }, [channels]);

  // Persist recents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(recentIds));
    } catch (e) {
      console.error('Failed to save recents:', e);
    }
  }, [recentIds]);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Play channel handler
  const handleSelectChannel = useCallback((channel: Channel) => {
    setCurrentChannel(channel);

    // Update recents
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== channel.id);
      return [channel.id, ...filtered].slice(0, 10);
    });

    // Smooth scroll to video player on desktop/mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Toggle favorite
  const handleToggleFavorite = useCallback((id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, isFavorite: !ch.isFavorite } : ch))
    );
  }, []);

  // Mark channel working or broken
  const handleMarkBroken = useCallback((id: string, isWorking: boolean) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, isWorking, lastChecked: Date.now() } : ch))
    );
  }, []);

  // Delete single channel
  const handleDeleteChannel = useCallback(
    (id: string) => {
      setChannels((prev) => prev.filter((ch) => ch.id !== id));
      setRecentIds((prev) => prev.filter((item) => item !== id));
      if (currentChannel?.id === id) {
        setCurrentChannel(null);
      }
    },
    [currentChannel]
  );

  // Add single channel
  const handleAddChannel = useCallback(
    (newChannel: Channel) => {
      setChannels((prev) => [newChannel, ...prev]);
      handleSelectChannel(newChannel);
    },
    [handleSelectChannel]
  );

  // Import channels from playlist
  const handleImportChannels = useCallback(
    (newChannels: Channel[], replace: boolean) => {
      if (replace) {
        setChannels(newChannels);
        if (newChannels.length > 0) {
          handleSelectChannel(newChannels[0]);
        }
      } else {
        // Filter duplicates by streamUrl
        setChannels((prev) => {
          const existingUrls = new Set(prev.map((c) => c.streamUrl));
          const uniqueNew = newChannels.filter((c) => !existingUrls.has(c.streamUrl));
          return [...prev, ...uniqueNew];
        });
      }
    },
    [handleSelectChannel]
  );

  // Clean all broken channels
  const handleCleanBroken = useCallback(() => {
    const brokenList = channels.filter((c) => !c.isWorking);
    const count = brokenList.length;
    setChannels((prev) => prev.filter((c) => c.isWorking));
    if (currentChannel && !currentChannel.isWorking) {
      setCurrentChannel(null);
    }
    showToast(`${count} ədəd işləməyən kanal silindi.`);
  }, [channels, currentChannel, showToast]);

  // Reset to default factory channels
  const handleResetDefaults = useCallback(() => {
    setChannels(DEFAULT_CHANNELS);
    setRecentIds([]);
    setIsCleanOpen(false);
    showToast('Bütün kanallar ilkin vəziyyətinə bərpa edildi!');
  }, [showToast]);

  // Export channels to M3U
  const handleExportPlaylist = useCallback(() => {
    const m3uContent = exportToM3U(channels);
    const blob = new Blob([m3uContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-iptv-playlist-${new Date().toISOString().slice(0, 10)}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('M3U pleylist faylı endirildi!');
  }, [channels, showToast]);

  // Filter & Sort channels
  const filteredChannels = useMemo(() => {
    let result = [...channels];

    // Category filter
    if (selectedCategory === 'Sevimlilər') {
      result = result.filter((c) => c.isFavorite);
    } else if (selectedCategory !== 'Hamısı') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Country filter
    if (selectedCountry !== 'Bütün Ölkələr') {
      result = result.filter((c) => c.country.includes(selectedCountry.replace(/^[^\s]+\s/, '')));
    }

    // Only working filter
    if (onlyWorking) {
      result = result.filter((c) => c.isWorking);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortMode === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'az'));
    } else if (sortMode === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name, 'az'));
    } else if (sortMode === 'recent') {
      result.sort((a, b) => {
        const indexA = recentIds.indexOf(a.id);
        const indexB = recentIds.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    return result;
  }, [channels, selectedCategory, selectedCountry, onlyWorking, searchQuery, sortMode, recentIds]);

  // Next and Previous channel navigation
  const handleNextChannel = useCallback(() => {
    if (!currentChannel || filteredChannels.length === 0) return;
    const currentIndex = filteredChannels.findIndex((c) => c.id === currentChannel.id);
    const nextIndex = currentIndex < filteredChannels.length - 1 ? currentIndex + 1 : 0;
    handleSelectChannel(filteredChannels[nextIndex]);
  }, [currentChannel, filteredChannels, handleSelectChannel]);

  const handlePrevChannel = useCallback(() => {
    if (!currentChannel || filteredChannels.length === 0) return;
    const currentIndex = filteredChannels.findIndex((c) => c.id === currentChannel.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredChannels.length - 1;
    handleSelectChannel(filteredChannels[prevIndex]);
  }, [currentChannel, filteredChannels, handleSelectChannel]);

  // Keyboard shortcut listeners (Arrow keys, Space, Numbers)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextChannel();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevChannel();
      } else if (e.key === 'Escape') {
        if (isAddOpen || isImportOpen || isCleanOpen || isShortcutsOpen) {
          setIsAddOpen(false);
          setIsImportOpen(false);
          setIsCleanOpen(false);
          setIsShortcutsOpen(false);
        } else if (currentChannel) {
          setCurrentChannel(null);
        }
      } else if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        if (num <= filteredChannels.length) {
          handleSelectChannel(filteredChannels[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNextChannel,
    handlePrevChannel,
    filteredChannels,
    handleSelectChannel,
    isAddOpen,
    isImportOpen,
    isCleanOpen,
    isShortcutsOpen,
    currentChannel,
  ]);

  // Calculate statistics
  const workingCount = useMemo(() => channels.filter((c) => c.isWorking).length, [channels]);
  const brokenCount = channels.length - workingCount;
  const favoritesCount = useMemo(() => channels.filter((c) => c.isFavorite).length, [channels]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Hamısı: channels.length,
      Sevimlilər: favoritesCount,
    };
    channels.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [channels, favoritesCount]);

  // Recent channel objects
  const recentChannels = useMemo(() => {
    return recentIds
      .map((id) => channels.find((c) => c.id === id))
      .filter((c): c is Channel => !!c);
  }, [recentIds, channels]);

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenImportModal={() => setIsImportOpen(true)}
        onOpenCleanModal={() => setIsCleanOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        onExportPlaylist={handleExportPlaylist}
        totalChannels={channels.length}
        workingChannels={workingCount}
        brokenCount={brokenCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Cinema Video Player (if a channel is currently chosen) */}
        {currentChannel ? (
          <div className="space-y-2 animate-fadeIn">
            <VideoPlayer
              channel={currentChannel}
              onClose={() => setCurrentChannel(null)}
              onNext={handleNextChannel}
              onPrev={handlePrevChannel}
              onToggleFavorite={handleToggleFavorite}
              onMarkBroken={handleMarkBroken}
              onDeleteChannel={handleDeleteChannel}
            />
          </div>
        ) : (
          /* Welcome Hero Banner when no channel is playing */
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#070b16] border border-white/10 p-6 md:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Müasir Smart IPTV Veb Platforması
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                  Azərbaycan, Türkiyə və Dünya <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                    Canlı TV Kanallarını İzlə
                  </span>
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Smart TV, kompüter və mobil cihazlar üçün tam uyğunlaşdırılmış, HD/1080p keyfiyyətli IPTV yayımı.
                  Aşağıdakı siyahıdan istənilən kanalı seçin və ya dərhal izləməyə başlayın.
                </p>
              </div>

              {/* Quick Play First Channel Button */}
              {filteredChannels.length > 0 && (
                <button
                  onClick={() => handleSelectChannel(filteredChannels[0])}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition cursor-pointer shadow-xl shadow-cyan-500/25 shrink-0 transform hover:scale-105 active:scale-95"
                >
                  <Tv className="w-5 h-5" />
                  <span>{filteredChannels[0].name} İzlə</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recently Watched Channels Bar */}
        <RecentBar
          recentChannels={recentChannels}
          currentChannelId={currentChannel?.id}
          onSelect={handleSelectChannel}
        />

        {/* Category & Filters Navigation */}
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
          onlyWorking={onlyWorking}
          onToggleOnlyWorking={() => setOnlyWorking(!onlyWorking)}
          favoritesCount={favoritesCount}
          sortMode={sortMode}
          onSortChange={setSortMode}
          channelCounts={categoryCounts}
        />

        {/* Channel Grid Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {selectedCategory === 'Hamısı' ? 'Bütün Kanallar' : selectedCategory}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-white/10 text-slate-400">
              {filteredChannels.length} kanal
            </span>
          </div>
        </div>

        {/* Channel Cards Grid */}
        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isPlaying={currentChannel?.id === channel.id}
                onSelect={handleSelectChannel}
                onToggleFavorite={handleToggleFavorite}
                onDeleteChannel={handleDeleteChannel}
                onShowToast={showToast}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/10 bg-slate-900/40">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <Tv className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Uyğun kanal tapılmadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Axtarış sözünü dəyişdirin, filtrləri sıfırlayın və ya "Yalnız işləyən kanallar" parametrini deaktiv edin.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Hamısı');
                setSelectedCountry('Bütün Ölkələr');
                setOnlyWorking(false);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold transition cursor-pointer border border-white/10"
            >
              Bütün Filtrləri Sıfırla
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              IPTV
            </div>
            <span className="font-semibold text-slate-400">Smart IPTV Veb Platforması</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>🇦🇿 Azərbaycan Kanalları</span>
            <span>•</span>
            <span>🇹🇷 Türkiyə Kanalları</span>
            <span>•</span>
            <span>🌍 Dünya Kanalları</span>
          </div>
          <p className="text-[11px]">HLS / M3U8 Canlı Yayım Standartı</p>
        </div>
      </footer>

      {/* Modals */}
      <AddChannelModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddChannel={handleAddChannel}
        onShowToast={showToast}
      />

      <ImportPlaylistModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportChannels={handleImportChannels}
        onShowToast={showToast}
      />

      <CleanBrokenModal
        isOpen={isCleanOpen}
        onClose={() => setIsCleanOpen(false)}
        onCleanBroken={handleCleanBroken}
        onResetDefaults={handleResetDefaults}
        brokenCount={brokenCount}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}
