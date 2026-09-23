import React, { useState } from 'react';
import { DailyActivity } from '../types';
import { Flame, Activity, Droplets, Plus, Watch } from 'lucide-react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/interfaceDynamics';

interface ProgressRingProps {
  activity: DailyActivity;
  onOpenWearableSync?: () => void;
  deviceName?: string | null;
  isDeviceConnected?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  activity,
  onOpenWearableSync,
  deviceName,
  isDeviceConnected = false,
}) => {
  const [activeMetric, setActiveMetric] = useState<'calories' | 'minutes' | 'water'>('calories');

  // Math for concentric SVG rings
  const size = 260;
  const strokeWidth = 10;
  const center = size / 2;

  // Outer Ring: Calories (Radius: 104)
  const r1 = 104;
  const c1 = 2 * Math.PI * r1;
  const caloriePercent = Math.min(100, Math.round((activity.caloriesBurned / activity.caloriesTarget) * 100));
  const strokeDashoffset1 = c1 - (c1 * caloriePercent) / 100;

  // Middle Ring: Active Minutes (Radius: 88)
  const r2 = 88;
  const c2 = 2 * Math.PI * r2;
  const minutesPercent = Math.min(100, Math.round((activity.activeMinutes / activity.activeMinutesTarget) * 100));
  const strokeDashoffset2 = c2 - (c2 * minutesPercent) / 100;

  // Inner Ring: Hydration (Radius: 72)
  const r3 = 72;
  const c3 = 2 * Math.PI * r3;
  const waterPercent = Math.min(100, Math.round((activity.waterIntakeLiters / activity.waterTargetLiters) * 100));
  const strokeDashoffset3 = c3 - (c3 * waterPercent) / 100;

  const handleSelectMetric = (metric: 'calories' | 'minutes' | 'water') => {
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    setActiveMetric(metric);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Background ambient diffused mirror glow */}
      <div
        className={`absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          activeMetric === 'calories'
            ? 'bg-[#FF1744]/20'
            : activeMetric === 'minutes'
            ? 'bg-[#00F0FF]/20'
            : 'bg-[#B026FF]/20'
        }`}
      />

      {/* Interactive SVG Circular Rings */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            {/* Outer Ring Gradient: Aggressive Red / Crimson to Coral */}
            <linearGradient id="calorieGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF0055" />
              <stop offset="60%" stopColor="#FF1744" />
              <stop offset="100%" stopColor="#FF7043" />
            </linearGradient>

            {/* Middle Ring Gradient: Electric Cyan to Neon Blue */}
            <linearGradient id="minutesGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#00A3FF" />
            </linearGradient>

            {/* Inner Ring Gradient: Neon Violet / Purple */}
            <linearGradient id="waterGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B026FF" />
              <stop offset="100%" stopColor="#7928CA" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track 1: Calories */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke="rgba(255, 23, 68, 0.15)"
            strokeWidth={strokeWidth}
            fill="none"
            className="cursor-pointer"
            onClick={() => handleSelectMetric('calories')}
          />
          {/* Active Arc 1: Calories */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke="url(#calorieGlow)"
            strokeWidth={activeMetric === 'calories' ? strokeWidth + 2 : strokeWidth}
            strokeDasharray={c1}
            strokeDashoffset={strokeDashoffset1}
            strokeLinecap="round"
            fill="none"
            filter="url(#neonBlur)"
            className="transition-all duration-700 ease-out cursor-pointer"
            onClick={() => handleSelectMetric('calories')}
          />

          {/* Background Track 2: Minutes */}
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="rgba(0, 240, 255, 0.15)"
            strokeWidth={strokeWidth}
            fill="none"
            className="cursor-pointer"
            onClick={() => handleSelectMetric('minutes')}
          />
          {/* Active Arc 2: Minutes */}
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="url(#minutesGlow)"
            strokeWidth={activeMetric === 'minutes' ? strokeWidth + 2 : strokeWidth}
            strokeDasharray={c2}
            strokeDashoffset={strokeDashoffset2}
            strokeLinecap="round"
            fill="none"
            filter="url(#neonBlur)"
            className="transition-all duration-700 ease-out cursor-pointer"
            onClick={() => handleSelectMetric('minutes')}
          />

          {/* Background Track 3: Water */}
          <circle
            cx={center}
            cy={center}
            r={r3}
            stroke="rgba(176, 38, 255, 0.15)"
            strokeWidth={strokeWidth}
            fill="none"
            className="cursor-pointer"
            onClick={() => handleSelectMetric('water')}
          />
          {/* Active Arc 3: Water */}
          <circle
            cx={center}
            cy={center}
            r={r3}
            stroke="url(#waterGlow)"
            strokeWidth={activeMetric === 'water' ? strokeWidth + 2 : strokeWidth}
            strokeDasharray={c3}
            strokeDashoffset={strokeDashoffset3}
            strokeLinecap="round"
            fill="none"
            filter="url(#neonBlur)"
            className="transition-all duration-700 ease-out cursor-pointer"
            onClick={() => handleSelectMetric('water')}
          />
        </svg>

        {/* Center Content: Sleek Glass Core */}
        <div
          onClick={() => {
            if (activeMetric === 'calories') handleSelectMetric('minutes');
            else if (activeMetric === 'minutes') handleSelectMetric('water');
            else handleSelectMetric('calories');
          }}
          className="absolute w-[126px] h-[126px] rounded-full bg-[#121214]/85 backdrop-blur-xl border border-white/15 flex flex-col items-center justify-center cursor-pointer shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_0_25px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-all group"
        >
          {activeMetric === 'calories' && (
            <>
              <div className="flex items-center gap-1 text-[#FF1744] mb-0.5">
                <Flame size={15} className="fill-[#FF1744]/30 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase font-mono">BURNED</span>
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight group-hover:text-[#FF1744] transition-colors font-mono">
                {activity.caloriesBurned}
              </div>
              <span className="text-[10px] text-neutral-400 font-medium font-mono">
                / {activity.caloriesTarget} kcal
              </span>
            </>
          )}

          {activeMetric === 'minutes' && (
            <>
              <div className="flex items-center gap-1 text-[#00F0FF] mb-0.5">
                <Activity size={15} className="animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase font-mono">ACTIVE</span>
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight group-hover:text-[#00F0FF] transition-colors font-mono">
                {activity.activeMinutes}
              </div>
              <span className="text-[10px] text-neutral-400 font-medium font-mono">
                / {activity.activeMinutesTarget} min
              </span>
            </>
          )}

          {activeMetric === 'water' && (
            <>
              <div className="flex items-center gap-1 text-[#B026FF] mb-0.5">
                <Droplets size={15} />
                <span className="text-[10px] font-bold tracking-widest uppercase font-mono">HYDRATE</span>
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight group-hover:text-[#B026FF] transition-colors font-mono">
                {activity.waterIntakeLiters.toFixed(1)}L
              </div>
              <span className="text-[10px] text-neutral-400 font-medium font-mono">
                / {activity.waterTargetLiters.toFixed(1)}L
              </span>
            </>
          )}
        </div>
      </div>

      {/* Ring Legend & Metric Selectors */}
      <div className="flex items-center justify-between w-full max-w-[340px] mt-2 px-3 py-2 rounded-2xl glass-panel border border-white/10 text-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSelectMetric('calories')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all ${
              activeMetric === 'calories' ? 'bg-[#FF1744]/20 border border-[#FF1744]/50' : 'hover:bg-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_6px_#FF1744]" />
            <span className="text-[10px] font-mono text-neutral-200 font-bold">{caloriePercent}%</span>
          </button>

          <button
            onClick={() => handleSelectMetric('minutes')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all ${
              activeMetric === 'minutes' ? 'bg-[#00F0FF]/20 border border-[#00F0FF]/50' : 'hover:bg-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
            <span className="text-[10px] font-mono text-neutral-200 font-bold">{minutesPercent}%</span>
          </button>

          <button
            onClick={() => handleSelectMetric('water')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all ${
              activeMetric === 'water' ? 'bg-[#B026FF]/20 border border-[#B026FF]/50' : 'hover:bg-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#B026FF] shadow-[0_0_6px_#B026FF]" />
            <span className="text-[10px] font-mono text-neutral-200 font-bold">{waterPercent}%</span>
          </button>
        </div>

        {/* Hardware Wearable Device Connection Status */}
        {onOpenWearableSync && (
          <button
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.TAP);
              onOpenWearableSync();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold transition-all active:scale-95 border ${
              isDeviceConnected
                ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                : 'bg-white/5 border-amber-500/40 text-amber-300 hover:border-amber-400'
            }`}
            title="Open Wearable Hardware Bridge"
          >
            <Watch size={12} className={isDeviceConnected ? 'animate-pulse' : ''} />
            <span className="truncate max-w-[105px]">
              {isDeviceConnected ? (deviceName || 'Watch Live') : 'Pair Watch'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDeviceConnected ? 'bg-[#00E676] shadow-[0_0_4px_#00E676]' : 'bg-amber-400'
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
