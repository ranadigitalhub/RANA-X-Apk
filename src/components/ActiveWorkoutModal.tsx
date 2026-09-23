import React, { useState, useEffect } from 'react';
import { WorkoutRoutine } from '../types';
import { X, Play, Pause, Check, RotateCcw, Flame, Clock, Dumbbell, Trophy } from 'lucide-react';
import {
  triggerHaptic,
  speakAiPrompt,
  stopAllVoicePlayback,
  HAPTIC_PATTERNS,
} from '../utils/interfaceDynamics';

interface ActiveWorkoutModalProps {
  workout: WorkoutRoutine;
  onClose: () => void;
  onFinishWorkout: (
    workout: WorkoutRoutine,
    caloriesBurned: number,
    sessionTonnageKg?: number,
    finishedSetsCount?: number,
    totalSetsCount?: number
  ) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  onClose,
  onFinishWorkout,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    workout.exercises.forEach((ex) => {
      initial[ex.id] = new Array(ex.sets).fill(false);
    });
    return initial;
  });

  // Rest Timer State (e.g. 60s)
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllVoicePlayback();
    };
  }, []);

  // Main Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Rest Timer loop with voice prompts and haptic ticks
  useEffect(() => {
    if (!isResting) return;

    const restInterval = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          triggerHaptic(HAPTIC_PATTERNS.REST_COMPLETE);
          speakAiPrompt('Rest period complete. Engage next set.', true);
          return 0;
        }
        const next = prev - 1;
        if (next === 3) {
          speakAiPrompt('3 seconds remaining', true);
          triggerHaptic(HAPTIC_PATTERNS.COUNTDOWN_TICK);
        } else if (next === 2 || next === 1) {
          triggerHaptic(HAPTIC_PATTERNS.TAP);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(restInterval);
  }, [isResting]);

  const toggleSet = (exId: string, setIndex: number) => {
    setCompletedSets((prev) => {
      const currentSets = [...(prev[exId] || [])];
      const newState = !currentSets[setIndex];
      currentSets[setIndex] = newState;

      // If completing set, trigger haptic pulse, audio feedback and 60s rest timer
      if (newState) {
        triggerHaptic(HAPTIC_PATTERNS.SET_COMPLETED);
        speakAiPrompt(`Set ${setIndex + 1} completed. 60 second recovery initiated.`);
        setRestSeconds(60);
        setIsResting(true);
      } else {
        triggerHaptic(HAPTIC_PATTERNS.TAP);
      }

      return { ...prev, [exId]: currentSets };
    });
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total completed sets & session tonnage shifted
  let totalSets = 0;
  let finishedSets = 0;
  let sessionTonnageKg = 0;

  workout.exercises.forEach((ex) => {
    const setsCompletedForEx = (completedSets[ex.id] || []).filter(Boolean).length;
    totalSets += ex.sets;
    finishedSets += setsCompletedForEx;
    const parsedReps = parseInt(ex.targetReps) || 5;
    const effectiveWeight = ex.weightKg > 0 ? ex.weightKg : 40; // 40kg standard baseline for bodyweight
    sessionTonnageKg += setsCompletedForEx * parsedReps * effectiveWeight;
  });

  const progressPercent = totalSets > 0 ? Math.round((finishedSets / totalSets) * 100) : 0;
  const currentBurn = Math.round((secondsElapsed / 60) * 8.5) + (finishedSets * 12);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col p-4 animate-in fade-in duration-200 select-none overflow-y-auto">
      {/* Top Protocol Bar */}
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF1744] shadow-[0_0_8px_#FF1744] animate-ping" />
          <span className="text-xs font-bold text-[#FF1744] tracking-widest uppercase">
            ACTIVE COMBAT PROTOCOL
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Routine Title & Timer Dashboard */}
      <div className="my-3 p-4 rounded-3xl glass-panel border border-white/15 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#00F0FF]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              {workout.title}
            </h2>
            <span className="text-xs text-[#00F0FF] font-semibold">{workout.category} • {workout.intensity}</span>
          </div>

          <button
            onClick={() => setIsActive(!isActive)}
            className="px-3 py-1.5 rounded-full glass-panel border border-white/20 flex items-center gap-1.5 text-xs text-neutral-300 active:scale-95"
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
            <span>{isActive ? 'PAUSE' : 'RESUME'}</span>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 text-center">
          <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] text-neutral-400 uppercase font-semibold flex items-center justify-center gap-0.5">
              <Clock size={10} /> ELAPSED
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-white block mt-0.5">
              {formatTime(secondsElapsed)}
            </span>
          </div>

          <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] text-[#FF1744] uppercase font-semibold flex items-center justify-center gap-0.5">
              <Flame size={10} className="fill-[#FF1744]" /> BURNED
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-[#FF1744] block mt-0.5">
              {currentBurn}
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">kcal</span>
          </div>

          <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] text-[#00E676] uppercase font-semibold flex items-center justify-center gap-0.5">
              <Dumbbell size={10} /> TONNAGE
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-[#00E676] block mt-0.5">
              {(sessionTonnageKg / 1000).toFixed(1)}
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">tonnes</span>
          </div>

          <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] text-[#00F0FF] uppercase font-semibold flex items-center justify-center gap-0.5">
              <Check size={10} /> COMPLETION
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-[#00F0FF] block mt-0.5">
              {progressPercent}%
            </span>
            <span className="text-[8px] text-neutral-400 font-mono">{finishedSets}/{totalSets} sets</span>
          </div>
        </div>

        {/* Floating Rest Timer Alert */}
        {isResting && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#00F0FF]/20 to-[#FF1744]/20 border border-[#00F0FF]/50 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#00F0FF]" />
              <span className="text-xs font-bold text-white">RECOVERY COUNTDOWN:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-black text-[#00F0FF]">{restSeconds}s</span>
              <button
                onClick={() => setIsResting(false)}
                className="text-[10px] text-neutral-400 uppercase font-bold hover:text-white"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercises Checklist */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {workout.exercises.map((ex, exIdx) => (
          <div key={ex.id} className="p-3.5 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-white block">{ex.name}</span>
                <span className="text-[10px] text-[#00F0FF] font-medium">{ex.targetMuscle} • {ex.weightKg > 0 ? `${ex.weightKg} kg` : 'Bodyweight'}</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">{ex.targetReps} reps</span>
            </div>

            {/* Sets Tracker Row */}
            <div className="flex items-center gap-2 mt-2">
              {(completedSets[ex.id] || []).map((isDone, setIdx) => (
                <button
                  key={setIdx}
                  onClick={() => toggleSet(ex.id, setIdx)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    isDone
                      ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_#00F0FF]'
                      : 'bg-white/5 text-neutral-400 border border-white/10 hover:border-white/30'
                  }`}
                >
                  {isDone ? <Check size={14} className="stroke-[3]" /> : `Set ${setIdx + 1}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Finish Workout CTA Button */}
      <div className="pt-3 border-t border-white/10 mt-auto">
        <button
          onClick={() => {
            triggerHaptic(HAPTIC_PATTERNS.WORKOUT_COMPLETED);
            speakAiPrompt('Combat protocol completed. Elite biometric telemetry synchronized.', true);
            onFinishWorkout(workout, currentBurn, sessionTonnageKg, finishedSets, totalSets);
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF1744] via-[#FF0055] to-[#FF5252] text-white font-extrabold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(255,23,68,0.5)] hover:shadow-[0_0_35px_rgba(255,23,68,0.8)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Trophy size={18} />
          <span>COMPLETE PROTOCOL & LOG BIOMETRICS</span>
        </button>
      </div>
    </div>
  );
};
