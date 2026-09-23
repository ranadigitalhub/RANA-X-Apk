import React, { useState, memo } from 'react';
import { DailyActivity } from '../types';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/interfaceDynamics';
import {
  Droplets,
  Plus,
  Minus,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface HydrationMatrixCardProps {
  activity: DailyActivity;
  onUpdateActivity: (updated: DailyActivity) => void;
  onLogWaterDelta?: (litersDelta: number) => void;
}

export const HydrationMatrixCard: React.FC<HydrationMatrixCardProps> = memo(({
  activity,
  onUpdateActivity,
  onLogWaterDelta,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<'liters' | 'milliliters'>('liters');
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const currentLiters = Math.max(0, activity.waterIntakeLiters || 0);
  const targetLiters = activity.waterTargetLiters || 3.0;
  const currentMl = Math.round(currentLiters * 1000);
  const targetMl = Math.round(targetLiters * 1000);

  // Standard glass is 250ml = 0.25L
  const GLASS_VOLUME_L = 0.25;
  const totalGlasses = Math.round(targetLiters / GLASS_VOLUME_L);
  const currentGlasses = Math.floor(currentLiters / GLASS_VOLUME_L);
  const percent = Math.min(150, Math.round((currentLiters / targetLiters) * 100));

  const handleAdjustWater = (deltaLiters: number) => {
    if (deltaLiters < 0 && currentLiters <= 0) return;

    if (deltaLiters > 0) {
      triggerHaptic(HAPTIC_PATTERNS.TAP);
    } else {
      triggerHaptic(HAPTIC_PATTERNS.TOGGLE);
    }

    const nextLiters = Math.max(0, Math.round((currentLiters + deltaLiters) * 100) / 100);

    if (onLogWaterDelta) {
      onLogWaterDelta(deltaLiters);
    } else {
      onUpdateActivity({
        ...activity,
        waterIntakeLiters: nextLiters,
      });
    }
  };

  const handleSetGlassCount = (glassIndex: number) => {
    triggerHaptic(HAPTIC_PATTERNS.SET_FINISH);
    const newLiters = Math.round((glassIndex + 1) * GLASS_VOLUME_L * 100) / 100;
    const delta = newLiters - currentLiters;

    if (onLogWaterDelta) {
      onLogWaterDelta(delta);
    } else {
      onUpdateActivity({
        ...activity,
        waterIntakeLiters: newLiters,
      });
    }
  };

  const handleResetDaily = () => {
    triggerHaptic(HAPTIC_PATTERNS.ALERT);
    const delta = -currentLiters;
    if (onLogWaterDelta) {
      onLogWaterDelta(delta);
    } else {
      onUpdateActivity({
        ...activity,
        waterIntakeLiters: 0,
      });
    }
  };

  // Status message based on percentage
  const getHydrationStatus = () => {
    if (percent >= 100) {
      return {
        label: 'OPTIMAL CELLULAR HYDRATION',
        desc: 'Electrolyte transport & recovery efficiency at peak',
        color: '#00F0FF',
        bg: 'bg-[#00F0FF]/15',
        border: 'border-[#00F0FF]/40',
        icon: CheckCircle2,
      };
    }
    if (percent >= 60) {
      return {
        label: 'HYDRATION BASELINE REACHED',
        desc: 'Good cellular volume; on pace for daily target',
        color: '#00E676',
        bg: 'bg-[#00E676]/15',
        border: 'border-[#00E676]/40',
        icon: Sparkles,
      };
    }
    return {
      label: 'DEFICIT ALERT — SIP WATER',
      desc: 'Muscle conductivity & cognitive endurance reduced',
      color: '#FFB300',
      bg: 'bg-[#FFB300]/15',
      border: 'border-[#FFB300]/40',
      icon: AlertTriangle,
    };
  };

  const status = getHydrationStatus();
  const StatusIcon = status.icon;

  return (
    <div className="relative rounded-3xl glass-panel p-4 sm:p-5 border border-[#B026FF]/30 hover:border-[#B026FF]/60 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] overflow-hidden select-none">
      {/* Background ambient diffused glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#B026FF]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#00F0FF]/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B026FF]/25 to-[#00F0FF]/25 border border-[#B026FF]/50 flex items-center justify-center shadow-[0_0_15px_rgba(176,38,255,0.4)]">
            <Droplets size={20} className="text-[#00F0FF] fill-[#00F0FF]/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                HYDRATION MATRIX
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#B026FF]/20 text-[#D87BF5] border border-[#B026FF]/50 font-extrabold">
                BIO-H2O
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              Cellular Fluid Balance • 250ml Glass Increments
            </p>
          </div>
        </div>

        {/* Unit Switcher & Reset Button */}
        <div className="flex items-center gap-1.5 font-mono">
          <button
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.TAP);
              setSelectedUnit(selectedUnit === 'liters' ? 'milliliters' : 'liters');
            }}
            className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 transition-all active:scale-95"
            title="Toggle unit between L and ml"
          >
            {selectedUnit === 'liters' ? 'L' : 'ml'}
          </button>
          {currentLiters > 0 && (
            <button
              onClick={handleResetDaily}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-neutral-400 hover:text-red-400 transition-all active:scale-95"
              title="Reset today's water"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Hydration Progress Hero */}
      <div className="relative z-10 p-4 rounded-2xl bg-black/60 border border-white/10 mb-4 overflow-hidden">
        {/* Futuristic liquid background fill height */}
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#B026FF]/20 via-[#00F0FF]/15 to-transparent transition-all duration-700 pointer-events-none"
          style={{ height: `${Math.min(100, percent)}%` }}
        />

        <div className="flex items-baseline justify-between relative z-10 mb-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {selectedUnit === 'liters' ? currentLiters.toFixed(2) : currentMl.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-[#00F0FF] font-mono">
              {selectedUnit === 'liters' ? 'L' : 'ml'}
            </span>
            <span className="text-xs text-neutral-500 font-mono ml-1">
              / {selectedUnit === 'liters' ? `${targetLiters.toFixed(1)} L` : `${targetMl.toLocaleString()} ml`}
            </span>
          </div>

          <div className="text-right">
            <span
              className="text-xl font-black font-mono tracking-tight"
              style={{ color: percent >= 100 ? '#00E676' : '#00F0FF' }}
            >
              {percent}%
            </span>
          </div>
        </div>

        {/* Dual-Glow Progress Bar with Fluid Indicator */}
        <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden relative p-0.5 mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B026FF] via-[#00A3FF] to-[#00F0FF] transition-all duration-700 relative shadow-[0_0_12px_rgba(0,240,255,0.6)]"
            style={{ width: `${Math.min(100, percent)}%` }}
          >
            {/* Shimmer line */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-shimmer" />
          </div>
        </div>

        {/* Dynamic Cellular Status Pill */}
        <div
          className={`flex items-center gap-2 p-2 rounded-xl ${status.bg} border ${status.border} text-xs relative z-10`}
        >
          <StatusIcon size={14} style={{ color: status.color }} className="flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black font-mono block leading-tight" style={{ color: status.color }}>
              {status.label}
            </span>
            <span className="text-[9px] text-neutral-300 font-mono truncate block opacity-85">
              {status.desc}
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono text-neutral-300 flex-shrink-0">
            {currentGlasses}/{totalGlasses} Glasses
          </span>
        </div>
      </div>

      {/* Interactive Glass Tracker Matrix (Visual 12-Glass Counter) */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5 px-0.5">
          <span>DAILY GLASSES LOG (250 ML)</span>
          <span className="text-[#00F0FF] font-bold">{currentGlasses} consumed</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 p-2.5 rounded-2xl bg-black/40 border border-white/5">
          {Array.from({ length: totalGlasses }).map((_, idx) => {
            const isFilled = idx < currentGlasses;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSetGlassCount(idx)}
                className={`relative flex flex-col items-center justify-center py-2 rounded-xl border transition-all duration-200 active:scale-90 ${
                  isFilled
                    ? 'bg-gradient-to-t from-[#B026FF]/30 to-[#00F0FF]/30 border-[#00F0FF]/70 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/30 text-neutral-600'
                }`}
                title={`Glass ${idx + 1} (${(idx + 1) * 250}ml)`}
              >
                <Droplets
                  size={14}
                  className={`transition-all ${
                    isFilled
                      ? 'text-[#00F0FF] fill-[#00F0FF]/40 drop-shadow-[0_0_4px_#00F0FF]'
                      : 'text-neutral-600'
                  }`}
                />
                <span className="text-[8px] font-mono mt-0.5 font-bold text-neutral-400">
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Functional (+) and (-) Controls */}
      <div className="relative z-10 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* (-) Minus Button: Decrease 250ml */}
          <button
            type="button"
            disabled={currentLiters <= 0}
            onClick={() => handleAdjustWater(-0.25)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-white/25 text-white font-mono text-xs font-bold transition-all active:scale-95 shadow-sm group"
          >
            <div className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center text-neutral-400 group-hover:text-red-400 transition-colors">
              <Minus size={14} />
            </div>
            <span>- 250 ml</span>
          </button>

          {/* (+) Plus Button: Increase 250ml (Standard Glass) */}
          <button
            type="button"
            onClick={() => handleAdjustWater(0.25)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#00F0FF]/20 to-[#00A3FF]/20 hover:from-[#00F0FF]/30 hover:to-[#00A3FF]/30 border border-[#00F0FF]/60 hover:border-[#00F0FF] text-white font-mono text-xs font-black transition-all active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.25)] group"
          >
            <div className="w-6 h-6 rounded-lg bg-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] group-hover:scale-110 transition-transform">
              <Plus size={14} />
            </div>
            <span className="text-[#00F0FF]">+ 250 ml (Glass)</span>
          </button>
        </div>

        {/* Quick Presets Row: Sip (+100ml) & Bottle (+500ml) */}
        <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => handleAdjustWater(0.1)}
            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-[#00F0FF]/15 border border-white/10 hover:border-[#00F0FF]/40 text-neutral-300 hover:text-[#00F0FF] transition-all active:scale-95 font-semibold text-center"
          >
            +100 ml (Sip)
          </button>

          <button
            type="button"
            onClick={() => handleAdjustWater(0.5)}
            className="py-1.5 px-2 rounded-xl bg-[#B026FF]/15 hover:bg-[#B026FF]/25 border border-[#B026FF]/40 hover:border-[#B026FF]/70 text-[#D87BF5] transition-all active:scale-95 font-bold text-center shadow-[0_0_8px_rgba(176,38,255,0.2)]"
          >
            +500 ml (Bottle)
          </button>

          <button
            type="button"
            onClick={() => handleAdjustWater(0.75)}
            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-[#00F0FF]/15 border border-white/10 hover:border-[#00F0FF]/40 text-neutral-300 hover:text-[#00F0FF] transition-all active:scale-95 font-semibold text-center"
          >
            +750 ml (Flask)
          </button>
        </div>
      </div>
    </div>
  );
});

HydrationMatrixCard.displayName = 'HydrationMatrixCard';
