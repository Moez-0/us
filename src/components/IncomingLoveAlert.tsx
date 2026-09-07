import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Sun,
  Moon,
  Smile,
  X,
  HeartHandshake,
} from 'lucide-react';
import { LoveEventType, PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface IncomingLoveAlertProps {
  event: {
    sender: PartnerName;
    type: LoveEventType;
    id: string;
  } | null;
  onDismiss: () => void;
}

const LOVE_INFO: Record<LoveEventType, { title: string; subtitle: string; icon: React.FC<{ className?: string }>; color: string }> = {
  thinking: {
    title: 'THINKING OF YOU',
    subtitle: 'A message received across the distance.',
    icon: Heart,
    color: '#FF3366',
  },
  miss_you: {
    title: 'MISSING YOU DEEPLY',
    subtitle: 'Wishing we were together right now.',
    icon: HeartHandshake,
    color: '#8338EC',
  },
  hug: {
    title: 'WARM VIRTUAL HUG',
    subtitle: 'Hold close and feel the squeeze!',
    icon: Heart,
    color: '#FF5400',
  },
  kiss: {
    title: 'SWEET KISS',
    subtitle: 'A tender kiss for you.',
    icon: Sparkles,
    color: '#FF0054',
  },
  good_morning: {
    title: 'GOOD MORNING, LOVE',
    subtitle: 'Hope your day starts gently.',
    icon: Sun,
    color: '#FFBE0B',
  },
  good_night: {
    title: 'GOOD NIGHT, SLEEP TIGHT',
    subtitle: 'Rest peacefully. Meet in dreams.',
    icon: Moon,
    color: '#3A86FF',
  },
  love: {
    title: 'I LOVE YOU',
    subtitle: 'Always & forever.',
    icon: Heart,
    color: '#FF3366',
  },
  laugh: {
    title: 'SHARED A SMILE',
    subtitle: 'Smiling thinking of us.',
    icon: Smile,
    color: '#06D6A0',
  },
};

export const IncomingLoveAlert: React.FC<IncomingLoveAlertProps> = ({ event, onDismiss }) => {
  useEffect(() => {
    if (!event) return;
    pixelAudio.playHeart();
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [event, onDismiss]);

  if (!event) return null;

  const info = LOVE_INFO[event.type] || LOVE_INFO.thinking;
  const Icon = info.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-12 px-3 select-none">
        {/* Floating Pixel Notification Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="pointer-events-auto max-w-sm w-full bg-white dark:bg-[#1A1A2E] border-4 border-black p-3.5 shadow-[6px_6px_0px_#000] flex items-center gap-3"
        >
          <div
            className="w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]"
            style={{ backgroundColor: info.color }}
          >
            <Icon className="w-5 h-5 text-white stroke-[2.5]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-[10px] text-[#FF3366] uppercase">
                ★ FROM {event.sender.toUpperCase()} ★
              </span>
            </div>
            <h4 className="font-pixel text-xs text-black dark:text-white truncate">
              {info.title}
            </h4>
            <p className="font-pixel-ui text-[11px] text-[#555] dark:text-[#AAA] truncate">
              {info.subtitle}
            </p>
          </div>

          <button
            onClick={() => {
              pixelAudio.playBlip();
              onDismiss();
            }}
            className="w-7 h-7 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000]"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
