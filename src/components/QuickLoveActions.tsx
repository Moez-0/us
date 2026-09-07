import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Sparkles,
  Sun,
  Moon,
  Smile,
  HeartHandshake,
  HeartPulse,
  MessageCircleHeart,
  X,
} from 'lucide-react';
import { LoveEventType, PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface QuickLoveActionsProps {
  partnerName: PartnerName;
  onSelectAction: (type: LoveEventType) => void;
  onClose: () => void;
}

const ACTIONS: {
  type: LoveEventType;
  label: string;
  sub: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}[] = [
  { type: 'thinking', label: 'THINKING OF YOU', sub: 'Just crossed my mind', icon: Heart, color: '#FF3366' },
  { type: 'miss_you', label: 'MISS YOU', sub: 'Wish you were here', icon: HeartHandshake, color: '#8338EC' },
  { type: 'hug', label: 'SEND HUG', sub: 'A warm embrace', icon: HeartPulse, color: '#FF5400' },
  { type: 'kiss', label: 'SEND KISS', sub: 'A tender kiss', icon: Sparkles, color: '#FF0054' },
  { type: 'good_morning', label: 'GOOD MORNING', sub: 'Wake up gently', icon: Sun, color: '#FFBE0B' },
  { type: 'good_night', label: 'GOOD NIGHT', sub: 'Sweet dreams', icon: Moon, color: '#3A86FF' },
  { type: 'laugh', label: 'LAUGH / SMILE', sub: 'Smiling thinking of us', icon: Smile, color: '#06D6A0' },
  { type: 'love', label: 'I LOVE YOU', sub: 'Always & forever', icon: MessageCircleHeart, color: '#FF3366' },
];

export const QuickLoveActions: React.FC<QuickLoveActionsProps> = ({
  partnerName,
  onSelectAction,
  onClose,
}) => {
  const handleSelect = (type: LoveEventType) => {
    pixelAudio.playHeart();
    onSelectAction(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 select-none">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="relative w-full max-w-md bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-4 z-10 pb-safe"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#FF3366] inline-block border border-black" />
            <h3 className="font-pixel text-sm text-black dark:text-white uppercase tracking-wider">
              &gt; LOVE ACTIONS FOR {partnerName} &lt;
            </h3>
          </div>
          <button
            onClick={() => {
              pixelAudio.playBlip();
              onClose();
            }}
            className="w-7 h-7 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-4 max-h-[60vh] overflow-y-auto">
          {ACTIONS.map((act) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.type}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(act.type)}
                className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#121224] border-2 border-black hover:bg-[#FFD166]/20 dark:hover:bg-[#FFD166]/10 text-left transition-transform shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 cursor-pointer group"
              >
                <div
                  className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]"
                  style={{ backgroundColor: act.color }}
                >
                  <Icon className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-pixel text-[11px] text-black dark:text-white leading-tight">
                    {act.label}
                  </span>
                  <span className="block font-pixel-ui text-[10px] text-[#666] dark:text-[#AAA] truncate mt-0.5">
                    {act.sub}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
