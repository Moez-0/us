import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Check } from 'lucide-react';
import { PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface VirtualHugButtonProps {
  partnerName: PartnerName;
  onSendHug: () => void;
}

export const VirtualHugButton: React.FC<VirtualHugButtonProps> = ({
  partnerName,
  onSendHug,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSent, setIsSent] = useState(false);
  const pressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const HUG_DURATION = 1500; // 1.5 seconds hold

  const handleStart = () => {
    if (isSent) return;
    setIsPressing(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    pixelAudio.playBlip();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    const step = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(elapsed / HUG_DURATION, 1);
      setProgress(currentProgress);

      if (typeof navigator !== 'undefined' && navigator.vibrate && Math.floor(elapsed / 300) % 2 === 0) {
        navigator.vibrate(20);
      }

      if (currentProgress < 1) {
        pressTimerRef.current = requestAnimationFrame(step);
      } else {
        completeHug();
      }
    };

    pressTimerRef.current = requestAnimationFrame(step);
  };

  const completeHug = () => {
    if (pressTimerRef.current) cancelAnimationFrame(pressTimerRef.current);
    setIsPressing(false);
    setProgress(1);
    setIsSent(true);

    pixelAudio.playHeart();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 160]);
    }

    onSendHug();

    setTimeout(() => {
      setIsSent(false);
      setProgress(0);
    }, 2800);
  };

  const handleEnd = () => {
    if (progress < 1 && !isSent) {
      if (pressTimerRef.current) cancelAnimationFrame(pressTimerRef.current);
      setIsPressing(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) cancelAnimationFrame(pressTimerRef.current);
    };
  }, []);

  const filledBlocks = Math.round(progress * 12);
  const totalBlocks = 12;

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      {/* Central hold interaction */}
      <div className="relative hug-orbit">
        <button
          id="hug-action-button"
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          className={`hug-button w-44 h-44 border flex flex-col items-center justify-center cursor-pointer transition-transform ${
            isSent
              ? 'bg-[#37dcc4] text-[#07131d] shadow-lg translate-y-0.5'
              : isPressing
              ? 'bg-[#ff3d83] text-white shadow-lg translate-y-0.5'
              : 'bg-[#10142c] text-white shadow-[0_0_28px_rgba(255,61,131,0.18)] hover:-translate-y-0.5'
          }`}
        >
          {isSent ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <Check className="w-10 h-10 text-black stroke-[3]" />
              <span className="font-pixel text-xs text-[#07131d] mt-1">HUG SENT!</span>
              <span className="font-pixel-ui text-[10px] text-[#07131d] font-bold">WITH LOVE</span>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center pointer-events-none">
              <Heart
                className={`w-10 h-10 transition-colors ${
                  isPressing
                    ? 'fill-white text-white animate-pulse'
                    : 'text-[#FF3366] fill-[#FF3366]'
                }`}
              />
              <span className="font-pixel text-xs mt-2 tracking-[0.14em]">
                {isPressing ? 'SENDING...' : 'HOLD TO HUG'}
              </span>
              <span className="script-place text-[10px] text-white/55">
                {isPressing ? `${Math.round(progress * 100)}%` : `For ${partnerName}`}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Charging bar */}
      <div className="hug-progress mt-5 w-52 p-1">
        <div className="flex gap-1 h-2">
          {Array.from({ length: totalBlocks }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 transition-colors ${
                i < filledBlocks
                  ? isSent
                    ? 'bg-[#06D6A0]'
                    : 'bg-[#FF3366]'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="font-pixel text-[10px] text-white/50 mt-3 text-center uppercase tracking-[0.12em]">
        {isSent
          ? `★ Warm Hug Received by ${partnerName}! ★`
          : `[ HOLD BUTTON 1.5S TO CHARGE VIRTUAL HUG ]`}
      </div>
    </div>
  );
};
