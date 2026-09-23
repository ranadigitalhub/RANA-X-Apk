import React, { memo } from 'react';
import { TabType } from '../types';
import { LayoutDashboard, Dumbbell, Sparkles, User } from 'lucide-react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/interfaceDynamics';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const TABS = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workouts' as TabType, label: 'Workouts', icon: Dumbbell },
  { id: 'coach' as TabType, label: 'AI Coach', icon: Sparkles },
  { id: 'profile' as TabType, label: 'Profile', icon: User },
];

export const Navigation: React.FC<NavigationProps> = memo(({ currentTab, onSelectTab }) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full z-50 pointer-events-none pb-3 pt-2 px-4 flex justify-center items-center"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Floating Glassmorphism-styled Bottom Tab Bar */}
      <nav
        aria-label="App Navigation"
        className="pointer-events-auto relative w-full max-w-md md:max-w-lg px-3 py-2 rounded-full bg-[#121214]/90 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,240,255,0.15)] flex items-center justify-between transition-all"
      >
        {/* Mirror glow subtle top specular light */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent" />

        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.TAP);
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-300 min-w-[68px] cursor-pointer ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
              }`}
            >
              {/* Active Glow Pill Background */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF]/15 via-white/10 to-[#FF1744]/15 border border-[#00F0FF]/40 shadow-[0_0_16px_rgba(0,240,255,0.25)] transition-all duration-300" />
              )}

              {/* Active Mirror Glow Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon
                  size={20}
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'text-[#00F0FF] filter drop-shadow-[0_0_6px_rgba(0,240,255,0.7)] scale-110'
                      : 'text-neutral-400 group-hover:text-white'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold tracking-wide mt-1 transition-colors ${
                    isActive
                      ? 'text-white font-bold text-glow-white'
                      : 'text-neutral-400'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
});

Navigation.displayName = 'Navigation';
