import React from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Heart,
  Sparkles,
  Coffee,
  Zap,
  HeartPulse,
  Smile,
  CloudRain,
  Moon,
  X,
  Check,
} from 'lucide-react';
import { StatusFeeling } from '../types';
import { pixelAudio } from '../lib/sound';

interface StatusPickerModalProps {
  currentStatus?: StatusFeeling;
  onSelectStatus: (feeling: StatusFeeling) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: {
  feeling: StatusFeeling;
  desc: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}[] = [
  { feeling: 'Happy', desc: 'Smiling & lighthearted', icon: Sun, color: '#FFBE0B' },
  { feeling: 'Missing you', desc: 'Thinking about being with you', icon: Heart, color: '#FF3366' },
  { feeling: 'Feeling loved', desc: 'Full heart & grateful', icon: Sparkles, color: '#8338EC' },
  { feeling: 'Tired', desc: 'Needs some rest', icon: Coffee, color: '#FB5607' },
  { feeling: 'Excited', desc: 'Charged up for our plans!', icon: Zap, color: '#FFD166' },
  { feeling: 'Need a hug', desc: 'Looking for a warm squeeze', icon: HeartPulse, color: '#FF006E' },
  { feeling: 'Having a good day', desc: 'Everything is flowing well', icon: Smile, color: '#06D6A0' },
  { feeling: 'Having a difficult day', desc: 'Needing comfort & love', icon: CloudRain, color: '#3A86FF' },
  { feeling: 'Going to sleep', desc: 'Entering sleep mode soon', icon: Moon, color: '#7209B7' },
];

export const StatusPickerModal: React.FC<StatusPickerModalProps> = ({
  currentStatus,
  onSelectStatus,
  onClose,
}) => {
  const handleSelect = (feeling: StatusFeeling) => {
    pixelAudio.playBlip();
    onSelectStatus(feeling);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 select-none">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="relative w-full max-w-md bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-4 z-10 pb-safe"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div>
            <span className="font-pixel text-[10px] text-[#FF3366] uppercase tracking-wider block">
              &gt; STATUS EFFECT CONFIG &lt;
            </span>
            <h3 className="font-pixel text-sm text-black dark:text-white mt-0.5">
              CURRENT MOOD STATE
            </h3>
          </div>
          <button
            onClick={() => {
              pixelAudio.playBlip();
              onClose();
            }}
            className="w-7 h-7 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="space-y-2 pt-3 max-h-[60vh] overflow-y-auto">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentStatus === opt.feeling;

            return (
              <motion.button
                key={opt.feeling}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(opt.feeling)}
                className={`w-full flex items-center justify-between p-2.5 border-2 border-black text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFD166] text-black shadow-[3px_3px_0px_#000] translate-x-1'
                    : 'bg-white dark:bg-[#121224] text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]"
                    style={{ backgroundColor: opt.color }}
                  >
                    <Icon className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-pixel text-xs text-black dark:text-white">
                      {opt.feeling}
                    </h4>
                    <p className="font-pixel-ui text-[11px] text-[#555] dark:text-[#AAA]">
                      {opt.desc}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 border-2 border-black bg-black text-white flex items-center justify-center font-pixel text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
