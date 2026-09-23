import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface CyberSkeletonLoaderProps {
  label?: string;
}

export const CyberSkeletonLoader: React.FC<CyberSkeletonLoaderProps> = memo(({ label = 'INITIALIZING TELEMETRY...' }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0A0A0E] text-white min-h-[300px] select-none">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#00F0FF]/20 border-t-[#00F0FF] animate-spin" />
        <Loader2 size={20} className="absolute text-[#00F0FF] animate-pulse" />
      </div>
      <span className="text-[11px] font-mono tracking-widest text-[#00F0FF] font-bold uppercase animate-pulse drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
        {label}
      </span>
      <span className="text-[9px] font-mono text-neutral-500 tracking-wider mt-1">
        60 FPS CYBER CORE ENGINE
      </span>
    </div>
  );
});

CyberSkeletonLoader.displayName = 'CyberSkeletonLoader';
