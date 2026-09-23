import React, { useState, useMemo, memo } from 'react';
import { WorkoutRoutine, WorkoutCategory, SkillTier, AthleteProfile } from '../types';
import { sampleWorkouts, initialProfile } from '../data/mockFitnessData';
import { calibrateIpfWorkout, classifyAthleteIpf } from '../utils/ipfStandards';
import {
  Flame,
  Clock,
  Dumbbell,
  Play,
  Zap,
  Shield,
  Gauge,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface WorkoutsScreenProps {
  onStartWorkout: (workout: WorkoutRoutine) => void;
  profile?: AthleteProfile;
}

export const WorkoutsScreen: React.FC<WorkoutsScreenProps> = memo(({ onStartWorkout, profile }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All Levels');

  const athleteProfile = profile || initialProfile;
  const athleteIpf = useMemo(
    () =>
      classifyAthleteIpf(
        athleteProfile.weightKg,
        athleteProfile.maxSquatKg,
        athleteProfile.maxBenchKg,
        athleteProfile.maxDeadliftKg,
        athleteProfile.gender || 'male'
      ),
    [athleteProfile]
  );

  // Calibrate workouts dynamically based on IPF standards and user's 1RM
  const calibratedWorkouts = useMemo(
    () => sampleWorkouts.map((w) => calibrateIpfWorkout(w, athleteProfile)),
    [athleteProfile]
  );

  const categories: { label: string; icon: any }[] = [
    { label: 'All', icon: Sparkles },
    { label: 'Powerlifting', icon: Dumbbell },
    { label: 'Bodybuilding', icon: Layers },
    { label: 'Calisthenics', icon: Shield },
    { label: 'Athletics', icon: Zap },
    { label: 'HIIT', icon: Flame },
    { label: 'Core', icon: Gauge },
  ];

  const skillTiers: { label: string; color: string }[] = [
    { label: 'All Levels', color: 'text-neutral-300' },
    { label: 'Beginner', color: 'text-[#00E676]' },
    { label: 'Intermediate', color: 'text-[#00F0FF]' },
    { label: 'Advance', color: 'text-[#B026FF]' },
    { label: 'Elite', color: 'text-[#FF1744]' },
  ];

  const filteredWorkouts = useMemo(
    () =>
      calibratedWorkouts.filter((workout) => {
        const matchesCategory =
          selectedCategory === 'All' || workout.category === selectedCategory;
        const matchesTier =
          selectedTier === 'All Levels' || workout.tier === selectedTier;
        return matchesCategory && matchesTier;
      }),
    [calibratedWorkouts, selectedCategory, selectedTier]
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Powerlifting':
      case 'Strength':
        return {
          text: 'text-[#FF1744]',
          bg: 'bg-[#FF1744]/10',
          border: 'border-[#FF1744]/30',
          glow: 'rgba(255,23,68,0.3)',
          meter: 'from-[#FF1744] to-[#FF5252]',
        };
      case 'Bodybuilding':
      case 'Hypertrophy':
        return {
          text: 'text-[#00F0FF]',
          bg: 'bg-[#00F0FF]/10',
          border: 'border-[#00F0FF]/30',
          glow: 'rgba(0,240,255,0.3)',
          meter: 'from-[#00F0FF] to-[#00A3FF]',
        };
      case 'Calisthenics':
        return {
          text: 'text-[#00E676]',
          bg: 'bg-[#00E676]/10',
          border: 'border-[#00E676]/30',
          glow: 'rgba(0,230,118,0.3)',
          meter: 'from-[#00E676] to-[#69F0AE]',
        };
      case 'Athletics':
        return {
          text: 'text-[#FF9100]',
          bg: 'bg-[#FF9100]/10',
          border: 'border-[#FF9100]/30',
          glow: 'rgba(255,145,0,0.3)',
          meter: 'from-[#FF9100] to-[#FFD600]',
        };
      default:
        return {
          text: 'text-[#B026FF]',
          bg: 'bg-[#B026FF]/10',
          border: 'border-[#B026FF]/30',
          glow: 'rgba(176,38,255,0.3)',
          meter: 'from-[#B026FF] to-[#E040FB]',
        };
    }
  };

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'Beginner':
        return {
          label: 'BEGINNER',
          class: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
          dot: 'bg-[#00E676]',
        };
      case 'Intermediate':
        return {
          label: 'INTERMEDIATE',
          class: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
          dot: 'bg-[#00F0FF]',
        };
      case 'Advance':
        return {
          label: 'ADVANCE',
          class: 'bg-[#B026FF]/10 text-[#B026FF] border-[#B026FF]/30',
          dot: 'bg-[#B026FF]',
        };
      case 'Elite':
        return {
          label: 'ELITE TIER',
          class: 'bg-[#FF1744]/15 text-[#FF1744] border-[#FF1744]/40 shadow-[0_0_10px_rgba(255,23,68,0.3)]',
          dot: 'bg-[#FF1744] animate-ping',
        };
      default:
        return {
          label: 'ALL TIERS',
          class: 'bg-white/5 text-neutral-400 border-white/10',
          dot: 'bg-neutral-400',
        };
    }
  };

  return (
    <div className="flex-1 px-4 pb-28 overflow-y-auto space-y-4 select-none">
      {/* Title & Stats */}
      <div className="pt-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#FF1744] tracking-wider uppercase flex items-center gap-1">
              <Zap size={12} className="fill-[#FF1744]" />
              MULTI-DISCIPLINARY COMBAT MATRIX
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Workouts & Protocols
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            {filteredWorkouts.length} READY
          </span>
        </div>

        {/* 1. Category Filters (Discipline) */}
        <div className="mt-3">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span>TRAINING DISCIPLINE</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00F0FF]/30 to-[#FF1744]/20 border border-[#00F0FF]/60 text-white shadow-[0_0_14px_rgba(0,240,255,0.35)]'
                      : 'glass-panel text-neutral-400 hover:text-white border border-white/10'
                  }`}
                >
                  <IconComponent size={12} className={isSelected ? 'text-[#00F0FF]' : 'text-neutral-400'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Skill Tier Filters (Experience Level) */}
        <div className="mt-2.5">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span>EXPERIENCE / SKILL TIER</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {skillTiers.map((tier) => {
              const isSelected = selectedTier === tier.label;
              return (
                <button
                  key={tier.label}
                  onClick={() => setSelectedTier(tier.label)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white/15 text-white border border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)] font-bold'
                      : 'bg-white/5 text-neutral-400 hover:text-neutral-200 border border-white/5'
                  }`}
                >
                  {tier.label !== 'All Levels' && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        tier.label === 'Beginner'
                          ? 'bg-[#00E676]'
                          : tier.label === 'Intermediate'
                          ? 'bg-[#00F0FF]'
                          : tier.label === 'Advance'
                          ? 'bg-[#B026FF]'
                          : 'bg-[#FF1744]'
                      }`}
                    />
                  )}
                  <span className={isSelected ? 'text-white' : tier.color}>
                    {tier.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* IPF Competition Calibration Telemetry Banner */}
      {(selectedCategory === 'All' || selectedCategory === 'Powerlifting') && (
        <div className="rounded-2xl p-3.5 glass-panel border border-[#FF1744]/40 bg-gradient-to-r from-[#FF1744]/15 via-black/60 to-[#B026FF]/15 shadow-[0_0_20px_rgba(255,23,68,0.15)] relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_8px_#FF1744] animate-pulse" />
              <span className="text-[11px] font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Award size={13} className="text-[#FF1744]" />
                IPF Technical Standards Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF1744]/20 border border-[#FF1744]/40 text-[#FF1744] font-extrabold">
                {athleteIpf.weightClass.label.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] font-extrabold">
                {athleteIpf.tier.toUpperCase()} TIER ({athleteIpf.relativeMultiplier}× BW)
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[#00E676]" />
              <span className="text-[10px] text-neutral-300">
                Working sets calibrated from authentic 1RM: <strong className="text-white">SQ {athleteProfile.maxSquatKg}kg</strong> • <strong className="text-white">BP {athleteProfile.maxBenchKg}kg</strong> • <strong className="text-white">DL {athleteProfile.maxDeadliftKg}kg</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#00F0FF] font-bold">
              {athleteIpf.ipfGlPoints} GL PTS
            </span>
          </div>
        </div>
      )}

      {/* Routine Cards List */}
      <div className="space-y-4">
        {filteredWorkouts.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-3xl border border-white/10">
            <Shield size={32} className="mx-auto text-neutral-500 mb-2" />
            <h4 className="text-white font-bold text-sm">No Matching Protocols Found</h4>
            <p className="text-xs text-neutral-400 mt-1">
              Try adjusting your discipline filter or skill tier to reveal training programs.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedTier('All Levels');
              }}
              className="mt-4 px-4 py-1.5 bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredWorkouts.map((routine) => {
            const catColors = getCategoryColor(routine.category);
            const tierBadge = getTierBadge(routine.tier);
            const intensityPercent = routine.intensityMeter || 80;

            return (
              <div
                key={routine.id}
                className="relative rounded-3xl glass-panel p-5 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)] group hover:scale-[1.01]"
              >
                {/* Subtle top mirror shine */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Header Badges: Category + Tier + Timing */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Category Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                    >
                      {routine.category}
                    </span>

                    {/* Skill Tier Badge */}
                    <span
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${tierBadge.class}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tierBadge.dot}`} />
                      {tierBadge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-neutral-400" />
                      {routine.durationMinutes}m
                    </span>
                    <span className="flex items-center gap-1 text-[#FF1744]">
                      <Flame size={13} className="fill-[#FF1744]/40" />
                      {routine.caloriesBurned} kcal
                    </span>
                  </div>
                </div>

                {/* Protocol Specific Highlight Tag */}
                {routine.protocolBadge && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                      ⚡ {routine.protocolBadge}
                    </span>
                    {routine.category === 'Powerlifting' && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#FF1744]/20 border border-[#FF1744]/40 text-[#FF1744] font-black flex items-center gap-1">
                        <Award size={10} />
                        IPF 1RM CALIBRATED
                      </span>
                    )}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-base font-extrabold text-white tracking-tight mt-2.5 group-hover:text-[#00F0FF] transition-colors">
                  {routine.title}
                </h3>

                {/* Dynamic Intensity Meter */}
                <div className="mt-3.5 p-3 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-mono text-neutral-400 flex items-center gap-1">
                      <TrendingUp size={11} className={catColors.text} />
                      INTENSITY OVERLOAD METER
                    </span>
                    <span className={`font-mono font-bold ${catColors.text}`}>
                      {intensityPercent}% • {routine.intensity.toUpperCase()}
                    </span>
                  </div>
                  {/* Gauge Bar */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${catColors.meter} transition-all duration-500`}
                      style={{ width: `${intensityPercent}%`, boxShadow: `0 0 10px ${catColors.glow}` }}
                    />
                  </div>
                </div>

                {/* Movement Roster Preview */}
                <div className="mt-3.5 pt-3 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                    Movement Roster ({routine.exercises.length} Exercises)
                  </span>
                  {routine.exercises.slice(0, 3).map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${catColors.bg} ${catColors.border} border`} />
                        <span className="text-neutral-200 font-medium">{ex.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {ex.weightKg > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#00F0FF]">
                            {ex.weightKg}kg
                          </span>
                        )}
                        <span className="text-neutral-400 text-[11px] font-mono">
                          {ex.sets} × {ex.targetReps}
                        </span>
                      </div>
                    </div>
                  ))}
                  {routine.exercises.length > 3 && (
                    <div className="text-[10px] text-neutral-500 italic pl-2 pt-0.5">
                      + {routine.exercises.length - 3} additional periodized movements
                    </div>
                  )}
                </div>

                {/* Action Button Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    Slot: <strong className="text-white">{routine.recommendedTime}</strong>
                  </span>

                  <button
                    onClick={() => onStartWorkout(routine)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:shadow-[0_0_24px_rgba(0,240,255,0.6)]"
                  >
                    <Play size={13} className="fill-black" />
                    <span>ENGAGE</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

WorkoutsScreen.displayName = 'WorkoutsScreen';
