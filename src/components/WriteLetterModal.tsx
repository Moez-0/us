import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, Calendar, Lock } from 'lucide-react';
import { PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface WriteLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: PartnerName;
  onSendLetter: (title: string, content: string, unlock_at?: string | null) => Promise<void>;
}

export const WriteLetterModal: React.FC<WriteLetterModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSendLetter,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasUnlockDate, setHasUnlockDate] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    pixelAudio.playQuestComplete();
    await onSendLetter(
      title.trim(),
      content.trim(),
      hasUnlockDate && unlockDate ? new Date(unlockDate).toISOString() : null
    );
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-4 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div>
            <span className="font-pixel text-[10px] text-[#FF3366] uppercase tracking-wider block">
              &gt; PRIVATE CORRESPONDENCE &lt;
            </span>
            <h3 className="font-pixel text-sm text-black dark:text-white mt-0.5">
              TO: {partnerName.toUpperCase()}
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

        {/* Letter Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pt-3 space-y-3 font-pixel-ui text-xs">
          <div>
            <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
              Letter Title
            </label>
            <input
              type="text"
              placeholder="e.g. For when you miss my hugs..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div>
            <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
              Your Letter Words
            </label>
            <textarea
              rows={7}
              placeholder="Take your time. Say what you've been feeling in your heart..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full p-3 border-2 border-black bg-[#FFFEE0] text-black text-xs sm:text-sm font-pixel-ui focus:outline-none leading-relaxed resize-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          {/* Timed delivery toggle */}
          <div className="p-3 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] shadow-[2px_2px_0px_#000] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FF3366]" />
                <span className="font-pixel text-[10px] text-black dark:text-white">
                  TIME CAPSULE (UNLOCK IN FUTURE)
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasUnlockDate}
                onChange={(e) => setHasUnlockDate(e.target.checked)}
                className="w-4 h-4 accent-[#FF3366] cursor-pointer"
              />
            </div>

            {hasUnlockDate && (
              <div className="pt-2 border-t-2 border-dashed border-black/20 dark:border-white/20">
                <label className="block font-pixel text-[9px] text-[#777] mb-1">
                  UNLOCK DATE:
                </label>
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required={hasUnlockDate}
                  className="w-full px-2 py-1.5 border-2 border-black bg-white dark:bg-[#1A1A2E] text-xs text-black dark:text-white focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                pixelAudio.playBlip();
                onClose();
              }}
              className="px-3 py-2 border-2 border-black bg-gray-200 dark:bg-gray-800 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              {hasUnlockDate ? 'SEAL CAPSULE' : 'SEND LETTER'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
