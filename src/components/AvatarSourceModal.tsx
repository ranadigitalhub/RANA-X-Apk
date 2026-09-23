// [TECH CONSTRAINT]: Ensure all GIFs under 1.3 MB and optimized to prevent playback issues on mobile. Large files will be skipped by the system.

import React, { useState, useMemo, memo } from 'react';
import { Upload, Camera, RotateCcw, X, Check, Sparkles, Flame, Shield, Layers, Zap } from 'lucide-react';
import { AnimatedAvatar } from './AnimatedAvatar';
import { premiumAvatars, PremiumAvatar } from '../data/presetAvatars';

interface AvatarSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  athleteName: string;
  activeColorHex: string;
  onUploadFileClick: () => void;
  onCameraCaptureClick: () => void;
  onSelectAvatar: (avatar: PremiumAvatar) => void;
  onResetAvatar: () => void;
}

type MatrixFilter = 'ALL' | 'CHARACTERS' | 'CYBER_GIFS';

export const AvatarSourceModal: React.FC<AvatarSourceModalProps> = memo(
  ({
    isOpen,
    onClose,
    currentAvatarUrl,
    athleteName,
    activeColorHex,
    onUploadFileClick,
    onCameraCaptureClick,
    onSelectAvatar,
    onResetAvatar,
  }) => {
    const [selectedFilter, setSelectedFilter] = useState<MatrixFilter>('ALL');

    const filteredAvatars = useMemo(() => {
      if (selectedFilter === 'CHARACTERS') {
        return premiumAvatars.filter((a) => Number(a.id) >= 23);
      }
      if (selectedFilter === 'CYBER_GIFS') {
        return premiumAvatars.filter((a) => Number(a.id) < 23);
      }
      return premiumAvatars;
    }, [selectedFilter]);

    if (!isOpen) return null;

    const filters: { id: MatrixFilter; label: string; count: number; icon: React.ReactNode }[] = [
      { id: 'ALL', label: 'ALL', count: premiumAvatars.length, icon: <Layers size={11} /> },
      { id: 'CHARACTERS', label: 'CHARACTERS', count: 11, icon: <Flame size={11} /> },
      { id: 'CYBER_GIFS', label: 'CYBER GIFS', count: 22, icon: <Zap size={11} /> },
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in overflow-y-auto">
        <div
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl p-4 sm:p-5 border bg-[#0C0C12] space-y-4 shadow-2xl animate-in zoom-in-95 duration-200"
          style={{
            borderColor: `${activeColorHex}50`,
            boxShadow: `0 10px 40px rgba(0,0,0,0.9), 0 0 30px ${activeColorHex}30`,
          }}
        >
          {/* Header - Minimalist Rebrand */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
                style={{
                  backgroundColor: activeColorHex,
                  boxShadow: `0 0 8px ${activeColorHex}`,
                }}
              />
              <h3
                className="text-xs sm:text-sm font-black tracking-widest uppercase text-white font-mono flex items-center gap-1.5"
                style={{ textShadow: `0 0 12px ${activeColorHex}66` }}
              >
                <Sparkles size={14} style={{ color: activeColorHex }} />
                PROFESSIONAL PROFILE CUSTOMISATION
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
            {/* Current Active Profile Preview Bar */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden p-0.5 border flex-shrink-0"
                  style={{
                    borderColor: activeColorHex,
                    boxShadow: `0 0 12px ${activeColorHex}40`,
                  }}
                >
                  <AnimatedAvatar
                    url={currentAvatarUrl}
                    alt="Current Avatar"
                    fallbackText={athleteName}
                    className="w-full h-full object-cover object-center rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">
                    ACTIVE PROFILE PICTURE
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{athleteName}</h4>
                </div>
              </div>

              {/* Reset to Official RANA X Logo Action */}
              <button
                type="button"
                onClick={() => {
                  onResetAvatar();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-[10px] font-mono font-bold transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                title="Reset to official RANA X logo"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>

            {/* Top Side-by-Side Action Buttons: Upload Image & Live Camera */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Upload Local File */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUploadFileClick();
                }}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left transition-all active:scale-95 group cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 border transition-colors"
                  style={{
                    backgroundColor: `${activeColorHex}15`,
                    borderColor: `${activeColorHex}40`,
                  }}
                >
                  <Upload size={15} style={{ color: activeColorHex }} />
                </div>
                <span className="text-xs font-bold text-white block">Upload Image</span>
                <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
                  Gallery / Photos
                </span>
              </button>

              {/* Live Camera Snapshot */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCameraCaptureClick();
                }}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left transition-all active:scale-95 group cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 border transition-colors"
                  style={{
                    backgroundColor: `${activeColorHex}15`,
                    borderColor: `${activeColorHex}40`,
                  }}
                >
                  <Camera size={15} style={{ color: activeColorHex }} />
                </div>
                <span className="text-xs font-bold text-white block">Live Camera</span>
                <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
                  Mobile Snapshot
                </span>
              </button>
            </div>

            {/* Shifted Premium Avatar Section: Immediately beneath Upload & Camera */}
            <div
              className="p-3 sm:p-4 rounded-2xl border space-y-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: `${activeColorHex}30`,
              }}
            >
              {/* Clean Section Header: 'PREMIUM AVATAR' (No sub-labels, no badges) */}
              <div className="flex items-center gap-2">
                <span
                  className="p-1 rounded-lg border flex items-center justify-center"
                  style={{
                    backgroundColor: `${activeColorHex}15`,
                    borderColor: `${activeColorHex}40`,
                    color: activeColorHex,
                  }}
                >
                  <Sparkles size={12} />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-white font-mono">
                  PREMIUM AVATAR
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {filters.map((f) => {
                  const isActive = selectedFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFilter(f.id)}
                      className={`px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold tracking-wider whitespace-nowrap transition-all border flex items-center gap-1 active:scale-95 cursor-pointer ${
                        isActive
                          ? 'text-black shadow-md'
                          : 'bg-white/5 text-neutral-400 hover:text-white border-white/10'
                      }`}
                      style={{
                        backgroundColor: isActive ? activeColorHex : undefined,
                        borderColor: isActive ? activeColorHex : undefined,
                        boxShadow: isActive ? `0 0 10px ${activeColorHex}50` : 'none',
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

              {/* 33 Curated Premium Avatars Grid with Exact Character Names */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-[290px] overflow-y-auto pr-1 no-scrollbar">
                {filteredAvatars.map((avatar) => {
                  const isSelected = currentAvatarUrl === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        onSelectAvatar(avatar);
                        onClose();
                      }}
                      className={`group relative p-2 rounded-xl border text-left transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2 overflow-hidden ${
                        isSelected
                          ? 'bg-white/10 shadow-lg'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                      }`}
                      style={{
                        borderColor: isSelected ? activeColorHex : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: isSelected ? `0 0 12px ${activeColorHex}40` : 'none',
                      }}
                    >
                      {/* Active Selection Pin */}
                      {isSelected && (
                        <div
                          className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md z-10"
                          style={{ backgroundColor: activeColorHex }}
                        >
                          <Check size={8} className="text-black stroke-[3]" />
                        </div>
                      )}

                      {/* Thumbnail Container */}
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden p-0.5 border flex-shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: '#0A0A0E',
                          borderColor: isSelected ? activeColorHex : 'rgba(255,255,255,0.15)',
                        }}
                      >
                        <AnimatedAvatar
                          url={avatar.url}
                          alt={avatar.name}
                          fallbackText={avatar.name}
                          className="w-full h-full object-cover object-center rounded-md"
                        />
                      </div>

                      {/* Character Name & Status */}
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-[7px] font-mono font-bold uppercase tracking-wider block text-neutral-400 truncate">
                          #{avatar.id} {avatar.tag || 'VIP'}
                        </span>
                        <h5 className="text-[11px] font-bold text-white truncate group-hover:text-white leading-tight">
                          {avatar.name}
                        </h5>
                        <span
                          className="text-[7px] font-mono block truncate mt-0.5"
                          style={{ color: isSelected ? activeColorHex : '#777' }}
                        >
                          {isSelected ? '● ACTIVE' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AvatarSourceModal.displayName = 'AvatarSourceModal';
