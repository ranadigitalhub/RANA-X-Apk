/**
 * RANA X — Adaptive Telemetry, Dynamic Progression & Anti-Cheat Validation Engine
 * 
 * 1. DYNAMIC PROGRESSION & REGRESSION ENGINE:
 *    - XP, Leveling (e.g. Level 28), and Cyber Prestige Titles tied to workouts & volume.
 *    - Performance decay & dynamic downshifting upon sustained missed protocols or sub-target weights.
 * 
 * 2. ANTI-CHEAT & SANITY VALIDATION LAYER:
 *    - Physiological relative strength ceilings (IPF World Standards).
 *    - Sudden jump/spike detection preventing fabricated 1RM records without volume history.
 *    - Telemetry Quarantine & Verification lock.
 * 
 * 3. DAILY TELEMETRY AUDITING:
 *    - Protocol completion rate tracking, rep ranges, tonnage velocity.
 *    - Continuous audit auto-correcting athlete classification tiers (Beginner to Elite).
 */

import { AthleteProfile, SkillTier, WorkoutRoutine } from '../types';

export interface WorkoutSessionLog {
  id: string;
  workoutId: string;
  workoutTitle: string;
  category: string;
  tier: SkillTier;
  timestamp: number;
  dateStr: string;
  durationMinutes: number;
  caloriesBurned: number;
  totalSets: number;
  completedSets: number;
  completionRatePercent: number;
  totalTonnageKg: number;
  avgReps: number;
  xpEarned: number;
}

export interface AntiCheatValidationResult {
  isValid: boolean;
  status: 'VERIFIED' | 'FLAGGED_ANOMALY' | 'PENDING_VERIFICATION';
  flags: string[];
  reasons: string[];
  maxAllowedBench: number;
  maxAllowedSquat: number;
  maxAllowedDeadlift: number;
  isSpikeDetected: boolean;
}

export interface DailyAuditReport {
  timestamp: number;
  auditedDate: string;
  totalSessionsEvaluated: number;
  completionRatePercent: number;
  totalTonnageKg: number;
  avgRepFidelityPercent: number;
  streakDays: number;
  consecutiveMissedProtocols: number;
  decayRisk: 'NONE' | 'LOW' | 'MODERATE' | 'ACTIVE_DOWNSHIFT';
  decayPenaltyXp: number;
  baseTier: SkillTier;
  autoCorrectedTier: SkillTier;
  tierStatusMessage: string;
  antiCheatStatus: 'VERIFIED' | 'FLAGGED_ANOMALY' | 'PENDING_VERIFICATION';
}

// Storage Keys
const STORAGE_KEY_TELEMETRY_LOGS = 'ranax_telemetry_history_logs';
const STORAGE_KEY_AUDIT_REPORT = 'ranax_daily_audit_report';
const STORAGE_KEY_ANTIDRIVE_STATE = 'ranax_anticheat_state';

/**
 * Cyber Prestige Titles by Level Bracket
 */
export const PRESTIGE_TIERS = [
  { minLevel: 1, maxLevel: 4, title: 'STARTER ATHLETE', color: '#00F0FF' },
  { minLevel: 5, maxLevel: 9, title: 'CYBER OPERATIVE', color: '#00E676' },
  { minLevel: 10, maxLevel: 14, title: 'NEON STRIKER', color: '#00F0FF' },
  { minLevel: 15, maxLevel: 19, title: 'KINETIC ENFORCER', color: '#2979FF' },
  { minLevel: 20, maxLevel: 24, title: 'QUANTUM JUGGERNAUT', color: '#B026FF' },
  { minLevel: 25, maxLevel: 29, title: 'CYBER TITAN', color: '#FF1744' },
  { minLevel: 30, maxLevel: 34, title: 'HYPERION COLOSSUS', color: '#FF0055' },
  { minLevel: 35, maxLevel: 39, title: 'APEX WARLORD', color: '#FF6D00' },
  { minLevel: 40, maxLevel: 49, title: 'BIOMECHANICAL OVERLORD', color: '#FFD600' },
  { minLevel: 50, maxLevel: 999, title: 'IMMORTAL CYBER GOD', color: '#00F0FF' },
];

/**
 * Returns prestige title & accent color for a given level
 */
export function getPrestigeTitle(level: number): { title: string; color: string } {
  const match = PRESTIGE_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel);
  return match || { title: 'STARTER ATHLETE', color: '#00F0FF' };
}

/**
 * Dynamic Handle Suffix mapping strictly based on live Level / Tier / Performance:
 * - Level 1 - 9 (Beginner / Starter): '_athlete' (e.g., @manoj_athlete, @ranax_athlete)
 * - Level 10 - 24 (Intermediate / Advanced): '_titan' (e.g., @manoj_titan, @ranax_titan)
 * - Level 25+ (Elite / Master): '_overlord' (e.g., @manoj_overlord, @ranax_overlord)
 */
export function getDynamicHandleSuffix(level: number, _tier?: SkillTier): string {
  if (level >= 25) {
    return '_overlord';
  } else if (level >= 10) {
    return '_titan';
  } else {
    return '_athlete';
  }
}

/**
 * Derives a dynamic handle from a base username/handle and the user's live level/tier.
 * Dynamically strips legacy or existing suffixes and appends the live tier suffix.
 * Example: 'RANA X' at Level 1 -> '@ranax_athlete'
 * Example: '@manoj_athlete' at Level 14 -> '@manoj_titan'
 * Example: 'manoj' at Level 28 -> '@manoj_overlord'
 */
export function formatDynamicHandle(rawHandleOrName: string, level: number, tier?: SkillTier): string {
  let clean = (rawHandleOrName || 'athlete').trim();
  if (clean.startsWith('@')) {
    clean = clean.slice(1);
  }
  // Strip any existing dynamic tier/level suffixes
  clean = clean.replace(/_(athlete|titan|overlord|apex|starter|beginner|intermediate|advance|elite)$/i, '');
  // Sanitize characters: lowercase alphanumeric and underscores
  clean = clean.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  if (!clean || clean === '_') {
    clean = 'athlete';
  }
  const suffix = getDynamicHandleSuffix(level, tier);
  return `@${clean}${suffix}`;
}

/**
 * XP Curves:
 * Cumulative XP required to reach Level L: XP = 110 * L^2
 * Level 28 requires ~ 110 * 28^2 = 86,240 XP
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(110 * Math.pow(level, 2));
}

/**
 * Computes level, current level progress, and XP to next level
 */
export function calculateLevelMetrics(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
  prestigeTitle: string;
  prestigeColor: string;
} {
  // Approximate level from XP
  let level = Math.max(1, Math.floor(Math.sqrt(Math.max(0, totalXp) / 110)));
  let baseForLevel = getXpRequiredForLevel(level);
  let nextLevelXp = getXpRequiredForLevel(level + 1);

  // Correction loop for exact bracket
  while (totalXp >= nextLevelXp) {
    level++;
    baseForLevel = nextLevelXp;
    nextLevelXp = getXpRequiredForLevel(level + 1);
  }

  const range = Math.max(1, nextLevelXp - baseForLevel);
  const currentLevelXp = Math.max(0, totalXp - baseForLevel);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / range) * 100)));
  const { title, color } = getPrestigeTitle(level);

  return {
    level,
    currentLevelXp,
    xpForNextLevel: nextLevelXp - baseForLevel,
    progressPercent,
    prestigeTitle: title,
    prestigeColor: color,
  };
}

/**
 * Computes XP earned from a completed combat protocol
 */
export function calculateWorkoutXp(
  workout: WorkoutRoutine,
  completedSets: number,
  totalSets: number,
  tonnageKg: number
): {
  totalXp: number;
  breakdown: {
    baseXp: number;
    completionBonus: number;
    volumeXp: number;
    intensityXp: number;
  };
} {
  // Base XP by tier
  const tierMap: Record<SkillTier, number> = {
    'Starter Athlete': 150,
    Beginner: 180,
    Intermediate: 280,
    Advance: 420,
    Elite: 600,
  };
  const workoutTier: SkillTier = workout.tier || 'Intermediate';
  const baseXp = tierMap[workoutTier] || 280;

  // Completion ratio multiplier
  const completionRatio = totalSets > 0 ? completedSets / totalSets : 1;
  const completionBonus = Math.round(completionRatio * 150);

  // Volume XP: 60 XP per tonne
  const volumeXp = Math.round((tonnageKg / 1000) * 60);

  // Intensity bonus
  const intensityBonusMap: Record<string, number> = {
    Extreme: 120,
    High: 80,
    Moderate: 40,
    Low: 15,
  };
  const intensityXp = intensityBonusMap[workout.intensity] || 50;

  const totalXp = Math.round((baseXp + completionBonus + volumeXp + intensityXp) * Math.max(0.4, completionRatio));

  return {
    totalXp,
    breakdown: {
      baseXp,
      completionBonus,
      volumeXp,
      intensityXp,
    },
  };
}

/**
 * -------------------------------------------------------------
 * 2. ANTI-CHEAT & PHYSIOLOGICAL SANITY VALIDATION LAYER
 * -------------------------------------------------------------
 * Validates PR adjustments against IPF human physiological limits
 * and flags abrupt statistical spikes that lack prior volume progression.
 */
export function validatePrCalibration(params: {
  weightKg: number;
  newBench: number;
  newSquat: number;
  newDeadlift: number;
  currentBench: number;
  currentSquat: number;
  currentDeadlift: number;
  gender: 'male' | 'female';
  volumeLiftedTonnes: number;
  totalWorkouts: number;
}): AntiCheatValidationResult {
  const {
    weightKg,
    newBench,
    newSquat,
    newDeadlift,
    currentBench,
    currentSquat,
    currentDeadlift,
    gender,
    volumeLiftedTonnes,
    totalWorkouts,
  } = params;

  const flags: string[] = [];
  const reasons: string[] = [];
  let isSpikeDetected = false;

  const isMale = gender === 'male';

  // Human physiological absolute & relative limits
  const maxBenchMult = isMale ? 3.1 : 2.2;
  const maxSquatMult = isMale ? 4.2 : 3.4;
  const maxDeadliftMult = isMale ? 4.6 : 3.8;

  const maxAllowedBench = Math.round(weightKg * maxBenchMult * 10) / 10;
  const maxAllowedSquat = Math.round(weightKg * maxSquatMult * 10) / 10;
  const maxAllowedDeadlift = Math.round(weightKg * maxDeadliftMult * 10) / 10;

  // 1. Check Absolute Human Limits / World Class Ceilings
  if (newBench > maxAllowedBench) {
    flags.push('EXCEEDS_BENCH_PHYSIOLOGICAL_CEILING');
    reasons.push(
      `Bench Press (${newBench} kg / ${(newBench / weightKg).toFixed(2)}× BW) exceeds maximal human physiological threshold (${maxAllowedBench} kg / ${maxBenchMult}× BW).`
    );
  }

  if (newSquat > maxAllowedSquat) {
    flags.push('EXCEEDS_SQUAT_PHYSIOLOGICAL_CEILING');
    reasons.push(
      `Back Squat (${newSquat} kg / ${(newSquat / weightKg).toFixed(2)}× BW) exceeds maximal human physiological threshold (${maxAllowedSquat} kg / ${maxSquatMult}× BW).`
    );
  }

  if (newDeadlift > maxAllowedDeadlift) {
    flags.push('EXCEEDS_DEADLIFT_PHYSIOLOGICAL_CEILING');
    reasons.push(
      `Deadlift (${newDeadlift} kg / ${(newDeadlift / weightKg).toFixed(2)}× BW) exceeds maximal human physiological threshold (${maxAllowedDeadlift} kg / ${maxDeadliftMult}× BW).`
    );
  }

  // 2. Sudden Spike / Jump Detection (Single jump > 20% without historical volume progression)
  const benchSpikePercent = currentBench > 0 ? ((newBench - currentBench) / currentBench) * 100 : 0;
  const squatSpikePercent = currentSquat > 0 ? ((newSquat - currentSquat) / currentSquat) * 100 : 0;
  const deadliftSpikePercent = currentDeadlift > 0 ? ((newDeadlift - currentDeadlift) / currentDeadlift) * 100 : 0;

  const requiredTonnesForElite = 30; // 30 tonnes lifetime working volume

  if (benchSpikePercent > 20 && volumeLiftedTonnes < requiredTonnesForElite) {
    isSpikeDetected = true;
    flags.push('UNVERIFIED_BENCH_SPIKE');
    reasons.push(
      `Bench jump (+${benchSpikePercent.toFixed(1)}%) lacks prerequisite working set volume history (${volumeLiftedTonnes}t < ${requiredTonnesForElite}t).`
    );
  }

  if (squatSpikePercent > 22 && volumeLiftedTonnes < requiredTonnesForElite) {
    isSpikeDetected = true;
    flags.push('UNVERIFIED_SQUAT_SPIKE');
    reasons.push(
      `Squat jump (+${squatSpikePercent.toFixed(1)}%) lacks prerequisite working set volume history (${volumeLiftedTonnes}t < ${requiredTonnesForElite}t).`
    );
  }

  if (deadliftSpikePercent > 22 && volumeLiftedTonnes < requiredTonnesForElite) {
    isSpikeDetected = true;
    flags.push('UNVERIFIED_DEADLIFT_SPIKE');
    reasons.push(
      `Deadlift jump (+${deadliftSpikePercent.toFixed(1)}%) lacks prerequisite working set volume history (${volumeLiftedTonnes}t < ${requiredTonnesForElite}t).`
    );
  }

  // 3. SBD Composite Multiplier Sanity Check
  const newTotal = newBench + newSquat + newDeadlift;
  const totalMult = weightKg > 0 ? newTotal / weightKg : 0;
  const eliteTotalMultThreshold = isMale ? 7.0 : 5.8;

  if (totalMult > eliteTotalMultThreshold && totalWorkouts < 50) {
    flags.push('SUSPICIOUS_SBD_COMPOSITE');
    reasons.push(
      `Composite SBD (${totalMult.toFixed(2)}× BW) flags anomaly: requires at least 50 logged verified protocols (currently ${totalWorkouts}).`
    );
  }

  const isValid = flags.length === 0;
  const status = isValid
    ? 'VERIFIED'
    : isSpikeDetected
    ? 'PENDING_VERIFICATION'
    : 'FLAGGED_ANOMALY';

  return {
    isValid,
    status,
    flags,
    reasons,
    maxAllowedBench,
    maxAllowedSquat,
    maxAllowedDeadlift,
    isSpikeDetected,
  };
}

/**
 * -------------------------------------------------------------
 * 3. TELEMETRY LOGGING & DAILY AUDITING ENGINE
 * -------------------------------------------------------------
 */

/**
 * Retrieve stored workout session logs
 */
export function getStoredWorkoutLogs(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TELEMETRY_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist a newly finished workout session into the telemetry matrix
 */
export function recordWorkoutSessionLog(log: WorkoutSessionLog): WorkoutSessionLog[] {
  try {
    const current = getStoredWorkoutLogs();
    const updated = [log, ...current.slice(0, 49)]; // keep 50 latest logs
    localStorage.setItem(STORAGE_KEY_TELEMETRY_LOGS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Initial historical mock telemetry logs for RANA X Titan (Level 28, 48.6 tonnes)
 */
function generateInitialMockLogs(): WorkoutSessionLog[] {
  const now = Date.now();
  const dayMs = 86400000;
  return [
    {
      id: 'log-1',
      workoutId: 'power-elite-peaking',
      workoutTitle: 'PEAK SBD OVERLOAD: ELITE 1RM MATRIX',
      category: 'Powerlifting',
      tier: 'Elite',
      timestamp: now - 1 * dayMs,
      dateStr: new Date(now - 1 * dayMs).toLocaleDateString(),
      durationMinutes: 72,
      caloriesBurned: 710,
      totalSets: 15,
      completedSets: 15,
      completionRatePercent: 100,
      totalTonnageKg: 3420,
      avgReps: 3.2,
      xpEarned: 890,
    },
    {
      id: 'log-2',
      workoutId: 'power-advance-triphasic',
      workoutTitle: 'TRIPHASIC BENCH & DEADLIFT OVERLOAD',
      category: 'Powerlifting',
      tier: 'Advance',
      timestamp: now - 3 * dayMs,
      dateStr: new Date(now - 3 * dayMs).toLocaleDateString(),
      durationMinutes: 65,
      caloriesBurned: 640,
      totalSets: 17,
      completedSets: 16,
      completionRatePercent: 94.1,
      totalTonnageKg: 2850,
      avgReps: 4.8,
      xpEarned: 740,
    },
    {
      id: 'log-3',
      workoutId: 'power-intermediate-volume',
      workoutTitle: 'INTERMEDIATE RPE LINEAR SBD BLOCK',
      category: 'Powerlifting',
      tier: 'Intermediate',
      timestamp: now - 5 * dayMs,
      dateStr: new Date(now - 5 * dayMs).toLocaleDateString(),
      durationMinutes: 58,
      caloriesBurned: 560,
      totalSets: 14,
      completedSets: 14,
      completionRatePercent: 100,
      totalTonnageKg: 2460,
      avgReps: 5.5,
      xpEarned: 610,
    },
    {
      id: 'log-4',
      workoutId: 'bodybuilding-hypertrophy',
      workoutTitle: 'ANABOLIC THORACIC & DELTOID MATRIX',
      category: 'Bodybuilding',
      tier: 'Advance',
      timestamp: now - 7 * dayMs,
      dateStr: new Date(now - 7 * dayMs).toLocaleDateString(),
      durationMinutes: 60,
      caloriesBurned: 580,
      totalSets: 18,
      completedSets: 17,
      completionRatePercent: 94.4,
      totalTonnageKg: 2100,
      avgReps: 9.0,
      xpEarned: 670,
    },
  ];
}

/**
 * Audits athlete telemetry, evaluating:
 * - Protocol completion rate over recent window
 * - Sustained frequency vs missed protocol decay
 * - Auto-corrects skill tier (Beginner to Elite) based on actual combat execution
 */
export function auditAthleteTelemetry(
  profile: AthleteProfile,
  consecutiveMissedDays: number = 0,
  simulatedLowWorkingWeights: boolean = false
): DailyAuditReport {
  const logs = getStoredWorkoutLogs();
  const totalSessions = logs.length;

  // Calculate recent average completion rate
  const recentLogs = logs.slice(0, 10);
  let totalCompletedSets = 0;
  let totalScheduledSets = 0;
  let totalTonnage = 0;
  let totalReps = 0;

  recentLogs.forEach((l) => {
    totalCompletedSets += l.completedSets;
    totalScheduledSets += l.totalSets;
    totalTonnage += l.totalTonnageKg;
    totalReps += l.avgReps;
  });

  const completionRatePercent =
    totalScheduledSets > 0 ? Math.round((totalCompletedSets / totalScheduledSets) * 1000) / 10 : 96.5;

  const avgRepFidelityPercent = totalSessions > 0 ? Math.min(100, Math.round((totalReps / Math.max(1, recentLogs.length)) * 10)) : 95;

  // Determine Decay Risk based on missed protocols or sustained sub-target performance
  let decayRisk: 'NONE' | 'LOW' | 'MODERATE' | 'ACTIVE_DOWNSHIFT' = 'NONE';
  let decayPenaltyXp = 0;

  if (consecutiveMissedDays >= 6 || simulatedLowWorkingWeights) {
    decayRisk = 'ACTIVE_DOWNSHIFT';
    decayPenaltyXp = 4500;
  } else if (consecutiveMissedDays >= 4) {
    decayRisk = 'MODERATE';
    decayPenaltyXp = 2200;
  } else if (consecutiveMissedDays >= 2) {
    decayRisk = 'LOW';
    decayPenaltyXp = 800;
  }

  // Base tier from SBD nominal values & athlete progression
  const totalKg = (profile.maxSquatKg || 0) + (profile.maxBenchKg || 0) + (profile.maxDeadliftKg || 0);
  let baseTier: SkillTier = 'Starter Athlete';
  if ((profile.totalWorkouts || 0) === 0 || (profile.level || 1) <= 1) {
    baseTier = 'Starter Athlete';
  } else if (totalKg >= 680 && (profile.level || 1) >= 25) {
    baseTier = 'Elite';
  } else if (totalKg >= 540 && (profile.level || 1) >= 15) {
    baseTier = 'Advance';
  } else if (totalKg >= 380 && (profile.level || 1) >= 5) {
    baseTier = 'Intermediate';
  } else if (totalKg > 0) {
    baseTier = 'Beginner';
  } else {
    baseTier = 'Starter Athlete';
  }

  // Dynamic Auto-Correction based on actual performance audits:
  // An athlete cannot sustain higher tiers if completion rate is low or experiencing active decay
  let autoCorrectedTier: SkillTier = baseTier;
  let tierStatusMessage = `🛡️ STARTER ATHLETE: Level ${profile.level || 1} • Complete combat protocols to earn XP, increase tonnage velocity, and scale tiers.`;

  if (baseTier === 'Starter Athlete') {
    tierStatusMessage = `🛡️ STARTER ATHLETE: Level ${profile.level || 1} • Complete workouts to earn XP and scale your athletic tier.`;
  } else if (decayRisk === 'ACTIVE_DOWNSHIFT' || completionRatePercent < 60) {
    // Dynamic Downshift
    if (baseTier === 'Elite') autoCorrectedTier = 'Advance';
    else if (baseTier === 'Advance') autoCorrectedTier = 'Intermediate';
    else if (baseTier === 'Intermediate') autoCorrectedTier = 'Beginner';
    else if (baseTier === 'Beginner') autoCorrectedTier = 'Starter Athlete';

    tierStatusMessage = `⚠️ DOWNSHIFT ENFORCED: Sustained missed protocols or completion rate (${completionRatePercent}%) insufficient to maintain ${baseTier} status. Temporarily downshifted to ${autoCorrectedTier}.`;
  } else if (completionRatePercent < 80 && baseTier === 'Elite') {
    autoCorrectedTier = 'Advance';
    tierStatusMessage = `⚠️ TIER CALIBRATED: Completion rate (${completionRatePercent}%) below Elite 80% threshold. Adjusted to Advance standing.`;
  } else {
    tierStatusMessage = `🛡️ VERIFIED ${baseTier.toUpperCase()}: Maintained ${completionRatePercent}% completion rate and ${profile.volumeLiftedTonnes}t lifetime volume velocity.`;
  }

  const antiCheatStatus: 'VERIFIED' | 'FLAGGED_ANOMALY' | 'PENDING_VERIFICATION' =
    profile.antiCheatStatus || 'VERIFIED';

  const report: DailyAuditReport = {
    timestamp: Date.now(),
    auditedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    totalSessionsEvaluated: totalSessions,
    completionRatePercent,
    totalTonnageKg: totalTonnage,
    avgRepFidelityPercent,
    streakDays: 14,
    consecutiveMissedProtocols: consecutiveMissedDays,
    decayRisk,
    decayPenaltyXp,
    baseTier,
    autoCorrectedTier,
    tierStatusMessage,
    antiCheatStatus,
  };

  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_REPORT, JSON.stringify(report));
  } catch {}

  return report;
}

/**
 * Retrieve cached audit report
 */
export function getStoredAuditReport(): DailyAuditReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_REPORT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
