export type TabType = 'dashboard' | 'workouts' | 'coach' | 'profile';

export interface DailyActivity {
  caloriesBurned: number;
  caloriesTarget: number;
  activeMinutes: number;
  activeMinutesTarget: number;
  waterIntakeLiters: number;
  waterTargetLiters: number;
  workoutStreakDays: number;
  avgHeartRate: number;
  powerOutputWatts: number;
}

export type WearableDeviceType =
  | 'apple_watch'
  | 'google_health_connect'
  | 'whoop_strap'
  | 'garmin_fenix'
  | 'polar_h10'
  | 'oura_ring'
  | 'galaxy_watch'
  | 'bluetooth_generic';

export interface WearableDeviceState {
  id: string;
  name: string;
  type: WearableDeviceType;
  brand: string;
  connected: boolean;
  batteryLevel?: number; // e.g. 88%
  lastSyncTimestamp?: string;
  liveBpm?: number;
  stepsToday?: number;
  activeMinutes?: number;
  restingBpm?: number;
  syncSource: 'WEB_BLUETOOTH' | 'HEALTHKIT_BRIDGE' | 'HEALTH_CONNECT' | 'REST_API';
}

export interface WearableSyncTelemetry {
  isLiveTracking: boolean;
  activeDevice: WearableDeviceState | null;
  liveHeartRate: number;
  heartRateZone: 1 | 2 | 3 | 4 | 5;
  hrvMs: number;
  stepsToday: number;
  distanceKm: number;
  devices: WearableDeviceState[];
  lastFullSyncTime: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  targetReps: string;
  weightKg: number;
  completedSets?: boolean[];
}

export type WorkoutCategory =
  | 'Powerlifting'
  | 'Bodybuilding'
  | 'Calisthenics'
  | 'Athletics'
  | 'Strength'
  | 'Hypertrophy'
  | 'HIIT'
  | 'Core';

export type SkillTier = 'Starter Athlete' | 'Beginner' | 'Intermediate' | 'Advance' | 'Elite';

export interface WorkoutRoutine {
  id: string;
  title: string;
  category: WorkoutCategory;
  tier?: SkillTier;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: 'Extreme' | 'High' | 'Moderate' | 'Low';
  intensityMeter?: number; // 0 to 100 percentage
  accentColor: 'cyan' | 'red' | 'purple' | 'emerald' | 'amber';
  exercises: Exercise[];
  description: string;
  recommendedTime: string;
  protocolBadge?: string; // e.g., 'Drop-Set Blast', '85% 1RM Overload', 'Planche Progression'
}

export interface MacroNutrient {
  grams: number;
  percentage: number;
  calories: number;
}

export interface StructuredDietPlan {
  planTitle: string;
  targetGoal: 'Hypertrophic Weight Gain' | 'Precision Fat Loss' | 'Powerlifting Recomposition';
  dailyCalories: number;
  protein: MacroNutrient;
  carbs: MacroNutrient;
  fats: MacroNutrient;
  preWorkoutNutrition: string;
  postWorkoutNutrition: string;
  hydrationElectrolytes: string;
  applied?: boolean;
}

export interface FormAnalysisTelemetry {
  exercise: string;
  score: number; // e.g., 94%
  primaryRisk: string;
  biomechanicalFix: string;
  barbellPathCue: string;
}

export interface OneRepMaxPrediction {
  exercise: string;
  currentLiftKg: number;
  currentReps: number;
  predictedOneRepMaxKg: number;
  confidenceRate: number;
  hypertrophyProgressionWeeks: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: 'routine' | 'nutrition' | 'recovery' | 'form' | 'diet_plan' | 'rm_prediction';
  actionPrompt?: string;
  dietPlan?: StructuredDietPlan;
  formAnalysis?: FormAnalysisTelemetry;
  rmPrediction?: OneRepMaxPrediction;
}

export interface AthleteProfile {
  name: string;
  handle: string;
  rank: string;
  level: number;
  avatarUrl: string;
  gender?: 'male' | 'female';
  weightKg: number;
  targetWeightKg: number;
  bodyFatPercent: number;
  heightCm: number;
  maxBenchKg: number;
  maxDeadliftKg: number;
  maxSquatKg: number;
  totalWorkouts: number;
  volumeLiftedTonnes: number;
  mirrorGlowMode: 'high' | 'subtle' | 'off';
  hapticFeedback: boolean;
  vibrationFeedback?: boolean;
  hapticSound?: boolean;
  audioCoaching: boolean;
  ipfWeightClass?: string;
  ipfGlPoints?: number;
  totalXp?: number;
  auditTier?: SkillTier;
  consecutiveMissedProtocols?: number;
  antiCheatStatus?: 'VERIFIED' | 'FLAGGED_ANOMALY' | 'PENDING_VERIFICATION';
  anomalyReason?: string | null;
  performanceDecayActive?: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'PROTOCOL' | 'COACH' | 'CYBER' | 'HARDWARE' | 'STREAK';
  read: boolean;
  actionTab?: TabType;
  actionLabel?: string;
}
