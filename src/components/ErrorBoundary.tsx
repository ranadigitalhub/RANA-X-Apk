import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0E] text-white min-h-[320px] select-none">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={28} />
          </div>

          <h3 className="text-base font-bold font-mono tracking-wide text-white uppercase mb-2">
            {this.props.fallbackTitle || 'Telemetry Protocol Interrupted'}
          </h3>

          <p className="text-xs text-neutral-400 max-w-xs mb-5 font-mono leading-relaxed">
            {this.state.error?.message || 'A transient rendering glitch occurred. System telemetry is safe.'}
          </p>

          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20 hover:from-[#00F0FF]/30 hover:to-[#B026FF]/30 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <RotateCcw size={14} />
            <span>Reboot Module</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
