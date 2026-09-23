import React, { useState } from 'react';
import { StructuredDietPlan, FormAnalysisTelemetry, OneRepMaxPrediction } from '../types';
import { Flame, Check, Sparkles, Shield, Bookmark, ArrowRight, Zap, Target, Activity, Dumbbell, PieChart } from 'lucide-react';

interface DietPlanCardProps {
  plan: StructuredDietPlan;
  onApplyDiet: (plan: StructuredDietPlan) => void;
  onSaveToProfile: (plan: StructuredDietPlan) => void;
}

export const DietPlanCard: React.FC<DietPlanCardProps> = ({
  plan,
  onApplyDiet,
  onSaveToProfile,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(plan.applied || false);

  const handleSave = () => {
    setIsSaved(true);
    onSaveToProfile(plan);
  };

  const handleApply = () => {
    setIsApplied(true);
    onApplyDiet(plan);
  };

  const isBulk = plan.targetGoal.includes('Gain');

  return (
    <div className="mt-3 p-4 rounded-2xl glass-panel border border-[#00F0FF]/40 shadow-[0_0_25px_rgba(0,240,255,0.2)] bg-gradient-to-b from-[#121216]/95 via-[#0D0D12]/95 to-[#0A0A0E]/95 relative overflow-hidden select-none">
      {/* Subtle top laser glow highlight */}
      <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isBulk ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#FF1744] shadow-[0_0_8px_#FF1744]'}`} />
          <span className="text-[10px] font-black tracking-widest uppercase text-white font-mono">
            {plan.planTitle}
          </span>
        </div>
        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
          isBulk ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30' : 'bg-[#FF1744]/10 text-[#FF1744] border-[#FF1744]/30'
        }`}>
          {plan.targetGoal}
        </span>
      </div>

      {/* Total Daily Calories Hero */}
      <div className="my-3 flex items-baseline justify-between bg-white/5 rounded-xl p-3 border border-white/10">
        <div>
          <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
            Total Daily Target
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {plan.dailyCalories.toLocaleString()}
            </span>
            <span className="text-xs font-black text-[#FF1744] uppercase font-mono">
              KCAL / DAY
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-neutral-400 block">Metabolic Cadence</span>
          <span className="text-xs font-bold text-[#00E676] flex items-center justify-end gap-1">
            <Activity size={12} /> CLINICAL LEVEL
          </span>
        </div>
      </div>

      {/* Macro Split Progress Visualizer */}
      <div className="space-y-2.5 my-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
          <span className="flex items-center gap-1 text-[#00F0FF]">
            <PieChart size={12} /> Macro Breakdown
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            P: {plan.protein.grams}g • C: {plan.carbs.grams}g • F: {plan.fats.grams}g
          </span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex p-0.5 gap-0.5 border border-white/10">
          <div
            style={{ width: `${plan.protein.percentage}%` }}
            className="h-full bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] rounded-l-full shadow-[0_0_10px_#00F0FF]"
            title={`Protein: ${plan.protein.percentage}%`}
          />
          <div
            style={{ width: `${plan.carbs.percentage}%` }}
            className="h-full bg-gradient-to-r from-[#FF1744] to-[#FF5252] shadow-[0_0_10px_#FF1744]"
            title={`Carbs: ${plan.carbs.percentage}%`}
          />
          <div
            style={{ width: `${plan.fats.percentage}%` }}
            className="h-full bg-gradient-to-r from-[#B026FF] to-[#D500F9] rounded-r-full shadow-[0_0_10px_#B026FF]"
            title={`Fats: ${plan.fats.percentage}%`}
          />
        </div>

        {/* Detailed 3-Pillar Macro Cards */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2 rounded-xl bg-white/5 border border-[#00F0FF]/30">
            <span className="text-[10px] font-bold text-[#00F0FF] block">PROTEIN</span>
            <span className="text-sm font-black text-white font-mono">{plan.protein.grams}g</span>
            <span className="text-[9px] text-neutral-400 block font-mono">{plan.protein.percentage}% • {plan.protein.calories} kcal</span>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-[#FF1744]/30">
            <span className="text-[10px] font-bold text-[#FF1744] block">CARBS</span>
            <span className="text-sm font-black text-white font-mono">{plan.carbs.grams}g</span>
            <span className="text-[9px] text-neutral-400 block font-mono">{plan.carbs.percentage}% • {plan.carbs.calories} kcal</span>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-[#B026FF]/30">
            <span className="text-[10px] font-bold text-[#B026FF] block">FATS</span>
            <span className="text-sm font-black text-white font-mono">{plan.fats.grams}g</span>
            <span className="text-[9px] text-neutral-400 block font-mono">{plan.fats.percentage}% • {plan.fats.calories} kcal</span>
          </div>
        </div>
      </div>

      {/* Structured Clinical Meal Timing */}
      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2 text-[11px]">
        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
          <span className="text-[#00F0FF] font-bold block text-[10px] uppercase tracking-wider">
            ⚡ Elite Pre-Workout Window (T - 35 min)
          </span>
          <p className="text-neutral-200 mt-0.5 leading-relaxed font-sans">
            {plan.preWorkoutNutrition}
          </p>
        </div>

        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
          <span className="text-[#FF1744] font-bold block text-[10px] uppercase tracking-wider">
            🛡️ Anabolic Post-Workout Window (T + 45 min)
          </span>
          <p className="text-neutral-200 mt-0.5 leading-relaxed font-sans">
            {plan.postWorkoutNutrition}
          </p>
        </div>

        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
          <span className="text-[#B026FF] font-bold block text-[10px] uppercase tracking-wider">
            💧 Hydration & Cellular Osmolytes
          </span>
          <p className="text-neutral-300 mt-0.5 text-[10px]">
            {plan.hydrationElectrolytes}
          </p>
        </div>
      </div>

      {/* Action Buttons: Save to Profile & Apply to App */}
      <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            isSaved
              ? 'bg-white/10 text-[#00E676] border-[#00E676]/40 cursor-default'
              : 'glass-panel text-white border-white/20 hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/10 active:scale-95'
          }`}
        >
          {isSaved ? <Check size={13} className="text-[#00E676]" /> : <Bookmark size={13} />}
          <span>{isSaved ? 'SAVED TO PROFILE' : 'SAVE TO PROFILE'}</span>
        </button>

        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            isApplied
              ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 shadow-[0_0_12px_rgba(0,230,118,0.3)]'
              : 'bg-gradient-to-r from-[#00F0FF] via-[#00D0FF] to-[#00A3FF] text-black shadow-[0_0_18px_rgba(0,240,255,0.5)] hover:shadow-[0_0_24px_rgba(0,240,255,0.8)]'
          }`}
        >
          {isApplied ? <Check size={14} className="stroke-[3]" /> : <Zap size={13} className="fill-black" />}
          <span>{isApplied ? 'SYNCED TO DASH' : 'APPLY TO APP'}</span>
        </button>
      </div>
    </div>
  );
};

interface FormTelemetryCardProps {
  telemetry: FormAnalysisTelemetry;
  onApplyFix: (telemetry: FormAnalysisTelemetry) => void;
}

export const FormTelemetryCard: React.FC<FormTelemetryCardProps> = ({
  telemetry,
  onApplyFix,
}) => {
  const [applied, setApplied] = useState(false);

  return (
    <div className="mt-3 p-4 rounded-2xl glass-panel border border-[#FF1744]/40 shadow-[0_0_25px_rgba(255,23,68,0.25)] bg-[#121216]/95 relative overflow-hidden select-none">
      <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF1744] to-transparent pointer-events-none" />

      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <span className="text-[10px] font-black text-white font-mono flex items-center gap-1">
          <Activity size={12} className="text-[#FF1744]" />
          CV BIOMECHANICS: {telemetry.exercise.toUpperCase()}
        </span>
        <span className="text-xs font-mono font-black text-[#00F0FF] px-2 py-0.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30">
          {telemetry.score}% FORM SCORE
        </span>
      </div>

      <div className="my-2.5 space-y-2 text-xs">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] text-[#FF1744] font-bold block uppercase tracking-wider">
            Critical Risk Detected
          </span>
          <span className="text-neutral-200 mt-0.5 block">{telemetry.primaryRisk}</span>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] text-[#00F0FF] font-bold block uppercase tracking-wider">
            Clinical Biomechanical Fix
          </span>
          <span className="text-neutral-200 mt-0.5 block">{telemetry.biomechanicalFix}</span>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] text-[#B026FF] font-bold block uppercase tracking-wider">
            Kinematic Bar Path Cue
          </span>
          <span className="text-neutral-300 text-[11px] mt-0.5 block">{telemetry.barbellPathCue}</span>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/10">
        <button
          onClick={() => {
            setApplied(true);
            onApplyFix(telemetry);
          }}
          disabled={applied}
          className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            applied
              ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
              : 'bg-gradient-to-r from-[#FF1744] to-[#FF0055] text-white shadow-[0_0_16px_rgba(255,23,68,0.4)] hover:shadow-[0_0_24px_rgba(255,23,68,0.7)]'
          }`}
        >
          {applied ? <Check size={14} className="stroke-[3]" /> : <Zap size={13} className="fill-white" />}
          <span>{applied ? 'BIOMECHANIC QUEUE LOADED' : 'APPLY FORM SAFEGUARDS'}</span>
        </button>
      </div>
    </div>
  );
};

interface OneRepMaxCardProps {
  prediction: OneRepMaxPrediction;
  onApplyPrediction: (pred: OneRepMaxPrediction) => void;
}

export const OneRepMaxCard: React.FC<OneRepMaxCardProps> = ({
  prediction,
  onApplyPrediction,
}) => {
  const [applied, setApplied] = useState(false);

  return (
    <div className="mt-3 p-4 rounded-2xl glass-panel border border-[#B026FF]/40 shadow-[0_0_25px_rgba(176,38,255,0.25)] bg-[#121216]/95 relative overflow-hidden select-none">
      <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#B026FF] to-transparent pointer-events-none" />

      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <span className="text-[10px] font-black text-white font-mono flex items-center gap-1">
          <Dumbbell size={12} className="text-[#B026FF]" />
          AUTOREGULATION 1-RM PREDICTION
        </span>
        <span className="text-[10px] font-mono text-[#00E676] px-2 py-0.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/30">
          {prediction.confidenceRate}% CONFIDENCE
        </span>
      </div>

      <div className="my-3 grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] text-neutral-400 block uppercase">Current Rep Max</span>
          <span className="text-lg font-black text-white font-mono">
            {prediction.currentLiftKg} kg × {prediction.currentReps}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#B026FF]/20 to-black border border-[#B026FF]/40 shadow-[0_0_12px_rgba(176,38,255,0.2)]">
          <span className="text-[10px] text-[#00F0FF] block uppercase font-bold">Predicted 1-RM</span>
          <span className="text-xl font-black text-white font-mono">
            {prediction.predictedOneRepMaxKg} <span className="text-xs text-[#00F0FF]">KG</span>
          </span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-white/10">
        <button
          onClick={() => {
            setApplied(true);
            onApplyPrediction(prediction);
          }}
          disabled={applied}
          className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            applied
              ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
              : 'bg-gradient-to-r from-[#B026FF] to-[#D500F9] text-white shadow-[0_0_16px_rgba(176,38,255,0.4)] hover:shadow-[0_0_24px_rgba(176,38,255,0.7)]'
          }`}
        >
          {applied ? <Check size={14} className="stroke-[3]" /> : <Target size={13} />}
          <span>{applied ? 'SYNCED TO PROFILE 1-RM' : 'APPLY TO ATHLETE MATRIX'}</span>
        </button>
      </div>
    </div>
  );
};
