import React, { useEffect, useRef } from 'react';
import { SystemNotification, TabType } from '../types';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Dumbbell,
  Sparkles,
  Zap,
  Watch,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/interfaceDynamics';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDismissNotification: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenWearableModal?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onDismissNotification,
  onNavigateTab,
  onOpenWearableModal,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category: SystemNotification['category']) => {
    switch (category) {
      case 'PROTOCOL':
        return <Dumbbell size={14} className="text-[#00F0FF]" />;
      case 'COACH':
        return <Sparkles size={14} className="text-[#FF1744]" />;
      case 'CYBER':
        return <Zap size={14} className="text-[#B026FF]" />;
      case 'HARDWARE':
        return <Watch size={14} className="text-[#FFB300]" />;
      case 'STREAK':
        return <Flame size={14} className="text-[#00E676]" />;
      default:
        return <Bell size={14} className="text-[#00F0FF]" />;
    }
  };

  const getCategoryBadgeClass = (category: SystemNotification['category']) => {
    switch (category) {
      case 'PROTOCOL':
        return 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40';
      case 'COACH':
        return 'bg-[#FF1744]/15 text-[#FF1744] border-[#FF1744]/40';
      case 'CYBER':
        return 'bg-[#B026FF]/15 text-[#B026FF] border-[#B026FF]/40';
      case 'HARDWARE':
        return 'bg-[#FFB300]/15 text-[#FFB300] border-[#FFB300]/40';
      case 'STREAK':
        return 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const handleNotificationAction = (notification: SystemNotification) => {
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    if (!notification.read) {
      onDismissNotification(notification.id);
    }
    if (notification.category === 'HARDWARE' && onOpenWearableModal) {
      onClose();
      onOpenWearableModal();
      return;
    }
    if (notification.actionTab) {
      onClose();
      onNavigateTab(notification.actionTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Notification Card Container */}
      <div
        ref={panelRef}
        className="relative w-full max-w-sm rounded-3xl bg-[#0B0B12]/95 border border-[#00F0FF]/30 shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in slide-in-from-top-4 sm:slide-in-from-right-4 duration-300"
      >
        {/* Top Glow Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00F0FF] via-[#B026FF] to-[#FF1744]" />

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                <Bell size={16} />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF1744] text-[9px] font-black text-white flex items-center justify-center border border-black shadow-[0_0_8px_#FF1744]">
                  {unreadCount}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono flex items-center gap-1.5">
                Notifications
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                {unreadCount > 0
                  ? `${unreadCount} unread system alert${unreadCount > 1 ? 's' : ''}`
                  : 'All systems operational & up-to-date'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.TAP);
              onClose();
            }}
            className="w-8 h-8 rounded-full glass-panel border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/30 transition-all active:scale-95"
            aria-label="Close notifications"
          >
            <X size={15} />
          </button>
        </div>

        {/* Action Controls Bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <button
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.SET_FINISH);
                onMarkAllAsRead();
              }}
              disabled={unreadCount === 0}
              className={`text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                unreadCount > 0
                  ? 'text-[#00F0FF] hover:text-white active:scale-95'
                  : 'text-neutral-500 cursor-not-allowed'
              }`}
            >
              <CheckCheck size={13} />
              Mark all as read
            </button>

            <button
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.TOGGLE);
                onClearAll();
              }}
              className="text-[11px] font-mono font-bold text-neutral-400 hover:text-[#FF1744] flex items-center gap-1 transition-colors active:scale-95"
            >
              <Trash2 size={13} />
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                <ShieldCheck size={24} className="text-[#00E676]" />
              </div>
              <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                No active notifications
              </p>
              <p className="text-[11px] text-neutral-400 max-w-xs leading-relaxed">
                You are completely caught up with your training protocols, coach advice, and wearable telemetry.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationAction(n)}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer group active:scale-[0.98] ${
                  !n.read
                    ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.03] border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.12)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Unread indicator beacon */}
                {!n.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getCategoryIcon(n.category)}
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-mono border ${getCategoryBadgeClass(
                          n.category
                        )}`}
                      >
                        {n.category}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {n.timestamp}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors leading-snug">
                      {n.title}
                    </h4>

                    <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Quick action link */}
                    {(n.actionLabel || n.actionTab || n.category === 'HARDWARE') && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-mono font-bold text-[#00F0FF] group-hover:underline">
                        <span>
                          {n.actionLabel ||
                            (n.category === 'HARDWARE'
                              ? 'Pair Wearable'
                              : n.actionTab === 'workouts'
                              ? 'View Workout Protocol'
                              : n.actionTab === 'coach'
                              ? 'Open AI Coach'
                              : n.actionTab === 'profile'
                              ? 'View Telemetry'
                              : 'Open Screen')}
                        </span>
                        <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/50 text-center">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
            RANA X Cyber Notifications • Sub-second BLE Telemetry
          </span>
        </div>
      </div>
    </div>
  );
};
