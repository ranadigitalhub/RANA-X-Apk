import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isFrameEnabled: boolean;
  onToggleFrame: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isFrameEnabled,
  onToggleFrame,
}) => {
  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-start relative selection:bg-[#00F0FF]/30 text-white">
      {/* Ambient background glow orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00F0FF]/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF1744]/5 blur-[120px] pointer-events-none" />

      {/* Frame Mode Switcher for Desktop / Web Preview */}
      <header className="w-full flex items-center justify-between py-2.5 px-4 sm:px-6 bg-[#0E0E14]/90 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
          <span className="text-xs font-black tracking-widest text-white uppercase font-sans">
            RANA X <span className="text-[#00F0FF]">WEB MATRIX</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
            BROWSER ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 hidden md:inline">Preview Mode:</span>
          <div className="flex items-center bg-black/50 p-1 rounded-full border border-white/10">
            <button
              onClick={() => isFrameEnabled && onToggleFrame()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                !isFrameEnabled
                  ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#00A3FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor size={14} />
              <span>Standard Web Window</span>
            </button>
            <button
              onClick={() => !isFrameEnabled && onToggleFrame()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isFrameEnabled
                  ? 'bg-gradient-to-r from-[#FF1744]/20 to-[#B026FF]/20 text-[#FF1744] border border-[#FF1744]/50 shadow-[0_0_12px_rgba(255,23,68,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Mobile Frame (390px)</span>
              <span className="sm:hidden">Phone</span>
            </button>
          </div>
        </div>
      </header>

      {isFrameEnabled ? (
        <div className="my-auto py-6 w-full max-w-[430px] flex justify-center">
          {/* Futuristic Phone Chassis */}
          <div className="relative w-full max-w-[412px] h-[860px] bg-[#0A0A0A] rounded-[48px] p-3 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_35px_rgba(0,240,255,0.15)] border-[3px] border-neutral-800/80 flex flex-col overflow-hidden">
            {/* Phone outer bezel specular highlight */}
            <div className="absolute inset-0 rounded-[45px] pointer-events-none border border-white/10" />

            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 border border-neutral-800/60 flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]/80 shadow-[0_0_6px_#00F0FF]" />
            </div>

            {/* App Container inside Phone */}
            <div className="relative w-full h-full bg-[#0A0A0A] rounded-[38px] overflow-hidden flex flex-col pt-7">
              {children}
            </div>

            {/* Home Bar Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-600/60 rounded-full pointer-events-none z-50" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl min-h-[calc(100vh-53px)] bg-[#0A0A0D] flex flex-col relative shadow-[0_0_80px_rgba(0,0,0,0.8)] border-x border-white/5 mx-auto">
          {children}
        </div>
      )}
    </div>
  );
};
