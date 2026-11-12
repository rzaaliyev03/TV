import React from 'react';
import {
  Heart,
  Globe,
  Radio,
  Flame,
  Film,
  Music,
  Smile,
  Newspaper,
  Trophy,
  Filter,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';
import { CATEGORIES, COUNTRIES } from '../data/defaultChannels';
import { SortMode } from '../types';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  onlyWorking: boolean;
  onToggleOnlyWorking: () => void;
  favoritesCount: number;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  channelCounts: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCountry,
  onSelectCountry,
  onlyWorking,
  onToggleOnlyWorking,
  favoritesCount,
  sortMode,
  onSortChange,
  channelCounts,
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Sevimlilər':
        return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />;
      case 'Azərbaycan':
        return <span className="text-sm">🇦🇿</span>;
      case 'Türkiyə':
        return <span className="text-sm">🇹🇷</span>;
      case 'Dünya':
        return <span className="text-sm">🌍</span>;
      case 'Xəbər':
        return <Newspaper className="w-3.5 h-3.5" />;
      case 'İdman':
        return <Trophy className="w-3.5 h-3.5" />;
      case 'Musiqi':
        return <Music className="w-3.5 h-3.5" />;
      case 'Uşaq':
        return <Smile className="w-3.5 h-3.5" />;
      case 'Sənədli':
        return <Film className="w-3.5 h-3.5" />;
      case 'Hamısı':
      default:
        return <Flame className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Horizontal Scrollable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'Sevimlilər' ? favoritesCount : channelCounts[cat] ?? 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400/50 shadow-lg shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/5 hover:border-white/10'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-white/5 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          {/* Country selector */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedCountry}
              onChange={(e) => onSelectCountry(e.target.value)}
              className="bg-slate-800 hover:bg-slate-700/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Only Working Switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div
              onClick={onToggleOnlyWorking}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition duration-300 cursor-pointer ${
                onlyWorking ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  onlyWorking ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="group-hover:text-white transition flex items-center gap-1">
              <CheckCircle className={`w-3.5 h-3.5 ${onlyWorking ? 'text-emerald-400' : 'text-slate-500'}`} />
              Yalnız işləyən kanallar
            </span>
          </label>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">Sıralama:</span>
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="bg-slate-800 hover:bg-slate-700/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="default">Standart (Tövsiyə olunan)</option>
            <option value="name-asc">Kanal Adı (A - Z)</option>
            <option value="name-desc">Kanal Adı (Z - A)</option>
            <option value="recent">Ən son baxılanlar</option>
          </select>
        </div>
      </div>
    </div>
  );
};
