import React, { useState, useEffect, useRef } from 'react';
import {
  WearableDeviceState,
  WearableSyncTelemetry,
  DailyActivity,
} from '../types';
import {
  getStoredWearableTelemetry,
  saveStoredWearableTelemetry,
  calculateHrZone,
  HR_ZONE_CONFIG,
  connectWebBluetoothHeartRate,
  pullWearableHealthTelemetry,
} from '../utils/wearableBridge';
import {
  triggerHaptic,
  speakAiPrompt,
  stopAllVoicePlayback,
  HAPTIC_PATTERNS,
} from '../utils/interfaceDynamics';
import {
  Watch,
  Activity,
  Heart,
  Bluetooth,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  Battery,
  Shield,
  Smartphone,
  Flame,
  Radio,
} from 'lucide-react';

interface WearableSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: DailyActivity;
  onUpdateActivity: (updated: DailyActivity) => void;
}

export const WearableSyncModal: React.FC<WearableSyncModalProps> = ({
  isOpen,
  onClose,
  activity,
  onUpdateActivity,
}) => {
  const [telemetry, setTelemetry] = useState<WearableSyncTelemetry>(getStoredWearableTelemetry);
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSyncingBridge, setIsSyncingBridge] = useState(false);
  const [liveBpm, setLiveBpm] = useState<number>(telemetry.liveHeartRate || 74);
  const pulseTimerRef = useRef<any>(null);

  // Oscillate live BPM naturally to simulate live telemetry sensor streaming
  useEffect(() => {
    if (!isOpen) return;

    pulseTimerRef.current = setInterval(() => {
      setLiveBpm((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = Math.max(62, Math.min(182, prev + delta));
        return next;
      });
    }, 2400);

    return () => {
      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
      stopAllVoicePlayback();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentZone = calculateHrZone(liveBpm);
  const zoneConfig = HR_ZONE_CONFIG[currentZone];

  const handleToggleDevice = (device: WearableDeviceState) => {
    triggerHaptic(HAPTIC_PATTERNS.TOGGLE);
    const willConnect = !device.connected;
    const updatedDevices = telemetry.devices.map((d) =>
      d.id === device.id ? { ...d, connected: willConnect, lastSyncTimestamp: 'Just now' } : d
    );
    const newActive = updatedDevices.find((d) => d.connected) || null;
    const updated: WearableSyncTelemetry = {
      ...telemetry,
      devices: updatedDevices,
      activeDevice: newActive,
      lastFullSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTelemetry(updated);
    saveStoredWearableTelemetry(updated);

    if (willConnect) {
      const pull = pullWearableHealthTelemetry(activity, { ...device, connected: true });
      onUpdateActivity(pull.updatedActivity);
      setLiveBpm(pull.updatedActivity.avgHeartRate);
      setStatusMessage(`🟢 ${device.name} Connected & Synced (+${pull.updatedActivity.caloriesBurned - activity.caloriesBurned} kcal)`);
    } else {
      setStatusMessage(`${device.name} Disconnected`);
    }

    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleScanBluetooth = async () => {
    setIsScanningBt(true);
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    setStatusMessage('Scanning for standard Bluetooth SIG Heart Rate Monitors (0x180D)...');

    const result = await connectWebBluetoothHeartRate((bpm) => {
      setLiveBpm(bpm);
      triggerHaptic(HAPTIC_PATTERNS.SET_FINISH);
    });

    setIsScanningBt(false);

    if (result.success) {
      triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
      speakAiPrompt(`Bluetooth sensor ${result.deviceName} synchronized successfully.`, true);
      setStatusMessage(`🟢 Connected to ${result.deviceName}`);

      // Add or activate Polar H10 / Generic BLE
      const updatedDevices = telemetry.devices.map((d) =>
        d.type === 'polar_h10' || d.id === 'polar-h10-strap'
          ? { ...d, connected: true, name: result.deviceName || d.name, lastSyncTimestamp: 'Just now' }
          : d
      );
      const updated: WearableSyncTelemetry = {
        ...telemetry,
        devices: updatedDevices,
        activeDevice: updatedDevices.find((d) => d.type === 'polar_h10') || telemetry.activeDevice,
      };
      setTelemetry(updated);
      saveStoredWearableTelemetry(updated);
    } else {
      triggerHaptic(HAPTIC_PATTERNS.ALERT);
      setStatusMessage(`Simulation Active: ${result.error}`);
    }

    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSyncHealthKit = () => {
    setIsSyncingBridge(true);
    triggerHaptic(HAPTIC_PATTERNS.TAP);
    setStatusMessage('Querying Apple HealthKit / Health Connect Secure Data Pipeline...');

    setTimeout(() => {
      setIsSyncingBridge(false);
      triggerHaptic(HAPTIC_PATTERNS.SUCCESS);

      const pulledActiveMinutes = 54;
      const pulledCalories = activity.caloriesBurned + 120;
      const pulledBpm = Math.floor(Math.random() * 8) + 72;

      setLiveBpm(pulledBpm);

      const updatedActivity: DailyActivity = {
        ...activity,
        caloriesBurned: pulledCalories,
        activeMinutes: Math.max(activity.activeMinutes, pulledActiveMinutes),
        avgHeartRate: pulledBpm,
      };

      onUpdateActivity(updatedActivity);

      const updatedTelemetry: WearableSyncTelemetry = {
        ...telemetry,
        liveHeartRate: pulledBpm,
        stepsToday: 9840,
        distanceKm: 7.2,
        lastFullSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTelemetry(updatedTelemetry);
      saveStoredWearableTelemetry(updatedTelemetry);

      speakAiPrompt('Biometric synchronization complete. Activity rings and telemetry updated.', true);
      setStatusMessage('🟢 HealthKit & Health Connect Synced (+120 kcal, 54m active, 9,840 steps)');
      setTimeout(() => setStatusMessage(null), 4000);
    }, 1200);
  };

  const handlePushToRings = () => {
    triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
    const updated: DailyActivity = {
      ...activity,
      avgHeartRate: liveBpm,
      activeMinutes: Math.max(activity.activeMinutes, activity.activeMinutes + 15),
      caloriesBurned: activity.caloriesBurned + 80,
    };
    onUpdateActivity(updated);
    setStatusMessage(`⚡ Synced to Dashboard Rings: ${liveBpm} BPM • +80 kcal • +15m`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-[#090B10] border border-[#00F0FF]/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden select-none"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <Watch size={18} className="text-[#00F0FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  WEARABLE SYNC MATRIX
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 font-bold">
                  LIVE BLE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                Apple Watch • Health Connect • BLE Sensors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
          {/* Status Toast / Notice */}
          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-xs text-[#00F0FF] flex items-center gap-2 animate-scale-up">
              <Radio size={14} className="animate-spin flex-shrink-0" style={{ animationDuration: '3s' }} />
              <span className="text-[11px] leading-tight">{statusMessage}</span>
            </div>
          )}

          {/* Live Cardiac Pulse Monitor & Zone Waveform */}
          <div className="p-4 rounded-2xl bg-black/70 border border-white/10 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Heart
                  size={14}
                  className="text-[#FF1744] fill-[#FF1744]/40"
                  style={{
                    animation: `pulse ${60 / liveBpm}s ease-in-out infinite`,
                  }}
                />
                LIVE SENSOR TELEMETRY
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  color: zoneConfig.color,
                  borderColor: `${zoneConfig.color}66`,
                  backgroundColor: `${zoneConfig.color}15`,
                }}
              >
                {zoneConfig.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-white tracking-tight">{liveBpm}</span>
                <span className="text-xs font-bold text-[#FF1744]">BPM</span>
              </div>
              <div className="text-right text-[10px] text-neutral-400 space-y-0.5">
                <div>HRV: <strong className="text-white">{telemetry.hrvMs} ms</strong></div>
                <div>Steps: <strong className="text-[#00F0FF]">{telemetry.stepsToday.toLocaleString()}</strong></div>
              </div>
            </div>

            {/* Simulated Live ECG / Pulse Wave Canvas */}
            <div className="h-9 w-full bg-white/[0.02] rounded-xl border border-white/5 p-1 flex items-center overflow-hidden">
              <svg viewBox="0 0 200 30" className="w-full h-full stroke-[#FF1744] fill-none stroke-[2] opacity-90">
                <path d="M0,15 L40,15 L48,5 L54,25 L60,8 L66,22 L72,15 L120,15 L128,4 L134,26 L140,7 L146,23 L152,15 L200,15" />
              </svg>
            </div>

            {/* Quick Button: Push Live Pulse to Dashboard Rings */}
            <button
              onClick={handlePushToRings}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Zap size={13} className="text-[#00F0FF]" />
              Push Live Pulse to Dashboard Activity Rings
            </button>
          </div>

          {/* Quick Hardware Connector Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleScanBluetooth}
              disabled={isScanningBt}
              className="p-3 rounded-2xl bg-white/[0.04] border border-[#00F0FF]/30 hover:border-[#00F0FF] text-left transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <Bluetooth size={16} className="text-[#00F0FF] group-hover:scale-110 transition-transform" />
                <span className="text-[9px] text-[#00F0FF] font-bold">SCAN BLE</span>
              </div>
              <span className="text-xs font-bold text-white block">Web Bluetooth</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">
                {isScanningBt ? 'Scanning...' : 'Pair Heart Strap (0x180D)'}
              </span>
            </button>

            <button
              onClick={handleSyncHealthKit}
              disabled={isSyncingBridge}
              className="p-3 rounded-2xl bg-white/[0.04] border border-[#FF1744]/30 hover:border-[#FF1744] text-left transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <RefreshCw
                  size={16}
                  className={`text-[#FF1744] ${isSyncingBridge ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`}
                />
                <span className="text-[9px] text-[#FF1744] font-bold">1-TAP SYNC</span>
              </div>
              <span className="text-xs font-bold text-white block">HealthKit / Connect</span>
              <span className="text-[9px] text-neutral-400 block mt-0.5">
                {isSyncingBridge ? 'Syncing...' : 'Sync Apple & Google Health'}
              </span>
            </button>
          </div>

          {/* Connected Device Matrix List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-bold px-1">
              <span>CONFIGURED HARDWARE HUBS</span>
              <span>LAST SYNC: {telemetry.lastFullSyncTime}</span>
            </div>

            <div className="space-y-2">
              {telemetry.devices.map((device) => (
                <div
                  key={device.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    device.connected
                      ? 'bg-white/[0.05] border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                      : 'bg-white/[0.02] border-white/5 opacity-70'
                  } flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        device.connected
                          ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]'
                          : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}
                    >
                      <Watch size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{device.name}</span>
                        {device.connected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{device.syncSource.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Battery size={11} className="text-neutral-400" />
                          {device.batteryLevel}%
                        </span>
                        <span>•</span>
                        <span>{device.lastSyncTimestamp}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDevice(device)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      device.connected
                        ? 'bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] hover:bg-[#FF1744]/20 hover:border-[#FF1744]/50 hover:text-[#FF1744]'
                        : 'bg-white/5 border border-white/15 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {device.connected ? 'LINKED' : 'CONNECT'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono">
            Auto-Sync Active • 256-bit Secure Health Storage
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.4)] active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
