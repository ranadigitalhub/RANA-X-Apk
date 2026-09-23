import React, { memo } from 'react';
import { Zap, Bell } from 'lucide-react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/interfaceDynamics';

interface HeaderProps {
  currentTab: string;
  onOpenNotifications?: () => void;
  onOpenHardwareSync?: () => void;
  unreadNotificationsCount?: number;
  isHardwareConnected?: boolean;
  hardwareDeviceName?: string | null;
}

export const Header: React.FC<HeaderProps> = memo(({
  currentTab,
  onOpenNotifications,
  onOpenHardwareSync,
  unreadNotificationsCount = 0,
  isHardwareConnected = false,
  hardwareDeviceName = null,
}) => {
  return (
    <header className="px-5 pt-3 pb-3 flex items-center justify-between z-30 relative select-none" style={{ transform: 'translateZ(0)' }}>
      {/* Top Brand Block */}
      <div className="flex items-center gap-3">
        {/* Glowing Logo Badge */}
        <div className="relative group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#FF1744]/20 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.3)] transition-transform active:scale-95">
            <Zap className="w-5 h-5 text-[#00F0FF] fill-[#00F0FF]/40 filter drop-shadow-[0_0_6px_#00F0FF]" />
          </div>
          {/* Subtle diffused background blur glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00F0FF]/30 to-[#FF1744]/20 rounded-xl blur-sm -z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        <div>
          {/* Bold Header saying 'RANA X' with a subtle glowing effect */}
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-300 font-sans select-none">
              RANA
            </h1>
            <span className="text-2xl font-black text-[#00F0FF] text-glow-cyan tracking-widest">
              X
            </span>
            <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#FF1744] shadow-[0_0_6px_#FF1744] animate-pulse" />
          </div>
          <p className="text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
            {currentTab === 'dashboard' && 'Neural Fitness Matrix'}
            {currentTab === 'workouts' && 'Hyper-Protocols'}
            {currentTab === 'coach' && 'AI Neural Assistant'}
            {currentTab === 'profile' && 'Cyber Athlete Telemetry'}
          </p>
        </div>
      </div>

      {/* Hardware-Exclusive Status & Notification Action Icons */}
      <div className="flex items-center gap-2">
        {/* Hardware-Exclusive Wearable Status Pill Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(HAPTIC_PATTERNS.TAP);
            onOpenHardwareSync?.();
          }}
          title={
            isHardwareConnected
              ? `Hardware Paired: ${hardwareDeviceName || 'Smartwatch / BLE Band'}`
              : 'Hardware Status: Disconnected. Tap to pair wearable/smartwatch sensor'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all active:scale-95 cursor-pointer border ${
            isHardwareConnected
              ? 'bg-[#00E676]/10 border-[#00E676]/40 text-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.25)] hover:bg-[#00E676]/20'
              : 'bg-white/[0.04] border-[#FF1744]/30 text-neutral-300 hover:border-[#FF1744]/60 hover:bg-[#FF1744]/10'
          }`}
        >
          {isHardwareConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676] animate-pulse" />
              <span className="font-bold tracking-wider">
                {hardwareDeviceName ? hardwareDeviceName.slice(0, 8).toUpperCase() : 'DEV: SYNCED'}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_6px_#FF1744]" />
              <span className="font-bold text-neutral-300 tracking-wider">
                DEV: OFFLINE
              </span>
            </>
          )}
        </button>

        {/* Interactive Notification Bell with Dynamic Badge */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(HAPTIC_PATTERNS.TAP);
            onOpenNotifications?.();
          }}
          aria-label={`System notifications (${unreadNotificationsCount} unread)`}
          className="relative w-9 h-9 rounded-full glass-panel border border-white/10 flex items-center justify-center text-neutral-300 hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all active:scale-90"
        >
          <Bell size={16} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF1744] text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0A0A10] shadow-[0_0_10px_#FF1744] animate-pulse">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
