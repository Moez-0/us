import React from 'react';
import { motion } from 'motion/react';
import { X, Calendar, User, Heart, Sparkles, Smile, Droplets, Star } from 'lucide-react';
import { Memory, MemoryReaction, PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface MemoryDetailModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: PartnerName;
  onReact: (memoryId: string, reaction: MemoryReaction['reaction']) => void;
}

const REACTION_CONFIG: {
  type: MemoryReaction['reaction'];
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}[] = [
  { type: 'heart', label: 'Heart', icon: Heart, color: '#FF3366' },
  { type: 'sparkles', label: 'Magic', icon: Sparkles, color: '#FFD166' },
  { type: 'smile', label: 'Smile', icon: Smile, color: '#06D6A0' },
  { type: 'cry', label: 'Tears of joy', icon: Droplets, color: '#118AB2' },
  { type: 'star', label: 'Star', icon: Star, color: '#8338EC' },
];

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  isOpen,
  onClose,
  currentUser,
  onReact,
}) => {
  if (!isOpen || !memory) return null;

  const handleReaction = (type: MemoryReaction['reaction']) => {
    pixelAudio.playHeart();
    onReact(memory.id, type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-black border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col justify-between"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-3 bg-[#1A1A2E] border-b-2 border-black">
          <div className="flex items-center gap-2 font-pixel text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-[#FF3366]" />
            <span>
              {new Date(memory.memory_date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <button
            onClick={() => {
              pixelAudio.playBlip();
              onClose();
            }}
            className="w-7 h-7 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000]"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Full Image */}
        <div className="flex-1 flex items-center justify-center bg-black min-h-[300px] max-h-[60vh] p-2">
          <img
            src={memory.image_path}
            alt={memory.caption}
            className="max-h-[55vh] max-w-full object-contain border-2 border-white/20"
          />
        </div>

        {/* Bottom Details & Reaction Bar */}
        <div className="p-3 bg-white dark:bg-[#1A1A2E] border-t-2 border-black">
          <p className="font-pixel-ui text-xs sm:text-sm font-bold text-black dark:text-white leading-relaxed mb-3">
            "{memory.caption}"
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-black/20 dark:border-white/20 gap-2">
            <div className="flex items-center gap-1 font-pixel text-[10px] text-[#777] dark:text-[#AAA]">
              <User className="w-3 h-3" />
              <span>CAPTURED BY {memory.creator_name.toUpperCase()}</span>
            </div>

            {/* Reaction buttons */}
            <div className="flex items-center gap-1.5">
              {REACTION_CONFIG.map((rc) => {
                const Icon = rc.icon;
                const hasReacted = (memory.reactions || []).some(
                  (r) => r.reaction === rc.type && r.user_name === currentUser
                );
                const count = (memory.reactions || []).filter((r) => r.reaction === rc.type).length;

                return (
                  <button
                    key={rc.type}
                    onClick={() => handleReaction(rc.type)}
                    className={`flex items-center gap-1 px-2 py-1 border-2 border-black font-pixel text-[10px] cursor-pointer transition-transform shadow-[1px_1px_0px_#000] hover:scale-105 ${
                      hasReacted
                        ? 'bg-[#FFD166] text-black font-bold'
                        : 'bg-white dark:bg-[#121224] text-black dark:text-white hover:bg-gray-100'
                    }`}
                    title={rc.label}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: rc.color }} />
                    {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
