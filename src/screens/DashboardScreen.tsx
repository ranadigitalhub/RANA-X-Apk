import React, { useState, useEffect } from 'react';
import { AthleteProfile, DailyActivity, WorkoutRoutine, WearableSyncTelemetry } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { NutriLensModal } from '../components/NutriLensModal';
import { WearableSyncModal } from '../components/WearableSyncModal';
import { HydrationMatrixCard } from '../components/HydrationMatrixCard';
import {
  Flame,
  Zap,
  Heart,
  Clock,
  ChevronRight,
  Play,
  Trophy,
  Sparkles,
  Camera,
  Scan,
  ArrowRight,
  Shield,
  AlertTriangle,
  Activity,
  Watch,
  Bluetooth,
  Radio,
  RefreshCw,
  Plus,
  Battery,
  CheckCircle2,
} from 'lucide-react';
import { triggerHaptic, HAPTIC_PATTERNS, speakAiPrompt } from '../utils/interfaceDynamics';
import {
  calculateHrZone,
  HR_ZONE_CONFIG,
  getStoredWearableTelemetry,
  pullWearableHealthTelemetry,
  setDeviceConnected,
} from '../utils/wearableBridge';

interface DashboardScreenProps {
  activity: DailyActivity;
  onQuickLogCalorie: (amount: number) => void;
  onQuickLogMinutes?: (minutes: number) => void;
  onQuickLogWater?: (liters: number) => void;
  onIncrementStreak?: () => void;
  onUpdateActivity?: (updated: DailyActivity) => void;
  nextWorkout: WorkoutRoutine;
  onStartWorkout: (workout: WorkoutRoutine) => void;
  onNavigateTab: (tab: any) => void;
  profile?: AthleteProfile;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  activity,
  onQuickLogCalorie,
  onQuickLogMinutes,
  onQuickLogWater,
  onIncrementStreak,
  onUpdateActivity,
  nextWorkout,
  onStartWorkout,
  onNavigateTab,
  profile,
}) => {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [isNutriLensOpen, setIsNutriLensOpen] = useState(false);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState(false);
  const [wearableTelemetry, setWearableTelemetry] = useState<WearableSyncTelemetry>(getStoredWearableTelemetry);
  const [syncStatusBanner, setSyncStatusBanner] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state whenever modal opens/closes or component re-renders
  useEffect(() => {
    setWearableTelemetry(getStoredWearableTelemetry());
  }, [isWearableModalOpen]);

  const level = profile?.level ?? 1;
  const rank = profile?.rank || 'STARTER ATHLETE';
  const antiCheatStatus = profile?.antiCheatStatus || 'VERIFIED';
  const isQuarantined = antiCheatStatus !== 'VERIFIED';
  const auditTier = profile?.auditTier || 'Starter Athlete';

  const hrZone = calculateHrZone(activity.avgHeartRate || 74);
  const hrZoneConfig = HR_ZONE_CONFIG[hrZone];

  const activeDevice = wearableTelemetry.activeDevice;
  const isDeviceConnected = Boolean(activeDevice && activeDevice.connected);

  // Direct Hardware Telemetry Sync
  const handleTriggerHardwareSync = () => {
    if (!isDeviceConnected) {
      triggerHaptic(HAPTIC_PATTERNS.ALERT);
      setIsWearableModalOpen(true);
      return;
    }

    setIsSyncing(true);
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    setSyncStatusBanner(`Querying ${activeDevice?.name} secure telemetry pipeline...`);

    setTimeout(() => {
      setIsSyncing(false);
      triggerHaptic(HAPTIC_PATTERNS.SUCCESS);

      const result = pullWearableHealthTelemetry(activity, activeDevice);
      if (onUpdateActivity) {
        onUpdateActivity(result.updatedActivity);
      }

      const refreshed = getStoredWearableTelemetry();
      setWearableTelemetry(refreshed);

      speakAiPrompt(`Wearable synchronization complete. Biometrics refreshed.`, true);
      setSyncStatusBanner(`🟢 ${result.syncSummary}`);
      setTimeout(() => setSyncStatusBanner(null), 4000);
    }, 900);
  };

  const handleQuickConnectDefaultDevice = () => {
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    const updated = setDeviceConnected('apple-watch-ultra', true);
    setWearableTelemetry(updated);
    setSyncStatusBanner('🟢 Apple Watch Ultra 2 connected via HealthKit Bridge');
    setTimeout(() => setSyncStatusBanner(null), 3000);
  };

  return (
    <div className="flex-1 px-4 pb-28 overflow-y-auto space-y-5 select-none">
      {/* Sub-header Banner with Live Cyber Telemetry Level */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="text-xs font-semibold text-[#00F0FF] tracking-wider uppercase flex items-center gap-1.5 hover:underline group cursor-pointer"
          >
            <Sparkles size={12} className="animate-spin text-[#00F0FF]" style={{ animationDuration: '6s' }} />
            <span>LVL {level} • {rank}</span>
            <span className="text-neutral-600">•</span>
            {isQuarantined ? (
              <span className="text-[#FFB300] font-bold flex items-center gap-0.5 text-[10px]">
                <AlertTriangle size={10} /> QUARANTINED
              </span>
            ) : (
              <span className="text-[#00E676] font-bold flex items-center gap-0.5 text-[10px]">
                <Shield size={10} /> {auditTier.toUpperCase()}
              </span>
            )}
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Today's Biometrics
          </h2>
        </div>
        <button
          onClick={() => onNavigateTab('coach')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-semibold hover:bg-[#00F0FF]/15 transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] active:scale-95"
        >
          <span>Ask AI Coach</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Sleek Circular Progress Ring Card with Glassmorphism */}
      <div className="relative rounded-3xl glass-panel p-2 shadow-glass-card border border-white/10 overflow-hidden">
        {/* Subtle top mirror shine */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        <ProgressRing
          activity={activity}
          onOpenWearableSync={() => setIsWearableModalOpen(true)}
          deviceName={activeDevice?.name}
          isDeviceConnected={isDeviceConnected}
        />
      </div>

      {/* Sync Status Feedback Toast Banner */}
      {syncStatusBanner && (
        <div className="p-3 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-xs text-[#00F0FF] font-mono flex items-center justify-between shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-scale-up">
          <div className="flex items-center gap-2">
            <Radio size={14} className="animate-spin text-[#00F0FF]" style={{ animationDuration: '2s' }} />
            <span className="font-semibold leading-tight">{syncStatusBanner}</span>
          </div>
          <button
            onClick={() => setSyncStatusBanner(null)}
            className="text-neutral-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Large Glowing Prominent Nutri-Lens Action Button */}
      <div className="relative group">
        {/* Ambient Pulsing Neon Aura behind the button */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00F0FF] via-[#00A3FF] to-[#B026FF] rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse pointer-events-none" />

        <button
          type="button"
          onClick={() => {
            triggerHaptic(HAPTIC_PATTERNS.TAP);
            setIsNutriLensOpen(true);
          }}
          className="relative w-full rounded-2xl p-4 bg-gradient-to-r from-[#08121A] via-[#0D1826] to-[#120D22] border-2 border-[#00F0FF]/70 hover:border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.35)] hover:shadow-[0_0_45px_rgba(0,240,255,0.65)] transition-all duration-300 active:scale-[0.98] flex items-center justify-between overflow-hidden cursor-pointer"
        >
          {/* Subtle Cyber Diagonal Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,240,255,0.06)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-shimmer pointer-events-none" />

          {/* Left: Glowing Scan/Camera Icon + Bold Labels */}
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#00F0FF]/30 to-[#00A3FF]/10 border-2 border-[#00F0FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.6)] group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="relative">
                <Camera size={24} className="text-[#00F0FF] drop-shadow-[0_0_8px_#00F0FF]" />
                <Scan size={14} className="text-[#00E676] absolute -bottom-1 -right-1 animate-pulse" />
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white uppercase tracking-wider font-sans group-hover:text-[#00F0FF] transition-colors">
                  Scan Meal
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  NUTRI-LENS
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-mono tracking-wide mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676] inline-block" />
                AI Macro & Vitamin Telemetry
              </p>
            </div>
          </div>

          {/* Right: Glowing Action Trigger Icon */}
          <div className="relative z-10 flex items-center gap-2 pr-1">
            <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/50 flex items-center justify-center text-[#00F0FF] group-hover:translate-x-1 group-hover:bg-[#00F0FF] group-hover:text-black transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <ArrowRight size={18} className="stroke-[2.5]" />
            </div>
          </div>
        </button>
      </div>

      {/* Floating Glass-Style Cards Grid for Key Stats (Genuine Hardware-Driven Biometrics) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* 1. Workout Streak Card */}
        <div
          className="relative rounded-2xl glass-panel p-4 border border-white/10 hover:border-[#FF1744]/40 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] group overflow-hidden"
        >
          {/* Subtle diffused glow behind */}
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#FF1744]/15 blur-xl pointer-events-none group-hover:bg-[#FF1744]/25 transition-all" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              Workout Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FF1744]/15 border border-[#FF1744]/40 flex items-center justify-center shadow-[0_0_10px_rgba(255,23,68,0.3)]">
              <Flame size={16} className="text-[#FF1744] fill-[#FF1744]/40 animate-pulse" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white tracking-tight font-mono">
              {activity.workoutStreakDays}
            </span>
            <span className="text-xs font-bold text-[#FF1744] tracking-wider uppercase font-mono">
              DAYS
            </span>
          </div>

          {/* 7-Day Matrix Streak Indicator */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-neutral-500 font-mono">{day}</span>
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    index < Math.min(7, activity.workoutStreakDays)
                      ? 'bg-[#FF1744] shadow-[0_0_6px_#FF1744]'
                      : 'bg-white/20 border border-white/30'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Calories Burned Card */}
        <div
          className="relative rounded-2xl glass-panel p-4 border border-white/10 hover:border-[#00F0FF]/40 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] group overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#00F0FF]/15 blur-xl pointer-events-none group-hover:bg-[#00F0FF]/25 transition-all" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              Calories Burned
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <Zap size={16} className="text-[#00F0FF]" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white tracking-tight font-mono">
              {activity.caloriesBurned}
            </span>
            <span className="text-xs font-bold text-[#00F0FF] tracking-wider uppercase font-mono">
              KCAL
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[10px] text-neutral-400 font-mono">
            <span>Target: {activity.caloriesTarget}</span>
            <button
              onClick={handleTriggerHardwareSync}
              className="text-[#00F0FF] font-bold hover:underline flex items-center gap-0.5"
              title="Sync calories from connected device"
            >
              <RefreshCw size={9} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* 3. Average Heart Rate Card (Clickable to open Wearable Sync Matrix) */}
        <div
          onClick={() => {
            triggerHaptic(HAPTIC_PATTERNS.TAP);
            setIsWearableModalOpen(true);
          }}
          className="relative rounded-2xl glass-panel p-4 border border-white/10 hover:border-[#FF1744]/60 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] group overflow-hidden cursor-pointer active:scale-95"
          title="Click to open Wearable Sync Bridge & live ECG"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              Avg Heart Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FF1744]/15 border border-[#FF1744]/40 flex items-center justify-center shadow-[0_0_10px_rgba(255,23,68,0.3)] group-hover:scale-110 transition-transform">
              <Heart size={16} className="text-[#FF1744] animate-pulse" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tracking-tight font-mono">
                {activity.avgHeartRate}
              </span>
              <span className="text-xs font-bold text-neutral-400 tracking-wider font-mono">
                BPM
              </span>
            </div>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono"
              style={{
                color: hrZoneConfig.color,
                borderColor: `${hrZoneConfig.color}55`,
                backgroundColor: `${hrZoneConfig.color}15`,
              }}
            >
              Z{hrZone}
            </span>
          </div>

          {/* Mini pulse wave SVG */}
          <div className="h-4 w-full mt-2.5 pt-1 flex items-center">
            <svg viewBox="0 0 100 20" className="w-full h-full stroke-[#FF1744] fill-none stroke-[2]">
              <path d="M0,10 L30,10 L35,2 L42,18 L47,5 L52,14 L55,10 L100,10" />
            </svg>
          </div>
          <span className="text-[8px] text-[#FF1744] font-mono block mt-1 text-right font-bold">
            {isDeviceConnected ? `${activeDevice?.name} • Live` : 'Pair BLE Sensor'}
          </span>
        </div>

        {/* 4. Active Time / Intensity Card */}
        <div
          className="relative rounded-2xl glass-panel p-4 border border-white/10 hover:border-[#00F0FF]/40 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] group overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              Active Time
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <Clock size={16} className="text-[#00F0FF]" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white tracking-tight font-mono">
              {activity.activeMinutes}
            </span>
            <span className="text-xs font-bold text-neutral-400 tracking-wider font-mono">
              MIN
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[10px] text-neutral-400 font-mono">
            <span className="text-[#00F0FF] font-semibold">Zone {hrZone}</span>
            <span>Target: {activity.activeMinutesTarget}m</span>
          </div>
        </div>
      </div>

      {/* DEDICATED INTERACTIVE HYDRATION MATRIX CARD */}
      <HydrationMatrixCard
        activity={activity}
        onUpdateActivity={(updated) => {
          if (onUpdateActivity) onUpdateActivity(updated);
        }}
        onLogWaterDelta={onQuickLogWater}
      />

      {/* WEARABLE HARDWARE BRIDGE & MULTI-DEVICE SYNC CARD */}
      {isDeviceConnected && activeDevice ? (
        <div className="relative rounded-3xl glass-panel p-4 border border-[#00F0FF]/35 hover:border-[#00F0FF]/60 transition-all duration-300 shadow-[0_0_25px_rgba(0,240,255,0.15)] overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00F0FF]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#00F0FF]/20 border border-[#00F0FF]/50 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                <Watch size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                    {activeDevice.name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse shadow-[0_0_6px_#00E676]" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                  <span>{activeDevice.brand}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-neutral-300">
                    <Battery size={11} className="text-[#00E676]" />
                    {activeDevice.batteryLevel}%
                  </span>
                  <span>•</span>
                  <span className="text-[#00F0FF] font-semibold">{activeDevice.syncSource.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleTriggerHardwareSync}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/50 hover:bg-[#00F0FF]/25 text-[#00F0FF] text-[10px] font-bold font-mono transition-all active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-50"
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'SYNCING...' : 'SYNC NOW'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(HAPTIC_PATTERNS.TAP);
                  setIsWearableModalOpen(true);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all active:scale-95"
                title="Manage Connected Devices"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Live Hardware Telemetry Bar */}
          <div className="p-3 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-between font-mono relative z-10 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Heart size={14} className="text-[#FF1744] fill-[#FF1744]/40 animate-pulse" />
                <span className="text-sm font-black text-white">{activity.avgHeartRate} BPM</span>
              </div>
              <span className="text-neutral-600">|</span>
              <div className="text-[10px] text-neutral-300">
                <span className="text-[#00E676] font-bold">LIVE BLE:</span> {wearableTelemetry.stepsToday.toLocaleString()} steps
              </div>
            </div>

            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                color: hrZoneConfig.color,
                borderColor: `${hrZoneConfig.color}55`,
                backgroundColor: `${hrZoneConfig.color}15`,
              }}
            >
              {hrZoneConfig.label.split(':')[0]}
            </span>
          </div>
        </div>
      ) : (
        /* Disconnected Hardware State Card with Direct Scan / Connect Button */
        <div className="relative rounded-3xl glass-panel p-4 border border-amber-500/30 bg-black/40 shadow-[0_0_20px_rgba(255,179,0,0.1)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(255,179,0,0.2)] flex-shrink-0">
                <Watch size={18} />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  WEARABLE DISCONNECTED
                </h4>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.TAP);
                setIsWearableModalOpen(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#00F0FF]/20 to-[#00A3FF]/20 hover:from-[#00F0FF]/30 hover:to-[#00A3FF]/30 border border-[#00F0FF]/60 text-[#00F0FF] text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              <Bluetooth size={14} />
              <span>Scan / Connect Device</span>
            </button>

            <button
              type="button"
              onClick={handleQuickConnectDefaultDevice}
              className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-semibold transition-all active:scale-95"
            >
              Pair Apple Watch
            </button>
          </div>
        </div>
      )}

      {/* Up Next Workout Protocol Hero Card with Mirror Glow */}
      <div className="relative rounded-3xl glass-panel-elevated p-5 border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Mirror Glow Border Ambient Effect */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#00F0FF]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF1744]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-[10px] font-bold tracking-wider uppercase shadow-[0_0_8px_rgba(0,240,255,0.3)] font-mono">
              NEXT PROTOCOL
            </span>
            <span className="text-xs text-neutral-400 font-medium font-mono">
              {nextWorkout.recommendedTime}
            </span>
          </div>
          <span className="text-xs font-bold text-[#FF1744] uppercase tracking-wider font-mono">
            {nextWorkout.intensity} INTENSITY
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-white tracking-tight relative z-10">
          {nextWorkout.title}
        </h3>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-4 text-xs text-neutral-300 font-medium">
            <div>
              <span className="text-neutral-500 text-[10px] block font-mono">DURATION</span>
              <span className="font-bold text-white font-mono">{nextWorkout.durationMinutes} min</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div>
              <span className="text-neutral-500 text-[10px] block font-mono">EST. BURN</span>
              <span className="font-bold text-[#FF1744] font-mono">{nextWorkout.caloriesBurned} kcal</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div>
              <span className="text-neutral-500 text-[10px] block font-mono">EXERCISES</span>
              <span className="font-bold text-[#00F0FF] font-mono">{nextWorkout.exercises.length} movements</span>
            </div>
          </div>

          {/* Glowing Neon Mirror Action Button */}
          <button
            onClick={() => onStartWorkout(nextWorkout)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.45)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all active:scale-95 font-mono"
          >
            <Play size={14} className="fill-black" />
            <span>START</span>
          </button>
        </div>
      </div>

      {/* Cyber Trophy / Achievement Banner */}
      <div className="rounded-2xl glass-panel p-3.5 border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B026FF]/20 to-[#00F0FF]/20 border border-[#B026FF]/40 flex items-center justify-center shadow-[0_0_12px_rgba(176,38,255,0.3)]">
            <Trophy size={18} className="text-[#B026FF]" />
          </div>
          <div>
            <div className="font-bold text-white">Tier II Cyber Master Unlocked</div>
            <div className="text-[11px] text-neutral-400">14 consecutive days of mechanical load</div>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-1 rounded-full border border-[#00F0FF]/25 font-mono">
          +250 XP
        </span>
      </div>

      {/* Nutri-Lens AI Vision Scanner Modal */}
      <NutriLensModal
        isOpen={isNutriLensOpen}
        onClose={() => setIsNutriLensOpen(false)}
        onLogCalories={(cal) => {
          onQuickLogCalorie(cal);
        }}
      />

      {/* Wearable Sync Matrix & Hardware Bridge Modal */}
      <WearableSyncModal
        isOpen={isWearableModalOpen}
        onClose={() => setIsWearableModalOpen(false)}
        activity={activity}
        onUpdateActivity={(updated) => {
          if (onUpdateActivity) {
            onUpdateActivity(updated);
          }
        }}
      />
    </div>
  );
};
