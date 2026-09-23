/**
 * RANA X — Advanced Gym & Fitness Cross-Platform Mobile UI
 * Built for React Native & Expo (iOS & Android)
 * Featuring Extreme Advanced AI Dietician & Elite Coach,
 * Multi-Modal Action Chips, Structured Glassmorphism Diet Plan Cards,
 * Macro Split Visualizer, and Biomechanical Telemetry.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  Image,
  PanResponder,
  Animated,
  Modal,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { compressImage } from '../utils/imageCompressor';
import { executeNutriLensAnalysis, NutriLensAnalysisResult } from '../services/nutriLensVisionEngine';
import { sampleWorkouts } from '../data/mockFitnessData';
import { WorkoutRoutine } from '../types';
import {
  classifyAthleteIpf,
  IpfDivision,
  getIpfWeightClass,
  IPF_MEN_WEIGHT_CLASSES,
  IPF_WOMEN_WEIGHT_CLASSES,
  calibrateIpfWorkout,
} from '../utils/ipfStandards';
import { formatDynamicHandle } from '../utils/telemetryEngine';
import { speakAiVoiceAlert, VoiceProfileId } from '../utils/interfaceDynamics';
import { PRESET_CYBER_AVATARS, CyberAvatarPreset } from '../data/presetAvatars';

const { width } = Dimensions.get('window');

// Design Tokens
const COLORS = {
  background: '#0A0A0A',
  cardBg: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  neonCyan: '#00F0FF',
  neonRed: '#FF1744',
  neonPurple: '#B026FF',
  neonGreen: '#00E676',
  textWhite: '#FFFFFF',
  textMuted: '#9E9E9E',
};

interface DietPlan {
  title: string;
  targetGoal: string;
  calories: number;
  proteinGrams: number;
  proteinPct: number;
  carbsGrams: number;
  carbsPct: number;
  fatsGrams: number;
  fatsPct: number;
  preWorkout: string;
  postWorkout: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  dietPlan?: DietPlan;
  applied?: boolean;
  saved?: boolean;
}

const HUE_SEGMENTS = [
  0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,
  180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345, 360,
];

export default function RanaXApp() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'workouts' | 'coach' | 'profile'>('dashboard');
  const [selectedWorkoutCategory, setSelectedWorkoutCategory] = useState<string>('All');
  const [selectedWorkoutTier, setSelectedWorkoutTier] = useState<string>('All Levels');
  const [dailyCaloriesTarget, setDailyCaloriesTarget] = useState(2350);
  const [inputText, setInputText] = useState('');

  // Voice Input Simulation State & Waveform Animations
  const [isListening, setIsListening] = useState(false);
  const listeningTimeoutRef = useRef<any>(null);

  const waveAnim1 = useRef(new Animated.Value(8)).current;
  const waveAnim2 = useRef(new Animated.Value(18)).current;
  const waveAnim3 = useRef(new Animated.Value(24)).current;
  const waveAnim4 = useRef(new Animated.Value(12)).current;
  const waveAnim5 = useRef(new Animated.Value(6)).current;
  const micPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 24, duration: 250, useNativeDriver: false }),
            Animated.timing(waveAnim1, { toValue: 6, duration: 250, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 8, duration: 200, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 28, duration: 200, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 30, duration: 300, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 10, duration: 300, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim4, { toValue: 6, duration: 220, useNativeDriver: false }),
            Animated.timing(waveAnim4, { toValue: 24, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim5, { toValue: 20, duration: 280, useNativeDriver: false }),
            Animated.timing(waveAnim5, { toValue: 8, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(micPulseAnim, { toValue: 1.15, duration: 350, useNativeDriver: false }),
            Animated.timing(micPulseAnim, { toValue: 0.95, duration: 350, useNativeDriver: false }),
          ]),
        ])
      );
      animLoop.start();
    } else {
      waveAnim1.setValue(8);
      waveAnim2.setValue(18);
      waveAnim3.setValue(24);
      waveAnim4.setValue(12);
      waveAnim5.setValue(6);
      micPulseAnim.setValue(1);
    }
    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [isListening]);

  const handleToggleVoice = () => {
    if (isListening) {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const speechResult = event.results?.[0]?.[0]?.transcript;
          setIsListening(false);
          if (speechResult && speechResult.trim()) {
            handleAction(speechResult.trim());
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (e) {
        // fallback
      }
    }

    setIsListening(true);
    const spoken = typeof window !== 'undefined'
      ? window.prompt('🎙️ Voice Input:\nEnter your query to send to RANA X Coach:')
      : null;
    setIsListening(false);
    if (spoken && spoken.trim()) {
      handleAction(spoken.trim());
    }
  };

  // Profile & Continuous Hue Spectrum Theme State (0 to 360 degrees)
  const [avatarUri, setAvatarUri] = useState('');
  const [hueValue, setHueValue] = useState(185); // Default 185° Electric Cyan
  const primaryGlowColor = `hsl(${hueValue}, 100%, 50%)`;
  const [athleteName, setAthleteName] = useState('RANA X');
  const [isEditingAthleteName, setIsEditingAthleteName] = useState(false);
  const [nameDraft, setNameDraft] = useState('RANA X');
  const [athleteFont, setAthleteFont] = useState<'System' | 'Cyber' | 'Athletic' | 'Neon'>('System');
  const [athleteTextColor, setAthleteTextColor] = useState('#FFFFFF');
  const [athleteRank, setAthleteRank] = useState('STARTER ATHLETE');
  const [athleteLevel, setAthleteLevel] = useState(1);
  const athleteHandle = formatDynamicHandle(athleteName, athleteLevel);
  const [athleteWeight, setAthleteWeight] = useState(86.4);
  const [maxBench, setMaxBench] = useState(142.5);
  const [maxSquat, setMaxSquat] = useState(185.0);
  const [maxDeadlift, setMaxDeadlift] = useState(215.0);
  const [ipfDivision, setIpfDivision] = useState<IpfDivision>('male');
  const [isEditingIpf, setIsEditingIpf] = useState(false);
  const [draftBench, setDraftBench] = useState('142.5');
  const [draftSquat, setDraftSquat] = useState('185.0');
  const [draftDeadlift, setDraftDeadlift] = useState('215.0');
  const [draftWeight, setDraftWeight] = useState('86.4');

  const ipfStats = classifyAthleteIpf(
    athleteWeight,
    maxSquat,
    maxBench,
    maxDeadlift,
    ipfDivision
  );

  // Interface Dynamics & Aura Matrix State
  const [glowIntensity, setGlowIntensity] = useState<'high' | 'subtle' | 'off'>(() => {
    try {
      return (localStorage.getItem('ranax_glow_intensity') as 'high' | 'subtle' | 'off') || 'high';
    } catch {
      return 'high';
    }
  });
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('ranax_haptic_feedback');
      return v !== null ? v === 'true' : true;
    } catch {
      return true;
    }
  });
  const [aiVoicePrompts, setAiVoicePrompts] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('ranax_ai_voice_alerts') || localStorage.getItem('ranax_ai_voice_prompts');
      return v !== null ? v === 'true' : true;
    } catch {
      return true;
    }
  });
  const [voiceProfile, setVoiceProfile] = useState<string>(() => {
    try {
      return localStorage.getItem('ranax_voice_profile') || 'titan';
    } catch {
      return 'titan';
    }
  });

  const triggerHapticFeedback = (duration: number = 50) => {
    if (!hapticFeedback) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(0);
        navigator.vibrate([duration]);
      } else {
        Vibration.vibrate(duration);
      }
    } catch {}
  };

  const speakPrompt = (text: string) => {
    if (!aiVoicePrompts) return;
    try {
      speakAiVoiceAlert(text, true, voiceProfile as VoiceProfileId);
    } catch {}
  };

  const handleGlowChange = (mode: 'high' | 'subtle' | 'off') => {
    setGlowIntensity(mode);
    try {
      localStorage.setItem('ranax_glow_intensity', mode);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-glow-mode', mode);
        document.documentElement.style.setProperty(
          '--neon-glow-intensity',
          mode === 'high' ? '1' : mode === 'subtle' ? '0.35' : '0'
        );
      }
    } catch {}
    triggerHapticFeedback(25);
  };

  const handleToggleHapticFeedback = () => {
    const nextVal = !hapticFeedback;
    setHapticFeedback(nextVal);
    try {
      localStorage.setItem('ranax_haptic_feedback', nextVal.toString());
    } catch {}
    if (nextVal) {
      triggerHapticFeedback(45);
    }
  };

  const handleToggleVoicePrompts = () => {
    const nextVal = !aiVoicePrompts;
    setAiVoicePrompts(nextVal);
    try {
      localStorage.setItem('ranax_ai_voice_prompts', nextVal.toString());
    } catch {}
    if (nextVal) {
      triggerHapticFeedback(25);
      speakPrompt('AI Voice Prompts enabled. Tactical guidance online.');
    }
  };

  // Nutri-Lens Modal Visibility & Dynamic Analysis State
  const [isNutriLensVisible, setIsNutriLensVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isNutriAnalyzing, setIsNutriAnalyzing] = useState<boolean>(false);
  const [nutriAnalysisComplete, setNutriAnalysisComplete] = useState<boolean>(false);
  const [isNutriError, setIsNutriError] = useState<boolean>(false);
  const [macroData, setMacroData] = useState<any>(null);

  const convertNutriAssetToBase64 = async (asset: { uri: string; base64?: string }): Promise<string> => {
    if (asset.base64) {
      return asset.base64;
    }
    if (asset.uri.startsWith('data:')) {
      const commaIdx = asset.uri.indexOf(',');
      return commaIdx !== -1 ? asset.uri.substring(commaIdx + 1) : asset.uri;
    }
    try {
      const FileSystem = require('expo-file-system');
      if (FileSystem && FileSystem.readAsStringAsync) {
        const b64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType?.Base64 || 'base64',
        });
        if (b64) return b64;
      }
    } catch (e) {
      // Ignore expo-file-system absence
    }
    if (typeof fetch !== 'undefined') {
      try {
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const resStr = reader.result as string;
            const commaIdx = resStr.indexOf(',');
            resolve(commaIdx !== -1 ? resStr.substring(commaIdx + 1) : resStr);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Blob conversion error:', err);
      }
    }
    return '';
  };

  const executeNutriGeminiAnalysis = async (asset: { uri: string; base64?: string }) => {
    setIsNutriAnalyzing(true);
    setNutriAnalysisComplete(false);
    setIsNutriError(false);
    setMacroData(null);

    try {
      // Background compression: max 800px width/height, 0.7 quality (<100KB)
      const compressed = await compressImage(asset, 800, 0.7);
      const activeUri = compressed.dataUrl || compressed.uri;
      setImageUri(activeUri);

      // Call resilient NutriLens vision engine with 429 exponential backoff and Indian thali detection
      const result: NutriLensAnalysisResult = await executeNutriLensAnalysis(null, activeUri);

      if (!result.isFood) {
        setIsNutriError(true);
        setMacroData(null);
      } else {
        setMacroData({
          foodName: result.foodName,
          mealType: result.mealType,
          calories: result.totalCalories ?? result.calories ?? 650,
          protein: result.proteinGrams ?? result.protein ?? 35,
          carbs: result.carbsGrams ?? result.carbs ?? 80,
          fats: result.fatsGrams ?? result.fats ?? 20,
          fiber: result.fiberGrams ?? result.fiber ?? 10,
          vitaminA: result.vitaminA ?? 50,
          vitaminC: result.vitaminC ?? 60,
          calcium: result.calcium ?? 40,
          iron: result.iron ?? 45,
          detectedItems: result.detectedItems,
          rateLimitNotice: result.rateLimitNotice,
        });
        setIsNutriError(false);
      }
    } catch (err: any) {
      console.error('Gemini Nutri-Lens API error:', err);
      setIsNutriError(true);
      setMacroData(null);
    } finally {
      setIsNutriAnalyzing(false);
      setNutriAnalysisComplete(true);
    }
  };

  const closeNutriLens = () => {
    setImageUri(null);
    setIsNutriAnalyzing(false);
    setNutriAnalysisComplete(false);
    setIsNutriError(false);
    setMacroData(null);
    setIsNutriLensVisible(false);
  };

  // Nutri-Lens Action Handlers
  const handleNutriOpenCamera = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const compressed = await compressImage(result.assets[0].uri, 800, 0.7);
        executeNutriGeminiAnalysis({ uri: compressed.uri, base64: compressed.base64 });
      }
    } catch (error) {
      console.warn('Error launching camera:', error);
    }
  };

  const handleNutriUploadFromGallery = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const compressed = await compressImage(result.assets[0].uri, 800, 0.7);
        executeNutriGeminiAnalysis({ uri: compressed.uri, base64: compressed.base64 });
      }
    } catch (error) {
      console.warn('Error launching gallery:', error);
    }
  };

  // PanResponder for smooth continuous hue dragging
  const spectrumWidth = Math.max(200, width - 64);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / spectrumWidth));
        setHueValue(Math.round(ratio * 360));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / spectrumWidth));
        setHueValue(Math.round(ratio * 360));
      },
    })
  ).current;

  // Interactive Profile Picture: Custom Photo Picker & Camera Snap
  const [rnAvatarUrlInput, setRnAvatarUrlInput] = useState('');

  const inferCharacterName = (hint: string): string | null => {
    if (!hint) return null;
    let segment = hint.split('?')[0].split('#')[0];
    segment = segment.substring(segment.lastIndexOf('/') + 1);
    segment = segment.replace(/\.(gif|png|jpe?g|webp|svg|bmp|avif|mp4|webm)$/i, '');
    try {
      segment = decodeURIComponent(segment);
    } catch {}
    segment = segment.replace(/^(IMG|DSC|PXL|Screenshot|Photo|image|file|giphy|avatar)[_\-\s\d]*/i, '');
    segment = segment.replace(/[_\.\-+]/g, ' ').trim();
    segment = segment.replace(/\s+[a-f0-9]{7,}$/i, '');
    if (!segment || segment.length < 2 || /^\d+$/.test(segment)) return null;
    const words = segment.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    return words.join(' ');
  };

  const handlePickAvatar = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      if (ImagePicker && ImagePicker.requestMediaLibraryPermissionsAsync) {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Media library access is required to update avatar.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setAvatarUri(asset.uri);
          if (asset.fileName) {
            const inferred = inferCharacterName(asset.fileName);
            if (inferred) {
              setAthleteName(inferred);
              setNameDraft(inferred);
            }
          }
          Alert.alert('Avatar Updated', '⚡ Profile picture updated via image picker!');
          return;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  const handleCaptureCamera = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      if (ImagePicker && ImagePicker.requestCameraPermissionsAsync) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera access is required for snapshots.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setAvatarUri(result.assets[0].uri);
          Alert.alert('Avatar Updated', '⚡ Profile photo captured from live camera!');
          return;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  const handleApplyRnAvatarUrl = () => {
    const trimmed = rnAvatarUrlInput.trim();
    if (!trimmed) return;
    setAvatarUri(trimmed);
    const inferred = inferCharacterName(trimmed);
    if (inferred) {
      setAthleteName(inferred);
      setNameDraft(inferred);
      Alert.alert('Avatar Calibrated', `⚡ Profile set to "${inferred}"!`);
    } else {
      Alert.alert('Avatar Updated', '⚡ Direct image link applied!');
    }
    setRnAvatarUrlInput('');
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return (typeof localStorage !== 'undefined' ? localStorage.getItem('rana_gemini_api_key') : '') || '';
    } catch (e) {
      return '';
    }
  });

  const actionChips = [
    { id: 'gain', label: '🥩 Generate Weight Gain Macros', prompt: 'Generate an elite Weight Gain Diet Plan with high-protein surplus macros' },
    { id: 'cut', label: '📉 Create Fat Loss Diet Plan', prompt: 'Create a precision Fat Loss Diet Plan with macro split and peri-workout nutrition' },
    { id: 'form', label: '🏋️ Analyze Form (Camera)', prompt: 'Analyze my deadlift and back squat form kinematics with computer vision biomechanics' },
    { id: 'rm', label: '📊 1-Rep Max Predictor', prompt: 'Run neural 1-Rep Max predictor telemetry for bench press based on 125kg x 5 reps' },
  ];

  const handleAction = async (promptText: string) => {
    const query = promptText.trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const endpoint = 'https://rana-x-backend.vercel.app/api/chat';

      const payload = {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content:
              'You are RANA X Coach, an elite AI expert in fitness, powerlifting, bodybuilding, clinical dietetics, dermatology, and physiotherapy. Only answer health-related questions. Strictly refuse non-health topics. Maintain a highly clinical and professional tone.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = await response.json().catch(() => null);

      // Seamless fallback if Groq decommissioned llama3-8b-8192
      if (data?.error || !data?.choices?.[0]?.message?.content) {
        const fallbackRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            model: 'openai/gpt-oss-20b',
          }),
        });
        const fallbackData = await fallbackRes.json().catch(() => null);
        if (fallbackData?.choices?.[0]?.message?.content) {
          data = fallbackData;
        }
      }

      if (!data?.choices?.[0]?.message?.content) {
        throw new Error(data?.error?.message || `HTTP ${response.status}`);
      }

      const replyText = data.choices[0].message.content;

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI Coach API error:', err);
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ RANA X Coach is currently under maintenance. We are upgrading our neural engines. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyDiet = (msgId: string, plan: DietPlan) => {
    setDailyCaloriesTarget(plan.calories);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
    Alert.alert('Protocol Applied!', `Target updated to ${plan.calories} kcal/day on Dashboard.`);
  };

  const handleSaveToProfile = (msgId: string, plan: DietPlan) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, saved: true } : m))
    );
    Alert.alert('Saved to Profile', `"${plan.title}" saved to Athlete Profile.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>RANA </Text>
            <Text style={styles.brandAccent}>X</Text>
          </View>
          <Text style={styles.tagline}>ADVANCED AI DIETITIAN & ELITE COACH</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>AI ACTIVE</Text>
        </View>
      </View>

      {/* Main Content Area */}
      {currentTab === 'coach' && (
        <View style={styles.coachWrapper}>
          {/* AI Coach Header Banner */}
          <View style={[styles.coachHeaderCard, { borderColor: `${primaryGlowColor}40` }]}>
            <View style={styles.coachHeaderLeft}>
              <View
                style={[
                  styles.coachAvatarCircle,
                  {
                    borderColor: primaryGlowColor,
                    shadowColor: primaryGlowColor,
                  },
                ]}
              >
                <Text style={styles.coachAvatarEmoji}>🤖</Text>
                <View style={[styles.coachOnlineDot, { backgroundColor: COLORS.neonGreen }]} />
              </View>
              <View style={styles.coachHeaderTextContainer}>
                <View style={styles.coachTitleRow}>
                  <Text style={styles.coachTitleText}>RANA X Coach</Text>
                  <View style={[styles.activeStatusTag, { borderColor: `${primaryGlowColor}70` }]}>
                    <Text style={[styles.activeStatusTagText, { color: primaryGlowColor }]}>AI ONLINE</Text>
                  </View>
                </View>
                {/* Badges below it reading 'Dietician | Physio | Derma | Coach' */}
                <View style={[styles.coachBadgesPill, { borderColor: `${primaryGlowColor}50` }]}>
                  <Text style={[styles.coachBadgesText, { color: primaryGlowColor }]}>
                    Dietician | Physio | Derma | Coach
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Multi-Modal Action Chips (Horizontal Scrollable) */}
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {actionChips.map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  style={styles.chipButton}
                  onPress={() => handleAction(chip.prompt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{chip.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatScrollContent}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View key={msg.id} style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperAi]}>
                  {!isUser && <Text style={[styles.aiSender, { color: primaryGlowColor }]}>⚡ RANA X COACH</Text>}

                  <View style={[styles.bubbleBase, isUser ? styles.userBubble : styles.aiBubble]}>
                    <Text style={styles.bubbleText}>{msg.text}</Text>

                    {/* Structured Glassmorphism Diet Plan Card */}
                    {msg.dietPlan && (
                      <View style={styles.dietPlanCard}>
                        <View style={styles.dietHeaderRow}>
                          <Text style={styles.dietPlanTitle}>{msg.dietPlan.title}</Text>
                          <Text style={styles.dietGoalBadge}>{msg.dietPlan.targetGoal}</Text>
                        </View>

                        {/* Calories Callout */}
                        <View style={styles.caloriesBanner}>
                          <Text style={styles.caloriesLabel}>TOTAL DAILY TARGET</Text>
                          <Text style={styles.caloriesValue}>
                            {msg.dietPlan.calories} <Text style={styles.caloriesUnit}>KCAL</Text>
                          </Text>
                        </View>

                        {/* Macro Split Progress Bars */}
                        <Text style={styles.macroHeader}>MACRO SPLIT VISUALIZER</Text>
                        <View style={styles.macroBarContainer}>
                          <View style={[styles.macroBarSegment, { flex: msg.dietPlan.proteinPct, backgroundColor: COLORS.neonCyan }]} />
                          <View style={[styles.macroBarSegment, { flex: msg.dietPlan.carbsPct, backgroundColor: COLORS.neonRed }]} />
                          <View style={[styles.macroBarSegment, { flex: msg.dietPlan.fatsPct, backgroundColor: COLORS.neonPurple }]} />
                        </View>

                        {/* 3 Macro Pillars */}
                        <View style={styles.macroPillarsRow}>
                          <View style={[styles.macroPillar, { borderColor: COLORS.neonCyan }]}>
                            <Text style={[styles.pillarLabel, { color: COLORS.neonCyan }]}>PROTEIN</Text>
                            <Text style={styles.pillarVal}>{msg.dietPlan.proteinGrams}g</Text>
                            <Text style={styles.pillarPct}>{msg.dietPlan.proteinPct}%</Text>
                          </View>
                          <View style={[styles.macroPillar, { borderColor: COLORS.neonRed }]}>
                            <Text style={[styles.pillarLabel, { color: COLORS.neonRed }]}>CARBS</Text>
                            <Text style={styles.pillarVal}>{msg.dietPlan.carbsGrams}g</Text>
                            <Text style={styles.pillarPct}>{msg.dietPlan.carbsPct}%</Text>
                          </View>
                          <View style={[styles.macroPillar, { borderColor: COLORS.neonPurple }]}>
                            <Text style={[styles.pillarLabel, { color: COLORS.neonPurple }]}>FATS</Text>
                            <Text style={styles.pillarVal}>{msg.dietPlan.fatsGrams}g</Text>
                            <Text style={styles.pillarPct}>{msg.dietPlan.fatsPct}%</Text>
                          </View>
                        </View>

                        {/* Meal Timing Cues */}
                        <View style={styles.mealCueBox}>
                          <Text style={styles.mealCueTitle}>⚡ Pre-Workout (T - 35m)</Text>
                          <Text style={styles.mealCueDesc}>{msg.dietPlan.preWorkout}</Text>
                        </View>
                        <View style={styles.mealCueBox}>
                          <Text style={styles.mealCueTitle}>🛡️ Post-Workout (T + 45m)</Text>
                          <Text style={styles.mealCueDesc}>{msg.dietPlan.postWorkout}</Text>
                        </View>

                        {/* Interactive Action Buttons */}
                        <View style={styles.dietActionsRow}>
                          <TouchableOpacity
                            style={[styles.saveBtn, msg.saved && styles.savedBtn]}
                            onPress={() => handleSaveToProfile(msg.id, msg.dietPlan!)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.saveBtnText}>{msg.saved ? '✓ SAVED' : 'SAVE TO PROFILE'}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.applyBtn, msg.applied && styles.appliedBtn]}
                            onPress={() => handleApplyDiet(msg.id, msg.dietPlan!)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.applyBtnText}>{msg.applied ? '✓ SYNCED' : 'APPLY TO APP'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Subtle Glowing 'typing...' Indicator */}
            {isTyping && (
              <View style={[styles.bubbleWrapper, styles.bubbleWrapperAi]}>
                <Text style={[styles.aiSender, { color: primaryGlowColor }]}>⚡ RANA X COACH</Text>
                <View
                  style={[
                    styles.bubbleBase,
                    styles.aiBubble,
                    {
                      borderColor: primaryGlowColor,
                      shadowColor: primaryGlowColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      elevation: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: primaryGlowColor, marginHorizontal: 2 }} />
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.neonRed, marginHorizontal: 2 }} />
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.neonPurple, marginHorizontal: 2 }} />
                  </View>
                  <Text style={{ color: primaryGlowColor, fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}>
                    typing...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Voice Input "Listening..." Animation HUD */}
          {isListening && (
            <View
              style={[
                styles.listeningContainer,
                {
                  borderColor: primaryGlowColor,
                  shadowColor: primaryGlowColor,
                },
              ]}
            >
              <View style={styles.waveformBox}>
                <Animated.View style={[styles.soundWaveBar, { height: waveAnim1, backgroundColor: primaryGlowColor }]} />
                <Animated.View style={[styles.soundWaveBar, { height: waveAnim2, backgroundColor: COLORS.neonRed }]} />
                <Animated.View style={[styles.soundWaveBar, { height: waveAnim3, backgroundColor: primaryGlowColor }]} />
                <Animated.View style={[styles.soundWaveBar, { height: waveAnim4, backgroundColor: COLORS.neonPurple }]} />
                <Animated.View style={[styles.soundWaveBar, { height: waveAnim5, backgroundColor: COLORS.neonCyan }]} />
              </View>
              <View style={styles.listeningTextBox}>
                <Text style={[styles.listeningTitle, { color: primaryGlowColor }]}>
                  🎙️ Listening...
                </Text>
                <Text style={styles.listeningSubtitle}>
                  Speak your diet, physio, or training question
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleToggleVoice}
                style={styles.cancelListeningBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelListeningText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Chat Input */}
          <View style={styles.inputContainer}>
            {/* Glowing Microphone Button */}
            <TouchableOpacity
              onPress={handleToggleVoice}
              activeOpacity={0.7}
              accessibilityLabel="Voice input microphone"
              accessibilityRole="button"
            >
              <Animated.View
                style={[
                  styles.micButton,
                  {
                    transform: [{ scale: isListening ? micPulseAnim : 1 }],
                    borderColor: isListening ? COLORS.neonRed : primaryGlowColor,
                    shadowColor: isListening ? COLORS.neonRed : primaryGlowColor,
                    backgroundColor: isListening ? 'rgba(255, 23, 68, 0.25)' : 'rgba(0, 240, 255, 0.12)',
                  },
                ]}
              >
                <Text style={styles.micIconText}>🎙️</Text>
              </Animated.View>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Ask Dietician, Physio, Derma, Coach..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: primaryGlowColor }]}
              onPress={() => {
                if (inputText.trim()) {
                  handleAction(inputText);
                  setInputText('');
                }
              }}
            >
              <Text style={styles.sendText}>SEND</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentTab === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.glassCard, styles.ringContainer]}>
            <Text style={styles.ringMetric}>840</Text>
            <Text style={styles.ringTarget}>/ {dailyCaloriesTarget.toLocaleString()} KCAL TARGET</Text>
            <Text style={styles.ringSubtitle}>Synchronized from RANA Clinical Dietitian</Text>
          </View>

          {/* Large Glowing Prominent Nutri-Lens Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsNutriLensVisible(true)}
            style={{
              marginTop: 14,
              borderRadius: 20,
              padding: 16,
              backgroundColor: '#0A0E17',
              borderWidth: 2,
              borderColor: primaryGlowColor,
              shadowColor: primaryGlowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: `${primaryGlowColor}20`,
                  borderWidth: 1.5,
                  borderColor: primaryGlowColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>📷</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 }}>
                    Scan Meal
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: `${primaryGlowColor}25`,
                      borderWidth: 1,
                      borderColor: `${primaryGlowColor}60`,
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: primaryGlowColor }}>NUTRI-LENS</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#A0AAB8', marginTop: 2 }}>
                  AI Macro & Vitamin Telemetry
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 18, color: primaryGlowColor, fontWeight: 'bold' }}>➔</Text>
          </TouchableOpacity>

          {/* Nutri-Lens Modal */}
          {isNutriLensVisible && (
            <Modal
              visible={isNutriLensVisible}
              transparent
              animationType="slide"
              onRequestClose={closeNutriLens}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.78)',
                  justifyContent: 'flex-end',
                }}
              >
                <View
                  style={{
                    height: '75%',
                    backgroundColor: '#0A0A0A',
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    borderTopWidth: 2,
                    borderLeftWidth: 1.5,
                    borderRightWidth: 1.5,
                    borderColor: '#00F0FF',
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    paddingBottom: 20,
                    shadowColor: '#00F0FF',
                    shadowOffset: { width: 0, height: -6 },
                    shadowOpacity: 0.35,
                    shadowRadius: 18,
                    elevation: 25,
                  }}
                >
                  {/* Cyber drag/accent indicator */}
                  <View
                    style={{
                      width: 44,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 240, 255, 0.4)',
                      alignSelf: 'center',
                      marginBottom: 12,
                    }}
                  />

                  {/* 1. Top Header ('NUTRI-LENS' centrally positioned and close button) */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ width: 36 }} />
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '900',
                        color: '#00F0FF',
                        letterSpacing: 3,
                        textAlign: 'center',
                        textShadowColor: 'rgba(0, 240, 255, 0.65)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 12,
                      }}
                    >
                      NUTRI-LENS
                    </Text>
                    <TouchableOpacity
                      onPress={closeNutriLens}
                      activeOpacity={0.7}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                  >
                    {/* 2. Row with two large interactive cyber buttons: 'Open Camera' and 'Upload from Gallery' */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleNutriOpenCamera}
                        style={{
                          flex: 1,
                          paddingVertical: 16,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          backgroundColor: '#0A131F',
                          borderWidth: 1.5,
                          borderColor: '#00F0FF',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#00F0FF',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 5,
                        }}
                      >
                        <Text style={{ fontSize: 26, marginBottom: 6 }}>📸</Text>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 }}>
                          Open Camera
                        </Text>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: '#00F0FF', marginTop: 2, letterSpacing: 1 }}>
                          LIVE SCANNER
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleNutriUploadFromGallery}
                        style={{
                          flex: 1,
                          paddingVertical: 16,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          backgroundColor: '#091A14',
                          borderWidth: 1.5,
                          borderColor: '#00FF9D',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#00FF9D',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 5,
                        }}
                      >
                        <Text style={{ fontSize: 26, marginBottom: 6 }}>🖼️</Text>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 }}>
                          Upload from Gallery
                        </Text>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: '#00FF9D', marginTop: 2, letterSpacing: 1 }}>
                          SELECT PHOTO
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 3. Dedicated fixed-height preview window (height: 250px) */}
                    <View
                      style={{
                        marginTop: 18,
                        height: 250,
                        borderRadius: 16,
                        overflow: 'hidden',
                        backgroundColor: '#05070B',
                        borderWidth: 1.5,
                        borderColor: imageUri ? '#00F0FF' : 'rgba(0, 240, 255, 0.15)',
                        borderStyle: imageUri ? 'solid' : 'dashed',
                        ...(imageUri
                          ? {
                              shadowColor: '#00F0FF',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.4,
                              shadowRadius: 10,
                              elevation: 8,
                            }
                          : {}),
                      }}
                    >
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>

                    {/* Glowing 'ANALYZING OPTICAL DATA...' loading indicator */}
                    {isNutriAnalyzing && (
                      <View
                        style={{
                          marginTop: 16,
                          padding: 16,
                          borderRadius: 14,
                          backgroundColor: 'rgba(0, 240, 255, 0.06)',
                          borderWidth: 1,
                          borderColor: 'rgba(0, 240, 255, 0.4)',
                          alignItems: 'center',
                          shadowColor: '#00F0FF',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.25,
                          shadowRadius: 10,
                          elevation: 4,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <ActivityIndicator size="small" color="#00F0FF" />
                          <Text
                            style={{
                              color: '#00F0FF',
                              fontSize: 12,
                              fontWeight: '900',
                              letterSpacing: 1.5,
                              textShadowColor: 'rgba(0, 240, 255, 0.6)',
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 8,
                            }}
                          >
                            ANALYZING OPTICAL DATA...
                          </Text>
                        </View>
                        <View
                          style={{
                            width: '100%',
                            height: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: '70%',
                              height: '100%',
                              backgroundColor: '#00F0FF',
                              borderRadius: 2,
                              shadowColor: '#00F0FF',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.9,
                              shadowRadius: 6,
                            }}
                          />
                        </View>
                      </View>
                    )}

                    {/* Non-Food Error UI (When isNutriError === true) */}
                    {nutriAnalysisComplete && !isNutriAnalyzing && isNutriError && (
                      <View
                        style={{
                          marginTop: 16,
                          padding: 20,
                          borderRadius: 16,
                          backgroundColor: '#160507',
                          borderWidth: 1.5,
                          borderColor: '#FF003C',
                          shadowColor: '#FF003C',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.5,
                          shadowRadius: 14,
                          elevation: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FF003C',
                            fontSize: 14,
                            fontWeight: '900',
                            letterSpacing: 0.8,
                            textAlign: 'center',
                            lineHeight: 22,
                            textShadowColor: 'rgba(255, 0, 60, 0.6)',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 8,
                          }}
                        >
                          ⚠️ NON-FOOD ITEM DETECTED. Please scan a valid biological meal.
                        </Text>
                      </View>
                    )}

                    {/* Redesigned Comprehensive Vertical Nutrient Breakdown Card (When isNutriError === false) */}
                    {nutriAnalysisComplete && !isNutriAnalyzing && !isNutriError && (
                      <ScrollView
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        style={{
                          marginTop: 16,
                          maxHeight: 480,
                        }}
                        contentContainerStyle={{
                          padding: 18,
                          borderRadius: 18,
                          backgroundColor: '#080C14',
                          borderWidth: 1.5,
                          borderColor: '#00F0FF',
                          shadowColor: '#00F0FF',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 12,
                          elevation: 6,
                        }}
                      >
                        {/* RESTORE STATUS BAR: At the very top of the Nutrient Breakdown container, render the glowing status pill */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            borderWidth: 1.5,
                            borderColor: '#00F0FF',
                            borderRadius: 24,
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            marginBottom: 16,
                            alignSelf: 'stretch',
                            shadowColor: '#00F0FF',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            elevation: 3,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#00F0FF',
                              marginRight: 8,
                              shadowColor: '#00F0FF',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.9,
                              shadowRadius: 6,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '800',
                              color: '#00F0FF',
                              letterSpacing: 0.8,
                              fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                              textShadowColor: 'rgba(0, 240, 255, 0.6)',
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 6,
                            }}
                          >
                            {macroData ? 'Status: Analysis Complete' : 'Status: Awaiting Server Response'}
                          </Text>
                        </View>

                        {/* Top Element: A large, full-width card showing ONLY 'Total Calories: -- kcal' */}
                        <View
                          style={{
                            width: '100%',
                            backgroundColor: 'rgba(0, 240, 255, 0.08)',
                            borderWidth: 1.5,
                            borderColor: '#00F0FF',
                            borderRadius: 14,
                            paddingVertical: 18,
                            paddingHorizontal: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                            shadowColor: '#00F0FF',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.35,
                            shadowRadius: 10,
                            elevation: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 21,
                              fontWeight: '900',
                              color: '#00F0FF',
                              letterSpacing: 1,
                              fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                              textShadowColor: 'rgba(0, 240, 255, 0.7)',
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 10,
                              textAlign: 'center',
                            }}
                          >
                            Total Calories: {macroData?.calories ? String(macroData.calories).replace(/kcal/i, '').trim() : '--'} kcal
                          </Text>
                        </View>

                        {/* Middle Element: A 2x2 grid for Macros */}
                        <View style={{ marginBottom: 10, marginTop: 6 }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '900',
                              color: 'rgba(255, 255, 255, 0.75)',
                              letterSpacing: 1.5,
                            }}
                          >
                            MACRONUTRIENTS
                          </Text>
                        </View>
                        <View style={{ gap: 10, marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                borderWidth: 1,
                                borderColor: 'rgba(0, 240, 255, 0.25)',
                                borderRadius: 12,
                                paddingVertical: 14,
                                paddingHorizontal: 12,
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '800',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  letterSpacing: 1,
                                  marginBottom: 6,
                                }}
                              >
                                PROTEIN
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: '900',
                                  color: '#FFFFFF',
                                  letterSpacing: 0.5,
                                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                                }}
                              >
                                Protein: {macroData?.protein ? String(macroData.protein).replace(/g/i, '').trim() : '--'} g
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                borderWidth: 1,
                                borderColor: 'rgba(0, 240, 255, 0.25)',
                                borderRadius: 12,
                                paddingVertical: 14,
                                paddingHorizontal: 12,
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '800',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  letterSpacing: 1,
                                  marginBottom: 6,
                                }}
                              >
                                CARBS
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: '900',
                                  color: '#FFFFFF',
                                  letterSpacing: 0.5,
                                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                                }}
                              >
                                Carbs: {macroData?.carbs ? String(macroData.carbs).replace(/g/i, '').trim() : '--'} g
                              </Text>
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                borderWidth: 1,
                                borderColor: 'rgba(0, 240, 255, 0.25)',
                                borderRadius: 12,
                                paddingVertical: 14,
                                paddingHorizontal: 12,
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '800',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  letterSpacing: 1,
                                  marginBottom: 6,
                                }}
                              >
                                FATS
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: '900',
                                  color: '#FFFFFF',
                                  letterSpacing: 0.5,
                                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                                }}
                              >
                                Fats: {macroData?.fats ? String(macroData.fats).replace(/g/i, '').trim() : '--'} g
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                borderWidth: 1,
                                borderColor: 'rgba(0, 240, 255, 0.25)',
                                borderRadius: 12,
                                paddingVertical: 14,
                                paddingHorizontal: 12,
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '800',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  letterSpacing: 1,
                                  marginBottom: 6,
                                }}
                              >
                                FIBER
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: '900',
                                  color: '#FFFFFF',
                                  letterSpacing: 0.5,
                                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                                }}
                              >
                                Fiber: {macroData?.fiber ? String(macroData.fiber).replace(/g/i, '').trim() : '--'} g
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Bottom Element: A vertical list for Micro-nutrients */}
                        <View style={{ marginBottom: 10, marginTop: 6 }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '900',
                              color: 'rgba(255, 255, 255, 0.75)',
                              letterSpacing: 1.5,
                            }}
                          >
                            MICRONUTRIENTS
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            borderWidth: 1,
                            borderColor: 'rgba(0, 240, 255, 0.15)',
                            borderRadius: 12,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                          }}
                        >
                          {[
                            {
                              name: 'Vitamin A',
                              val: macroData?.vitaminA ? `${String(macroData.vitaminA).replace(/%/i, '').trim()} %` : '-- %',
                            },
                            {
                              name: 'Vitamin C',
                              val: macroData?.vitaminC ? `${String(macroData.vitaminC).replace(/%/i, '').trim()} %` : '-- %',
                            },
                            {
                              name: 'Calcium',
                              val: macroData?.calcium ? `${String(macroData.calcium).replace(/%/i, '').trim()} %` : '-- %',
                            },
                            {
                              name: 'Iron',
                              val: macroData?.iron ? `${String(macroData.iron).replace(/%/i, '').trim()} %` : '-- %',
                            },
                          ].map((micro, idx, arr) => (
                            <View
                              key={idx}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingVertical: 10,
                                borderBottomWidth: idx === arr.length - 1 ? 0 : 1,
                                borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: '700',
                                  color: '#FFFFFF',
                                  letterSpacing: 0.5,
                                }}
                              >
                                {micro.name}
                              </Text>
                              <View
                                style={{
                                  backgroundColor: 'rgba(0, 240, 255, 0.08)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(0, 240, 255, 0.3)',
                                  borderRadius: 8,
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: '900',
                                    color: '#00F0FF',
                                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                                  }}
                                >
                                  {micro.val}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    )}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
      )}

      {currentTab === 'workouts' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Banner */}
          <View style={[styles.glassCard, { borderColor: `${primaryGlowColor}50` }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[styles.workoutSectionTitle, { color: COLORS.neonRed }]}>
                  ⚡ MULTI-DISCIPLINARY COMBAT MATRIX
                </Text>
                <Text style={{ color: COLORS.textWhite, fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                  Workouts & Protocols
                </Text>
              </View>
              <View style={styles.rnCountBadge}>
                <Text style={styles.rnCountText}>
                  {
                    sampleWorkouts.filter((w) => {
                      const matchesCat = selectedWorkoutCategory === 'All' || w.category === selectedWorkoutCategory;
                      const matchesTier = selectedWorkoutTier === 'All Levels' || w.tier === selectedWorkoutTier;
                      return matchesCat && matchesTier;
                    }).length
                  }{' '}
                  READY
                </Text>
              </View>
            </View>

            {/* Discipline Category Filters */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.rnFilterHeading}>TRAINING DISCIPLINE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rnFilterScroll}>
                {['All', 'Powerlifting', 'Bodybuilding', 'Calisthenics', 'Athletics', 'HIIT', 'Core'].map((cat) => {
                  const isSel = selectedWorkoutCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedWorkoutCategory(cat)}
                      style={[
                        styles.rnFilterPill,
                        isSel && {
                          backgroundColor: 'rgba(0, 240, 255, 0.25)',
                          borderColor: COLORS.neonCyan,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rnFilterPillText,
                          isSel && { color: COLORS.neonCyan, fontWeight: '900' },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Skill Tier Filters */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.rnFilterHeading}>EXPERIENCE / SKILL TIER</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rnFilterScroll}>
                {[
                  { label: 'All Levels', color: COLORS.textMuted },
                  { label: 'Beginner', color: COLORS.neonGreen },
                  { label: 'Intermediate', color: COLORS.neonCyan },
                  { label: 'Advance', color: COLORS.neonPurple },
                  { label: 'Elite', color: COLORS.neonRed },
                ].map((tier) => {
                  const isSel = selectedWorkoutTier === tier.label;
                  return (
                    <TouchableOpacity
                      key={tier.label}
                      onPress={() => setSelectedWorkoutTier(tier.label)}
                      style={[
                        styles.rnTierPill,
                        isSel && {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        },
                      ]}
                    >
                      {tier.label !== 'All Levels' && (
                        <View style={[styles.rnTierDot, { backgroundColor: tier.color }]} />
                      )}
                      <Text
                        style={[
                          styles.rnTierPillText,
                          { color: isSel ? COLORS.textWhite : tier.color },
                          isSel && { fontWeight: '800' },
                        ]}
                      >
                        {tier.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* IPF Technical Standards Active Banner */}
          {(selectedWorkoutCategory === 'All' || selectedWorkoutCategory === 'Powerlifting') && (
            <View
              style={[
                styles.glassCard,
                {
                  borderColor: 'rgba(255, 23, 68, 0.4)',
                  backgroundColor: 'rgba(255, 23, 68, 0.08)',
                  marginTop: 10,
                  padding: 12,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: COLORS.neonRed, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>
                  🏆 IPF TECHNICAL STANDARDS ACTIVE
                </Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <View style={{ backgroundColor: 'rgba(255,23,68,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,23,68,0.4)' }}>
                    <Text style={{ color: COLORS.neonRed, fontSize: 9, fontWeight: '800' }}>
                      {ipfStats.weightClass.label}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(0,240,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,240,255,0.4)' }}>
                    <Text style={{ color: COLORS.neonCyan, fontSize: 9, fontWeight: '800' }}>
                      {ipfStats.tier.toUpperCase()} TIER ({ipfStats.relativeMultiplier}× BW)
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 4 }}>
                Working sets dynamically periodized from verified 1RM: SQ {maxSquat}kg • BP {maxBench}kg • DL {maxDeadlift}kg ({ipfStats.ipfGlPoints} GL Points)
              </Text>
            </View>
          )}

          {/* Workouts List */}
          {sampleWorkouts
            .map((w) =>
              calibrateIpfWorkout(w, {
                name: athleteName,
                avatarUrl: '',
                themeColor: primaryGlowColor,
                currentPlanId: '',
                weightKg: athleteWeight,
                heightCm: 182,
                maxBenchKg: maxBench,
                maxSquatKg: maxSquat,
                maxDeadliftKg: maxDeadlift,
                gender: ipfDivision,
                ipfWeightClass: ipfStats.weightClass.label,
                ipfGlPoints: ipfStats.ipfGlPoints,
              })
            )
            .filter((w) => {
              const matchesCat = selectedWorkoutCategory === 'All' || w.category === selectedWorkoutCategory;
              const matchesTier = selectedWorkoutTier === 'All Levels' || w.tier === selectedWorkoutTier;
              return matchesCat && matchesTier;
            })
            .map((routine) => {
              const catColor =
                routine.category === 'Powerlifting' || routine.category === 'Strength'
                  ? COLORS.neonRed
                  : routine.category === 'Bodybuilding' || routine.category === 'Hypertrophy'
                  ? COLORS.neonCyan
                  : routine.category === 'Calisthenics'
                  ? COLORS.neonGreen
                  : routine.category === 'Athletics'
                  ? '#FF9100'
                  : COLORS.neonPurple;

              const tierColor =
                routine.tier === 'Beginner'
                  ? COLORS.neonGreen
                  : routine.tier === 'Intermediate'
                  ? COLORS.neonCyan
                  : routine.tier === 'Advance'
                  ? COLORS.neonPurple
                  : COLORS.neonRed;

              const intensity = routine.intensityMeter || 80;

              return (
                <View
                  key={routine.id}
                  style={[
                    styles.glassCard,
                    {
                      borderColor: `${catColor}30`,
                      marginTop: 10,
                      backgroundColor: 'rgba(18, 18, 18, 0.85)',
                    },
                  ]}
                >
                  {/* Top Badges Row */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {/* Discipline Badge */}
                      <View
                        style={[
                          styles.rnBadge,
                          { backgroundColor: `${catColor}20`, borderColor: `${catColor}60` },
                        ]}
                      >
                        <Text style={[styles.rnBadgeText, { color: catColor }]}>
                          {routine.category.toUpperCase()}
                        </Text>
                      </View>
                      {/* Tier Badge */}
                      <View
                        style={[
                          styles.rnBadge,
                          { backgroundColor: `${tierColor}15`, borderColor: `${tierColor}50` },
                        ]}
                      >
                        <View style={[styles.rnTierDot, { backgroundColor: tierColor }]} />
                        <Text style={[styles.rnBadgeText, { color: tierColor }]}>
                          {routine.tier?.toUpperCase() || 'ALL TIERS'}
                        </Text>
                      </View>
                    </View>

                    {/* Duration and Calories */}
                    <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: '600' }}>
                      ⏱ {routine.durationMinutes}m • 🔥 {routine.caloriesBurned} kcal
                    </Text>
                  </View>

                  {/* Protocol Badge if available */}
                  {routine.protocolBadge && (
                    <View style={styles.rnProtocolBadge}>
                      <Text style={styles.rnProtocolBadgeText}>⚡ {routine.protocolBadge}</Text>
                    </View>
                  )}

                  {routine.category === 'Powerlifting' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <View style={{ backgroundColor: 'rgba(255, 23, 68, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 23, 68, 0.4)' }}>
                        <Text style={{ color: COLORS.neonRed, fontSize: 8, fontWeight: '900' }}>
                          IPF 1RM CALIBRATED
                        </Text>
                      </View>
                      <Text style={{ color: COLORS.textMuted, fontSize: 8 }}>
                        Auto-scaled off verified SBD
                      </Text>
                    </View>
                  )}

                  {/* Title & Description */}
                  <Text style={styles.rnWorkoutCardTitle}>{routine.title}</Text>
                  <Text style={styles.rnWorkoutCardDesc}>{routine.description}</Text>

                  {/* Intensity Meter */}
                  <View style={styles.rnIntensityContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={styles.rnIntensityLabel}>INTENSITY OVERLOAD METER</Text>
                      <Text style={[styles.rnIntensityValue, { color: catColor }]}>
                        {intensity}% • {routine.intensity.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.rnIntensityBarTrack}>
                      <View
                        style={[
                          styles.rnIntensityBarFill,
                          { width: `${intensity}%`, backgroundColor: catColor },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Movement Roster */}
                  <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                    <Text style={styles.rnRosterHeading}>
                      Movement Roster ({routine.exercises.length} Movements)
                    </Text>
                    {routine.exercises.slice(0, 3).map((ex) => (
                      <View key={ex.id} style={styles.rnRosterRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View style={[styles.rnRosterDot, { backgroundColor: catColor }]} />
                          <Text style={styles.rnRosterName} numberOfLines={1}>
                            {ex.name}
                          </Text>
                        </View>
                        <Text style={styles.rnRosterSets}>
                          {ex.weightKg > 0 ? `${ex.weightKg}kg • ` : ''}
                          {ex.sets} × {ex.targetReps}
                        </Text>
                      </View>
                    ))}
                    {routine.exercises.length > 3 && (
                      <Text style={styles.rnRosterMore}>
                        + {routine.exercises.length - 3} more periodized movements
                      </Text>
                    )}
                  </View>

                  {/* Engage Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      Alert.alert(
                        'Protocol Engaged',
                        `Engaging: ${routine.title}\nCategory: ${routine.category}\nSkill Tier: ${routine.tier}\nIntensity: ${intensity}%`
                      );
                    }}
                    style={[styles.rnEngageBtn, { backgroundColor: catColor }]}
                  >
                    <Text style={styles.rnEngageBtnText}>⚡ ENGAGE PROTOCOL</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
        </ScrollView>
      )}

      {currentTab === 'profile' && (
        <ScrollView style={styles.profileScroll} contentContainerStyle={styles.profileScrollContent}>
          {/* 1. Profile Header with Interactive Avatar Ring */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {/* Dynamic Aura Ring with primaryGlowColor - Entire Avatar Directly Tappable */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Alert.alert(
                    '⚡ Calibrate Profile Photo',
                    'Choose an option to update your profile avatar:',
                    [
                      { text: '📁 Upload from Gallery', onPress: handlePickAvatar },
                      { text: '📷 Live Camera Snap', onPress: handleCaptureCamera },
                      {
                        text: '🛡️ Reset Monogram',
                        style: 'destructive',
                        onPress: () => {
                          setAvatarUri('');
                          Alert.alert('Reset', 'Avatar reset to default Cyber Monogram.');
                        },
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
                style={[
                  styles.avatarGlowRing,
                  {
                    borderColor: primaryGlowColor,
                    shadowColor: primaryGlowColor,
                  },
                ]}
                accessibilityLabel="Tap to calibrate profile picture"
                accessibilityRole="button"
              >
                <View style={styles.avatarTouch}>
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                </View>
              </TouchableOpacity>

              {/* Level Badge */}
              <View style={[styles.levelBadge, { borderColor: `${primaryGlowColor}80` }]}>
                <Text style={[styles.levelBadgeText, { color: primaryGlowColor }]}>
                  LVL {athleteLevel}
                </Text>
              </View>
            </View>

            {/* Editable Athlete Name Header */}
            {!isEditingAthleteName ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 8 }}>
                <Text
                  style={[
                    styles.athleteNameText,
                    {
                      color: athleteTextColor,
                      fontFamily:
                        athleteFont === 'Cyber'
                          ? 'monospace'
                          : athleteFont === 'Athletic'
                          ? 'sans-serif-condensed'
                          : athleteFont === 'Neon'
                          ? 'sans-serif'
                          : undefined,
                      letterSpacing: athleteFont === 'Neon' ? 2 : athleteFont === 'Athletic' ? 1.5 : 0.5,
                    },
                  ]}
                >
                  {athleteName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setNameDraft(athleteName);
                    setIsEditingAthleteName(true);
                  }}
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: `${primaryGlowColor}60`,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 13, color: primaryGlowColor }}>✏️</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: '100%', alignItems: 'center', marginTop: 14, paddingHorizontal: 16 }}>
                {/* TextInput and Save button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 8 }}>
                  <TextInput
                    value={nameDraft}
                    onChangeText={setNameDraft}
                    autoFocus
                    style={{
                      flex: 1,
                      backgroundColor: '#121216',
                      borderWidth: 1,
                      borderColor: primaryGlowColor,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      color: athleteTextColor,
                      fontSize: 14,
                      fontWeight: 'bold',
                      fontFamily:
                        athleteFont === 'Cyber'
                          ? 'monospace'
                          : athleteFont === 'Athletic'
                          ? 'sans-serif-condensed'
                          : undefined,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const trimmed = nameDraft.trim();
                      if (trimmed) setAthleteName(trimmed);
                      setIsEditingAthleteName(false);
                    }}
                    style={{
                      backgroundColor: primaryGlowColor,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 12 }}>✓ Save</Text>
                  </TouchableOpacity>
                </View>

                {/* Sleek Glassmorphism Control Panel directly below TextInput */}
                <View
                  style={{
                    width: '100%',
                    marginTop: 10,
                    backgroundColor: 'rgba(18, 18, 22, 0.85)',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: `${primaryGlowColor}40`,
                    padding: 12,
                  }}
                >
                  {/* Font Selector */}
                  <View style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#888', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Font Selector
                      </Text>
                      <Text style={{ color: primaryGlowColor, fontSize: 10, fontWeight: 'bold' }}>
                        {athleteFont}
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                      {(['System', 'Cyber', 'Athletic', 'Neon'] as const).map((fontOption) => {
                        const isSelected = athleteFont === fontOption;
                        return (
                          <TouchableOpacity
                            key={fontOption}
                            onPress={() => setAthleteFont(fontOption)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 8,
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                              borderWidth: 1,
                              borderColor: isSelected ? athleteTextColor : 'rgba(255,255,255,0.12)',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: 'bold',
                                color: isSelected ? athleteTextColor : '#AAA',
                                fontFamily: fontOption === 'Cyber' ? 'monospace' : undefined,
                              }}
                            >
                              {fontOption}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Isolated Mini Text Color Picker */}
                  <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#888', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Text Color (Isolated)
                      </Text>
                      <Text style={{ color: athleteTextColor, fontSize: 10, fontWeight: 'bold' }}>
                        {athleteTextColor}
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {['#FFFFFF', '#00F0FF', '#00E676', '#FFD600', '#FF007F', '#FF1744', '#D500F9', '#FF6D00'].map((hexColor) => {
                        const isSelected = athleteTextColor.toLowerCase() === hexColor.toLowerCase();
                        return (
                          <TouchableOpacity
                            key={hexColor}
                            onPress={() => setAthleteTextColor(hexColor)}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: hexColor,
                              borderWidth: isSelected ? 2 : 0,
                              borderColor: '#FFFFFF',
                              transform: [{ scale: isSelected ? 1.15 : 1 }],
                            }}
                          />
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}
            <View style={styles.profileMetaRow}>
              <Text style={[styles.athleteHandleText, { color: primaryGlowColor }]}>
                {athleteHandle}
              </Text>
              <Text style={styles.profileMetaDot}>•</Text>
              <View style={styles.rankBadgeContainer}>
                <Text style={styles.rankBadgeText}>{athleteRank}</Text>
              </View>
            </View>
          </View>

          {/* 2. IPF Official Technical Standards & 1-Rep Max Telemetry */}
          <View
            style={[
              styles.glassCard,
              {
                borderColor: `${primaryGlowColor}40`,
                shadowColor: primaryGlowColor,
                shadowOpacity: 0.15,
                shadowRadius: 16,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.cardHeaderFlex}>
              <View>
                <Text style={styles.telemetryCardTitle}>🏆 IPF OFFICIAL STANDARDS</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 1 }}>
                  Technical Rulebook • GL Points System
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!isEditingIpf) {
                    setDraftBench(maxBench.toString());
                    setDraftSquat(maxSquat.toString());
                    setDraftDeadlift(maxDeadlift.toString());
                    setDraftWeight(athleteWeight.toString());
                  }
                  setIsEditingIpf(!isEditingIpf);
                }}
                style={[
                  styles.verifiedBadge,
                  {
                    borderColor: `${primaryGlowColor}60`,
                    backgroundColor: isEditingIpf ? `${primaryGlowColor}30` : `${primaryGlowColor}15`,
                  },
                ]}
              >
                <Text style={[styles.verifiedBadgeText, { color: primaryGlowColor }]}>
                  {isEditingIpf ? 'CANCEL' : 'CALIBRATE SBD'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Division Switcher */}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 3, gap: 4 }}>
              <TouchableOpacity
                onPress={() => setIpfDivision('male')}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: ipfDivision === 'male' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                  borderWidth: 1,
                  borderColor: ipfDivision === 'male' ? COLORS.neonCyan : 'transparent',
                }}
              >
                <Text style={{ color: ipfDivision === 'male' ? COLORS.textWhite : COLORS.textMuted, fontSize: 10, fontWeight: '800' }}>
                  MEN'S IPF (8 CLASSES)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIpfDivision('female')}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: ipfDivision === 'female' ? 'rgba(255, 23, 68, 0.2)' : 'transparent',
                  borderWidth: 1,
                  borderColor: ipfDivision === 'female' ? COLORS.neonRed : 'transparent',
                }}
              >
                <Text style={{ color: ipfDivision === 'female' ? COLORS.textWhite : COLORS.textMuted, fontSize: 10, fontWeight: '800' }}>
                  WOMEN'S IPF (8 CLASSES)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Weight Class & Tier Banner */}
            <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: COLORS.textMuted, fontSize: 9, fontWeight: '800' }}>OFFICIAL WEIGHT CLASS</Text>
                  <Text style={{ color: COLORS.textWhite, fontSize: 16, fontWeight: '900', marginTop: 2 }}>
                    {ipfStats.weightClass.label}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>
                    BW: {athleteWeight} kg ({ipfStats.weightClass.minBodyweight} – {ipfStats.weightClass.maxBodyweight === 999 ? '∞' : `${ipfStats.weightClass.maxBodyweight}.0`} kg)
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 9, fontWeight: '800' }}>SKILL CLASSIFICATION</Text>
                  <View style={{
                    marginTop: 2,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                    backgroundColor: ipfStats.tier === 'Elite' ? 'rgba(255,23,68,0.2)' : 'rgba(0,240,255,0.2)',
                    borderWidth: 1,
                    borderColor: ipfStats.tier === 'Elite' ? COLORS.neonRed : COLORS.neonCyan,
                  }}>
                    <Text style={{
                      color: ipfStats.tier === 'Elite' ? COLORS.neonRed : COLORS.neonCyan,
                      fontSize: 10,
                      fontWeight: '900',
                    }}>
                      {ipfStats.tier.toUpperCase()} ATHLETE
                    </Text>
                  </View>
                </View>
              </View>

              {/* 3 Metric Badges */}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800' }}>SBD TOTAL</Text>
                  <Text style={{ color: COLORS.textWhite, fontSize: 13, fontWeight: '900', marginTop: 2 }}>{ipfStats.totalKg} KG</Text>
                </View>

                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800' }}>RELATIVE STRENGTH</Text>
                  <Text style={{ color: primaryGlowColor, fontSize: 13, fontWeight: '900', marginTop: 2 }}>{ipfStats.relativeMultiplier}× BW</Text>
                </View>

                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800' }}>IPF GL SCORE</Text>
                  <Text style={{ color: COLORS.neonGreen, fontSize: 13, fontWeight: '900', marginTop: 2 }}>{ipfStats.ipfGlPoints} PTS</Text>
                </View>
              </View>

              {/* Tier Progress Bar */}
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>
                    {ipfStats.tier === 'Elite'
                      ? '🏆 Elite Benchmark Achieved'
                      : `Next Tier: ${ipfStats.nextTierName} (+${ipfStats.nextTierKgNeeded} kg)`}
                  </Text>
                  <Text style={{ color: COLORS.textWhite, fontSize: 9, fontWeight: '800' }}>
                    {ipfStats.tierProgressPercent}%
                  </Text>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <View style={{ width: `${ipfStats.tierProgressPercent}%`, height: '100%', backgroundColor: primaryGlowColor }} />
                </View>
              </View>
            </View>

            {/* Quick SBD & Weight Edit Box */}
            {isEditingIpf && (
              <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.neonCyan }}>
                <Text style={{ color: COLORS.neonCyan, fontSize: 10, fontWeight: '900', marginBottom: 8 }}>
                  ⚡ LIVE IPF SBD CALIBRATION
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 8 }}>BW (kg)</Text>
                    <TextInput
                      value={draftWeight}
                      onChangeText={setDraftWeight}
                      keyboardType="numeric"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.textWhite, borderRadius: 8, padding: 6, fontSize: 11, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 8 }}>SQ (kg)</Text>
                    <TextInput
                      value={draftSquat}
                      onChangeText={setDraftSquat}
                      keyboardType="numeric"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.textWhite, borderRadius: 8, padding: 6, fontSize: 11, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 8 }}>BP (kg)</Text>
                    <TextInput
                      value={draftBench}
                      onChangeText={setDraftBench}
                      keyboardType="numeric"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.textWhite, borderRadius: 8, padding: 6, fontSize: 11, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 8 }}>DL (kg)</Text>
                    <TextInput
                      value={draftDeadlift}
                      onChangeText={setDraftDeadlift}
                      keyboardType="numeric"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.textWhite, borderRadius: 8, padding: 6, fontSize: 11, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const bw = parseFloat(draftWeight) || athleteWeight;
                    const sq = parseFloat(draftSquat) || maxSquat;
                    const bp = parseFloat(draftBench) || maxBench;
                    const dl = parseFloat(draftDeadlift) || maxDeadlift;
                    setAthleteWeight(bw);
                    setMaxSquat(sq);
                    setMaxBench(bp);
                    setMaxDeadlift(dl);
                    setIsEditingIpf(false);
                    Alert.alert('IPF Calibrated', `Updated to ${classifyAthleteIpf(bw, sq, bp, dl, ipfDivision).weightClass.label}`);
                  }}
                  style={{ backgroundColor: COLORS.neonCyan, paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>APPLY & RECALIBRATE</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SBD Lift Breakdown Grid */}
            <View style={styles.telemetryGrid}>
              <View style={[styles.telemetryCol, { borderColor: `${primaryGlowColor}50` }]}>
                <Text style={styles.telemetryColLabel}>BENCH PRESS</Text>
                <Text style={styles.telemetryColVal}>{maxBench}</Text>
                <Text style={[styles.telemetryColUnit, { color: primaryGlowColor }]}>{ipfStats.benchMultiplier}× BW</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800', marginTop: 2 }}>{ipfStats.benchTier}</Text>
              </View>

              <View style={[styles.telemetryCol, { borderColor: 'rgba(255,23,68,0.4)' }]}>
                <Text style={styles.telemetryColLabel}>BACK SQUAT</Text>
                <Text style={styles.telemetryColVal}>{maxSquat}</Text>
                <Text style={[styles.telemetryColUnit, { color: COLORS.neonRed }]}>{ipfStats.squatMultiplier}× BW</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800', marginTop: 2 }}>{ipfStats.squatTier}</Text>
              </View>

              <View style={[styles.telemetryCol, { borderColor: 'rgba(176,38,255,0.4)' }]}>
                <Text style={styles.telemetryColLabel}>DEADLIFT</Text>
                <Text style={styles.telemetryColVal}>{maxDeadlift}</Text>
                <Text style={[styles.telemetryColUnit, { color: COLORS.neonPurple }]}>{ipfStats.deadliftMultiplier}× BW</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800', marginTop: 2 }}>{ipfStats.deadliftTier}</Text>
              </View>
            </View>
          </View>

          {/* 3. NEON SPECTRUM & AESTHETICS (Continuous Color Hue Slider Bar) */}
          <View
            style={[
              styles.glassCard,
              {
                borderColor: primaryGlowColor,
                shadowColor: primaryGlowColor,
                shadowOpacity: 0.25,
                shadowRadius: 18,
              },
            ]}
          >
            <View style={styles.cardHeaderFlex}>
              <Text style={styles.spectrumCardTitle}>🎨 NEON SPECTRUM & AESTHETICS</Text>
              <View
                style={[
                  styles.activeSpectrumPill,
                  {
                    borderColor: primaryGlowColor,
                    backgroundColor: `${primaryGlowColor}20`,
                  },
                ]}
              >
                <Text style={[styles.activeSpectrumText, { color: primaryGlowColor }]}>
                  {hueValue}° HUE ACTIVE
                </Text>
              </View>
            </View>

            <Text style={styles.spectrumInstructionText}>
              Drag across the continuous 360° spectrum to dynamically recalibrate all neon borders, active icons, and telemetry stats:
            </Text>

            {/* Continuous Color Spectrum Slider (Hue Bar) */}
            <View style={styles.spectrumContainer}>
              <View style={styles.spectrumHeaderRow}>
                <View style={styles.spectrumColorPreviewRow}>
                  <View
                    style={[
                      styles.spectrumLiveDot,
                      {
                        backgroundColor: primaryGlowColor,
                        shadowColor: primaryGlowColor,
                      },
                    ]}
                  />
                  <Text style={styles.spectrumHslText}>{primaryGlowColor}</Text>
                </View>
                <Text style={[styles.spectrumDegreeText, { color: primaryGlowColor }]}>
                  {hueValue}° / 360°
                </Text>
              </View>

              {/* Draggable Hue Bar with PanResponder */}
              <View
                {...panResponder.panHandlers}
                style={styles.hueBarTrackContainer}
              >
                {/* Continuous Rainbow Gradient Track */}
                <View style={styles.hueBarTrack}>
                  {HUE_SEGMENTS.map((h, idx) => (
                    <View
                      key={idx}
                      style={{
                        flex: 1,
                        height: '100%',
                        backgroundColor: `hsl(${h}, 100%, 50%)`,
                      }}
                    />
                  ))}
                </View>

                {/* Draggable Slider Thumb */}
                <View
                  style={[
                    styles.hueSliderThumb,
                    {
                      left: `${(hueValue / 360) * 100}%`,
                      backgroundColor: primaryGlowColor,
                      shadowColor: primaryGlowColor,
                    },
                  ]}
                >
                  <View style={styles.hueSliderThumbInner} />
                </View>
              </View>

              {/* Hue Degrees Anchor Labels */}
              <View style={styles.hueDegreeLabelsRow}>
                <Text style={[styles.hueDegreeLabel, { color: '#FF1744' }]}>0° RED</Text>
                <Text style={[styles.hueDegreeLabel, { color: '#FFD700' }]}>60° GLD</Text>
                <Text style={[styles.hueDegreeLabel, { color: '#00FF66' }]}>120° GRN</Text>
                <Text style={[styles.hueDegreeLabel, { color: '#00F0FF' }]}>180° CYN</Text>
                <Text style={[styles.hueDegreeLabel, { color: '#2979FF' }]}>240° BLU</Text>
                <Text style={[styles.hueDegreeLabel, { color: '#B026FF' }]}>300° MAG</Text>
                <Text style={[styles.hueDegreeLabel, { color: '#FF1744' }]}>360° RED</Text>
              </View>
            </View>
          </View>


          {/* 4. Body Composition & Telemetry */}
          <View style={styles.biometricsRow}>
            <View style={[styles.glassCard, styles.biometricsBox]}>
              <Text style={styles.biometricsLabel}>BODY WEIGHT</Text>
              <Text style={styles.biometricsVal}>
                86.4 <Text style={[styles.biometricsUnit, { color: primaryGlowColor }]}>KG</Text>
              </Text>
              <Text style={styles.biometricsSub}>Target: 84.0 kg</Text>
            </View>

            <View style={[styles.glassCard, styles.biometricsBox]}>
              <Text style={styles.biometricsLabel}>BODY FAT</Text>
              <Text style={styles.biometricsVal}>
                11.8 <Text style={[styles.biometricsUnit, { color: COLORS.neonRed }]}>%</Text>
              </Text>
              <Text style={[styles.biometricsSub, { color: COLORS.neonGreen }]}>Elite Athletic</Text>
            </View>
          </View>

          {/* 5. Interface Dynamics & Aura Matrix */}
          <View
            style={[
              styles.glassCard,
              {
                borderColor: `${primaryGlowColor}40`,
                shadowColor: primaryGlowColor,
                shadowOpacity: glowIntensity === 'high' ? 0.25 : glowIntensity === 'subtle' ? 0.1 : 0,
                shadowRadius: glowIntensity === 'high' ? 16 : 8,
                marginTop: 14,
              },
            ]}
          >
            <View style={styles.cardHeaderFlex}>
              <View>
                <Text style={styles.telemetryCardTitle}>⚡ INTERFACE DYNAMICS & AURA</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 1 }}>
                  Global Neon Glow, Haptic Feedback & AI Speech
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 12,
                  backgroundColor: `${primaryGlowColor}15`,
                  borderWidth: 1,
                  borderColor: `${primaryGlowColor}40`,
                }}
              >
                <Text style={{ color: primaryGlowColor, fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}>
                  ACTIVE MATRIX
                </Text>
              </View>
            </View>

            {/* Item 1: Mirror Glow Intensity */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>Mirror Glow Intensity</Text>
                  <Text style={{ color: glowIntensity === 'off' ? '#888' : primaryGlowColor, fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    [{glowIntensity}]
                  </Text>
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>
                  Dynamically scales neon shadows and border opacity
                </Text>
              </View>
              <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                {(['high', 'subtle', 'off'] as const).map((mode) => {
                  const isSel = glowIntensity === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => handleGlowChange(mode)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 14,
                        backgroundColor: isSel ? primaryGlowColor : 'transparent',
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: isSel ? '#000' : '#AAA',
                          textTransform: 'uppercase',
                        }}
                      >
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Item 2: Haptic Pulse Feedback */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>Haptic Pulse Feedback</Text>
                  <Text style={{ color: hapticFeedback ? '#00E676' : '#888', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {hapticFeedback ? 'ACTIVE' : 'MUTED'}
                  </Text>
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>
                  Tactile vibration upon set completion & countdowns
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleToggleHapticFeedback}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: hapticFeedback ? primaryGlowColor : '#2A2A2A',
                  padding: 2,
                  justifyContent: 'center',
                }}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#000',
                    alignSelf: hapticFeedback ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Item 3: AI Voice Alerts & Voice Profile */}
            <View style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>AI Voice Alerts</Text>
                    <Text style={{ color: aiVoicePrompts ? '#00F0FF' : '#888', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {aiVoicePrompts ? 'ONLINE' : 'MUTED'}
                    </Text>
                  </View>
                  <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>
                    Synthesized rest countdowns & tactical power milestones
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleToggleVoicePrompts}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: aiVoicePrompts ? '#00F0FF' : '#2A2A2A',
                    padding: 2,
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: '#000',
                      alignSelf: aiVoicePrompts ? 'flex-end' : 'flex-start',
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* Voice Profile Selector Matrix */}
              <View style={{ marginTop: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <Text style={{ color: primaryGlowColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>
                  VOICE PROFILE MATRIX
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { id: 'titan', name: 'Titan (Hardcore Male)' },
                    { id: 'spartan', name: 'Spartan (Calm Male)' },
                    { id: 'valkyrie', name: 'Valkyrie (Elite Female)' },
                    { id: 'apex_coach', name: 'Apex Coach (Motivating Female)' },
                    { id: 'cyber_core', name: 'Cyber Core (AI System)' },
                  ].map((v) => {
                    const isSel = voiceProfile === v.id;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        onPress={() => {
                          setVoiceProfile(v.id);
                          try {
                            localStorage.setItem('ranax_voice_profile', v.id);
                          } catch {}
                          triggerHapticFeedback(50);
                          speakPrompt(`Voice profile active: ${v.name}`);
                        }}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: isSel ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.04)',
                          borderWidth: 1,
                          borderColor: isSel ? primaryGlowColor : 'rgba(255,255,255,0.1)',
                          marginBottom: 4,
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: isSel ? '#FFF' : '#AAA' }}>
                          {v.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Floating Tab Bar */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {(['dashboard', 'workouts', 'coach', 'profile'] as const).map((tab) => {
            const isActive = currentTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setCurrentTab(tab)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab === 'dashboard' ? 'Dash' : tab === 'workouts' ? 'Work' : tab === 'coach' ? 'AI Coach' : 'Profile'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: COLORS.textWhite,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandAccent: {
    color: COLORS.neonCyan,
    fontSize: 22,
    fontWeight: '900',
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 8.5,
    letterSpacing: 1.2,
    marginTop: 2,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neonGreen,
    marginRight: 6,
  },
  statusText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: '700',
  },
  coachWrapper: {
    flex: 1,
    paddingBottom: 85,
  },
  coachHeaderCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
  },
  coachHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coachAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(18, 18, 24, 0.95)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  coachAvatarEmoji: {
    fontSize: 22,
  },
  coachOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
  },
  coachHeaderTextContainer: {
    flex: 1,
  },
  coachTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coachTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeStatusTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  activeStatusTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coachBadgesPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
  },
  coachBadgesText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  chipsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
  },
  chipText: {
    color: COLORS.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  bubbleWrapper: {
    marginBottom: 16,
  },
  bubbleWrapperUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapperAi: {
    alignItems: 'flex-start',
  },
  aiSender: {
    color: COLORS.neonRed,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  bubbleBase: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '88%',
  },
  userBubble: {
    backgroundColor: 'rgba(0, 240, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(22, 22, 28, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    color: '#F9FAFB',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.15,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'system-ui',
    }),
  },
  dietPlanCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 18, 22, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.45)',
  },
  dietHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dietPlanTitle: {
    color: COLORS.textWhite,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dietGoalBadge: {
    color: COLORS.neonCyan,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  caloriesBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  caloriesLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  caloriesValue: {
    color: COLORS.textWhite,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  caloriesUnit: {
    color: COLORS.neonRed,
    fontSize: 12,
  },
  macroHeader: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  macroBarContainer: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  macroBarSegment: {
    height: '100%',
  },
  macroPillarsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  macroPillar: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    alignItems: 'center',
  },
  pillarLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  pillarVal: {
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  pillarPct: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  mealCueBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  mealCueTitle: {
    color: COLORS.neonCyan,
    fontSize: 10,
    fontWeight: '700',
  },
  mealCueDesc: {
    color: COLORS.textWhite,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  dietActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  savedBtn: {
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  saveBtnText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.neonCyan,
    alignItems: 'center',
  },
  appliedBtn: {
    backgroundColor: COLORS.neonGreen,
  },
  applyBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  listeningContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 18, 24, 0.95)',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  waveformBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    width: 32,
    justifyContent: 'center',
  },
  soundWaveBar: {
    width: 3.5,
    borderRadius: 2,
  },
  listeningTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  listeningTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  listeningSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  cancelListeningBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelListeningText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  micButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 6,
  },
  micIconText: {
    fontSize: 18,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textWhite,
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: COLORS.neonCyan,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  glassCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 14,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  ringMetric: {
    color: COLORS.textWhite,
    fontSize: 48,
    fontWeight: '900',
  },
  ringTarget: {
    color: COLORS.neonRed,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  ringSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 18, 20, 0.9)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabItemActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.neonCyan,
    fontWeight: '800',
  },
  workoutSectionTitle: {
    color: COLORS.neonCyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  workoutCardInner: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  workoutItemTitle: {
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  workoutItemSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  profileScroll: {
    flex: 1,
  },
  profileScrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2.5,
    padding: 3,
    backgroundColor: '#0A0A0A',
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTouch: {
    width: 98,
    height: 98,
    borderRadius: 49,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 49,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: '#0E0E14',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 5,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  athleteNameText: {
    color: COLORS.textWhite,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 14,
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  athleteHandleText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  profileMetaDot: {
    color: COLORS.textMuted,
  },
  rankBadgeContainer: {
    backgroundColor: 'rgba(255, 23, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rankBadgeText: {
    color: COLORS.neonRed,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  telemetryCardTitle: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  telemetryCol: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  telemetryColLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telemetryColVal: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  telemetryColUnit: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  spectrumCardTitle: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  activeSpectrumPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeSpectrumText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  spectrumInstructionText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  spectrumContainer: {
    marginTop: 2,
  },
  spectrumHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  spectrumColorPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spectrumLiveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  spectrumHslText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  spectrumDegreeText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  hueBarTrackContainer: {
    position: 'relative',
    height: 38,
    justifyContent: 'center',
  },
  hueBarTrack: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  hueSliderThumb: {
    position: 'absolute',
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  hueSliderThumbInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  hueDegreeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  hueDegreeLabel: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  biometricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  biometricsBox: {
    flex: 1,
    marginBottom: 0,
  },
  biometricsLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  biometricsVal: {
    color: COLORS.textWhite,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  biometricsUnit: {
    fontSize: 11,
    fontWeight: '800',
  },
  biometricsSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  rnCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  rnCountText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rnFilterHeading: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  rnFilterScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  rnFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rnFilterPillText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  rnTierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 5,
  },
  rnTierPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rnTierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  rnBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rnProtocolBadge: {
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'flex-start',
  },
  rnProtocolBadgeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  rnWorkoutCardTitle: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 8,
  },
  rnWorkoutCardDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  rnIntensityContainer: {
    marginTop: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rnIntensityLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rnIntensityValue: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rnIntensityBarTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  rnIntensityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rnRosterHeading: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  rnRosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  rnRosterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  rnRosterName: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  rnRosterSets: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  rnRosterMore: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 3,
  },
  rnEngageBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rnEngageBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
