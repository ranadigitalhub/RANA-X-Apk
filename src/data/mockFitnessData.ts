import { DailyActivity, WorkoutRoutine, AthleteProfile, ChatMessage } from '../types';

export const initialDailyActivity: DailyActivity = {
  caloriesBurned: 840,
  caloriesTarget: 1000,
  activeMinutes: 52,
  activeMinutesTarget: 60,
  waterIntakeLiters: 2.6,
  waterTargetLiters: 3.0,
  workoutStreakDays: 14,
  avgHeartRate: 138,
  powerOutputWatts: 480,
};

export const sampleWorkouts: WorkoutRoutine[] = [
  // ==========================================
  // 1. POWERLIFTING PROTOCOLS (Squat, Bench, Deadlift Overload)
  // ==========================================
  {
    id: 'power-elite-peaking',
    title: 'PEAK SBD OVERLOAD: ELITE 1RM MATRIX',
    category: 'Powerlifting',
    tier: 'Elite',
    durationMinutes: 75,
    caloriesBurned: 740,
    intensity: 'Extreme',
    intensityMeter: 98,
    accentColor: 'red',
    recommendedTime: 'Monday • 5:30 PM',
    protocolBadge: '92.5–96% 1RM Heavy Singles',
    description: 'Competition peaking protocol utilizing low-velocity neuromuscular recruitment, paused bar commands, and intra-abdominal bracing.',
    exercises: [
      { id: 'pw-e1', name: 'Low Bar Competition Squat (Single @ RPE 9.5)', targetMuscle: 'Posterior Chain & Quads', sets: 5, targetReps: '1 @ 95% 1RM', weightKg: 220 },
      { id: 'pw-e2', name: 'Competition Paused Bench Press', targetMuscle: 'Pectorals & Triceps', sets: 4, targetReps: '2 @ 92.5% 1RM', weightKg: 155 },
      { id: 'pw-e3', name: 'Deadlift Off 2" Deficit', targetMuscle: 'Erector Spinae & Lats', sets: 3, targetReps: '3 @ 88% 1RM', weightKg: 240 },
      { id: 'pw-e4', name: 'Heavy Barbell Pin Squats (Bottom Dead Stop)', targetMuscle: 'Sticking Point Overload', sets: 3, targetReps: '3', weightKg: 190 }
    ]
  },
  {
    id: 'power-advance-triphasic',
    title: 'TRIPHASIC BENCH & DEADLIFT OVERLOAD',
    category: 'Powerlifting',
    tier: 'Advance',
    durationMinutes: 68,
    caloriesBurned: 660,
    intensity: 'Extreme',
    intensityMeter: 90,
    accentColor: 'red',
    recommendedTime: 'Wednesday • 6:00 PM',
    protocolBadge: '85–88% 1RM Wave Loading',
    description: 'Advance force-velocity curve optimization using 4-second eccentric tempo on Bench Press and banded accommodating resistance Deadlifts.',
    exercises: [
      { id: 'pw-e5', name: 'Deadlift with Monster Mini-Bands', targetMuscle: 'Lockout Acceleration', sets: 5, targetReps: '3 @ 85% 1RM', weightKg: 210 },
      { id: 'pw-e6', name: 'Spoto Press (Paused 1" Off Chest)', targetMuscle: 'Mid-Range Isometric Rigidity', sets: 4, targetReps: '4', weightKg: 135 },
      { id: 'pw-e7', name: 'Safety Squat Bar (SSB) Hatfield Squats', targetMuscle: 'Quad Centric Overload', sets: 4, targetReps: '6', weightKg: 165 },
      { id: 'pw-e8', name: 'Barbell Seal Rows (Dead Stop)', targetMuscle: 'Upper Thoracic Spine', sets: 4, targetReps: '8', weightKg: 95 }
    ]
  },
  {
    id: 'power-intermediate-volume',
    title: 'INTERMEDIATE RPE LINEAR SBD BLOCK',
    category: 'Powerlifting',
    tier: 'Intermediate',
    durationMinutes: 60,
    caloriesBurned: 580,
    intensity: 'High',
    intensityMeter: 80,
    accentColor: 'red',
    recommendedTime: 'Friday • 6:30 PM',
    protocolBadge: '78–82% 1RM Sub-Maximal Sets',
    description: 'Volume-accumulation block designed to reinforce bar trajectory, hip hinge mechanics, and lat flare under heavy sub-maximal load.',
    exercises: [
      { id: 'pw-e9', name: 'Barbell Back Squat (Linear Progression)', targetMuscle: 'Quads & Spinal Bracing', sets: 4, targetReps: '5 @ 80% 1RM', weightKg: 145 },
      { id: 'pw-e10', name: 'Barbell Touch-and-Go Bench Press', targetMuscle: 'Pectoral Drive', sets: 4, targetReps: '6 @ 78% 1RM', weightKg: 105 },
      { id: 'pw-e11', name: 'Conventional Deadlift (Double Overhand Hook)', targetMuscle: 'Posterior Kinetic Chain', sets: 3, targetReps: '5 @ 80% 1RM', weightKg: 160 },
      { id: 'pw-e12', name: 'Romanian Deadlift (Controlled Eccentric)', targetMuscle: 'Hamstrings & Glutes', sets: 3, targetReps: '8', weightKg: 110 }
    ]
  },
  {
    id: 'power-beginner-linear',
    title: 'FOUNDATION POWERLIFTING 3×5 BASICS',
    category: 'Powerlifting',
    tier: 'Beginner',
    durationMinutes: 48,
    caloriesBurned: 420,
    intensity: 'Moderate',
    intensityMeter: 65,
    accentColor: 'red',
    recommendedTime: 'Tuesday • 7:00 AM',
    protocolBadge: '68–72% 1RM Form Stabilization',
    description: 'Introductory compound bar mastery focusing on breath bracing (Valsalva maneuver), foot tripod balance, and scapular retraction.',
    exercises: [
      { id: 'pw-e13', name: 'Barbell Back Squat (Box Depth Check)', targetMuscle: 'Hip & Knee Coordination', sets: 3, targetReps: '5 @ 70% 1RM', weightKg: 80 },
      { id: 'pw-e14', name: 'Flat Barbell Bench Press (Leg Drive)', targetMuscle: 'Chest & Anterior Delts', sets: 3, targetReps: '5 @ 70% 1RM', weightKg: 60 },
      { id: 'pw-e15', name: 'Deadlift (Mid-Shin Pull)', targetMuscle: 'Posterior Foundation', sets: 2, targetReps: '5 @ 72% 1RM', weightKg: 95 },
      { id: 'pw-e16', name: 'Overhead Barbell Military Press', targetMuscle: 'Deltoid & Core Rigidity', sets: 3, targetReps: '6', weightKg: 40 }
    ]
  },

  // ==========================================
  // 2. BODYBUILDING PROTOCOLS (Hypertrophy, Drop-Sets, Supersets)
  // ==========================================
  {
    id: 'bb-elite-giantsets',
    title: 'BLOOD VOLUME OBLITERATION: CHEST & ARMS',
    category: 'Bodybuilding',
    tier: 'Elite',
    durationMinutes: 65,
    caloriesBurned: 640,
    intensity: 'Extreme',
    intensityMeter: 96,
    accentColor: 'cyan',
    recommendedTime: 'Today • 6:30 PM',
    protocolBadge: 'Mechanical Drop-Sets & Rest-Pause',
    description: 'Maximal metabolic accumulation and sarcoplasmic hypertrophy using double drop-sets to absolute muscular failure (RIR 0 to -1).',
    exercises: [
      { id: 'bb-e1', name: 'Incline Smith Press (Double Drop-Set on Final Set)', targetMuscle: 'Clavicular Pec Head', sets: 4, targetReps: '8, 8, 8, 8+6+6', weightKg: 100 },
      { id: 'bb-e2', name: 'SUPERSET: Incline DB Flyes + Hex Press', targetMuscle: 'Pectoral Stretch & Contraction', sets: 4, targetReps: '12 + 10', weightKg: 28 },
      { id: 'bb-e3', name: 'Cable Standing Crossover (15s Isometric Peak Hold)', targetMuscle: 'Sternal Pectoral Squeeze', sets: 3, targetReps: '15', weightKg: 22 },
      { id: 'bb-e4', name: 'SUPERSET: BFR Spider Curls + Rope Tricep Pushdowns', targetMuscle: 'Biceps & Triceps Lateral Head', sets: 4, targetReps: '12 + 15', weightKg: 18 }
    ]
  },
  {
    id: 'bb-advance-quads-delts',
    title: 'HYPERTROPHY SPEC: V-TAPER & TEARDROP QUADS',
    category: 'Bodybuilding',
    tier: 'Advance',
    durationMinutes: 58,
    caloriesBurned: 580,
    intensity: 'High',
    intensityMeter: 88,
    accentColor: 'cyan',
    recommendedTime: 'Thursday • 6:00 PM',
    protocolBadge: 'Drop-Set & Peak Contraction Pause',
    description: 'High-density hypertrophy split targeting lateral deltoid capping and vastus medialis sweep through continuous mechanical tension.',
    exercises: [
      { id: 'bb-e5', name: 'Pendulum Squat (3s Eccentric Tempo)', targetMuscle: 'Vastus Medialis & Laterals', sets: 4, targetReps: '10-12', weightKg: 120 },
      { id: 'bb-e6', name: 'Leg Extensions (Final Set Quad Drop-Set)', targetMuscle: 'Rectus Femoris Pump', sets: 4, targetReps: '12 + 8 + 8', weightKg: 75 },
      { id: 'bb-e7', name: 'Seated DB Lateral Raises (Strict 1s Top Pause)', targetMuscle: 'Lateral Deltoids', sets: 5, targetReps: '15', weightKg: 14 },
      { id: 'bb-e8', name: 'Cable Upright Row with EZ-Attachment', targetMuscle: 'Upper Traps & Delts', sets: 3, targetReps: '12', weightKg: 45 }
    ]
  },
  {
    id: 'bb-intermediate-upper-lower',
    title: 'UPPER BODY DENSITY & SUPERSETS',
    category: 'Bodybuilding',
    tier: 'Intermediate',
    durationMinutes: 52,
    caloriesBurned: 510,
    intensity: 'High',
    intensityMeter: 78,
    accentColor: 'cyan',
    recommendedTime: 'Monday • 7:00 PM',
    protocolBadge: 'Antagonist Supersets & High Tension',
    description: 'Balanced muscle architecture routine pairing antagonistic muscle groups for heightened cellular swelling and joint recovery.',
    exercises: [
      { id: 'bb-e9', name: 'SUPERSET: Flat DB Bench Press + Chest Supported T-Bar Row', targetMuscle: 'Pectorals & Latissimus Dorsi', sets: 4, targetReps: '10 + 10', weightKg: 34 },
      { id: 'bb-e10', name: 'Incline Cable Chest Press', targetMuscle: 'Upper Chest Fibers', sets: 3, targetReps: '12', weightKg: 35 },
      { id: 'bb-e11', name: 'SUPERSET: Overhead Rope Extension + Incline Incline Curls', targetMuscle: 'Triceps & Biceps', sets: 3, targetReps: '12 + 12', weightKg: 25 },
      { id: 'bb-e12', name: 'Rear Delt Reverse Pec Deck Flyes', targetMuscle: 'Posterior Deltoid', sets: 4, targetReps: '15', weightKg: 40 }
    ]
  },
  {
    id: 'bb-beginner-push-pull',
    title: 'AESTHETIC FOUNDATION PUSH HYPERTROPHY',
    category: 'Bodybuilding',
    tier: 'Beginner',
    durationMinutes: 44,
    caloriesBurned: 380,
    intensity: 'Moderate',
    intensityMeter: 62,
    accentColor: 'cyan',
    recommendedTime: 'Wednesday • 8:00 AM',
    protocolBadge: 'Mind-Muscle Connection Drills',
    description: 'Beginner aesthetic split honing in on mind-muscle neurological intent, zero-momentum eccentric control, and chest expansion.',
    exercises: [
      { id: 'bb-e13', name: 'Dumbbell Flat Bench Press (Neutral Grip)', targetMuscle: 'Pectoral Squeeze', sets: 3, targetReps: '10-12', weightKg: 18 },
      { id: 'bb-e14', name: 'Incline Machine Chest Press', targetMuscle: 'Clavicular Pec Fibers', sets: 3, targetReps: '12', weightKg: 40 },
      { id: 'bb-e15', name: 'Dumbbell Standing Lateral Raises', targetMuscle: 'Side Delts', sets: 3, targetReps: '12-15', weightKg: 8 },
      { id: 'bb-e16', name: 'Triceps Rope Cable Pushdowns', targetMuscle: 'Triceps Horseshoe', sets: 3, targetReps: '12', weightKg: 20 }
    ]
  },

  // ==========================================
  // 3. CALISTHENICS PROTOCOLS (Bodyweight Mastery)
  // ==========================================
  {
    id: 'cal-elite-planche',
    title: 'PLANCHE MASTERY & FREESTANDING HSPU',
    category: 'Calisthenics',
    tier: 'Elite',
    durationMinutes: 62,
    caloriesBurned: 590,
    intensity: 'Extreme',
    intensityMeter: 97,
    accentColor: 'emerald',
    recommendedTime: 'Tuesday • 6:00 PM',
    protocolBadge: 'Full Planche & Straight-Arm Mastery',
    description: 'Elite gymnastic strength routine focusing on straight-arm scapular protraction, anterior deltoid torque, and hollow-body levers.',
    exercises: [
      { id: 'cal-e1', name: 'Full Planche Static Hold (Isometric)', targetMuscle: 'Straight-Arm Anterior Deltoids & Core', sets: 5, targetReps: '6-8s hold', weightKg: 0 },
      { id: 'cal-e2', name: 'Freestanding Handstand Push-Ups (Full ROM)', targetMuscle: 'Shoulder Power & Dynamic Balance', sets: 4, targetReps: '6-8', weightKg: 0 },
      { id: 'cal-e3', name: 'Full Front Lever Ice Cream Makers', targetMuscle: 'Latissimus Dorsi & Core Wall', sets: 4, targetReps: '6', weightKg: 0 },
      { id: 'cal-e4', name: 'Strict Bar Muscle-Up to Dip (Zero Kip)', targetMuscle: 'Explosive Pull-to-Push Transition', sets: 4, targetReps: '5', weightKg: 0 }
    ]
  },
  {
    id: 'cal-advance-muscleup',
    title: 'EXPLOSIVE BAR MUSCLE-UPS & STRADDLE LEVER',
    category: 'Calisthenics',
    tier: 'Advance',
    durationMinutes: 55,
    caloriesBurned: 530,
    intensity: 'High',
    intensityMeter: 87,
    accentColor: 'emerald',
    recommendedTime: 'Saturday • 10:00 AM',
    protocolBadge: 'Ring & Bar Kinetic Transitions',
    description: 'High-leverage gymnastic power building dynamic hip-to-bar drive, slow negative dips, and advanced ring stability.',
    exercises: [
      { id: 'cal-e5', name: 'Strict Bar Muscle-Ups (Chest-to-Bar Clearance)', targetMuscle: 'Lats, Traps & Triceps', sets: 4, targetReps: '6', weightKg: 0 },
      { id: 'cal-e6', name: 'Straddle Planche Leans on Parallettes', targetMuscle: 'Wrist & Anterior Shoulder Torque', sets: 4, targetReps: '12s hold', weightKg: 0 },
      { id: 'cal-e7', name: 'Weighted Ring Dips (+20kg Plate)', targetMuscle: 'Chest & Tricep Depressors', sets: 4, targetReps: '8', weightKg: 20 },
      { id: 'cal-e8', name: 'Straddle Front Lever Pulls', targetMuscle: 'Scapular Retraction & Core', sets: 3, targetReps: '6', weightKg: 0 }
    ]
  },
  {
    id: 'cal-intermediate-tuck',
    title: 'TUCK PLANCHE & PULL-OVER PROGRESSION',
    category: 'Calisthenics',
    tier: 'Intermediate',
    durationMinutes: 48,
    caloriesBurned: 450,
    intensity: 'High',
    intensityMeter: 76,
    accentColor: 'emerald',
    recommendedTime: 'Thursday • 5:30 PM',
    protocolBadge: 'Advanced Tuck & Ring Stabilization',
    description: 'Intermediate bodyweight calibration transitioning from foundational pulls to advanced straight-arm isometric levers.',
    exercises: [
      { id: 'cal-e9', name: 'Advanced Tuck Planche on Parallettes', targetMuscle: 'Anterior Shoulders & Serratus', sets: 4, targetReps: '15s hold', weightKg: 0 },
      { id: 'cal-e10', name: 'Wall-Assisted Handstand Push-Ups (Chest to Wall)', targetMuscle: 'Deltoid Pressing Architecture', sets: 4, targetReps: '8', weightKg: 0 },
      { id: 'cal-e11', name: 'L-Sit Pull-Ups (Strict Form)', targetMuscle: 'Lats & Lower Abdominals', sets: 4, targetReps: '8', weightKg: 0 },
      { id: 'cal-e12', name: 'Tuck Front Lever Isometric Hold', targetMuscle: 'Thoracic Chain & Posterior', sets: 3, targetReps: '15s hold', weightKg: 0 }
    ]
  },
  {
    id: 'cal-beginner-pullup-dip',
    title: 'BODYWEIGHT MASTERY: STRICT PULL & DIP',
    category: 'Calisthenics',
    tier: 'Beginner',
    durationMinutes: 40,
    caloriesBurned: 350,
    intensity: 'Moderate',
    intensityMeter: 60,
    accentColor: 'emerald',
    recommendedTime: 'Monday • 8:00 AM',
    protocolBadge: 'Full ROM Scapular Activation',
    description: 'Essential calisthenic pillar establishing dead-hang active scapular pull-ups, parallel bar dips, and hollow-body core holds.',
    exercises: [
      { id: 'cal-e13', name: 'Strict Bodyweight Pull-Ups (Dead Hang to Chin)', targetMuscle: 'Upper Back & Biceps', sets: 4, targetReps: '6-8', weightKg: 0 },
      { id: 'cal-e14', name: 'Parallel Bar Dips (Chest Forward Lean)', targetMuscle: 'Pecs & Triceps Extension', sets: 4, targetReps: '8-10', weightKg: 0 },
      { id: 'cal-e15', name: 'Hollow Body Isometric Rockers', targetMuscle: 'Pelvic Tilt & Deep Core', sets: 3, targetReps: '30s hold', weightKg: 0 },
      { id: 'cal-e16', name: 'Inverted Horizontal Bar Rows', targetMuscle: 'Rhomboids & Scapulae', sets: 3, targetReps: '10', weightKg: 0 }
    ]
  },

  // ==========================================
  // 4. ATHLETICS PROTOCOLS (Agility, Speed, Plyometrics)
  // ==========================================
  {
    id: 'ath-elite-explosive',
    title: 'ELITE DECELERATION & ELASTIC SSC PLYO',
    category: 'Athletics',
    tier: 'Elite',
    durationMinutes: 56,
    caloriesBurned: 620,
    intensity: 'Extreme',
    intensityMeter: 95,
    accentColor: 'amber',
    recommendedTime: 'Wednesday • 5:00 PM',
    protocolBadge: 'Elastic Stretch-Shortening Cycle',
    description: 'Pro athletic performance regimen utilizing depth drops to immediate vertical rebound and maximum velocity curve sprints.',
    exercises: [
      { id: 'ath-e1', name: 'Depth Jumps from 24" Box (Rebound <0.2s)', targetMuscle: 'Achilles Tendon Stiffness & Reactive Force', sets: 5, targetReps: '4', weightKg: 0 },
      { id: 'ath-e2', name: 'Trap Bar Deadlift Jump Shrugs', targetMuscle: 'Triple Extension Power (Ankle/Knee/Hip)', sets: 4, targetReps: '4 @ 40% 1RM', weightKg: 85 },
      { id: 'ath-e3', name: 'Curvilinear 30m Sprint Acceleration Drills', targetMuscle: 'Adductor Force & Lateral Drive', sets: 6, targetReps: '30m max sprint', weightKg: 0 },
      { id: 'ath-e4', name: 'Rotational Med Ball Scoop Slams against Concrete', targetMuscle: 'Transverse Core Power Transfer', sets: 4, targetReps: '6 each side', weightKg: 10 }
    ]
  },
  {
    id: 'ath-advance-speed-endurance',
    title: 'SPEED ENDURANCE & CONTRAST TRAINING',
    category: 'Athletics',
    tier: 'Advance',
    durationMinutes: 50,
    caloriesBurned: 560,
    intensity: 'High',
    intensityMeter: 86,
    accentColor: 'amber',
    recommendedTime: 'Friday • 4:30 PM',
    protocolBadge: 'Post-Activation Potentiation (PAP)',
    description: 'Neurological contrast pairing heavy strength loading with uninhibited ballistic movements to elicit maximum motor unit firing.',
    exercises: [
      { id: 'ath-e5', name: 'PAP PAIR: Heavy Half Squat + Max Hurdle Hops', targetMuscle: 'Quadriceps Potentiation', sets: 4, targetReps: '3 @ 85% + 5 Hops', weightKg: 150 },
      { id: 'ath-e6', name: 'Unilateral Lateral Bound to Stick (Deceleration)', targetMuscle: 'Gluteus Medius & Knee Stabilizers', sets: 3, targetReps: '6 each leg', weightKg: 0 },
      { id: 'ath-e7', name: 'Banded Broad Jumps for Maximum Distance', targetMuscle: 'Horizontal Force Vector Output', sets: 4, targetReps: '5', weightKg: 0 },
      { id: 'ath-e8', name: 'Repeated Sprint Shuttle 150m (Lactate Buffer)', targetMuscle: 'Anaerobic Fast-Twitch Capacity', sets: 4, targetReps: '150m shuttle', weightKg: 0 }
    ]
  },
  {
    id: 'ath-intermediate-agility',
    title: 'MULTI-DIRECTIONAL AGILITY & CODER DRILLS',
    category: 'Athletics',
    tier: 'Intermediate',
    durationMinutes: 45,
    caloriesBurned: 480,
    intensity: 'High',
    intensityMeter: 75,
    accentColor: 'amber',
    recommendedTime: 'Sunday • 10:00 AM',
    protocolBadge: 'Change-of-Direction (COD) Velocity',
    description: 'Dynamic change of direction programming addressing 5-10-5 pro agility tests, reactive cone footwork, and deceleration braking.',
    exercises: [
      { id: 'ath-e9', name: 'Pro Agility 5-10-5 Shuttle Drills', targetMuscle: 'Center of Mass Modulation & Ankle Plant', sets: 5, targetReps: '1 drill @ 100%', weightKg: 0 },
      { id: 'ath-e10', name: 'Dumbbell Bulgarian Split Squat Jumps', targetMuscle: 'Single-Leg Explosive Drive', sets: 3, targetReps: '6 each', weightKg: 12 },
      { id: 'ath-e11', name: 'Kettlebell Push Press Acceleration', targetMuscle: 'Ground Reaction Kinetic Chain', sets: 4, targetReps: '8', weightKg: 24 },
      { id: 'ath-e12', name: 'Hexagon Agility Dot Drills', targetMuscle: 'Fast-Twitch Footwork & Neuromuscular Speed', sets: 4, targetReps: '30s', weightKg: 0 }
    ]
  },
  {
    id: 'ath-beginner-movement-prep',
    title: 'ATHLETIC MECHANICS & LINEAR ACCELERATION',
    category: 'Athletics',
    tier: 'Beginner',
    durationMinutes: 38,
    caloriesBurned: 360,
    intensity: 'Moderate',
    intensityMeter: 58,
    accentColor: 'amber',
    recommendedTime: 'Tuesday • 8:30 AM',
    protocolBadge: 'Wall Drills & Deceleration Base',
    description: 'Foundational athletic motor patterning including sprint posture wall drills, ankle stiffness pogo hops, and landing mechanics.',
    exercises: [
      { id: 'ath-e13', name: 'Sprint Posture Wall March & Switches (45° Lean)', targetMuscle: 'Hip Flexor Drive & Core Stiffness', sets: 4, targetReps: '10 switches', weightKg: 0 },
      { id: 'ath-e14', name: 'Low Box Step-Down & Single-Leg Landing Stick', targetMuscle: 'Knee Alignment & Deceleration Braking', sets: 3, targetReps: '8 each', weightKg: 0 },
      { id: 'ath-e15', name: 'Double Leg Ankling & Pogo Hops', targetMuscle: 'Gastrocnemius & Achilles Tendon Elasticity', sets: 3, targetReps: '25 hops', weightKg: 0 },
      { id: 'ath-e16', name: 'Medicine Ball Chest Pass against Solid Wall', targetMuscle: 'Upper Body Ballistic Power', sets: 4, targetReps: '10', weightKg: 6 }
    ]
  },

  // ==========================================
  // 5. HYPERTROPHY, STRENGTH, HIIT & CORE PROTOCOLS
  // ==========================================
  {
    id: 'cyber-hypertrophy-chest',
    title: 'CYBER HYPERTROPHY: CHEST & DELTS',
    category: 'Hypertrophy',
    tier: 'Advance',
    durationMinutes: 52,
    caloriesBurned: 520,
    intensity: 'High',
    intensityMeter: 84,
    accentColor: 'cyan',
    recommendedTime: 'Today • 6:30 PM',
    protocolBadge: 'Mechanical Tension & Stretch',
    description: 'High mechanical tension protocols targeted on clavicular pectoral fibers and lateral deltoid capping.',
    exercises: [
      { id: 'e1', name: 'Incline Dumbbell Press (30°)', targetMuscle: 'Upper Chest', sets: 4, targetReps: '8-10', weightKg: 38 },
      { id: 'e2', name: 'Barbell Flat Bench Press', targetMuscle: 'Mid Pectorals', sets: 4, targetReps: '6-8', weightKg: 105 },
      { id: 'e3', name: 'Cable Low-to-High Flyes', targetMuscle: 'Pectoral Squeeze', sets: 3, targetReps: '12-15', weightKg: 18 },
      { id: 'e4', name: 'Seated DB Lateral Raises (Strict)', targetMuscle: 'Lateral Deltoid', sets: 4, targetReps: '12-15', weightKg: 16 },
      { id: 'e5', name: 'Overhead Cable Tricep Extension', targetMuscle: 'Triceps Long Head', sets: 3, targetReps: '10-12', weightKg: 32 }
    ]
  },
  {
    id: 'titan-strength-compound',
    title: 'TITAN COMPOUND: SQUAT & DEADLIFT',
    category: 'Powerlifting',
    tier: 'Advance',
    durationMinutes: 65,
    caloriesBurned: 690,
    intensity: 'Extreme',
    intensityMeter: 91,
    accentColor: 'red',
    recommendedTime: 'Tomorrow • 7:00 AM',
    protocolBadge: 'IPF Standard • 82.5–85% 1RM Overload',
    description: 'Official IPF competition loaded working sets targeting posterior chain, quadriceps drive vectors, and Valsalva core bracing.',
    exercises: [
      { id: 'e6', name: 'Olympic Barbell Back Squat', targetMuscle: 'Quads & Glutes', sets: 5, targetReps: '5 @ 82.5% 1RM', weightKg: 152.5 },
      { id: 'e7', name: 'Conventional Heavy Deadlift', targetMuscle: 'Posterior Chain', sets: 4, targetReps: '4 @ 85.0% 1RM', weightKg: 182.5 },
      { id: 'e8', name: 'Bulgarian Split Squats', targetMuscle: 'Unilateral Quads', sets: 3, targetReps: '8 each', weightKg: 28 },
      { id: 'e9', name: 'Hanging Leg Raises (L-Sit)', targetMuscle: 'Rectus Abdominis', sets: 3, targetReps: '12', weightKg: 0 }
    ]
  },
  {
    id: 'neon-hiit-circuit',
    title: 'HIGH-VOLTAGE NEON HIIT CIRCUIT',
    category: 'HIIT',
    tier: 'Intermediate',
    durationMinutes: 32,
    caloriesBurned: 440,
    intensity: 'Extreme',
    intensityMeter: 89,
    accentColor: 'purple',
    recommendedTime: 'Saturday • 9:00 AM',
    protocolBadge: 'Tabata Anaerobic EPOC Spikes',
    description: 'Anaerobic metabolic conditioning using Tabata intervals designed for post-exercise oxygen consumption (EPOC).',
    exercises: [
      { id: 'e10', name: 'Echo Assault Bike Sprints', targetMuscle: 'Full Body Conditioning', sets: 6, targetReps: '30s max effort', weightKg: 0 },
      { id: 'e11', name: 'Heavy Kettlebell Swings', targetMuscle: 'Hips & Posterior', sets: 4, targetReps: '20', weightKg: 32 },
      { id: 'e12', name: 'Plyometric Plyo Box Jumps (30")', targetMuscle: 'Fast-Twitch Power', sets: 4, targetReps: '10', weightKg: 0 },
      { id: 'e13', name: 'Battle Rope Waves & Slams', targetMuscle: 'Shoulders & Core', sets: 4, targetReps: '45s', weightKg: 0 }
    ]
  },
  {
    id: 'titanium-core-matrix',
    title: 'TITANIUM CORE & OBLIQUES',
    category: 'Core',
    tier: 'Beginner',
    durationMinutes: 24,
    caloriesBurned: 220,
    intensity: 'Moderate',
    intensityMeter: 64,
    accentColor: 'purple',
    recommendedTime: 'Sunday • 11:00 AM',
    protocolBadge: 'Spinal Rigidity & Anti-Extension',
    description: 'Anti-extension and rotational isometric stabilization for bulletproof spine rigidity and shredded definition.',
    exercises: [
      { id: 'e14', name: 'Dragon Flags (Bruce Lee Form)', targetMuscle: 'Lower Abs & Core', sets: 4, targetReps: '6-8', weightKg: 0 },
      { id: 'e15', name: 'Cable Kneeling Woodchoppers', targetMuscle: 'Internal/External Obliques', sets: 3, targetReps: '12 each', weightKg: 25 },
      { id: 'e16', name: 'Weighted Abdominal Wheel Rollouts', targetMuscle: 'Anterior Core Wall', sets: 4, targetReps: '10', weightKg: 10 },
      { id: 'e17', name: 'Hollow Body Hold', targetMuscle: 'Transverse Abdominis', sets: 3, targetReps: '45s', weightKg: 0 }
    ]
  }
];

export const initialProfile: AthleteProfile = {
  name: 'RANA X',
  handle: '@ranax_athlete',
  rank: 'STARTER ATHLETE',
  level: 1,
  avatarUrl: 'https://raw.githubusercontent.com/ranadigitalhub/rana-x-assets/main/file_000000005f448211a3815d55509ba927.png',
  gender: 'male',
  weightKg: 86.4,
  targetWeightKg: 84.0,
  bodyFatPercent: 11.8,
  heightCm: 184,
  maxBenchKg: 60.0,
  maxDeadliftKg: 80.0,
  maxSquatKg: 70.0,
  totalWorkouts: 0,
  volumeLiftedTonnes: 0.0,
  mirrorGlowMode: 'high',
  hapticFeedback: true,
  audioCoaching: true,
  ipfWeightClass: 'Men -93 kg',
  ipfGlPoints: 0.0,
  totalXp: 0,
  auditTier: 'Starter Athlete',
  antiCheatStatus: 'VERIFIED',
  consecutiveMissedProtocols: 0,
  performanceDecayActive: false,
};

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'ai-intro-welcome',
    sender: 'ai',
    text: "Hey! RANA X Coach here. What are we locking in today—heavy SBD numbers, macro splits, or recovery protocol?",
    timestamp: 'Just now',
  },
];
