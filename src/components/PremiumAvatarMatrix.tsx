// [TECH CONSTRAINT]: Ensure all GIFs under 1.3 MB and optimized to prevent playback issues on mobile. Large files will be skipped by the system.

import React, { useState, memo } from 'react';
import { premiumAvatars, PremiumAvatar } from '../data/presetAvatars';
import { AnimatedAvatar } from './AnimatedAvatar';
import { Sparkles, ChevronDown, ChevronUp, Check, Flame, Shield, Layers, Zap } from 'lucide-react';

export interface PremiumAvatarMatrixProps {
  currentAvatarUrl?: string | null;
  activeColorHex: string;
  onSelectAvatar: (avatar: PremiumAvatar) => void;
}

type MatrixFilter = 'ALL' | 'CHARACTERS' | 'CYBER_GIFS';

export const PremiumAvatarMatrix: React.FC<PremiumAvatarMatrixProps> = memo(
  ({ currentAvatarUrl, activeColorHex, onSelectAvatar }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<MatrixFilter>('ALL');

    const filteredAvatars = React.useMemo(() => {
      if (selectedFilter === 'CHARACTERS') {
        return premiumAvatars.filter((a) => Number(a.id) >= 23);
      }
      if (selectedFilter === 'CYBER_GIFS') {
        return premiumAvatars.filter((a) => Number(a.id) < 23);
      }
      return premiumAvatars;
    }, [selectedFilter]);

    const filters: { id: MatrixFilter; label: string; count: number; icon: React.ReactNode }[] = [
      { id: 'ALL', label: 'ALL MATRIX', count: premiumAvatars.length, icon: <Layers size={11} /> },
      { id: 'CHARACTERS', label: 'CHARACTERS', count: 11, icon: <Flame size={11} /> },
      { id: 'CYBER_GIFS', label: 'CYBER GIFS', count: 22, icon: <Zap size={11} /> },
    ];

    return (
      <div
        className="rounded-3xl p-4 border space-y-3 transition-all duration-300"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          borderColor: `${activeColorHex}40`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 0 16px ${activeColorHex}0a`,
        }}
      >
        {/* Header with Collapsible Trigger - Section Header: 'PREMIUM AVATAR' */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span
              className="p-2 rounded-xl border flex items-center justify-center transition-colors"
              style={{
                backgroundColor: `${activeColorHex}15`,
                borderColor: `${activeColorHex}50`,
                color: activeColorHex,
              }}
            >
              <Sparkles size={16} className="animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white font-mono">
                  PREMIUM AVATAR
                </span>
                <span
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase"
                  style={{
                    backgroundColor: `${activeColorHex}20`,
                    borderColor: `${activeColorHex}60`,
                    color: activeColorHex,
                  }}
                >
                  {premiumAvatars.length} ASSETS
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                Instant character calibration with zero-lag profile ring preview
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 text-neutral-400 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Expandable Content Area */}
        {isExpanded && (
          <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Tech Constraint Notice */}
            <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-[8px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Shield size={10} style={{ color: activeColorHex }} />
                [TECH CONSTRAINT]: GIFs optimized &lt; 1.3 MB for mobile fluidity
              </span>
              <span className="text-[#00E676] font-bold">60FPS GPU</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {filters.map((f) => {
                const isActive = selectedFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                      isActive
                        ? 'text-black shadow-md'
                        : 'bg-white/5 text-neutral-400 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: isActive ? activeColorHex : undefined,
                      borderColor: isActive ? activeColorHex : undefined,
                      boxShadow: isActive ? `0 0 12px ${activeColorHex}66` : 'none',
                    }}
                  >
                    {f.icon}
                    <span>
                      {f.label} ({f.count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Minimalist Responsive Grid of 33 Avatars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
              {filteredAvatars.map((avatar) => {
                const isSelected = currentAvatarUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => onSelectAvatar(avatar)}
                    className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 active:scale-95 cursor-pointer flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'bg-white/10 shadow-lg'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      borderColor: isSelected ? activeColorHex : 'rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected
                        ? `0 0 16px ${activeColorHex}44, inset 0 0 12px ${activeColorHex}15`
                        : 'none',
                    }}
                  >
                    {/* Active Selection Indicator */}
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center shadow-md z-10"
                        style={{
                          backgroundColor: activeColorHex,
                        }}
                      >
                        <Check size={10} className="text-black stroke-[3]" />
                      </div>
                    )}

                    {/* Avatar Thumbnail with Neon Ring */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden p-0.5 border flex-shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: '#0A0A0E',
                          borderColor: isSelected ? activeColorHex : 'rgba(255,255,255,0.15)',
                        }}
                      >
                        <AnimatedAvatar
                          url={avatar.url}
                          alt={avatar.name}
                          fallbackText={avatar.name}
                          className="w-full h-full object-cover object-center rounded-lg"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] font-mono font-black uppercase tracking-wider block text-neutral-400 truncate">
                          #{avatar.id} {avatar.tag || 'VIP'}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-white mt-0.5">
                          {avatar.name}
                        </h4>
                        <span
                          className="text-[8px] font-mono block truncate mt-0.5"
                          style={{ color: isSelected ? activeColorHex : '#888' }}
                        >
                          {isSelected ? '● ACTIVE' : 'Tap to apply'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PremiumAvatarMatrix.displayName = 'PremiumAvatarMatrix';
