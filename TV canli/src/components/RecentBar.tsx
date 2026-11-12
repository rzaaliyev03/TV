import React from 'react';
import { History, Play } from 'lucide-react';
import { Channel } from '../types';

interface RecentBarProps {
  recentChannels: Channel[];
  currentChannelId?: string;
  onSelect: (channel: Channel) => void;
}

export const RecentBar: React.FC<RecentBarProps> = ({
  recentChannels,
  currentChannelId,
  onSelect,
}) => {
  if (recentChannels.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
      <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 font-medium mr-1">
        <History className="w-3.5 h-3.5 text-cyan-400" />
        <span>Son Baxılanlar:</span>
      </div>
      <div className="flex items-center gap-2">
        {recentChannels.slice(0, 8).map((ch) => {
          const isCurrent = ch.id === currentChannelId;
          return (
            <button
              key={ch.id}
              onClick={() => onSelect(ch)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shrink-0 border ${
                isCurrent
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-white/5 hover:border-white/10'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="truncate max-w-[120px]">{ch.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
