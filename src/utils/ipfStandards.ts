/**
 * Official International Powerlifting Federation (IPF) Technical Rulebook Standards
 * Weight Classes, GL Goodlift Scoring, and Relative Strength Multiplier Benchmarks
 */

import { AthleteProfile, WorkoutRoutine, Exercise, SkillTier } from '../types';

export type IpfDivision = 'male' | 'female';

export interface IpfWeightClassDefinition {
  code: string;
  label: string;
  division: IpfDivision;
  maxBodyweight: number; // in kg, Infinity for plus class
  minBodyweight: number;
  // Standard total benchmarks (in kg) for Beginner, Intermediate, Advance, Elite
  thresholds: {
    beginner: number;
    intermediate: number;
    advance: number;
    elite: number;
  };
}

/**
 * Official IPF Senior/Open Weight Classes
 * Rulebook: Men (59, 66, 74, 83, 93, 105, 120, 120+)
 * Rulebook: Women (47, 52, 57, 63, 69, 76, 84, 84+)
 * (Includes junior 53kg for Men and 43kg for Women for comprehensive youth & junior athlete compliance)
 */
export const IPF_MEN_WEIGHT_CLASSES: IpfWeightClassDefinition[] = [
  {
    code: 'M-53',
    label: 'Men -53 kg (Junior)',
    division: 'male',
    minBodyweight: 0,
    maxBodyweight: 53.0,
    thresholds: { beginner: 180, intermediate: 250, advance: 330, elite: 400 },
  },
  {
    code: 'M-59',
    label: 'Men -59 kg',
    division: 'male',
    minBodyweight: 53.01,
    maxBodyweight: 59.0,
    thresholds: { beginner: 200, intermediate: 280, advance: 370, elite: 460 },
  },
  {
    code: 'M-66',
    label: 'Men -66 kg',
    division: 'male',
    minBodyweight: 59.01,
    maxBodyweight: 66.0,
    thresholds: { beginner: 230, intermediate: 325, advance: 430, elite: 530 },
  },
  {
    code: 'M-74',
    label: 'Men -74 kg',
    division: 'male',
    minBodyweight: 66.01,
    maxBodyweight: 74.0,
    thresholds: { beginner: 260, intermediate: 365, advance: 485, elite: 600 },
  },
  {
    code: 'M-83',
    label: 'Men -83 kg',
    division: 'male',
    minBodyweight: 74.01,
    maxBodyweight: 83.0,
    thresholds: { beginner: 290, intermediate: 410, advance: 540, elite: 665 },
  },
  {
    code: 'M-93',
    label: 'Men -93 kg',
    division: 'male',
    minBodyweight: 83.01,
    maxBodyweight: 93.0,
    thresholds: { beginner: 320, intermediate: 445, advance: 585, elite: 720 },
  },
  {
    code: 'M-105',
    label: 'Men -105 kg',
    division: 'male',
    minBodyweight: 93.01,
    maxBodyweight: 105.0,
    thresholds: { beginner: 345, intermediate: 480, advance: 630, elite: 775 },
  },
  {
    code: 'M-120',
    label: 'Men -120 kg',
    division: 'male',
    minBodyweight: 105.01,
    maxBodyweight: 120.0,
    thresholds: { beginner: 370, intermediate: 515, advance: 675, elite: 825 },
  },
  {
    code: 'M-120+',
    label: 'Men 120+ kg (Super Heavyweight)',
    division: 'male',
    minBodyweight: 120.01,
    maxBodyweight: 999.0,
    thresholds: { beginner: 390, intermediate: 540, advance: 710, elite: 875 },
  },
];

export const IPF_WOMEN_WEIGHT_CLASSES: IpfWeightClassDefinition[] = [
  {
    code: 'W-43',
    label: 'Women -43 kg (Junior)',
    division: 'female',
    minBodyweight: 0,
    maxBodyweight: 43.0,
    thresholds: { beginner: 120, intermediate: 170, advance: 225, elite: 285 },
  },
  {
    code: 'W-47',
    label: 'Women -47 kg',
    division: 'female',
    minBodyweight: 43.01,
    maxBodyweight: 47.0,
    thresholds: { beginner: 135, intermediate: 195, advance: 255, elite: 320 },
  },
  {
    code: 'W-52',
    label: 'Women -52 kg',
    division: 'female',
    minBodyweight: 47.01,
    maxBodyweight: 52.0,
    thresholds: { beginner: 155, intermediate: 215, advance: 285, elite: 355 },
  },
  {
    code: 'W-57',
    label: 'Women -57 kg',
    division: 'female',
    minBodyweight: 52.01,
    maxBodyweight: 57.0,
    thresholds: { beginner: 170, intermediate: 235, advance: 310, elite: 390 },
  },
  {
    code: 'W-63',
    label: 'Women -63 kg',
    division: 'female',
    minBodyweight: 57.01,
    maxBodyweight: 63.0,
    thresholds: { beginner: 185, intermediate: 260, advance: 340, elite: 425 },
  },
  {
    code: 'W-69',
    label: 'Women -69 kg',
    division: 'female',
    minBodyweight: 63.01,
    maxBodyweight: 69.0,
    thresholds: { beginner: 200, intermediate: 280, advance: 365, elite: 460 },
  },
  {
    code: 'W-76',
    label: 'Women -76 kg',
    division: 'female',
    minBodyweight: 69.01,
    maxBodyweight: 76.0,
    thresholds: { beginner: 215, intermediate: 300, advance: 395, elite: 495 },
  },
  {
    code: 'W-84',
    label: 'Women -84 kg',
    division: 'female',
    minBodyweight: 76.01,
    maxBodyweight: 84.0,
    thresholds: { beginner: 230, intermediate: 320, advance: 420, elite: 525 },
  },
  {
    code: 'W-84+',
    label: 'Women 84+ kg (Super Heavyweight)',
    division: 'female',
    minBodyweight: 84.01,
    maxBodyweight: 999.0,
    thresholds: { beginner: 245, intermediate: 340, advance: 445, elite: 560 },
  },
];

/**
 * Resolve the user's official IPF weight class based on current bodyweight and division
 */
export function getIpfWeightClass(
  weightKg: number,
  division: IpfDivision = 'male'
): IpfWeightClassDefinition {
  const classes = division === 'male' ? IPF_MEN_WEIGHT_CLASSES : IPF_WOMEN_WEIGHT_CLASSES;
  
  for (const c of classes) {
    if (weightKg <= c.maxBodyweight) {
      return c;
    }
  }
  return classes[classes.length - 1];
}

/**
 * Official IPF GL Points Formula (Standard since 2020, replacing Wilks)
 * Points = 100 * Total / (A - B * exp(-C * BW))
 */
export function calculateIpfGlPoints(
  totalKg: number,
  bodyweightKg: number,
  division: IpfDivision = 'male'
): number {
  if (totalKg <= 0 || bodyweightKg <= 0) return 0;

  // Official IPF Classic/Raw Parameters
  const A = division === 'male' ? 1199.72839 : 610.32796;
  const B = division === 'male' ? 1025.18162 : 535.89976;
  const C = division === 'male' ? 0.00921 : 0.01163;

  const denominator = A - B * Math.exp(-C * bodyweightKg);
  if (denominator <= 0) return 0;

  const points = (100 * totalKg) / denominator;
  return Math.round(points * 100) / 100;
}

/**
 * Relative Strength Multiplier Thresholds (Total / Bodyweight)
 */
export const IPF_RELATIVE_MULTIPLIERS = {
  male: {
    beginner: 3.25,     // < 3.25x BW
    intermediate: 4.75, // 3.25x - 4.75x BW
    advance: 5.85,      // 4.75x - 5.85x BW
    elite: 5.85,        // >= 5.85x BW
  },
  female: {
    beginner: 2.50,     // < 2.50x BW
    intermediate: 3.65, // 2.50x - 3.65x BW
    advance: 4.75,      // 3.65x - 4.75x BW
    elite: 4.75,        // >= 4.75x BW
  },
};

/**
 * Lift Specific Relative Multipliers
 */
export const IPF_LIFT_MULTIPLIERS = {
  male: {
    squat: { beginner: 1.25, intermediate: 1.75, advance: 2.25, elite: 2.65 },
    bench: { beginner: 0.95, intermediate: 1.30, advance: 1.65, elite: 1.95 },
    deadlift: { beginner: 1.50, intermediate: 2.10, advance: 2.65, elite: 3.10 },
  },
  female: {
    squat: { beginner: 0.95, intermediate: 1.40, advance: 1.85, elite: 2.25 },
    bench: { beginner: 0.60, intermediate: 0.90, advance: 1.20, elite: 1.50 },
    deadlift: { beginner: 1.20, intermediate: 1.75, advance: 2.25, elite: 2.70 },
  },
};

export interface IpfAthleteClassification {
  division: IpfDivision;
  weightClass: IpfWeightClassDefinition;
  totalKg: number;
  relativeMultiplier: number;
  tier: SkillTier;
  ipfGlPoints: number;
  squatKg: number;
  squatMultiplier: number;
  squatTier: SkillTier;
  benchKg: number;
  benchMultiplier: number;
  benchTier: SkillTier;
  deadliftKg: number;
  deadliftMultiplier: number;
  deadliftTier: SkillTier;
  nextTierKgNeeded: number;
  nextTierName: string | null;
  tierProgressPercent: number;
}

/**
 * Classify athlete according to official IPF relative strength and weight class benchmarks
 */
export function classifyAthleteIpf(
  weightKg: number,
  squatKg: number,
  benchKg: number,
  deadliftKg: number,
  division: IpfDivision = 'male'
): IpfAthleteClassification {
  const weightClass = getIpfWeightClass(weightKg, division);
  const totalKg = Math.round((squatKg + benchKg + deadliftKg) * 10) / 10;
  const relativeMultiplier = weightKg > 0 ? Math.round((totalKg / weightKg) * 100) / 100 : 0;
  const glPoints = calculateIpfGlPoints(totalKg, weightKg, division);

  const determineLiftTier = (
    ratio: number,
    thresholds: { beginner: number; intermediate: number; advance: number; elite: number }
  ): SkillTier => {
    if (ratio >= thresholds.elite) return 'Elite';
    if (ratio >= thresholds.advance) return 'Advance';
    if (ratio >= thresholds.intermediate) return 'Intermediate';
    return 'Beginner';
  };

  const squatRatio = weightKg > 0 ? Math.round((squatKg / weightKg) * 100) / 100 : 0;
  const benchRatio = weightKg > 0 ? Math.round((benchKg / weightKg) * 100) / 100 : 0;
  const deadliftRatio = weightKg > 0 ? Math.round((deadliftKg / weightKg) * 100) / 100 : 0;

  const squatTier = determineLiftTier(squatRatio, IPF_LIFT_MULTIPLIERS[division].squat);
  const benchTier = determineLiftTier(benchRatio, IPF_LIFT_MULTIPLIERS[division].bench);
  const deadliftTier = determineLiftTier(deadliftRatio, IPF_LIFT_MULTIPLIERS[division].deadlift);

  // Overall Tier based on Weight Class Total thresholds and relative multiplier
  const { thresholds } = weightClass;
  let tier: SkillTier = 'Beginner';
  let nextTierKgNeeded = 0;
  let nextTierName: string | null = null;
  let tierProgressPercent = 0;

  if (totalKg >= thresholds.elite) {
    tier = 'Elite';
    nextTierKgNeeded = 0;
    nextTierName = null;
    tierProgressPercent = 100;
  } else if (totalKg >= thresholds.advance) {
    tier = 'Advance';
    nextTierName = 'Elite';
    nextTierKgNeeded = Math.max(0, thresholds.elite - totalKg);
    const range = thresholds.elite - thresholds.advance;
    tierProgressPercent = Math.min(100, Math.round(((totalKg - thresholds.advance) / range) * 100));
  } else if (totalKg >= thresholds.intermediate) {
    tier = 'Intermediate';
    nextTierName = 'Advance';
    nextTierKgNeeded = Math.max(0, thresholds.advance - totalKg);
    const range = thresholds.advance - thresholds.intermediate;
    tierProgressPercent = Math.min(100, Math.round(((totalKg - thresholds.intermediate) / range) * 100));
  } else {
    tier = 'Beginner';
    nextTierName = 'Intermediate';
    nextTierKgNeeded = Math.max(0, thresholds.intermediate - totalKg);
    const range = thresholds.intermediate - thresholds.beginner;
    tierProgressPercent = Math.max(0, Math.min(100, Math.round(((totalKg - thresholds.beginner) / Math.max(1, range)) * 100)));
  }

  return {
    division,
    weightClass,
    totalKg,
    relativeMultiplier,
    tier,
    ipfGlPoints: glPoints,
    squatKg,
    squatMultiplier: squatRatio,
    squatTier,
    benchKg,
    benchMultiplier: benchRatio,
    benchTier,
    deadliftKg,
    deadliftMultiplier: deadliftRatio,
    deadliftTier,
    nextTierKgNeeded,
    nextTierName,
    tierProgressPercent,
  };
}

/**
 * Standard IPF Competition Plate Rounding (nearest 2.5 kg bar load)
 */
export function roundToIpfIncrement(weightKg: number): number {
  return Math.max(20, Math.round(weightKg / 2.5) * 2.5);
}

/**
 * Calibrate a Powerlifting routine to authentic IPF competition standards using the athlete's 1RM
 */
export function calibrateIpfWorkout(
  workout: WorkoutRoutine,
  profile: AthleteProfile
): WorkoutRoutine {
  // Only recalibrate Powerlifting or Strength compound protocols
  if (workout.category !== 'Powerlifting' && workout.id !== 'titan-strength-compound') {
    return workout;
  }

  const { maxSquatKg, maxBenchKg, maxDeadliftKg } = profile;

  // Process exercises
  const updatedExercises: Exercise[] = workout.exercises.map((ex) => {
    const lowerName = ex.name.toLowerCase();

    // 1. Squat variations
    if (lowerName.includes('squat')) {
      if (lowerName.includes('single') || lowerName.includes('95%') || workout.tier === 'Elite') {
        const load = roundToIpfIncrement(maxSquatKg * 0.95);
        return {
          ...ex,
          targetReps: '1 @ 95% 1RM (IPF Single)',
          weightKg: load,
        };
      }
      if (workout.id === 'titan-strength-compound') {
        const load = roundToIpfIncrement(maxSquatKg * 0.825);
        return {
          ...ex,
          targetReps: '5 @ 82.5% 1RM (Competition Depth)',
          weightKg: load,
        };
      }
      if (workout.tier === 'Advance') {
        const load = roundToIpfIncrement(maxSquatKg * 0.85);
        return {
          ...ex,
          targetReps: '3-4 @ 85% 1RM',
          weightKg: load,
        };
      }
      if (workout.tier === 'Intermediate') {
        const load = roundToIpfIncrement(maxSquatKg * 0.80);
        return {
          ...ex,
          targetReps: '5 @ 80% 1RM (IPF Volume)',
          weightKg: load,
        };
      }
      // Beginner
      const load = roundToIpfIncrement(maxSquatKg * 0.70);
      return {
        ...ex,
        targetReps: '5 @ 70% 1RM (Depth Mechanics)',
        weightKg: load,
      };
    }

    // 2. Deadlift variations
    if (lowerName.includes('deadlift')) {
      if (lowerName.includes('deficit') || lowerName.includes('single') || workout.tier === 'Elite') {
        const load = roundToIpfIncrement(maxDeadliftKg * 0.88);
        return {
          ...ex,
          targetReps: '3 @ 88% 1RM (Competition Lockout)',
          weightKg: load,
        };
      }
      if (workout.id === 'titan-strength-compound') {
        const load = roundToIpfIncrement(maxDeadliftKg * 0.85);
        return {
          ...ex,
          targetReps: '4 @ 85% 1RM (Intra-Abdominal Brace)',
          weightKg: load,
        };
      }
      if (workout.tier === 'Advance') {
        const load = roundToIpfIncrement(maxDeadliftKg * 0.85);
        return {
          ...ex,
          targetReps: '3 @ 85% 1RM',
          weightKg: load,
        };
      }
      if (workout.tier === 'Intermediate') {
        const load = roundToIpfIncrement(maxDeadliftKg * 0.80);
        return {
          ...ex,
          targetReps: '5 @ 80% 1RM (Sub-Max Accumulation)',
          weightKg: load,
        };
      }
      // Beginner
      const load = roundToIpfIncrement(maxDeadliftKg * 0.72);
      return {
        ...ex,
        targetReps: '5 @ 72% 1RM (Slack Pull Cues)',
        weightKg: load,
      };
    }

    // 3. Bench Press variations
    if (lowerName.includes('bench') || lowerName.includes('spoto press')) {
      if (lowerName.includes('paused') || lowerName.includes('single') || workout.tier === 'Elite') {
        const load = roundToIpfIncrement(maxBenchKg * 0.925);
        return {
          ...ex,
          targetReps: '2 @ 92.5% 1RM (IPF 2-Sec Pause)',
          weightKg: load,
        };
      }
      if (workout.tier === 'Advance') {
        const load = roundToIpfIncrement(maxBenchKg * 0.85);
        return {
          ...ex,
          targetReps: '4 @ 85% 1RM',
          weightKg: load,
        };
      }
      if (workout.tier === 'Intermediate') {
        const load = roundToIpfIncrement(maxBenchKg * 0.78);
        return {
          ...ex,
          targetReps: '6 @ 78% 1RM',
          weightKg: load,
        };
      }
      // Beginner
      const load = roundToIpfIncrement(maxBenchKg * 0.70);
      return {
        ...ex,
        targetReps: '5 @ 70% 1RM (Leg Drive Rhythm)',
        weightKg: load,
      };
    }

    return ex;
  });

  return {
    ...workout,
    protocolBadge: workout.protocolBadge
      ? `IPF Certified • ${workout.protocolBadge}`
      : 'IPF Standard Load',
    exercises: updatedExercises,
  };
}
