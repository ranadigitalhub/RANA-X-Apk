import React, { useState, useRef, useCallback, memo } from 'react';
import { AthleteProfile, StructuredDietPlan } from '../types';
import { initialProfile } from '../data/mockFitnessData';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import { AvatarSourceModal } from '../components/AvatarSourceModal';
import { CyberAvatarPreset } from '../data/presetAvatars';
import {
  classifyAthleteIpf,
  IpfDivision,
  getIpfWeightClass,
  IPF_MEN_WEIGHT_CLASSES,
  IPF_WOMEN_WEIGHT_CLASSES,
} from '../utils/ipfStandards';
import {
  GlowIntensityMode,
  VoiceProfileId,
  VOICE_PROFILES,
  getStoredDynamicsConfig,
  getStoredVoiceProfile,
  setStoredVoiceProfile,
  applyGlowIntensity,
  setStoredHaptic,
  setStoredVibration,
  setStoredHapticSound,
  setStoredVoice,
  triggerHaptic,
  speakAiVoiceAlert,
  speakAiPrompt,
  stopAllVoicePlayback,
  HAPTIC_PATTERNS,
} from '../utils/interfaceDynamics';
import {
  getPrestigeTitle,
  calculateLevelMetrics,
  validatePrCalibration,
  auditAthleteTelemetry,
  getStoredWorkoutLogs,
  recordWorkoutSessionLog,
  formatDynamicHandle,
  WorkoutSessionLog,
  DailyAuditReport,
} from '../utils/telemetryEngine';
import {
  Dumbbell,
  Sparkles,
  Zap,
  Camera,
  Check,
  Palette,
  Upload,
  RefreshCw,
  Sliders,
  Shield,
  Trophy,
  Pencil,
  Award,
  TrendingUp,
  Activity,
  ArrowRight,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Flame,
  BarChart3,
  RotateCcw,
  Clock,
  Volume2,
  Link2,
  X,
} from 'lucide-react';

interface ProfileScreenProps {
  profile?: AthleteProfile;
  savedDietPlan?: StructuredDietPlan | null;
  onUpdateProfile?: (updated: AthleteProfile) => void;
}

// Dynamically converts HSL to Hex #RRGGBB so alpha-hex styling (${activeColorHex}33, etc.) works across all CSS properties
export function hslToHex(h: number, s: number = 100, l: number = 50): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Intelligently infer anime/character/athlete name from uploaded asset filename or direct URL
export function inferCharacterNameFromAsset(filenameOrUrl: string): string | null {
  if (!filenameOrUrl) return null;
  // Get last path component or filename
  let segment = filenameOrUrl.split('?')[0].split('#')[0];
  segment = segment.substring(segment.lastIndexOf('/') + 1);
  // Remove image/video extensions
  segment = segment.replace(/\.(gif|png|jpe?g|webp|svg|bmp|avif|mp4|webm)$/i, '');
  // Decode URL percent-encoding
  try {
    segment = decodeURIComponent(segment);
  } catch {}
  // Strip common generic camera/screenshot prefixes and numeric random hashes
  segment = segment.replace(/^(IMG|DSC|PXL|Screenshot|Photo|image|file|giphy|avatar)[_\-\s\d]*/i, '');
  // Replace symbols/dashes with spaces
  segment = segment.replace(/[_\.\-+]/g, ' ').trim();
  // Strip trailing pure hash chunks (e.g. "a9f3b1c8")
  segment = segment.replace(/\s+[a-f0-9]{7,}$/i, '');
  // If pure numbers or too short
  if (!segment || segment.length < 2 || /^\d+$/.test(segment)) return null;

  // Title case words
  const words = segment.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const result = words.join(' ');
  return result.length >= 2 ? result : null;
}

export type UsernameFontOption = 'System' | 'Cyber' | 'Athletic' | 'Neon';

export interface FontConfig {
  id: UsernameFontOption;
  label: string;
  className: string;
  style: React.CSSProperties;
}

export const USERNAME_FONTS: FontConfig[] = [
  {
    id: 'System',
    label: 'System',
    className: 'font-sans font-black',
    style: { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  },
  {
    id: 'Cyber',
    label: 'Cyber',
    className: 'font-mono font-bold tracking-wider',
    style: { fontFamily: '"Share Tech Mono", "Courier New", monospace', letterSpacing: '0.08em' },
  },
  {
    id: 'Athletic',
    label: 'Athletic',
    className: 'uppercase tracking-widest font-black',
    style: { fontFamily: 'Impact, "Arial Black", "Teko", sans-serif', letterSpacing: '0.06em' },
  },
  {
    id: 'Neon',
    label: 'Neon',
    className: 'tracking-widest font-extrabold uppercase',
    style: { fontFamily: '"Orbitron", "Rajdhani", sans-serif', letterSpacing: '0.12em' },
  },
];

export const USERNAME_NEON_COLORS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Electric Cyan', hex: '#00F0FF' },
  { name: 'Toxic Green', hex: '#00E676' },
  { name: 'Hyper Yellow', hex: '#FFD600' },
  { name: 'Cyber Pink', hex: '#FF007F' },
  { name: 'Crimson Red', hex: '#FF1744' },
  { name: 'Neon Purple', hex: '#D500F9' },
  { name: 'Solar Orange', hex: '#FF6D00' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = memo(({
  profile: propProfile,
  savedDietPlan,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<AthleteProfile>(propProfile || initialProfile);
  // Continuous Hue Spectrum State (0 to 360 degrees, default 185° Electric Cyan)
  const [hueValue, setHueValue] = useState<number>(185);
  const primaryGlowColor = `hsl(${hueValue}, 100%, 50%)`;
  const activeColorHex = hslToHex(hueValue, 100, 50);

  const handleHueChange = (newHue: number) => {
    const clamped = Math.max(0, Math.min(360, Math.round(newHue)));
    setHueValue(clamped);
  };

  const storedDynamics = getStoredDynamicsConfig();
  const [glowMode, setGlowMode] = useState<GlowIntensityMode>(storedDynamics.glowIntensity);
  const [vibration, setVibration] = useState<boolean>(storedDynamics.vibrationFeedback);
  const [hapticSound, setHapticSound] = useState<boolean>(storedDynamics.hapticSound);
  const [audio, setAudio] = useState<boolean>(storedDynamics.aiVoiceAlerts);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfileId>(getStoredVoiceProfile);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const lastVoiceTriggerTimeRef = useRef<number>(0);

  // Apply active glow mode to CSS variables on initial render & Strict Mode voice cleanup
  React.useEffect(() => {
    applyGlowIntensity(glowMode);
    return () => {
      stopAllVoicePlayback();
    };
  }, []);

  const handleGlowModeChange = (mode: GlowIntensityMode) => {
    setGlowMode(mode);
    applyGlowIntensity(mode);
    const updated = { ...profile, mirrorGlowMode: mode };
    setProfile(updated);
    onUpdateProfile?.(updated);
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    showNotification(`Mirror Glow: ${mode.toUpperCase()} intensity applied across interface.`);
  };

  const handleToggleVibration = () => {
    const nextVal = !vibration;
    setVibration(nextVal);
    setStoredVibration(nextVal);
    const updated = { ...profile, vibrationFeedback: nextVal, hapticFeedback: nextVal || hapticSound };
    setProfile(updated);
    onUpdateProfile?.(updated);
    if (nextVal) {
      triggerHaptic(HAPTIC_PATTERNS.TOGGLE);
      showNotification('Vibration Feedback activated (tactile buzz).');
    } else {
      showNotification('Vibration Feedback disabled.');
    }
  };

  const handleToggleHapticSound = () => {
    const nextVal = !hapticSound;
    setHapticSound(nextVal);
    setStoredHapticSound(nextVal);
    const updated = { ...profile, hapticSound: nextVal, hapticFeedback: vibration || nextVal };
    setProfile(updated);
    onUpdateProfile?.(updated);
    if (nextVal) {
      triggerHaptic(HAPTIC_PATTERNS.TOGGLE);
      showNotification('Haptic Sound FX activated (audio click/thud).');
    } else {
      showNotification('Haptic Sound FX muted.');
    }
  };

  const handleToggleVoice = () => {
    const now = Date.now();
    if (now - lastVoiceTriggerTimeRef.current < 400) return;
    lastVoiceTriggerTimeRef.current = now;

    const nextVal = !audio;
    setAudio(nextVal);
    setStoredVoice(nextVal);
    const updated = { ...profile, audioCoaching: nextVal };
    setProfile(updated);
    onUpdateProfile?.(updated);
    if (nextVal) {
      triggerHaptic(HAPTIC_PATTERNS.TAP);
      const activeCfg = VOICE_PROFILES[voiceProfile] || VOICE_PROFILES.titan;
      speakAiVoiceAlert(`AI Voice Alerts online. ${activeCfg.samplePhrase}`, true, voiceProfile);
      showNotification('AI Voice Alerts enabled.');
    } else {
      stopAllVoicePlayback();
      showNotification('AI Voice Alerts muted.');
    }
  };

  const handleSelectVoiceProfile = (vId: VoiceProfileId) => {
    const now = Date.now();
    if (now - lastVoiceTriggerTimeRef.current < 350) return;
    lastVoiceTriggerTimeRef.current = now;

    setVoiceProfile(vId);
    setStoredVoiceProfile(vId);
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    const activeCfg = VOICE_PROFILES[vId] || VOICE_PROFILES.titan;
    speakAiVoiceAlert(`Voice profile set to ${activeCfg.name}. ${activeCfg.samplePhrase}`, true, vId);
    showNotification(`Voice profile switched to: ${activeCfg.name}`);
  };

  const handleTestVoiceAlert = async () => {
    const now = Date.now();
    if (now - lastVoiceTriggerTimeRef.current < 500 || isTestingVoice) return;
    lastVoiceTriggerTimeRef.current = now;

    setIsTestingVoice(true);
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    const activeCfg = VOICE_PROFILES[voiceProfile] || VOICE_PROFILES.titan;
    showNotification(`Testing voice: ${activeCfg.name}`);
    try {
      await speakAiVoiceAlert(`[RANA X System Alert] ${activeCfg.samplePhrase}`, true, voiceProfile);
    } finally {
      setTimeout(() => {
        setIsTestingVoice(false);
      }, 600);
    }
  };
  const [showAvatarSourceModal, setShowAvatarSourceModal] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>('');
  const hueTrackRef = useRef<HTMLDivElement>(null);

  // Username Editing State
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(profile.name || 'RANA X');
  const [usernameFont, setUsernameFont] = useState<UsernameFontOption>(() => {
    try {
      return (localStorage.getItem('rana_username_font') as UsernameFontOption) || 'System';
    } catch {
      return 'System';
    }
  });
  const [usernameColor, setUsernameColor] = useState<string>(() => {
    try {
      return localStorage.getItem('rana_username_color') || '#FFFFFF';
    } catch {
      return '#FFFFFF';
    }
  });

  // Sync prop updates if parent changes (e.g. 1RM prediction update from AI coach)
  React.useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
      if (!isEditingName) {
        setNameInput(propProfile.name);
      }
    }
  }, [propProfile, isEditingName]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      const updatedHandle = formatDynamicHandle(trimmed, levelMetrics.level, profile.auditTier);
      const updated = { ...profile, name: trimmed, handle: updatedHandle };
      setProfile(updated);
      onUpdateProfile?.(updated);
      try {
        localStorage.setItem('rana_username_font', usernameFont);
        localStorage.setItem('rana_username_color', usernameColor);
      } catch {}
      showNotification(`Username updated to ${trimmed} (${updatedHandle})`);
    } else {
      setNameInput(profile.name);
    }
    setIsEditingName(false);
  };

  const currentFontConfig =
    USERNAME_FONTS.find((f) => f.id === usernameFont) || USERNAME_FONTS[0];

  // IPF Division & Powerlifting Telemetry State
  const [ipfDivision, setIpfDivision] = useState<IpfDivision>(profile.gender || 'male');
  const [isEditingPrs, setIsEditingPrs] = useState<boolean>(false);
  const [draftBench, setDraftBench] = useState<string>(profile.maxBenchKg.toString());
  const [draftSquat, setDraftSquat] = useState<string>(profile.maxSquatKg.toString());
  const [draftDeadlift, setDraftDeadlift] = useState<string>(profile.maxDeadliftKg.toString());
  const [draftWeight, setDraftWeight] = useState<string>(profile.weightKg.toString());

  // Dynamic Level & Cyber Prestige Progression
  const currentTotalXp = profile.totalXp ?? 0;
  const levelMetrics = calculateLevelMetrics(currentTotalXp);

  // Real-time Anti-Cheat Validation on Live PR Editor Inputs
  const parsedDraftBench = parseFloat(draftBench) || profile.maxBenchKg;
  const parsedDraftSquat = parseFloat(draftSquat) || profile.maxSquatKg;
  const parsedDraftDeadlift = parseFloat(draftDeadlift) || profile.maxDeadliftKg;
  const parsedDraftWeight = parseFloat(draftWeight) || profile.weightKg;

  const antiCheatCheck = validatePrCalibration({
    weightKg: parsedDraftWeight,
    newBench: parsedDraftBench,
    newSquat: parsedDraftSquat,
    newDeadlift: parsedDraftDeadlift,
    currentBench: profile.maxBenchKg,
    currentSquat: profile.maxSquatKg,
    currentDeadlift: profile.maxDeadliftKg,
    gender: ipfDivision,
    volumeLiftedTonnes: profile.volumeLiftedTonnes,
    totalWorkouts: profile.totalWorkouts,
  });

  // Daily Telemetry Audit state
  const [missedDaysSimulated, setMissedDaysSimulated] = useState<number>(profile.consecutiveMissedProtocols || 0);
  const [lowWeightSimulated, setLowWeightSimulated] = useState<boolean>(profile.performanceDecayActive || false);
  const [auditReport, setAuditReport] = useState<DailyAuditReport>(() =>
    auditAthleteTelemetry(profile, missedDaysSimulated, lowWeightSimulated)
  );
  const [showTelemetryHistory, setShowTelemetryHistory] = useState<boolean>(false);
  const [storedLogs, setStoredLogs] = useState<WorkoutSessionLog[]>(getStoredWorkoutLogs);

  // Calculate live IPF classification and performance metrics
  const ipfData = classifyAthleteIpf(
    profile.weightKg,
    profile.maxSquatKg,
    profile.maxBenchKg,
    profile.maxDeadliftKg,
    ipfDivision
  );

  const handleToggleDivision = (newDiv: IpfDivision) => {
    setIpfDivision(newDiv);
    const classification = classifyAthleteIpf(
      profile.weightKg,
      profile.maxSquatKg,
      profile.maxBenchKg,
      profile.maxDeadliftKg,
      newDiv
    );
    const updated: AthleteProfile = {
      ...profile,
      gender: newDiv,
      ipfWeightClass: classification.weightClass.label,
      ipfGlPoints: classification.ipfGlPoints,
    };
    setProfile(updated);
    onUpdateProfile?.(updated);
    showNotification(`Switched to IPF ${newDiv === 'male' ? "Men's" : "Women's"} Division (${classification.weightClass.label})`);
  };

  const handleSaveIpfPrs = () => {
    const newBench = parseFloat(draftBench) || profile.maxBenchKg;
    const newSquat = parseFloat(draftSquat) || profile.maxSquatKg;
    const newDeadlift = parseFloat(draftDeadlift) || profile.maxDeadliftKg;
    const newWeight = parseFloat(draftWeight) || profile.weightKg;

    const validation = validatePrCalibration({
      weightKg: newWeight,
      newBench,
      newSquat,
      newDeadlift,
      currentBench: profile.maxBenchKg,
      currentSquat: profile.maxSquatKg,
      currentDeadlift: profile.maxDeadliftKg,
      gender: ipfDivision,
      volumeLiftedTonnes: profile.volumeLiftedTonnes,
      totalWorkouts: profile.totalWorkouts,
    });

    const classification = classifyAthleteIpf(newWeight, newSquat, newBench, newDeadlift, ipfDivision);
    const updatedHandle = formatDynamicHandle(profile.handle || profile.name, levelMetrics.level, classification.tier);

    const updated: AthleteProfile = {
      ...profile,
      handle: updatedHandle,
      auditTier: classification.tier,
      gender: ipfDivision,
      weightKg: Math.round(newWeight * 10) / 10,
      maxBenchKg: Math.round(newBench * 10) / 10,
      maxSquatKg: Math.round(newSquat * 10) / 10,
      maxDeadliftKg: Math.round(newDeadlift * 10) / 10,
      ipfWeightClass: classification.weightClass.label,
      ipfGlPoints: classification.ipfGlPoints,
      antiCheatStatus: validation.status,
      anomalyReason: validation.isValid ? null : validation.reasons.join(' • '),
    };

    setProfile(updated);
    onUpdateProfile?.(updated);
    setIsEditingPrs(false);

    if (!validation.isValid) {
      triggerHaptic(HAPTIC_PATTERNS.ALERT);
      speakAiPrompt('Warning: Physiological sanity check anomaly detected. Telemetry quarantined.', true);
      showNotification(`⚠️ ANOMALY FLAGGED: Telemetry quarantined pending verification through logged sets.`);
    } else {
      triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
      speakAiPrompt('Biometric calibration confirmed. IPF relative strength verified.', true);
      showNotification(`🛡️ IPF Calibrated: ${classification.weightClass.label} • ${classification.tier.toUpperCase()} TIER (${classification.relativeMultiplier}× BW)`);
    }
  };

  const handleClearAnomalyFlags = () => {
    const updated: AthleteProfile = {
      ...profile,
      antiCheatStatus: 'VERIFIED',
      anomalyReason: null,
    };
    setProfile(updated);
    onUpdateProfile?.(updated);
    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    showNotification('🛡️ Anti-Cheat flags cleared. Telemetry verified.');
  };

  const handleRunInstantAudit = () => {
    const logs = getStoredWorkoutLogs();
    setStoredLogs(logs);
    const newAudit = auditAthleteTelemetry(profile, missedDaysSimulated, lowWeightSimulated);
    setAuditReport(newAudit);
    const updatedHandle = formatDynamicHandle(profile.handle || profile.name, levelMetrics.level, newAudit.autoCorrectedTier);
    if (updatedHandle !== profile.handle || newAudit.autoCorrectedTier !== profile.auditTier) {
      const updated = {
        ...profile,
        handle: updatedHandle,
        auditTier: newAudit.autoCorrectedTier,
      };
      setProfile(updated);
      onUpdateProfile?.(updated);
    }
    triggerHaptic(HAPTIC_PATTERNS.TOGGLE);
    showNotification(`⚡ Daily Telemetry Audited: ${newAudit.completionRatePercent}% completion • ${updatedHandle}`);
  };

  const handleSimulateMissedProtocols = (days: number) => {
    setMissedDaysSimulated(days);
    const newAudit = auditAthleteTelemetry(profile, days, lowWeightSimulated);
    setAuditReport(newAudit);

    // Apply XP decay and downshift if decay condition active
    const currentXp = profile.totalXp ?? 0;
    const penalty = newAudit.decayPenaltyXp;
    const decayedXp = Math.max(0, currentXp - penalty);
    const newMetrics = calculateLevelMetrics(decayedXp);
    const updatedHandle = formatDynamicHandle(profile.handle || profile.name, newMetrics.level, newAudit.autoCorrectedTier);

    const updated: AthleteProfile = {
      ...profile,
      handle: updatedHandle,
      totalXp: decayedXp,
      level: newMetrics.level,
      rank: newMetrics.prestigeTitle,
      consecutiveMissedProtocols: days,
      performanceDecayActive: newAudit.decayRisk === 'ACTIVE_DOWNSHIFT',
      auditTier: newAudit.autoCorrectedTier,
    };
    setProfile(updated);
    onUpdateProfile?.(updated);
    triggerHaptic(HAPTIC_PATTERNS.ALERT);
    showNotification(
      `⚠️ REGRESSION ENFORCED: ${days} missed protocols. -${penalty} XP. Downshifted to LVL ${newMetrics.level} (${updatedHandle})!`
    );
  };

  const handleRestorePeakReadiness = () => {
    setMissedDaysSimulated(0);
    setLowWeightSimulated(false);
    const restoredXp = Math.max(0, profile.totalXp ?? 0);
    const metrics = calculateLevelMetrics(restoredXp);

    const updated: AthleteProfile = {
      ...profile,
      totalXp: restoredXp,
      level: metrics.level,
      rank: metrics.prestigeTitle,
      consecutiveMissedProtocols: 0,
      performanceDecayActive: false,
      antiCheatStatus: 'VERIFIED',
      anomalyReason: null,
    };
    const newAudit = auditAthleteTelemetry(updated, 0, false);
    updated.auditTier = newAudit.autoCorrectedTier;
    updated.handle = formatDynamicHandle(profile.handle || profile.name, metrics.level, newAudit.autoCorrectedTier);
    setAuditReport(newAudit);
    setProfile(updated);
    onUpdateProfile?.(updated);
    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    speakAiPrompt('Peak readiness restored. Athlete standing verified.', true);
    showNotification(`⚡ Peak Readiness Restored! LVL ${metrics.level} • ${updated.handle}`);
  };

  const handleResetToLevelOne = () => {
    setMissedDaysSimulated(0);
    setLowWeightSimulated(false);
    const updatedHandle = formatDynamicHandle(profile.handle || profile.name, 1, 'Starter Athlete');
    const updated: AthleteProfile = {
      ...profile,
      handle: updatedHandle,
      level: 1,
      totalXp: 0,
      rank: 'STARTER ATHLETE',
      auditTier: 'Starter Athlete',
      totalWorkouts: 0,
      volumeLiftedTonnes: 0.0,
      consecutiveMissedProtocols: 0,
      performanceDecayActive: false,
      antiCheatStatus: 'VERIFIED',
      anomalyReason: null,
    };
    const newAudit = auditAthleteTelemetry(updated, 0, false);
    setAuditReport(newAudit);
    setProfile(updated);
    onUpdateProfile?.(updated);
    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    speakAiPrompt('Profile reset to Level 1 Starter Athlete.', true);
    showNotification(`🛡️ Baseline Reset: Level 1 (0 XP) • Handle evolved to ${updatedHandle}`);
  };

  const showNotification = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  };

  // Profile Picture Upload Handler (Supports client-side image files, camera snaps, and gallery picks)
  const updateAvatarWithAsset = useCallback(
    (newUrl: string, assetHint?: string) => {
      const inferredName = assetHint ? inferCharacterNameFromAsset(assetHint) : null;
      setProfile((prev) => {
        let updatedName = prev.name;
        let updatedHandle = prev.handle;
        if (inferredName && inferredName.length >= 2 && inferredName.toLowerCase() !== 'athlete') {
          updatedName = inferredName;
          setNameInput(inferredName);
          updatedHandle = formatDynamicHandle(inferredName, levelMetrics.level, prev.auditTier);
        }
        const updated = {
          ...prev,
          avatarUrl: newUrl,
          name: updatedName,
          handle: updatedHandle,
        };
        onUpdateProfile?.(updated);
        return updated;
      });
      triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
      if (inferredName && inferredName.length >= 2 && inferredName.toLowerCase() !== 'athlete') {
        showNotification(`⚡ Avatar Calibrated! Character: ${inferredName}`);
      } else {
        showNotification('⚡ Custom Profile Photo Updated Successfully!');
      }
    },
    [onUpdateProfile, levelMetrics.level]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('⚠️ Please select a valid image file (PNG, JPG, WEBP, GIF)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newUrl = event.target.result as string;
          updateAvatarWithAsset(newUrl, file.name);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newUrl = event.target.result as string;
          updateAvatarWithAsset(newUrl, 'Live Camera Snapshot');
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleApplyAvatarUrl = () => {
    const trimmed = avatarUrlInput.trim();
    if (!trimmed) return;
    if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('data:') &&
      !trimmed.startsWith('blob:')
    ) {
      showNotification('⚠️ Please enter a valid URL starting with https://');
      return;
    }
    updateAvatarWithAsset(trimmed, trimmed);
    setAvatarUrlInput('');
  };

  const RANA_X_DEFAULT_LOGO =
    'https://raw.githubusercontent.com/ranadigitalhub/rana-x-assets/main/file_000000005f448211a3815d55509ba927.png';

  const handleResetAvatar = useCallback(() => {
    setProfile((prev) => {
      const updated = { ...prev, avatarUrl: RANA_X_DEFAULT_LOGO };
      onUpdateProfile?.(updated);
      return updated;
    });
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    showNotification('🛡️ Profile photo reset to official RANA X logo.');
  }, [onUpdateProfile]);

  const handleSelectPresetAvatar = useCallback(
    (preset: CyberAvatarPreset) => {
      setProfile((prev) => {
        const updated = {
          ...prev,
          avatarUrl: preset.url,
        };
        onUpdateProfile?.(updated);
        return updated;
      });
      triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
      showNotification('⚡ Profile photo updated.');
    },
    [onUpdateProfile]
  );

  return (
    <div className="flex-1 px-4 pb-28 pt-2 overflow-y-auto space-y-4 select-none bg-[#0A0A0A]">
      {/* Toast Notification for DP & Color updates */}
      {feedbackToast && (
        <div
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-fade-in border"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.95)',
            borderColor: activeColorHex,
            boxShadow: `0 0 20px ${activeColorHex}66`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: activeColorHex }}
          />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Interactive Avatar Source Modal (Professional Profile Customisation) */}
      <AvatarSourceModal
        isOpen={showAvatarSourceModal}
        onClose={() => setShowAvatarSourceModal(false)}
        currentAvatarUrl={profile.avatarUrl}
        athleteName={profile.name}
        activeColorHex={activeColorHex}
        onUploadFileClick={() => fileInputRef.current?.click()}
        onCameraCaptureClick={() => cameraInputRef.current?.click()}
        onSelectAvatar={handleSelectPresetAvatar}
        onResetAvatar={handleResetAvatar}
      />

      {/* Hidden Native File Input for Gallery / Local Files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />

      {/* Hidden Native File Input for Live Mobile Camera Snapshots */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleCameraChange}
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-hidden="true"
      />

      {/* ============================================================ */}
      {/* 1. PROFILE HEADER WITH SLEEK INTERACTIVE AVATAR RING         */}
      {/* ============================================================ */}
      <div className="pt-2 flex flex-col items-center text-center relative">
        <div className="relative group">
          {/* Glowing Aura Ring with Dynamic primaryGlowColor */}
          <div
            className="absolute -inset-2 rounded-full blur-lg opacity-70 transition-all duration-500 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${activeColorHex} 0%, rgba(10,10,10,0) 75%)`,
              filter: `drop-shadow(0 0 16px ${activeColorHex})`,
            }}
          />

          {/* Interactive Avatar Container - Clicking triggers clean calibration modal */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.TAP);
              setShowAvatarSourceModal(true);
            }}
            title="Click to calibrate profile photo (Upload / Camera / Web Link)"
            aria-label="Profile Avatar"
            className="relative w-28 h-28 rounded-full p-1 bg-[#0A0A0A] overflow-hidden transition-all duration-300 active:scale-95 hover:scale-105 cursor-pointer block border-2 z-10 group"
            style={{
              borderColor: activeColorHex,
              boxShadow: `0 0 25px ${activeColorHex}55`,
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <AnimatedAvatar
                url={profile.avatarUrl}
                alt="Athlete Profile Picture"
                fallbackText={profile.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Hover / Tap Quick Calibration Hint */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 backdrop-blur-[2px]">
                <Sparkles size={16} className="text-white drop-shadow-md animate-pulse" />
                <span className="text-[8px] font-mono font-black text-white uppercase tracking-wider">
                  CALIBRATE
                </span>
              </div>
            </div>
          </button>

          {/* Level Badge */}
          <div
            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0E0E12] text-[10px] font-black tracking-widest uppercase border z-20 transition-colors duration-300"
            style={{
              color: activeColorHex,
              borderColor: `${activeColorHex}88`,
              boxShadow: `0 0 10px ${activeColorHex}55`,
            }}
          >
            LVL {profile.level}
          </div>
        </div>

        {/* Header Titles with Editable Username */}
        {!isEditingName ? (
          <div className="flex items-center justify-center gap-2 mt-4 max-w-full px-2">
            <h2
              className={`text-xl sm:text-2xl font-black tracking-wider uppercase break-words text-center transition-all duration-300 ${currentFontConfig.className}`}
              style={{
                ...currentFontConfig.style,
                color: usernameColor,
                textShadow: `0 0 16px ${usernameColor}44`,
              }}
            >
              {profile.name}
            </h2>
            <button
              type="button"
              onClick={() => {
                setNameInput(profile.name);
                setIsEditingName(true);
              }}
              title="Edit username"
              aria-label="Edit username"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border transition-all duration-300 active:scale-95 group flex-shrink-0"
              style={{
                borderColor: `${activeColorHex}66`,
                boxShadow: `0 0 10px ${activeColorHex}44`,
              }}
            >
              <Pencil
                size={14}
                className="transition-transform group-hover:scale-110"
                style={{
                  color: activeColorHex,
                  filter: `drop-shadow(0 0 6px ${activeColorHex})`,
                }}
              />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5 mt-4 w-full max-w-md px-2 transition-all duration-300">
            {/* TextInput and Save button row */}
            <div className="flex items-center justify-center gap-2 w-full">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setNameInput(profile.name);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                placeholder="Enter athlete name"
                className={`flex-1 px-3 py-2 rounded-xl bg-black/80 border text-base sm:text-lg font-black tracking-wider uppercase focus:outline-none transition-all ${currentFontConfig.className}`}
                style={{
                  ...currentFontConfig.style,
                  color: usernameColor,
                  borderColor: activeColorHex,
                  boxShadow: `0 0 15px ${activeColorHex}55`,
                }}
              />
              <button
                type="button"
                onClick={handleSaveName}
                title="Save username"
                aria-label="Save username"
                className="px-3.5 py-2 rounded-xl text-black font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
                style={{
                  backgroundColor: activeColorHex,
                  boxShadow: `0 0 16px ${activeColorHex}88`,
                }}
              >
                <Check size={16} className="stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-wider">Save</span>
              </button>
            </div>

            {/* Sleek Glassmorphism Control Panel directly below TextInput */}
            <div
              className="w-full p-3.5 rounded-2xl bg-black/75 backdrop-blur-xl border shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 text-left"
              style={{
                borderColor: `${activeColorHex}40`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.85), 0 0 18px ${activeColorHex}25`,
              }}
            >
              {/* Horizontal Scrollable Font Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: activeColorHex }}
                    />
                    Font Selector
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: activeColorHex }}
                  >
                    {usernameFont}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                  {USERNAME_FONTS.map((fontItem) => {
                    const isSelected = usernameFont === fontItem.id;
                    return (
                      <button
                        key={fontItem.id}
                        type="button"
                        onClick={() => {
                          setUsernameFont(fontItem.id);
                          try {
                            localStorage.setItem('rana_username_font', fontItem.id);
                          } catch {}
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 border active:scale-95 ${
                          isSelected
                            ? 'bg-white/20 border-white/70 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                            : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                        } ${fontItem.className}`}
                        style={{
                          ...fontItem.style,
                          color: isSelected ? usernameColor : undefined,
                          borderColor: isSelected ? usernameColor : undefined,
                        }}
                      >
                        {fontItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mini Horizontal Text Color Picker (Isolated Neon Color Swatches) */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: usernameColor }}
                    />
                    Text Color (Isolated)
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{ color: usernameColor }}
                  >
                    {USERNAME_NEON_COLORS.find(
                      (c) => c.hex.toLowerCase() === usernameColor.toLowerCase()
                    )?.name || usernameColor}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {USERNAME_NEON_COLORS.map((c) => {
                    const isSelected =
                      usernameColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setUsernameColor(c.hex);
                          try {
                            localStorage.setItem('rana_username_color', c.hex);
                          } catch {}
                        }}
                        title={c.name}
                        aria-label={`Select ${c.name} text color`}
                        className={`relative rounded-full transition-all duration-200 flex-shrink-0 flex items-center justify-center active:scale-90 ${
                          isSelected
                            ? 'w-7 h-7 ring-2 ring-white scale-110 shadow-lg'
                            : 'w-6 h-6 hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: c.hex,
                          boxShadow: isSelected
                            ? `0 0 14px ${c.hex}`
                            : `0 0 6px ${c.hex}66`,
                        }}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-black/90 shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs font-mono font-bold tracking-wider transition-colors duration-300"
            style={{ color: activeColorHex }}
          >
            {formatDynamicHandle(profile.handle || profile.name, levelMetrics.level, profile.auditTier)}
          </span>
          <span className="text-neutral-600">•</span>
          <span
            className="text-xs font-black tracking-wider px-2 py-0.5 rounded border transition-colors duration-300"
            style={{
              color: levelMetrics.prestigeColor,
              borderColor: `${levelMetrics.prestigeColor}66`,
              backgroundColor: `${levelMetrics.prestigeColor}15`,
            }}
          >
            {levelMetrics.prestigeTitle}
          </span>
        </div>

        {/* Dynamic Progression & Cyber Prestige Level Engine Bar */}
        <div className="w-full max-w-sm mt-3 px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md shadow-lg space-y-1.5 text-left">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold flex items-center gap-1.5" style={{ color: levelMetrics.prestigeColor }}>
              <Sparkles size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
              LVL {levelMetrics.level} • {levelMetrics.prestigeTitle}
            </span>
            <span className="text-neutral-400 font-semibold">
              {levelMetrics.currentLevelXp.toLocaleString()} / {levelMetrics.xpForNextLevel.toLocaleString()} XP
            </span>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
            <div
              className="h-full rounded-full transition-all duration-700 relative shadow-sm"
              style={{
                width: `${levelMetrics.progressPercent}%`,
                background: `linear-gradient(90deg, ${activeColorHex}, ${levelMetrics.prestigeColor})`,
                boxShadow: `0 0 10px ${levelMetrics.prestigeColor}88`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
            <span>{levelMetrics.progressPercent}% to Level {levelMetrics.level + 1}</span>
            <span className="flex items-center gap-1">
              {profile.antiCheatStatus === 'FLAGGED_ANOMALY' || profile.antiCheatStatus === 'PENDING_VERIFICATION' ? (
                <span className="text-[#FFB300] font-bold flex items-center gap-0.5">
                  <AlertTriangle size={10} /> TELEMETRY QUARANTINED
                </span>
              ) : (
                <span className="text-[#00E676] font-bold flex items-center gap-0.5">
                  <Shield size={10} /> 100% TELEMETRY VERIFIED
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. IPF OFFICIAL TECHNICAL STANDARDS & 1-REP MAX TELEMETRY    */}
      {/* ============================================================ */}
      <div
        className="rounded-3xl p-4 sm:p-5 border shadow-glass-card space-y-4 transition-colors duration-300 relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          borderColor: `${activeColorHex}33`,
          boxShadow: `0 4px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${activeColorHex}15`,
        }}
      >
        {/* Header with IPF Technical Standards Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: activeColorHex, boxShadow: `0 0 10px ${activeColorHex}` }}
            />
            <div>
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-white font-mono">
                <Award size={15} style={{ color: activeColorHex }} />
                IPF Official Standards & Classification
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (!isEditingPrs) {
                  setDraftBench(profile.maxBenchKg.toString());
                  setDraftSquat(profile.maxSquatKg.toString());
                  setDraftDeadlift(profile.maxDeadliftKg.toString());
                  setDraftWeight(profile.weightKg.toString());
                }
                setIsEditingPrs(!isEditingPrs);
              }}
              className="px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider border transition-all flex items-center gap-1"
              style={{
                borderColor: `${activeColorHex}44`,
                backgroundColor: isEditingPrs ? `${activeColorHex}25` : 'rgba(255,255,255,0.05)',
                color: isEditingPrs ? '#FFFFFF' : activeColorHex,
              }}
            >
              <Pencil size={11} />
              {isEditingPrs ? 'CANCEL EDIT' : 'CALIBRATE SBD'}
            </button>
          </div>
        </div>

        {/* Division Selector Tabs: Men (IPF) vs Women (IPF) */}
        <div className="bg-black/40 p-1 rounded-2xl border border-white/5 flex items-center gap-1">
          <button
            onClick={() => handleToggleDivision('male')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              ipfDivision === 'male'
                ? 'bg-gradient-to-r from-[#00F0FF]/25 to-[#00A3FF]/25 text-white border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>MEN'S IPF DIVISION</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
              8 Classes
            </span>
          </button>

          <button
            onClick={() => handleToggleDivision('female')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              ipfDivision === 'female'
                ? 'bg-gradient-to-r from-[#FF1744]/25 to-[#FF0055]/25 text-white border border-[#FF1744]/40 shadow-[0_0_12px_rgba(255,23,68,0.2)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>WOMEN'S IPF DIVISION</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
              8 Classes
            </span>
          </button>
        </div>

        {/* Official Weight Class & Classification Hero Banner */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Assigned IPF Weight Class
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  {ipfData.weightClass.label}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  ({ipfData.weightClass.minBodyweight} – {ipfData.weightClass.maxBodyweight === 999 ? '∞' : `${ipfData.weightClass.maxBodyweight}.0`} kg)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                IPF Classification Tier
              </span>
              <span
                className={`inline-block mt-0.5 text-xs font-black font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                  ipfData.tier === 'Elite'
                    ? 'bg-[#FF1744]/20 text-[#FF1744] border-[#FF1744]/50 shadow-[0_0_10px_rgba(255,23,68,0.4)]'
                    : ipfData.tier === 'Advance'
                    ? 'bg-[#B026FF]/20 text-[#B026FF] border-[#B026FF]/50 shadow-[0_0_10px_rgba(176,38,255,0.4)]'
                    : ipfData.tier === 'Intermediate'
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 shadow-[0_0_10px_rgba(0,230,118,0.4)]'
                }`}
              >
                {ipfData.tier.toUpperCase()} ATHLETE
              </span>
            </div>
          </div>

          {/* Key Metric Pillars: SBD Total, Multiplier, GL Points */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">SBD TOTAL</span>
              <span className="text-lg font-black text-white font-mono">{ipfData.totalKg}</span>
              <span className="text-[9px] font-mono text-neutral-400 block">KG</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">RELATIVE STRENGTH</span>
              <span
                className="text-lg font-black font-mono"
                style={{ color: activeColorHex }}
              >
                {ipfData.relativeMultiplier}×
              </span>
              <span className="text-[9px] font-mono text-neutral-400 block">BODYWEIGHT</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">IPF GL SCORE</span>
              <span className="text-lg font-black text-[#00E676] font-mono">{ipfData.ipfGlPoints}</span>
              <span className="text-[9px] font-mono text-neutral-400 block">POINTS</span>
            </div>
          </div>

          {/* Next Tier Progression Meter */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-400">
                {ipfData.tier === 'Elite' ? (
                  <span className="text-[#00E676] font-bold">🏆 Maximum IPF Elite Benchmark Achieved</span>
                ) : (
                  <span>
                    Next Tier: <strong className="text-white">{ipfData.nextTierName}</strong> (+{ipfData.nextTierKgNeeded} kg needed on Total)
                  </span>
                )}
              </span>
              <span className="font-bold text-white">{ipfData.tierProgressPercent}%</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${ipfData.tierProgressPercent}%`,
                  backgroundColor: activeColorHex,
                  boxShadow: `0 0 8px ${activeColorHex}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Anti-Cheat Quarantine Alert Banner */}
        {profile.antiCheatStatus && profile.antiCheatStatus !== 'VERIFIED' && (
          <div className="p-3 rounded-2xl bg-[#FF1744]/15 border border-[#FF1744]/50 flex items-center justify-between gap-2 text-xs shadow-[0_0_15px_rgba(255,23,68,0.2)]">
            <div className="flex items-start gap-2.5">
              <AlertOctagon size={18} className="text-[#FF1744] flex-shrink-0 animate-pulse mt-0.5" />
              <div>
                <span className="font-black text-[#FF1744] uppercase tracking-wider block font-mono">
                  {profile.antiCheatStatus === 'PENDING_VERIFICATION'
                    ? '⚠️ TELEMETRY PENDING VERIFICATION'
                    : '🚨 UNVERIFIED SBD ANOMALY FLAGGED'}
                </span>
                <span className="text-[10px] text-neutral-300 block mt-0.5 leading-relaxed">
                  {profile.anomalyReason ||
                    'Sudden calibration jump quarantined. Official IPF Elite tier locked pending daily logged sets.'}
                </span>
              </div>
            </div>
            <button
              onClick={handleClearAnomalyFlags}
              className="px-2.5 py-1.5 rounded-xl bg-[#FF1744]/25 border border-[#FF1744]/50 text-white font-bold text-[10px] uppercase hover:bg-[#FF1744]/40 active:scale-95 flex-shrink-0 transition-all font-mono shadow-sm"
            >
              Clear & Re-verify
            </button>
          </div>
        )}

        {/* Quick PR & Bodyweight Editor (Accordion) */}
        {isEditingPrs && (
          <div className="p-4 rounded-2xl bg-black/80 border border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider block font-mono flex items-center gap-1.5">
                <Shield size={13} />
                Live IPF Calibration & Anti-Cheat Validator
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Max Safe: Bench ≤{antiCheatCheck.maxAllowedBench}kg • Squat ≤{antiCheatCheck.maxAllowedSquat}kg
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-semibold block mb-1">
                  Bodyweight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={draftWeight}
                  onChange={(e) => setDraftWeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-semibold block mb-1">
                  Squat 1RM (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={draftSquat}
                  onChange={(e) => setDraftSquat(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#FF1744]"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-semibold block mb-1">
                  Bench 1RM (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={draftBench}
                  onChange={(e) => setDraftBench(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-semibold block mb-1">
                  Deadlift 1RM (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={draftDeadlift}
                  onChange={(e) => setDraftDeadlift(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#B026FF]"
                />
              </div>
            </div>

            {/* Real-Time Anti-Cheat & Physiological Sanity Feedback */}
            <div
              className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                antiCheatCheck.isValid
                  ? 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]'
                  : antiCheatCheck.isSpikeDetected
                  ? 'bg-[#FFB300]/15 border-[#FFB300]/50 text-[#FFD54F]'
                  : 'bg-[#FF1744]/15 border-[#FF1744]/50 text-[#FF5252]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {antiCheatCheck.isValid ? (
                  <>
                    <CheckCircle2 size={14} className="text-[#00E676] flex-shrink-0" />
                    <span>SANCTIONED PHYSIOLOGICAL TELEMETRY: ALL RATIOS VERIFIED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle
                      size={14}
                      className={`flex-shrink-0 ${antiCheatCheck.isSpikeDetected ? 'text-[#FFB300]' : 'text-[#FF1744]'}`}
                    />
                    <span>
                      {antiCheatCheck.isSpikeDetected
                        ? 'UNVERIFIED SUDDEN JUMP: REQUIRES LOGGED WORKING SET HISTORY'
                        : 'PHYSIOLOGICAL CEILING BREACH DETECTED'}
                    </span>
                  </>
                )}
              </div>

              {!antiCheatCheck.isValid ? (
                <div className="mt-2 space-y-1 text-[10px] text-neutral-300">
                  {antiCheatCheck.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#FF1744] font-black">•</span>
                      <span className="leading-tight">{r}</span>
                    </div>
                  ))}
                  <div className="text-neutral-400 pt-1 text-[9px]">
                    Human theoretical thresholds for {parsedDraftWeight} kg BW: Bench ≤ {antiCheatCheck.maxAllowedBench} kg, Squat ≤ {antiCheatCheck.maxAllowedSquat} kg, Deadlift ≤ {antiCheatCheck.maxAllowedDeadlift} kg.
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-neutral-400">
                  Bench: {(parsedDraftBench / parsedDraftWeight).toFixed(2)}× BW • Squat: {(parsedDraftSquat / parsedDraftWeight).toFixed(2)}× BW • Deadlift: {(parsedDraftDeadlift / parsedDraftWeight).toFixed(2)}× BW. All within human physiological limits.
                </div>
              )}
            </div>

            {/* Anti-Cheat Quick Stress Testing Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
              <span className="text-neutral-400">Test Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setDraftBench('145');
                  setDraftSquat('190');
                  setDraftDeadlift('220');
                }}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#00E676] hover:bg-white/10"
              >
                Realistic (+2.5kg)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftBench('260'); // sudden spike
                }}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#FFB300] hover:bg-white/10"
              >
                Test Sudden Spike (+82%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftBench('380'); // exceeds theoretical ceiling
                }}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#FF1744] hover:bg-white/10"
              >
                Test Human Ceiling Breach
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-white/10">
              <button
                onClick={() => setIsEditingPrs(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIpfPrs}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-black transition-all ${
                  antiCheatCheck.isValid
                    ? 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-gradient-to-r from-[#FFB300] to-[#FF8F00] shadow-[0_0_12px_rgba(255,179,0,0.4)]'
                }`}
              >
                {antiCheatCheck.isValid ? 'Apply & Verify Telemetry' : 'Save as Quarantined Telemetry'}
              </button>
            </div>
          </div>
        )}

        {/* 3-Pillar 1-Rep Max Telemetry Grid with Relative Multipliers */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          {/* Bench Press Card */}
          <div
            className="p-3 rounded-2xl bg-white/[0.04] border transition-all duration-300 hover:scale-102"
            style={{
              borderColor: `${activeColorHex}44`,
              boxShadow: `0 0 12px ${activeColorHex}10`,
            }}
          >
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">BENCH PRESS</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {profile.maxBenchKg}
            </span>
            <span
              className="text-[10px] font-bold block transition-colors duration-300 font-mono"
              style={{ color: activeColorHex }}
            >
              {ipfData.benchMultiplier}× BW
            </span>
            <span className="mt-1 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-neutral-300 block">
              {ipfData.benchTier}
            </span>
          </div>

          {/* Squat Card */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-[#FF1744]/30 transition-all duration-300 hover:scale-102">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">BACK SQUAT</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {profile.maxSquatKg}
            </span>
            <span className="text-[10px] text-[#FF1744] font-bold block font-mono">
              {ipfData.squatMultiplier}× BW
            </span>
            <span className="mt-1 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-neutral-300 block">
              {ipfData.squatTier}
            </span>
          </div>

          {/* Deadlift Card */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-[#B026FF]/30 transition-all duration-300 hover:scale-102">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase">DEADLIFT</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {profile.maxDeadliftKg}
            </span>
            <span className="text-[10px] text-[#B026FF] font-bold block font-mono">
              {ipfData.deadliftMultiplier}× BW
            </span>
            <span className="mt-1 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-neutral-300 block">
              {ipfData.deadliftTier}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2.5 ADAPTIVE TELEMETRY, PROGRESSION & INTEGRITY MATRIX       */}
      {/* Dynamic progression/regression engine & daily audit system   */}
      {/* ============================================================ */}
      <div
        className="rounded-3xl p-4 border space-y-4 transition-all duration-300 relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          borderColor:
            auditReport.decayRisk === 'ACTIVE_DOWNSHIFT'
              ? 'rgba(255, 23, 68, 0.5)'
              : `${activeColorHex}55`,
          boxShadow:
            auditReport.decayRisk === 'ACTIVE_DOWNSHIFT'
              ? '0 0 25px rgba(255, 23, 68, 0.25)'
              : `0 0 25px ${activeColorHex}20`,
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity
              size={17}
              className={auditReport.decayRisk === 'ACTIVE_DOWNSHIFT' ? 'text-[#FF1744]' : 'text-[#00F0FF]'}
            />
            <div>
              <span className="text-xs font-black text-white uppercase tracking-wider block font-mono">
                ADAPTIVE TELEMETRY & INTEGRITY MATRIX
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                Dynamic Level Progression & Real-Time Sanity Audit
              </span>
            </div>
          </div>
          <span
            className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${
              auditReport.decayRisk === 'ACTIVE_DOWNSHIFT'
                ? 'bg-[#FF1744]/20 text-[#FF1744] border-[#FF1744]/50 animate-pulse'
                : 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50'
            }`}
          >
            {auditReport.decayRisk === 'ACTIVE_DOWNSHIFT' ? 'DECAY ACTIVE' : 'OPTIMAL CADENCE'}
          </span>
        </div>

        {/* 4 Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block flex items-center justify-center gap-1">
              <CheckCircle2 size={10} className="text-[#00F0FF]" /> COMPLETION RATE
            </span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">
              {auditReport.completionRatePercent}%
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">Elite req: ≥80%</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block flex items-center justify-center gap-1">
              <Flame size={10} className="text-[#FF1744]" /> TONNAGE SHIFTED
            </span>
            <span className="text-lg font-black text-[#FF1744] font-mono mt-0.5 block">
              {(auditReport.totalTonnageKg / 1000).toFixed(1)}t
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">Lifetime: {profile.volumeLiftedTonnes}t</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block flex items-center justify-center gap-1">
              <Zap size={10} className="text-[#FFD600]" /> REP FIDELITY
            </span>
            <span className="text-lg font-black text-[#FFD600] font-mono mt-0.5 block">
              {auditReport.avgRepFidelityPercent}%
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">Target execution</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block flex items-center justify-center gap-1">
              <Shield size={10} className="text-[#00E676]" /> AUDITED STANDING
            </span>
            <span
              className={`text-sm font-black font-mono mt-1 block uppercase px-1.5 py-0.5 rounded ${
                auditReport.autoCorrectedTier === 'Elite'
                  ? 'text-[#FF1744] bg-[#FF1744]/15'
                  : auditReport.autoCorrectedTier === 'Advance'
                  ? 'text-[#B026FF] bg-[#B026FF]/15'
                  : 'text-[#00F0FF] bg-[#00F0FF]/15'
              }`}
            >
              {auditReport.autoCorrectedTier}
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">Daily Auto-Certified</span>
          </div>
        </div>

        {/* Dynamic Standing & Performance Decay Notification */}
        <div
          className={`p-3 rounded-2xl border text-xs font-mono transition-all ${
            auditReport.decayRisk === 'ACTIVE_DOWNSHIFT'
              ? 'bg-[#FF1744]/15 border-[#FF1744]/50 text-[#FF5252]'
              : auditReport.decayRisk === 'MODERATE'
              ? 'bg-[#FFB300]/15 border-[#FFB300]/50 text-[#FFD54F]'
              : 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]'
          }`}
        >
          <div className="flex items-start gap-2">
            {auditReport.decayRisk === 'ACTIVE_DOWNSHIFT' ? (
              <AlertOctagon size={16} className="text-[#FF1744] flex-shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <Shield size={16} className="text-[#00E676] flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block uppercase tracking-wider">
                {auditReport.decayRisk === 'ACTIVE_DOWNSHIFT'
                  ? 'PERFORMANCE DECAY ENFORCED: TIER DOWNSHIFTED'
                  : 'ORGANIC ATHLETIC STANDING VERIFIED'}
              </span>
              <span className="text-[10px] text-neutral-300 block mt-0.5 leading-relaxed">
                {auditReport.tierStatusMessage}
              </span>
              {auditReport.decayRisk === 'ACTIVE_DOWNSHIFT' && (
                <span className="text-[10px] text-[#FF8A80] font-bold block mt-1">
                  Penalty: -{auditReport.decayPenaltyXp} XP Docked • True athletic capability reflects sustained cadence.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Dynamic Progression & Regression Engine Controls */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={13} style={{ color: activeColorHex }} />
              Progression & Regression Engine Controls
            </span>
            <span className="text-[10px] text-neutral-400">
              Missed Days: <strong className="text-white">{missedDaysSimulated}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleSimulateMissedProtocols(6)}
              className="px-2.5 py-2 rounded-xl bg-[#FF1744]/15 border border-[#FF1744]/40 hover:bg-[#FF1744]/25 text-[#FF5252] font-bold text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <AlertTriangle size={12} />
              Simulate 6 Missed Days
            </button>

            <button
              onClick={handleRestorePeakReadiness}
              className="px-2.5 py-2 rounded-xl bg-[#00E676]/15 border border-[#00E676]/40 hover:bg-[#00E676]/25 text-[#00E676] font-bold text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} />
              Restore Peak Readiness
            </button>

            <button
              onClick={handleResetToLevelOne}
              className="px-2.5 py-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 hover:bg-[#00F0FF]/25 text-[#00F0FF] font-bold text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Shield size={12} />
              Reset to Level 1 (0 XP)
            </button>

            <button
              onClick={handleRunInstantAudit}
              className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-bold text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} />
              Run Daily Audit
            </button>
          </div>
        </div>

        {/* Collapsible Telemetry History Logs Drawer */}
        <div className="border-t border-white/10 pt-2">
          <button
            onClick={() => setShowTelemetryHistory(!showTelemetryHistory)}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-neutral-400 hover:text-white transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 size={13} style={{ color: activeColorHex }} />
              Telemetry History ({storedLogs.length} Audited Protocols)
            </span>
            <span className="text-[10px] text-[#00F0FF]">
              {showTelemetryHistory ? 'Hide Logs ▲' : 'Show Logs ▼'}
            </span>
          </button>

          {showTelemetryHistory && (
            <div className="mt-2.5 space-y-2 max-h-60 overflow-y-auto pr-1 animate-in fade-in duration-200">
              {storedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-[11px] truncate max-w-[180px]">
                        {log.workoutTitle}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-neutral-400">
                        {log.tier}
                      </span>
                    </div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">
                      {log.dateStr} • {log.completedSets}/{log.totalSets} sets ({log.completionRatePercent}%) • {(log.totalTonnageKg / 1000).toFixed(1)}t
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-[#00F0FF] block">
                      +{log.xpEarned} XP
                    </span>
                    <span className="text-[9px] text-neutral-400 block font-mono">
                      {log.caloriesBurned} kcal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className="rounded-3xl p-4 border space-y-3.5 transition-all duration-300"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          borderColor: `${activeColorHex}55`,
          boxShadow: `0 0 25px ${activeColorHex}20`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={15} style={{ color: activeColorHex }} />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              NEON SPECTRUM & AESTHETICS
            </span>
          </div>
          <span
            className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-all duration-300 font-bold flex items-center gap-1.5"
            style={{
              color: activeColorHex,
              borderColor: activeColorHex,
              backgroundColor: `${activeColorHex}20`,
              boxShadow: `0 0 10px ${activeColorHex}40`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: activeColorHex }}
            />
            {hueValue}° HUE • {activeColorHex}
          </span>
        </div>

        {/* Continuous Color Spectrum Slider Container */}
        <div className="space-y-2.5 pt-1 pb-1">
          {/* Live telemetry reading */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white/90 shadow-md flex-shrink-0"
                style={{
                  backgroundColor: primaryGlowColor,
                  boxShadow: `0 0 12px ${activeColorHex}`,
                }}
              />
              <span className="font-mono text-[11px] font-bold text-white tracking-wide">
                {primaryGlowColor}
              </span>
            </div>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider transition-colors"
              style={{ color: activeColorHex }}
            >
              DYNAMIC HSL RECALIBRATION
            </span>
          </div>

          {/* Draggable Hue Bar with Continuous Color Gradient & Thumb */}
          <div
            ref={hueTrackRef}
            className="relative w-full py-3 select-none touch-none group cursor-pointer"
            onPointerDown={(e) => {
              if (hueTrackRef.current) {
                const rect = hueTrackRef.current.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                handleHueChange(ratio * 360);
              }
            }}
          >
            {/* Horizontal Bar with full continuous gradient (0 to 360 degrees) */}
            <div
              className="w-full h-5 rounded-full overflow-hidden border border-white/20 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
              style={{
                background:
                  'linear-gradient(to right, hsl(0, 100%, 50%) 0%, hsl(60, 100%, 50%) 17%, hsl(120, 100%, 50%) 33%, hsl(180, 100%, 50%) 50%, hsl(240, 100%, 50%) 67%, hsl(300, 100%, 50%) 83%, hsl(360, 100%, 50%) 100%)',
              }}
            >
              {/* Top glass reflection highlight */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25 rounded-t-full pointer-events-none" />
            </div>

            {/* Draggable Slider Thumb on top of the gradient bar */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform group-active:scale-115"
              style={{
                left: `${(hueValue / 360) * 100}%`,
              }}
            >
              <div
                className="w-7 h-7 rounded-full border-[2.5px] border-white flex items-center justify-center shadow-2xl"
                style={{
                  backgroundColor: primaryGlowColor,
                  boxShadow: `0 0 16px ${activeColorHex}, 0 0 6px #FFFFFF`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            {/* Range Input for silky smooth native dragging, touch, and accessibility */}
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={hueValue}
              onChange={(e) => handleHueChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              aria-label="Continuous Color Hue Spectrum Slider"
            />
          </div>

          {/* Color Hue Degree Labels across the spectrum */}
          <div className="flex justify-between text-[9px] font-mono font-bold px-1 select-none">
            <span className="text-[#FF1744]">0° RED</span>
            <span className="text-[#FFD700]">60° GOLD</span>
            <span className="text-[#00FF66]">120° GRN</span>
            <span className="text-[#00F0FF]">180° CYAN</span>
            <span className="text-[#2979FF]">240° BLUE</span>
            <span className="text-[#B026FF]">300° MAG</span>
            <span className="text-[#FF1744]">360° RED</span>
          </div>
        </div>
      </div>


      {/* ============================================================ */}
      {/* 5. BIOMETRICS & BODY COMPOSITION                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl glass-panel p-3.5 border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Body Weight</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{profile.weightKg}</span>
            <span
              className="text-xs font-bold transition-colors duration-300"
              style={{ color: activeColorHex }}
            >
              KG
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Target: {profile.targetWeightKg} kg</span>
        </div>

        <div className="rounded-2xl glass-panel p-3.5 border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Body Fat</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{profile.bodyFatPercent}</span>
            <span className="text-xs text-[#FF1744] font-bold">%</span>
          </div>
          <span className="text-[10px] text-[#00E676] mt-1 block">Athletic Elite Zone</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. ACTIVE DIET PROTOCOL (IF SYNCHRONIZED)                    */}
      {/* ============================================================ */}
      {savedDietPlan && (
        <div
          className="rounded-3xl p-4 border space-y-2.5 transition-all duration-300"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            borderColor: `${activeColorHex}55`,
            boxShadow: `0 0 20px ${activeColorHex}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-300"
              style={{ color: activeColorHex }}
            >
              <Zap size={14} style={{ color: activeColorHex, fill: activeColorHex }} />
              Active Clinical Diet Protocol
            </span>
            <span className="text-[10px] font-mono text-[#00E676] px-2 py-0.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/30">
              SYNCHRONIZED
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-sm font-black text-white block">{savedDietPlan.planTitle}</span>
              <span className="text-[11px] text-neutral-400">{savedDietPlan.targetGoal}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-white">{savedDietPlan.dailyCalories}</span>
              <span className="text-[10px] text-[#FF1744] font-bold ml-1 font-mono">KCAL/D</span>
            </div>
          </div>

          {/* Macro Split Pills */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span
                className="text-[9px] font-bold block transition-colors duration-300"
                style={{ color: activeColorHex }}
              >
                PROTEIN
              </span>
              <span className="font-mono font-bold text-white">{savedDietPlan.protein.grams}g</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[9px] text-[#FF1744] font-bold block">CARBS</span>
              <span className="font-mono font-bold text-white">{savedDietPlan.carbs.grams}g</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[9px] text-[#B026FF] font-bold block">FATS</span>
              <span className="font-mono font-bold text-white">{savedDietPlan.fats.grams}g</span>
            </div>
          </div>
        </div>
      )}

      {/* Lifetime Combat Volume */}
      <div className="rounded-2xl glass-panel p-4 border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Volume Shifted</span>
          <div className="text-xl font-black text-white mt-0.5">
            {profile.volumeLiftedTonnes} <span className="text-xs text-neutral-400">Tonnes</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Completed Protocols</span>
          <div
            className="text-xl font-black mt-0.5 transition-colors duration-300"
            style={{ color: activeColorHex }}
          >
            {profile.totalWorkouts}
          </div>
        </div>
      </div>

      {/* Interface Dynamics & Aura */}
      <div className="rounded-3xl glass-panel p-4 border border-white/10 bg-white/[0.03] backdrop-blur-md space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} style={{ color: activeColorHex }} />
            Interface Dynamics & Aura
          </span>
          <span
            className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border"
            style={{
              borderColor: `${activeColorHex}40`,
              backgroundColor: `${activeColorHex}15`,
              color: activeColorHex,
            }}
          >
            ACTIVE MATRIX
          </span>
        </div>

        {/* Mirror Glow Selector */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Mirror Glow Intensity</span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold"
                style={{
                  color: glowMode === 'off' ? '#9E9E9E' : activeColorHex,
                  borderColor: glowMode === 'off' ? '#404040' : `${activeColorHex}60`,
                  backgroundColor: glowMode === 'off' ? 'transparent' : `${activeColorHex}15`,
                }}
              >
                {glowMode}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">Real-time border diffusion & box-shadow scaling</div>
          </div>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {(['high', 'subtle', 'off'] as const).map((m) => {
              const isActive = glowMode === m;
              return (
                <button
                  key={m}
                  onClick={() => handleGlowModeChange(m)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                    isActive ? 'text-black font-black' : 'text-neutral-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isActive ? activeColorHex : 'transparent',
                    boxShadow: isActive ? `0 0 10px ${activeColorHex}` : 'none',
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Vibration Feedback Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-white/5">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Vibration Feedback</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${
                vibration ? 'text-[#00E676] border-[#00E676]/40 bg-[#00E676]/10' : 'text-neutral-500 border-neutral-800'
              }`}>
                {vibration ? 'ENABLED' : 'MUTED'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">Tactile hardware motor buzz on reps, timer alerts & taps</div>
          </div>
          <button
            onClick={handleToggleVibration}
            className="w-11 h-6 rounded-full transition-all relative"
            style={{
              backgroundColor: vibration ? activeColorHex : '#262626',
              boxShadow: vibration ? `0 0 12px ${activeColorHex}` : 'none',
            }}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${
                vibration ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* 2. Haptic Sound Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-white/5">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Haptic Sound</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${
                hapticSound ? 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10' : 'text-neutral-500 border-neutral-800'
              }`}>
                {hapticSound ? 'ACTIVE' : 'MUTED'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">Subtle mechanical audio click/thud on interface interaction</div>
          </div>
          <button
            onClick={handleToggleHapticSound}
            className="w-11 h-6 rounded-full transition-all relative"
            style={{
              backgroundColor: hapticSound ? '#00F0FF' : '#262626',
              boxShadow: hapticSound ? '0 0 12px rgba(0, 240, 255, 0.6)' : 'none',
            }}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${
                hapticSound ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* AI Voice Alerts & Voice Profile */}
        <div className="pt-2 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 size={13} style={{ color: activeColorHex }} />
                <span>AI Voice Alerts</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${
                  audio ? 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10' : 'text-neutral-500 border-neutral-800'
                }`}>
                  {audio ? 'ONLINE' : 'MUTED'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">Synthesized rest countdowns & tactical power milestones</div>
            </div>
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                audio ? 'bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${
                  audio ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Profile Selector Panel */}
          <div
            className="p-3.5 rounded-2xl bg-black/60 border space-y-2.5"
            style={{
              borderColor: `${activeColorHex}30`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 0 12px ${activeColorHex}08`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeColorHex }} />
                Voice Profile Matrix (5 Presets)
              </span>
              <button
                type="button"
                onClick={handleTestVoiceAlert}
                disabled={isTestingVoice}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  isTestingVoice
                    ? 'opacity-60 cursor-not-allowed scale-95'
                    : 'active:scale-95 cursor-pointer'
                }`}
                style={{
                  color: activeColorHex,
                  borderColor: `${activeColorHex}50`,
                  backgroundColor: `${activeColorHex}15`,
                }}
              >
                <Volume2 size={11} className={isTestingVoice ? 'animate-bounce' : ''} />
                <span>{isTestingVoice ? 'Synthesizing...' : 'Test Alert'}</span>
              </button>
            </div>

            {/* 5 Distinct Voice Profile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {(Object.keys(VOICE_PROFILES) as VoiceProfileId[]).map((vId) => {
                const profileConfig = VOICE_PROFILES[vId];
                const isSelected = voiceProfile === vId;
                return (
                  <button
                    key={vId}
                    type="button"
                    onClick={() => handleSelectVoiceProfile(vId)}
                    className={`p-2.5 rounded-xl text-left border transition-all duration-200 cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'bg-white/10 ring-1'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                    }`}
                    style={{
                      borderColor: isSelected ? activeColorHex : 'rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? `0 0 14px ${activeColorHex}30` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                        {profileConfig.name}
                      </span>
                      {isSelected && (
                        <span
                          className="text-[8px] font-mono px-1.5 py-0.2 rounded font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${activeColorHex}25`,
                            color: activeColorHex,
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[9px] text-neutral-400 font-mono line-clamp-1">
                        {profileConfig.description}
                      </p>
                      <span className="text-[8px] font-mono text-[#00F0FF]/80 shrink-0 ml-1 font-semibold">
                        {profileConfig.elevenLabsSpeakerName}
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
});

ProfileScreen.displayName = 'ProfileScreen';
