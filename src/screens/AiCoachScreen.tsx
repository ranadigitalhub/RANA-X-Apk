import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ChatMessage, WorkoutRoutine, StructuredDietPlan, FormAnalysisTelemetry, OneRepMaxPrediction } from '../types';
import { DietPlanCard, FormTelemetryCard, OneRepMaxCard } from '../components/StructuredCoachCards';
import { generateAdvancedAiCoachResponse } from '../services/aiCoachEngine';
import {
  Send,
  Bot,
  Sparkles,
  User,
  Dumbbell,
  Zap,
  Trash2,
  Mic,
} from 'lucide-react';

interface AiCoachScreenProps {
  initialMessages: ChatMessage[];
  onStartWorkoutFromCoach?: (routine: WorkoutRoutine) => void;
  onApplyDietPlan?: (plan: StructuredDietPlan) => void;
  onSaveDietToProfile?: (plan: StructuredDietPlan) => void;
  onApplyFormFix?: (fix: FormAnalysisTelemetry) => void;
  onApply1RMPrediction?: (pred: OneRepMaxPrediction) => void;
}

export const AiCoachScreen: React.FC<AiCoachScreenProps> = memo(({
  initialMessages,
  onStartWorkoutFromCoach,
  onApplyDietPlan,
  onSaveDietToProfile,
  onApplyFormFix,
  onApply1RMPrediction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    return [
      {
        id: 'ai-intro-welcome',
        sender: 'ai',
        text: "Hey! RANA X Coach here. What are we locking in today—heavy SBD numbers, macro splits, or recovery protocol?",
        timestamp: 'Just now',
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isTyping]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Handle voice recognition toggle
  const handleVoiceToggle = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
            handleSendMessage(speechResult.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            alert('Microphone permission was denied. Please allow microphone access in browser settings.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {
        console.warn('Speech recognition init error, fallback to prompt:', e);
      }
    }

    // Fallback prompt
    setIsListening(true);
    const spoken = window.prompt(
      '🎙️ Voice Input:\nEnter voice query for RANA X Coach (e.g., "Calculate 2400 kcal cutting macros", "Deadlift form check"):'
    );
    setIsListening(false);
    if (spoken && spoken.trim()) {
      handleSendMessage(spoken.trim());
    }
  };

  // Multi-modal quick action chips
  const actionChips = [
    {
      id: 'gain_macros',
      label: '🥩 Hypertrophy Surplus Macros',
      prompt: 'Give me an elite high-protein surplus macro split and nutrient timing protocol for clean hypertrophy.',
      glow: 'cyan',
    },
    {
      id: 'fat_loss',
      label: '📉 Precision Fat Loss Split',
      prompt: 'Design a high-protein calorie deficit macro plan that preserves maximum lean muscle and strength.',
      glow: 'red',
    },
    {
      id: 'form_cues',
      label: '🏋️ SBD Biomechanics Cues',
      prompt: 'Break down the crucial biomechanical cues for locking out heavy deadlifts and maximizing leg drive on bench.',
      glow: 'purple',
    },
    {
      id: 'rm_predictor',
      label: '📊 1-Rep Max Calculator',
      prompt: 'Calculate estimated 1RM and warm-up percentage pyramid for a 140kg x 5 rep squat set.',
      glow: 'cyan',
    },
    {
      id: 'pre_workout',
      label: '⚡ Pre-Workout Fuel Matrix',
      prompt: 'What is the optimal pre-workout nutrition timing, hydration, and salt protocol for peak gym power?',
      glow: 'red',
    },
  ];

  // Send message handler with zero input lag & multi-turn memory
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    // Clear input synchronously immediately
    setInputText('');

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setIsTyping(true);

    try {
      const result = await generateAdvancedAiCoachResponse(query, messages);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: result.category,
        actionPrompt: result.actionPrompt,
        dietPlan: result.dietPlan,
        formAnalysis: result.formAnalysis,
        rmPrediction: result.rmPrediction,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('AI Coach Screen error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "Yo! Let's dial in your session. What specific exercise numbers, macro breakdown, or recovery question are we attacking today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to render formatted message content with markdown bold highlights
  const renderMessageContent = (text: string) => {
    // Simple parser for bold **text** and bullet lines
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className={line.startsWith('•') || line.startsWith('-') ? 'pl-2 py-0.5' : 'py-0.5'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-[#00F0FF]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full px-4 pb-24 select-none overflow-hidden">
      {/* AI Coach Header */}
      <div className="py-2.5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00F0FF]/30 to-[#FF1744]/25 border border-[#00F0FF]/60 flex items-center justify-center shadow-[0_0_14px_rgba(0,240,255,0.45)]">
              <Bot size={18} className="text-[#00F0FF]" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-white tracking-wide">
                RANA X Coach
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                PRO COACH & PHYSIO
              </span>
            </div>
            <span className="text-[10px] text-neutral-400">
              Autonomous Strength, Biomechanics & Performance Nutrition
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: `ai-intro-${Date.now()}`,
                sender: 'ai',
                text: "Hey! RANA X Coach here. What are we locking in today—heavy SBD numbers, macro splits, or recovery protocol?",
                timestamp: 'Just now',
              },
            ])
          }
          title="Reset conversation"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Reset chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-shrink-0">
        {actionChips.map((chip) => {
          const isCyan = chip.glow === 'cyan';
          const isRed = chip.glow === 'red';

          return (
            <button
              key={chip.id}
              onClick={() => handleSendMessage(chip.prompt)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 backdrop-blur-xl border shadow-[0_4px_16px_rgba(0,0,0,0.5)] ${
                isCyan
                  ? 'bg-[#00F0FF]/10 text-neutral-200 hover:text-white border-[#00F0FF]/30 hover:border-[#00F0FF]/70 hover:shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                  : isRed
                  ? 'bg-[#FF1744]/10 text-neutral-200 hover:text-white border-[#FF1744]/30 hover:border-[#FF1744]/70 hover:shadow-[0_0_15px_rgba(255,23,68,0.35)]'
                  : 'bg-[#B026FF]/10 text-neutral-200 hover:text-white border-[#B026FF]/30 hover:border-[#B026FF]/70 hover:shadow-[0_0_15px_rgba(176,38,255,0.35)]'
              }`}
            >
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages List */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 py-2 pr-1 scroll-smooth"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF1744]/20 to-[#B026FF]/20 border border-[#FF1744]/40 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(255,23,68,0.3)]">
                  <Sparkles size={12} className="text-[#FF1744]" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Chat Bubble */}
                <div
                  className={`relative p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all duration-300 w-full ${
                    isUser
                      ? 'bg-[#00F0FF]/15 backdrop-blur-xl border border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.25)] text-white rounded-br-none'
                      : 'bg-white/5 backdrop-blur-xl border border-white/15 shadow-[0_0_20px_rgba(255,23,68,0.15)] text-neutral-200 rounded-bl-none'
                  }`}
                >
                  {/* Subtle top glow line */}
                  <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  {/* Message Body */}
                  <div className="font-sans text-neutral-100 leading-normal">
                    {renderMessageContent(msg.text)}
                  </div>

                  {/* Structured Diet Plan Card */}
                  {msg.dietPlan && (
                    <DietPlanCard
                      plan={msg.dietPlan}
                      onApplyDiet={(plan) => onApplyDietPlan?.(plan)}
                      onSaveToProfile={(plan) => onSaveDietToProfile?.(plan)}
                    />
                  )}

                  {/* Structured Form Telemetry Card */}
                  {msg.formAnalysis && (
                    <FormTelemetryCard
                      telemetry={msg.formAnalysis}
                      onApplyFix={(fix) => onApplyFormFix?.(fix)}
                    />
                  )}

                  {/* Structured 1-RM Predictor Card */}
                  {msg.rmPrediction && (
                    <OneRepMaxCard
                      prediction={msg.rmPrediction}
                      onApplyPrediction={(pred) => onApply1RMPrediction?.(pred)}
                    />
                  )}

                  {/* Action Button */}
                  {msg.actionPrompt && !msg.dietPlan && !msg.formAnalysis && !msg.rmPrediction && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1">
                        <Dumbbell size={12} />
                        {msg.actionPrompt}
                      </span>
                      <button
                        onClick={() => handleSendMessage(`Load protocol: ${msg.actionPrompt}`)}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:shadow-[0_0_18px_rgba(0,240,255,0.7)] transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Zap size={11} className="fill-black" />
                        <span>APPLY</span>
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-neutral-500 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                  <User size={12} className="text-[#00F0FF]" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5 justify-start animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              <Sparkles size={12} className="text-[#00F0FF] animate-pulse" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-none bg-black/60 backdrop-blur-xl border border-[#00F0FF]/30 shadow-[0_0_18px_rgba(0,240,255,0.25)] flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-bounce shadow-[0_0_6px_#00F0FF]" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-bounce shadow-[0_0_6px_#00F0FF]" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-bounce shadow-[0_0_6px_#00F0FF]" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-[#00F0FF] font-mono tracking-wider font-semibold ml-1">Coach analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recognition HUD */}
      {isListening && (
        <div className="mb-2 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-[#00F0FF]/60 shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-between animate-in fade-in duration-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 h-6 px-1">
              <div className="w-1 bg-[#00F0FF] rounded-full animate-pulse h-4" style={{ animationDuration: '400ms' }} />
              <div className="w-1 bg-[#FF1744] rounded-full animate-pulse h-6" style={{ animationDuration: '300ms' }} />
              <div className="w-1 bg-[#00F0FF] rounded-full animate-pulse h-5" style={{ animationDuration: '500ms' }} />
              <div className="w-1 bg-[#B026FF] rounded-full animate-pulse h-3" style={{ animationDuration: '350ms' }} />
              <div className="w-1 bg-[#00E676] rounded-full animate-pulse h-5" style={{ animationDuration: '450ms' }} />
            </div>
            <div>
              <div className="text-xs font-black text-[#00F0FF] tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
                Listening...
              </div>
              <p className="text-[10px] text-neutral-400">
                Speak your query (e.g., diet plan, 1RM, macros)...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVoiceToggle}
            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20 transition-all uppercase"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="pt-2 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center rounded-full glass-panel border border-white/15 focus-within:border-[#00F0FF]/50 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all p-1.5 gap-1.5"
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              isListening
                ? 'bg-[#FF1744]/20 border border-[#FF1744] text-[#FF1744] shadow-[0_0_15px_rgba(255,23,68,0.7)] animate-pulse'
                : 'bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.35)] hover:bg-[#00F0FF]/25 hover:border-[#00F0FF] active:scale-95'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice recognition'}
          >
            <Mic size={16} className={isListening ? 'animate-pulse text-[#FF1744]' : 'text-[#00F0FF]'} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask RANA X Coach anything (SBD, macros, recovery)..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-sans"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              inputText.trim() && !isTyping
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.6)] active:scale-90'
                : 'bg-white/10 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Send size={15} className={inputText.trim() && !isTyping ? 'fill-black' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
});

AiCoachScreen.displayName = 'AiCoachScreen';
