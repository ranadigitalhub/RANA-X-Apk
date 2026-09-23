/**
 * RANA X — Interface Dynamics, Global Haptics & AI Voice Matrix
 * Provides:
 * 1. Global Neon Glow Intensity scaling (--neon-glow-intensity CSS variable)
 * 2. Reliable Web Vibration API (navigator.vibrate([50]) with reset) & Web Audio API synthesized mechanical tick sound
 * 3. AI Voice Alerts with 5 distinct Voice Profiles (Titan, Spartan, Valkyrie, Apex Coach, Cyber Core)
 * 4. Asynchronous SpeechSynthesis voice caching with strict gender/style mapping & aggressive pitch/rate modifiers
 * 5. LocalStorage persistence for user preferences
 */

export type GlowIntensityMode = 'high' | 'subtle' | 'off';

export type VoiceProfileId = 'titan' | 'spartan' | 'valkyrie' | 'apex_coach' | 'cyber_core';

export interface VoiceProfileConfig {
  id: VoiceProfileId;
  name: string;
  category: 'Male' | 'Female' | 'AI System';
  description: string;
  elevenLabsVoiceId: string;
  elevenLabsSpeakerName: string;
  pitch: number;
  rate: number;
  gender: 'male' | 'female' | 'synth';
  samplePhrase: string;
}

/**
 * 5 Distinct Voice Profiles with Standard Free ElevenLabs Voice IDs & Local Modifiers
 */
export const VOICE_PROFILES: Record<VoiceProfileId, VoiceProfileConfig> = {
  titan: {
    id: 'titan',
    name: 'Titan (Deep Male)',
    category: 'Male',
    description: 'Deep, slow, authoritarian gym command',
    elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
    elevenLabsSpeakerName: 'Adam',
    pitch: 0.1,
    rate: 0.8,
    gender: 'male',
    samplePhrase: 'Lock in. Heavy SBD load approaching.',
  },
  spartan: {
    id: 'spartan',
    name: 'Spartan (Calm Male)',
    category: 'Male',
    description: 'Stoic, composed, steady breathing pacing',
    elevenLabsVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni
    elevenLabsSpeakerName: 'Antoni',
    pitch: 0.2,
    rate: 0.85,
    gender: 'male',
    samplePhrase: 'Rest timer complete. Step up to the barbell.',
  },
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie (Intense Female)',
    category: 'Female',
    description: 'Crisp, high-energy, sharp biomechanical cues',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    elevenLabsSpeakerName: 'Bella',
    pitch: 1.2,
    rate: 1.1,
    gender: 'female',
    samplePhrase: 'Chest up, brace the core, explode through lockout.',
  },
  apex_coach: {
    id: 'apex_coach',
    name: 'Apex Coach (Motivating Female)',
    category: 'Female',
    description: 'Dynamic, encouraging, athletic empowerment',
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    elevenLabsSpeakerName: 'Rachel',
    pitch: 1.0,
    rate: 1.05,
    gender: 'female',
    samplePhrase: 'New personal record logged. Outstanding power output.',
  },
  cyber_core: {
    id: 'cyber_core',
    name: 'Cyber Core (AI System)',
    category: 'AI System',
    description: 'Futuristic synthesized neural matrix voice',
    elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG', // Domi
    elevenLabsSpeakerName: 'Domi',
    pitch: 2.0,
    rate: 1.2,
    gender: 'synth',
    samplePhrase: 'Neural telemetry synced. Cyber matrix online.',
  },
};

export interface InterfaceDynamicsConfig {
  glowIntensity: GlowIntensityMode;
  hapticFeedback: boolean;
  vibrationFeedback: boolean;
  hapticSound: boolean;
  aiVoiceAlerts: boolean;
  aiVoicePrompts: boolean; // Backwards compatibility
  voiceProfile: VoiceProfileId;
}

const STORAGE_KEY_GLOW = 'ranax_glow_intensity';
const STORAGE_KEY_HAPTIC = 'ranax_haptic_feedback';
const STORAGE_KEY_VIBRATION = 'ranax_vibration_feedback';
const STORAGE_KEY_HAPTIC_SOUND = 'ranax_haptic_sound';
const STORAGE_KEY_VOICE = 'ranax_ai_voice_alerts';
const STORAGE_KEY_LEGACY_VOICE = 'ranax_ai_voice_prompts';
const STORAGE_KEY_VOICE_PROFILE = 'ranax_voice_profile';

/**
 * Tactile vibration pulse presets (in milliseconds)
 */
export const HAPTIC_PATTERNS = {
  TAP: 50,
  SET_COMPLETED: 50,
  ALERT: [50, 40, 50],
  COUNTDOWN_TICK: 35,
  REST_COMPLETE: [50, 30, 50],
  WORKOUT_COMPLETED: [60, 40, 60, 40, 100],
  TOGGLE: 40,
  ERROR: [80, 40, 80],
  SET_FINISH: 50,
};

// Web Audio API Shared Context Singleton
let sharedAudioCtx: AudioContext | null = null;

const getSharedAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      try {
        sharedAudioCtx = new AudioContextClass();
      } catch (e) {
        // audio context creation fallback
      }
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

/**
 * Subtle short UI "tick/thud" sound via Web Audio API for desktop/non-vibrating platforms.
 * Fires instantly without lag on every user tap.
 */
export const playTactileTick = (freq: number = 1200, durationMs: number = 16) => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High frequency start dropping rapidly for a clean mechanical tick
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + durationMs / 1000);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationMs / 1000);
  } catch {
    // Silently handle if audio policy prevents autoplay
  }
};

/**
 * Triggers hardware tactile vibration via Web Vibration API & Audio Tick Fallback.
 * Vibrates if Vibration Feedback is enabled, and plays audio click if Haptic Sound is enabled.
 */
export const triggerHaptic = (pattern: number | number[] = 50): boolean => {
  try {
    const config = getStoredDynamicsConfig();
    let triggered = false;

    // 1. Physical mobile vibration via Web Vibration API (Tactile buzz)
    if (config.vibrationFeedback && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Reset stuck vibration state first
        navigator.vibrate(0);
        if (typeof pattern === 'number') {
          navigator.vibrate([pattern]);
        } else {
          navigator.vibrate(pattern);
        }
        triggered = true;
      } catch {}
    }

    // 2. Subtle, crisp UI "tick/thud" sound via Web Audio API (Haptic sound)
    if (config.hapticSound) {
      playTactileTick(1200, 16);
      triggered = true;
    }

    return triggered;
  } catch {
    return false;
  }
};

/**
 * Reads persisted Interface Dynamics configuration from localStorage
 */
export const getStoredDynamicsConfig = (): InterfaceDynamicsConfig => {
  try {
    const glow = (localStorage.getItem(STORAGE_KEY_GLOW) as GlowIntensityMode) || 'high';
    const legacyHaptic = localStorage.getItem(STORAGE_KEY_HAPTIC);
    const vibrationStored = localStorage.getItem(STORAGE_KEY_VIBRATION);
    const hapticSoundStored = localStorage.getItem(STORAGE_KEY_HAPTIC_SOUND);

    const vibration =
      vibrationStored !== null
        ? vibrationStored === 'true'
        : legacyHaptic !== null
        ? legacyHaptic === 'true'
        : true;

    const hapticSound =
      hapticSoundStored !== null
        ? hapticSoundStored === 'true'
        : legacyHaptic !== null
        ? legacyHaptic === 'true'
        : true;

    const haptic = vibration || hapticSound;

    // Check both new voice alert key and legacy prompt key
    const voiceAlertStored = localStorage.getItem(STORAGE_KEY_VOICE);
    const legacyVoiceStored = localStorage.getItem(STORAGE_KEY_LEGACY_VOICE);
    const voice =
      voiceAlertStored !== null
        ? voiceAlertStored === 'true'
        : legacyVoiceStored !== null
        ? legacyVoiceStored === 'true'
        : true;

    const profileId = (localStorage.getItem(STORAGE_KEY_VOICE_PROFILE) as VoiceProfileId) || 'titan';
    const validProfile: VoiceProfileId = VOICE_PROFILES[profileId] ? profileId : 'titan';

    return {
      glowIntensity: glow,
      hapticFeedback: haptic,
      vibrationFeedback: vibration,
      hapticSound: hapticSound,
      aiVoiceAlerts: voice,
      aiVoicePrompts: voice,
      voiceProfile: validProfile,
    };
  } catch {
    return {
      glowIntensity: 'high',
      hapticFeedback: true,
      vibrationFeedback: true,
      hapticSound: true,
      aiVoiceAlerts: true,
      aiVoicePrompts: true,
      voiceProfile: 'titan',
    };
  }
};

export const getStoredVoiceProfile = (): VoiceProfileId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VOICE_PROFILE) as VoiceProfileId;
    return saved && VOICE_PROFILES[saved] ? saved : 'titan';
  } catch {
    return 'titan';
  }
};

export const setStoredVoiceProfile = (profileId: VoiceProfileId) => {
  try {
    localStorage.setItem(STORAGE_KEY_VOICE_PROFILE, profileId);
  } catch {}
};

/**
 * Dynamically binds Glow Intensity mode to document root CSS variables
 */
export const applyGlowIntensity = (mode: GlowIntensityMode) => {
  try {
    localStorage.setItem(STORAGE_KEY_GLOW, mode);
  } catch {}

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-glow-mode', mode);

    if (mode === 'high') {
      root.style.setProperty('--neon-glow-intensity', '1.6');
      root.style.setProperty('--neon-border-alpha', '0.75');
      root.style.setProperty('--neon-shadow-alpha', '0.65');
      root.style.setProperty('--glow-spread', '1.5');
      root.style.setProperty('--glass-blur', '22px');
    } else if (mode === 'subtle') {
      root.style.setProperty('--neon-glow-intensity', '0.35');
      root.style.setProperty('--neon-border-alpha', '0.25');
      root.style.setProperty('--neon-shadow-alpha', '0.15');
      root.style.setProperty('--glow-spread', '0.5');
      root.style.setProperty('--glass-blur', '14px');
    } else {
      // off
      root.style.setProperty('--neon-glow-intensity', '0');
      root.style.setProperty('--neon-border-alpha', '0.08');
      root.style.setProperty('--neon-shadow-alpha', '0');
      root.style.setProperty('--glow-spread', '0');
      root.style.setProperty('--glass-blur', '8px');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ranax_glow_change', {
          detail: { mode },
        })
      );
    }
  }
};

/**
 * Persist Vibration Feedback setting
 */
export const setStoredVibration = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY_VIBRATION, enabled.toString());
  } catch {}
};

/**
 * Persist Haptic Sound setting
 */
export const setStoredHapticSound = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY_HAPTIC_SOUND, enabled.toString());
  } catch {}
};

/**
 * Persist Master/Legacy Haptic setting
 */
export const setStoredHaptic = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY_HAPTIC, enabled.toString());
    localStorage.setItem(STORAGE_KEY_VIBRATION, enabled.toString());
    localStorage.setItem(STORAGE_KEY_HAPTIC_SOUND, enabled.toString());
  } catch {}
};

/**
 * Persist Voice Alerts setting
 */
export const setStoredVoice = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY_VOICE, enabled.toString());
    localStorage.setItem(STORAGE_KEY_LEGACY_VOICE, enabled.toString());
  } catch {}
};

// ==========================================
// ASYNCHRONOUS VOICE LOADING & MAPPING ENGINE
// ==========================================

let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Synchronously retrieves or updates available voices from SpeechSynthesis
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  try {
    const fresh = window.speechSynthesis.getVoices();
    if (fresh && fresh.length > 0) {
      cachedVoices = fresh;
    }
  } catch {}
  return cachedVoices;
};

// Asynchronously listen for browser voiceschanged event
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    getAvailableVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      getAvailableVoices();
    };
    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        getAvailableVoices();
      });
    }
  } catch {}
}

const FEMALE_VOICE_KEYWORDS = [
  'female',
  'zira',
  'samantha',
  'victoria',
  'karen',
  'jenny',
  'aria',
  'hazel',
  'catherine',
  'susan',
  'linda',
  'helena',
  'clara',
  'fiona',
  'en-gb-x-gbb-network',
  'en-gb-x-gbb-local',
  'en-us-x-sfg-local',
];

const MALE_VOICE_KEYWORDS = [
  'en-gb-x-rjs-network',
  'en-gb-x-rjs-local',
  'en-us-language',
  'google uk english male',
  'uk english male',
  'en-gb-x-rjs',
  'en-gb-x-fis',
  'en-us-x-sfg-network',
  'en-us-x-tpd-network',
  'en-us-x-iol-network',
  'male',
  'david',
  'mark',
  'alex',
  'daniel',
  'guy',
  'george',
  'arthur',
  'james',
  'richard',
  'paul',
  'oliver',
];

/**
 * Strictly maps browser voices to the specified Voice Profile
 */
export const getMappedVoice = (
  voices: SpeechSynthesisVoice[],
  profileId: VoiceProfileId
): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  if (profileId === 'titan') {
    // Strictly filter for male voices containing Android/Chrome specific URIs & names
    const maleCandidates = pool.filter((v) => {
      const name = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
      const hasMaleMatch = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      const hasFemaleMatch = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      return hasMaleMatch && !hasFemaleMatch;
    });

    const best =
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('en-gb-x-rjs-network')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('en-gb-x-rjs-local')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('google uk english male')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('david')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('mark')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('en-us-language')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('male')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('daniel')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('alex')) ||
      maleCandidates[0];

    if (best) return best;

    // Secondary fallback: find British English voice as Chrome/Android often defaults to male for UK
    const ukVoice = pool.find((v) => v.lang && v.lang.toLowerCase().includes('gb') && !FEMALE_VOICE_KEYWORDS.some(kw => v.name.toLowerCase().includes(kw)));
    if (ukVoice) return ukVoice;
  }

  if (profileId === 'spartan') {
    // Strictly filter for male voices
    const maleCandidates = pool.filter((v) => {
      const name = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
      const hasMaleMatch = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      const hasFemaleMatch = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      return hasMaleMatch && !hasFemaleMatch;
    });

    const best =
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('mark')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('google uk english male')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('en-gb-x-rjs-network')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('daniel')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('david')) ||
      maleCandidates.find((v) => (v.name + ' ' + (v.voiceURI || '')).toLowerCase().includes('male')) ||
      maleCandidates[0];

    if (best) return best;

    const ukVoice = pool.find((v) => v.lang && v.lang.toLowerCase().includes('gb') && !FEMALE_VOICE_KEYWORDS.some(kw => v.name.toLowerCase().includes(kw)));
    if (ukVoice) return ukVoice;
  }

  if (profileId === 'valkyrie') {
    // STRICTLY filter for 'Female', 'Zira', 'Samantha', 'Google US English', 'Victoria'
    const femaleCandidates = pool.filter((v) => {
      const name = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
      const hasFemaleMatch = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      const hasMaleMatch = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      return hasFemaleMatch && !hasMaleMatch;
    });

    const best =
      femaleCandidates.find((v) => v.name.toLowerCase().includes('zira')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('victoria')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('google uk english female')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('female')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('samantha')) ||
      femaleCandidates[0];

    if (best) return best;
  }

  if (profileId === 'apex_coach') {
    // STRICTLY filter for 'Samantha', 'Google US English', 'Female', 'Jenny', 'Aria'
    const femaleCandidates = pool.filter((v) => {
      const name = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
      const hasFemaleMatch =
        FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw)) ||
        name.includes('google us english');
      const hasMaleMatch = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      return hasFemaleMatch && !hasMaleMatch;
    });

    const best =
      femaleCandidates.find((v) => v.name.toLowerCase().includes('samantha')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('google us english')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('jenny')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('aria')) ||
      femaleCandidates.find((v) => v.name.toLowerCase().includes('female')) ||
      femaleCandidates[0];

    if (best) return best;
  }

  if (profileId === 'cyber_core') {
    // Look for 'Microsoft Hazel', 'Google हिन्दी', 'Zarvox', 'Cellos', 'Trinoids', 'Whisper', 'Fred'
    const synthMatch =
      voices.find((v) => v.name.toLowerCase().includes('hazel')) ||
      voices.find((v) => v.name.includes('हिन्दी') || v.name.toLowerCase().includes('hindi')) ||
      voices.find((v) => v.name.toLowerCase().includes('zarvox')) ||
      voices.find((v) => v.name.toLowerCase().includes('whisper')) ||
      voices.find((v) => v.name.toLowerCase().includes('fred')) ||
      voices.find((v) => v.name.toLowerCase().includes('cellos')) ||
      voices.find((v) => v.name.toLowerCase().includes('trinoids'));

    if (synthMatch) return synthMatch;
  }

  // Fallback to default
  return pool[0] || voices[0] || null;
};

/**
 * ElevenLabs Turbo Engine & Singleton Audio Player State
 */
let currentAudioElement: HTMLAudioElement | null = null;
let currentAudioBlobUrl: string | null = null;
let currentAbortController: AbortController | null = null;
let currentAudioSessionId: number = 0;
const audioMemoryCache = new Map<string, Blob>();

export const getElevenLabsApiKey = (): string => {
  let key = '';
  try {
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
      key = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    }
  } catch {}
  if (!key) {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        key = (import.meta as any).env.NEXT_PUBLIC_ELEVENLABS_API_KEY || (import.meta as any).env.VITE_ELEVENLABS_API_KEY || '';
      }
    } catch {}
  }
  return key || 'sk_03dd6960e013a6e5dd3bc5ed50a450effe724db69097a52e';
};

/**
 * Stop any ongoing synthesized speech (both ElevenLabs audio buffer & local speech synthesis)
 * and cancel any pending HTTP requests.
 */
export const stopAllVoicePlayback = () => {
  // Invalidate session ID to block any in-flight asynchronous operations
  currentAudioSessionId++;

  // 1. Abort any in-flight ElevenLabs API request
  if (currentAbortController) {
    try {
      currentAbortController.abort();
    } catch {}
    currentAbortController = null;
  }

  // 2. Stop and clear active HTMLAudioElement
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.src = '';
    } catch {}
    currentAudioElement = null;
  }

  // 3. Revoke Blob URL
  if (currentAudioBlobUrl) {
    try {
      URL.revokeObjectURL(currentAudioBlobUrl);
    } catch {}
    currentAudioBlobUrl = null;
  }

  // 4. Cancel browser SpeechSynthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
};

/**
 * Triggers a custom Dark Neon Cyber UI Toast Notification across the interface
 */
export const showCyberToast = (message: string, durationMs: number = 3800) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ranax_cyber_toast', {
        detail: { message, duration: durationMs },
      })
    );
  }
};

/**
 * Synthesizes speech locally via Web Speech API as a zero-latency seamless fallback.
 */
export const speakAiVoiceAlertLocal = (
  text: string,
  cancelPrevious: boolean = true,
  customProfile?: VoiceProfileId,
  expectedSessionId?: number
): boolean => {
  try {
    if (expectedSessionId !== undefined && expectedSessionId !== currentAudioSessionId) {
      return false;
    }

    if (cancelPrevious) {
      stopAllVoicePlayback();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const config = getStoredDynamicsConfig();
      const activeProfileId = customProfile || config.voiceProfile;
      const profile = VOICE_PROFILES[activeProfileId] || VOICE_PROFILES.titan;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.volume = 1.0;

      if (profile.gender === 'male' || activeProfileId === 'titan' || activeProfileId === 'spartan') {
        utterance.lang = 'en-GB';
      } else {
        utterance.lang = 'en-US';
      }

      let voices = getAvailableVoices();
      if (!voices || voices.length === 0) {
        voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          cachedVoices = voices;
        }
      }

      const matchedVoice = getMappedVoice(voices, activeProfileId);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        if (matchedVoice.lang) {
          utterance.lang = matchedVoice.lang;
        }
      }

      window.speechSynthesis.speak(utterance);
      return true;
    }
  } catch (err) {
    console.warn('Local Speech Synthesis fallback failed:', err);
  }
  return false;
};

/**
 * Synthesizes AI voice alert using ElevenLabs Turbo v2.5 Engine.
 * Features:
 * - Singleton Audio Management: Guarantees ONLY ONE audio track can play at any millisecond.
 * - AbortController: Immediately cancels pending HTTP fetch if a new request is triggered.
 * - Session Locking: Prevents React Strict Mode or rapid double-invocations from echoing.
 * - If HTTP 401/403/429/500 occurs, shows custom Neon Toast and falls back to local Web Speech API.
 */
export const speakAiVoiceAlert = async (
  text: string,
  cancelPrevious: boolean = true,
  customProfile?: VoiceProfileId
): Promise<boolean> => {
  try {
    const config = getStoredDynamicsConfig();
    if (!config.aiVoiceAlerts) return false;

    // Trigger subtle tactile haptic pulse alongside voice activation
    triggerHaptic(HAPTIC_PATTERNS.TAP);

    if (cancelPrevious) {
      stopAllVoicePlayback();
    } else if (currentAudioElement) {
      try {
        currentAudioElement.pause();
        currentAudioElement.currentTime = 0;
      } catch {}
      currentAudioElement = null;
    }

    // Invalidate previous operations and assign unique session id
    const thisSessionId = ++currentAudioSessionId;

    // Abort previous in-flight HTTP request
    if (currentAbortController) {
      try {
        currentAbortController.abort();
      } catch {}
    }
    const abortController = new AbortController();
    currentAbortController = abortController;

    const activeProfileId = customProfile || config.voiceProfile;
    const profile = VOICE_PROFILES[activeProfileId] || VOICE_PROFILES.titan;
    const voiceId = profile.elevenLabsVoiceId || 'pNInz6obpgDQGcFmaJgB';
    const apiKey = getElevenLabsApiKey();

    const cacheKey = `${voiceId}_${text.trim()}`;
    let audioBlob = audioMemoryCache.get(cacheKey);

    if (!audioBlob) {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
        }),
        signal: abortController.signal,
      });

      // If superseded during the fetch, exit immediately
      if (thisSessionId !== currentAudioSessionId || abortController.signal.aborted) {
        return false;
      }

      if (!response.ok) {
        throw new Error(`ElevenLabs API HTTP ${response.status}: ${response.statusText}`);
      }

      audioBlob = await response.blob();
      if (thisSessionId !== currentAudioSessionId || abortController.signal.aborted) {
        return false;
      }

      if (audioBlob && audioBlob.size > 0) {
        audioMemoryCache.set(cacheKey, audioBlob);
      }
    }

    // Final safety check before creating audio element
    if (thisSessionId !== currentAudioSessionId || abortController.signal.aborted) {
      return false;
    }

    if (audioBlob) {
      // Explicitly clean up old blob URL & audio instance
      if (currentAudioBlobUrl) {
        try {
          URL.revokeObjectURL(currentAudioBlobUrl);
        } catch {}
        currentAudioBlobUrl = null;
      }
      if (currentAudioElement) {
        try {
          currentAudioElement.pause();
          currentAudioElement.currentTime = 0;
        } catch {}
        currentAudioElement = null;
      }

      const blobUrl = URL.createObjectURL(audioBlob);
      currentAudioBlobUrl = blobUrl;
      const audio = new Audio(blobUrl);
      currentAudioElement = audio;

      audio.onended = () => {
        URL.revokeObjectURL(blobUrl);
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        if (currentAudioBlobUrl === blobUrl) {
          currentAudioBlobUrl = null;
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        if (thisSessionId === currentAudioSessionId) {
          speakAiVoiceAlertLocal(text, false, activeProfileId, thisSessionId);
        }
      };

      if (thisSessionId === currentAudioSessionId) {
        await audio.play();
        return true;
      }
    }
  } catch (err: any) {
    // If request was deliberately aborted or superseded, do not trigger fallback or toast
    if (err?.name === 'AbortError' || (currentAbortController && currentAbortController.signal.aborted)) {
      return false;
    }

    // Premium Fallback System: Only fire if still the active session
    showCyberToast('NEURAL NETWORK AT CAPACITY: Switching to local audio engine.');
    speakAiVoiceAlertLocal(text, cancelPrevious, customProfile);
    return true;
  }

  return false;
};

/**
 * Backwards compatibility alias for speakAiVoiceAlert
 */
export const speakAiPrompt = speakAiVoiceAlert;
