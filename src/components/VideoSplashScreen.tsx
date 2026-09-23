import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VideoSplashScreenProps {
  onComplete: () => void;
}

const VIDEO_SRC =
  'https://raw.githubusercontent.com/ranadigitalhub/rana-x-assets/main/2f0967fe0592eeb2a8df21573ae978c4_720w.mp4';
const LOGO_SRC =
  'https://raw.githubusercontent.com/ranadigitalhub/rana-x-assets/main/file_000000005f448211a3815d55509ba927.png';

export const VideoSplashScreen: React.FC<VideoSplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'intro' | 'reveal' | 'exit'>('intro');
  const stageRef = useRef<'intro' | 'reveal' | 'exit'>('intro');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  stageRef.current = stage;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start video playback
    video.play().catch(() => {
      // Autoplay handled via muted & playsInline
    });

    const checkTimeline = () => {
      if (completedRef.current) return;

      if (video) {
        const currentTime = video.currentTime || 0;

        // 7.0s: Dim background & reveal logo
        if (currentTime >= 7.0 && stageRef.current === 'intro') {
          stageRef.current = 'reveal';
          setStage('reveal');
        }

        // 15.0s (or video end): Trigger smooth 600ms exit animation
        if ((currentTime >= 15.0 || video.ended) && stageRef.current !== 'exit') {
          stageRef.current = 'exit';
          setStage('exit');
          setTimeout(() => {
            if (!completedRef.current) {
              completedRef.current = true;
              onComplete();
            }
          }, 600);
          return;
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(checkTimeline);
    };

    animationFrameIdRef.current = requestAnimationFrame(checkTimeline);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [onComplete]);

  const isRevealed = stage === 'reveal' || stage === 'exit';
  const isExiting = stage === 'exit';

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={isExiting ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden select-none"
      style={{
        pointerEvents: isExiting ? 'none' : 'auto',
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
    >
      {/* Background HTML5 Video */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay for smooth dimming at 7.0s */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: isRevealed ? 0.7 : 0,
        }}
      />

      {/* Centered Logo (Hidden until 7.0s, then fades and scales in) */}
      <div
        className="relative z-10 flex items-center justify-center p-6 transition-all duration-1000 ease-out"
        style={{
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'scale(1)' : 'scale(0.8)',
          pointerEvents: 'none',
        }}
      >
        <img
          src={LOGO_SRC}
          alt="RANA X Logo"
          className="max-w-[280px] sm:max-w-[360px] md:max-w-[420px] max-h-[45vh] object-contain"
          style={{
            filter: 'drop-shadow(0 0 25px rgba(255, 30, 0, 0.9))',
          }}
        />
      </div>
    </motion.div>
  );
};
