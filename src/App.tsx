import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  TabType,
  DailyActivity,
  WorkoutRoutine,
  StructuredDietPlan,
  FormAnalysisTelemetry,
  OneRepMaxPrediction,
  AthleteProfile,
  SystemNotification,
  WearableSyncTelemetry,
} from './types';
import { initialDailyActivity, sampleWorkouts, initialChatMessages, initialProfile } from './data/mockFitnessData';
import { PhoneFrame } from './components/PhoneFrame';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardScreen } from './screens/DashboardScreen';
import { VideoSplashScreen } from './components/VideoSplashScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CyberSkeletonLoader } from './components/CyberSkeletonLoader';
import {
  applyGlowIntensity,
  getStoredDynamicsConfig,
  triggerHaptic,
  HAPTIC_PATTERNS,
} from './utils/interfaceDynamics';
import {
  calculateWorkoutXp,
  calculateLevelMetrics,
  recordWorkoutSessionLog,
  auditAthleteTelemetry,
  formatDynamicHandle,
} from './utils/telemetryEngine';
import { getStoredWearableTelemetry } from './utils/wearableBridge';

// Lazy-loaded heavy off-screen modules & modals
const WorkoutsScreen = lazy(() =>
  import('./screens/WorkoutsScreen').then((m) => ({ default: m.WorkoutsScreen }))
);
const AiCoachScreen = lazy(() =>
  import('./screens/AiCoachScreen').then((m) => ({ default: m.AiCoachScreen }))
);
const ProfileScreen = lazy(() =>
  import('./screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen }))
);
const ActiveWorkoutModal = lazy(() =>
  import('./components/ActiveWorkoutModal').then((m) => ({ default: m.ActiveWorkoutModal }))
);
const NotificationCenter = lazy(() =>
  import('./components/NotificationCenter').then((m) => ({ default: m.NotificationCenter }))
);
const WearableSyncModal = lazy(() =>
  import('./components/WearableSyncModal').then((m) => ({ default: m.WearableSyncModal }))
);

const STORAGE_KEY_ACTIVITY = 'rana_daily_activity_v2';
const STORAGE_KEY_PROFILE = 'rana_athlete_profile_v2';
const STORAGE_KEY_NOTIFICATIONS = 'rana_system_notifications_v2';

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'SBD Peak Protocol Ready',
    message: 'Coach calibrated your Deadlift peak week numbers (+5kg estimated 1RM jump).',
    timestamp: '5m ago',
    category: 'PROTOCOL',
    read: false,
    actionTab: 'workouts',
    actionLabel: 'View Workout Routine',
  },
  {
    id: 'notif-2',
    title: 'AI Coach: New Macro Targets',
    message: 'Targeting 210g protein & 340g carbs based on your current high-volume training block.',
    timestamp: '25m ago',
    category: 'COACH',
    read: false,
    actionTab: 'coach',
    actionLabel: 'Open AI Coach',
  },
  {
    id: 'notif-3',
    title: 'Tier II Cyber Master Unlocked',
    message: 'Neural Telemetry sync verified. Anti-cheat integrity verified at 100%.',
    timestamp: '1h ago',
    category: 'CYBER',
    read: false,
    actionTab: 'profile',
    actionLabel: 'View Audit Profile',
  },
  {
    id: 'notif-4',
    title: 'Hardware BLE Beacon',
    message: 'No wearable device connected. Pair your smartwatch or HRM band for live heart rate telemetry.',
    timestamp: '2h ago',
    category: 'HARDWARE',
    read: true,
    actionLabel: 'Pair Wearable Sensor',
  },
  {
    id: 'notif-5',
    title: 'Streak Check-In Reminder',
    message: "Lock in today's active session to keep your workout streak burning hot.",
    timestamp: '4h ago',
    category: 'STREAK',
    read: true,
    actionTab: 'dashboard',
    actionLabel: 'Check Dashboard',
  },
];

const ENABLE_SPLASH = true;
const SPLASH_SESSION_KEY = 'hasSeenSplash';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (!ENABLE_SPLASH) return false;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const hasSeen = sessionStorage.getItem(SPLASH_SESSION_KEY);
        if (hasSeen) {
          return false;
        }
      } catch (e) {
        console.warn('sessionStorage check error:', e);
      }
    }
    return true;
  });
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Daily activity state with persistence
  const [activity, setActivity] = useState<DailyActivity>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved activity:', e);
    }
    return initialDailyActivity;
  });

  // Athlete profile state with persistence (defaults to Level 1, 0 XP, Starter Athlete)
  const [profile, setProfile] = useState<AthleteProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If an old legacy profile with 88750 XP / Level 28 without real records is detected, reset to Level 1
        if (parsed && (parsed.totalXp === 88750 || (parsed.level === 28 && parsed.totalWorkouts === 214))) {
          return initialProfile;
        }
        const liveLevel = parsed.level || 1;
        const dynamicHandle = formatDynamicHandle(parsed.handle || parsed.name || 'ranax', liveLevel, parsed.auditTier);
        return {
          ...parsed,
          handle: dynamicHandle,
        };
      }
    } catch (e) {
      console.error('Failed to parse saved profile:', e);
    }
    return initialProfile;
  });

  // System notifications state with persistence
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved notifications:', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState(false);
  const [wearableTelemetry, setWearableTelemetry] = useState<WearableSyncTelemetry>(getStoredWearableTelemetry);

  const [savedDietPlan, setSavedDietPlan] = useState<StructuredDietPlan | null>(null);
  const [isFrameEnabled, setIsFrameEnabled] = useState<boolean>(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize global glow intensity and aura settings from local storage
  useEffect(() => {
    const config = getStoredDynamicsConfig();
    applyGlowIntensity(config.glowIntensity);
  }, []);

  // Pre-load off-screen lazy modules in background while splash plays
  useEffect(() => {
    const prefetchModules = () => {
      import('./screens/WorkoutsScreen');
      import('./screens/AiCoachScreen');
      import('./screens/ProfileScreen');
      import('./components/ActiveWorkoutModal');
      import('./components/NotificationCenter');
      import('./components/WearableSyncModal');
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetchModules);
      } else {
        setTimeout(prefetchModules, 1000);
      }
    }
  }, []);

  // Listen for global cyber toast notifications (e.g. ElevenLabs fallback or system alerts)
  useEffect(() => {
    let timeoutId: any = null;
    const handleCyberToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; duration?: number }>;
      if (customEvent.detail?.message) {
        setToastMessage(customEvent.detail.message);
        const duration = customEvent.detail.duration || 3800;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setToastMessage((prev) => (prev === customEvent.detail.message ? null : prev));
        }, duration);
      }
    };
    window.addEventListener('ranax_cyber_toast', handleCyberToast);
    return () => {
      window.removeEventListener('ranax_cyber_toast', handleCyberToast);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Auto-persist activity to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(activity));
    } catch (e) {
      console.error('Failed to save activity to localStorage:', e);
    }
  }, [activity]);

  // Auto-persist profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage:', e);
    }
  }, [profile]);

  // Auto-persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  // Refresh wearable telemetry whenever wearable modal opens or closes
  useEffect(() => {
    setWearableTelemetry(getStoredWearableTelemetry());
  }, [isWearableModalOpen]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  }, []);

  const handleQuickLogCalorie = useCallback((amount: number) => {
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    setActivity((prev) => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + amount,
    }));
    showToast(`Logged +${amount} kcal to Cyber Matrix`);
  }, [showToast]);

  const handleQuickLogMinutes = useCallback((minutes: number) => {
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    setActivity((prev) => ({
      ...prev,
      activeMinutes: prev.activeMinutes + minutes,
    }));
    showToast(`Logged +${minutes} active minutes`);
  }, [showToast]);

  const handleQuickLogWater = useCallback((liters: number) => {
    triggerHaptic(liters > 0 ? HAPTIC_PATTERNS.TAP : HAPTIC_PATTERNS.TOGGLE);
    setActivity((prev) => {
      const nextVal = Math.max(0, Math.round((prev.waterIntakeLiters + liters) * 100) / 100);
      return {
        ...prev,
        waterIntakeLiters: nextVal,
      };
    });
    if (liters > 0) {
      showToast(`Hydration logged +${(liters * 1000).toFixed(0)} ml`);
    } else {
      showToast(`Hydration adjusted -${(Math.abs(liters) * 1000).toFixed(0)} ml`);
    }
  }, [showToast]);

  const handleIncrementStreak = useCallback(() => {
    triggerHaptic(HAPTIC_PATTERNS.SET_FINISH);
    setActivity((prev) => ({
      ...prev,
      workoutStreakDays: prev.workoutStreakDays + 1,
    }));
    showToast(`🔥 Workout streak checked-in! Now ${activity.workoutStreakDays + 1} days!`);
  }, [activity.workoutStreakDays, showToast]);

  const handleUpdateActivity = useCallback((updated: DailyActivity) => {
    setActivity(updated);
  }, []);

  const handleStartWorkout = useCallback((workout: WorkoutRoutine) => {
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    setActiveWorkout(workout);
  }, []);

  const handleFinishWorkout = useCallback((
    workout: WorkoutRoutine,
    caloriesBurned: number,
    sessionTonnageKg: number = 2400,
    finishedSets: number = 15,
    totalSets: number = 15
  ) => {
    // 1. Calculate XP earned using dynamic progression algorithm
    const { totalXp: xpEarned } = calculateWorkoutXp(workout, finishedSets, totalSets, sessionTonnageKg);

    // 2. Persist session log to telemetry history
    const sessionLog = {
      id: `log-${Date.now()}`,
      workoutId: workout.id,
      workoutTitle: workout.title,
      category: workout.category,
      tier: workout.tier || 'Intermediate',
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      durationMinutes: workout.durationMinutes,
      caloriesBurned,
      totalSets,
      completedSets: finishedSets,
      completionRatePercent: totalSets > 0 ? Math.round((finishedSets / totalSets) * 1000) / 10 : 100,
      totalTonnageKg: sessionTonnageKg,
      avgReps: 5,
      xpEarned,
    };
    recordWorkoutSessionLog(sessionLog);

    // 3. Update Activity Metrics
    setActivity((prev) => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + caloriesBurned,
      activeMinutes: prev.activeMinutes + workout.durationMinutes,
      completedWorkoutsToday: prev.completedWorkoutsToday + 1,
    }));

    // 4. Update Profile XP & Auto-Recalculate Dynamic Rank / Level / Audit Tier
    setProfile((prev) => {
      const currentXp = prev.totalXp ?? (prev.level * 2000 - 1500);
      const newTotalXp = currentXp + xpEarned;
      const { level: newLevel, rank: newRank } = calculateLevelMetrics(newTotalXp);
      const newTotalWorkouts = prev.totalWorkouts + 1;
      const newVolumeTonnes = Math.round((prev.volumeLiftedTonnes + sessionTonnageKg / 1000) * 100) / 100;

      // Run telemetry anti-cheat audit on the live updated values
      const telemetryAudit = auditAthleteTelemetry(
        newTotalXp,
        newLevel,
        newTotalWorkouts,
        newVolumeTonnes,
        prev.weightKg || 80,
        prev.maxBenchKg || 60,
        prev.maxSquatKg || 70,
        prev.maxDeadliftKg || 80,
        prev.antiCheatStatus || 'VERIFIED'
      );

      const dynamicHandle = formatDynamicHandle(prev.handle || prev.name || 'ranax', newLevel, telemetryAudit.auditTier);

      return {
        ...prev,
        totalXp: newTotalXp,
        level: newLevel,
        rank: newRank,
        handle: dynamicHandle,
        auditTier: telemetryAudit.auditTier,
        antiCheatStatus: telemetryAudit.antiCheatStatus,
        totalWorkouts: newTotalWorkouts,
        volumeLiftedTonnes: newVolumeTonnes,
      };
    });

    setActiveWorkout(null);
    triggerHaptic(HAPTIC_PATTERNS.LEVEL_UP);
    showToast(`⚡ Combat Mission Complete! +${xpEarned} XP • +${caloriesBurned} kcal`);
  }, [showToast]);

  const handleApplyDietPlan = useCallback((plan: StructuredDietPlan) => {
    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    setSavedDietPlan(plan);
    showToast(`🥗 Applied AI Nutrition: ${plan.title} (${plan.dailyCalories} kcal)`);
  }, [showToast]);

  const handleSaveDietToProfile = useCallback((plan: StructuredDietPlan) => {
    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    setSavedDietPlan(plan);
    showToast(`💾 Saved "${plan.title}" to Cyber Profile & synced macros.`);
  }, [showToast]);

  const handleApplyFormFix = useCallback((fix: FormAnalysisTelemetry) => {
    triggerHaptic(HAPTIC_PATTERNS.TOGGLE);
    showToast(`🎯 Form Cue Calibrated: ${fix.exerciseName} (${fix.detectedIssue})`);
  }, [showToast]);

  const handleApply1RMPrediction = useCallback((pred: OneRepMaxPrediction) => {
    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    setProfile((prev) => {
      const exerciseKey = pred.exercise.toLowerCase();
      const updated = { ...prev };
      if (exerciseKey.includes('bench')) {
        updated.maxBenchKg = pred.estimated1RM;
      } else if (exerciseKey.includes('squat')) {
        updated.maxSquatKg = pred.estimated1RM;
      } else if (exerciseKey.includes('deadlift')) {
        updated.maxDeadliftKg = pred.estimated1RM;
      }
      return updated;
    });
    showToast(`🚀 New 1RM Calibrated: ${pred.exercise} -> ${pred.estimated1RM}kg (${pred.formula})`);
  }, [showToast]);

  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All system notifications marked as read');
  }, [showToast]);

  const handleClearAllNotifications = useCallback(() => {
    setNotifications([]);
    showToast('All notifications cleared');
  }, [showToast]);

  const handleDismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const isHardwareConnected = Boolean(wearableTelemetry.activeDevice && wearableTelemetry.activeDevice.connected);
  const hardwareDeviceName = isHardwareConnected ? wearableTelemetry.activeDevice?.name || null : null;

  const handleSplashComplete = useCallback(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
      } catch (e) {
        console.warn('sessionStorage setItem error:', e);
      }
    }
    setShowSplash(false);
  }, []);

  return (
    <>
      {ENABLE_SPLASH && showSplash && (
        <VideoSplashScreen onComplete={handleSplashComplete} />
      )}
      <div className="w-full h-full min-h-screen flex flex-col flex-1">
        <PhoneFrame
          isFrameEnabled={isFrameEnabled}
          onToggleFrame={() => setIsFrameEnabled(!isFrameEnabled)}
        >
          {/* Top Application Header with Hardware Sync & Interactive Notifications */}
          <Header
            currentTab={currentTab}
            onOpenNotifications={() => setIsNotificationCenterOpen(true)}
            onOpenHardwareSync={() => setIsWearableModalOpen(true)}
            unreadNotificationsCount={unreadCount}
            isHardwareConnected={isHardwareConnected}
            hardwareDeviceName={hardwareDeviceName}
          />

          {/* Screen Router wrapped in ErrorBoundary and Suspense */}
          <main className="flex-1 flex flex-col relative overflow-hidden">
            <ErrorBoundary fallbackTitle="Module Telemetry Error">
              <Suspense fallback={<CyberSkeletonLoader label="CALIBRATING NEURAL MODULE..." />}>
                {currentTab === 'dashboard' && (
                  <DashboardScreen
                    activity={activity}
                    onQuickLogCalorie={handleQuickLogCalorie}
                    onQuickLogMinutes={handleQuickLogMinutes}
                    onQuickLogWater={handleQuickLogWater}
                    onIncrementStreak={handleIncrementStreak}
                    onUpdateActivity={handleUpdateActivity}
                    nextWorkout={sampleWorkouts[0]}
                    onStartWorkout={handleStartWorkout}
                    onNavigateTab={(tab) => setCurrentTab(tab)}
                    profile={profile}
                  />
                )}

                {currentTab === 'workouts' && (
                  <WorkoutsScreen
                    onStartWorkout={handleStartWorkout}
                    profile={profile}
                  />
                )}

                {currentTab === 'coach' && (
                  <AiCoachScreen
                    initialMessages={initialChatMessages}
                    onStartWorkoutFromCoach={handleStartWorkout}
                    onApplyDietPlan={handleApplyDietPlan}
                    onSaveDietToProfile={handleSaveDietToProfile}
                    onApplyFormFix={handleApplyFormFix}
                    onApply1RMPrediction={handleApply1RMPrediction}
                  />
                )}

                {currentTab === 'profile' && (
                  <ProfileScreen
                    profile={profile}
                    savedDietPlan={savedDietPlan}
                    onUpdateProfile={(updated) => setProfile(updated)}
                  />
                )}
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* Floating Glassmorphism-Styled Bottom Navigation Bar - Only rendered when splash screen is inactive */}
          {!showSplash && (
            <Navigation
              currentTab={currentTab}
              onSelectTab={(tab) => {
                triggerHaptic(HAPTIC_PATTERNS.TAP);
                setCurrentTab(tab);
              }}
            />
          )}

          {/* Interactive System Notification Center */}
          <Suspense fallback={null}>
            <NotificationCenter
              isOpen={isNotificationCenterOpen}
              onClose={() => setIsNotificationCenterOpen(false)}
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onClearAll={handleClearAllNotifications}
              onDismissNotification={handleDismissNotification}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenWearableModal={() => setIsWearableModalOpen(true)}
            />
          </Suspense>

          {/* Hardware Wearable Synchronization Modal */}
          <Suspense fallback={null}>
            <WearableSyncModal
              isOpen={isWearableModalOpen}
              onClose={() => {
                setIsWearableModalOpen(false);
                setWearableTelemetry(getStoredWearableTelemetry());
              }}
              activity={activity}
              onUpdateActivity={handleUpdateActivity}
            />
          </Suspense>

          {/* Active Workout Combat Tracker Modal */}
          {activeWorkout && (
            <Suspense fallback={<CyberSkeletonLoader label="ENGAGING ACTIVE COMBAT MATRIX..." />}>
              <ActiveWorkoutModal
                workout={activeWorkout}
                onClose={() => setActiveWorkout(null)}
                onFinishWorkout={handleFinishWorkout}
              />
            </Suspense>
          )}

          {/* Toast Notification with Dark Cyber Neon Styling & Cyan Borders */}
          {toastMessage && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] max-w-[92vw] px-4 py-2.5 rounded-xl bg-[#090D14]/95 backdrop-blur-2xl border border-[#00F0FF]/80 text-[#E0F7FA] text-xs font-mono font-bold tracking-wide shadow-[0_0_25px_rgba(0,240,255,0.45)] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none select-none" style={{ transform: 'translateZ(0)' }}>
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_8px_#00F0FF] shrink-0" />
              <span className="leading-snug text-center">{toastMessage}</span>
            </div>
          )}
        </PhoneFrame>
      </div>
    </>
  );
};

export default App;
