import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, MailOpen, Calendar, Lock, Check } from 'lucide-react';
import { Letter, PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface LetterReaderModalProps {
  letter: Letter | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: PartnerName;
  onMarkOpened: (id: string) => void;
}

export const LetterReaderModal: React.FC<LetterReaderModalProps> = ({
  letter,
  isOpen,
  onClose,
  currentUser,
  onMarkOpened,
}) => {
  const [isUnfolding, setIsUnfolding] = useState(false);
  const openingLetterId = useRef<string | null>(null);

  useEffect(() => {
    if (!letter) {
      openingLetterId.current = null;
      return;
    }

    if (
      !letter.opened_at &&
      letter.sender_name !== currentUser &&
      openingLetterId.current !== letter.id
    ) {
      openingLetterId.current = letter.id;
      setIsUnfolding(true);
      pixelAudio.playHeart();
      const timer = setTimeout(() => {
        setIsUnfolding(false);
        onMarkOpened(letter.id);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [letter, currentUser, onMarkOpened]);

  if (!isOpen || !letter) return null;

  const isLocked =
    letter.unlock_at && new Date(letter.unlock_at).getTime() > new Date().getTime();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-[#FFFEE0] text-black border-4 border-black shadow-[8px_8px_0px_#000] p-5 flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            pixelAudio.playBlip();
            onClose();
          }}
          className="absolute top-4 right-4 w-7 h-7 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#000] z-20"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        {isLocked ? (
          // LOCKED LETTER
          <div className="py-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center mb-3 shadow-[2px_2px_0px_#000]">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-pixel text-base text-black mb-1">
              ★ LETTER SEALED ★
            </h3>
            <p className="font-pixel-ui text-xs text-[#555] max-w-xs mb-4">
              {letter.sender_name} locked this time capsule for a future milestone. It will safely open on:
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white font-pixel text-xs text-[#FF3366] shadow-[2px_2px_0px_#000]">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(letter.unlock_at!).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        ) : isUnfolding ? (
          // UNSEALING ANIMATION
          <div className="py-16 text-center flex flex-col items-center">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [0.9, 1.1, 1] }}
              transition={{ duration: 0.8 }}
              className="w-16 h-16 border-2 border-black bg-[#FFD166] text-black flex items-center justify-center mb-3 shadow-[3px_3px_0px_#000]"
            >
              <MailOpen className="w-8 h-8" />
            </motion.div>
            <p className="font-pixel text-xs text-black">
              OPENING LETTER FROM {letter.sender_name.toUpperCase()}...
            </p>
          </div>
        ) : (
          // OPEN LETTER
          <>
            <div className="pb-3 border-b-2 border-black pr-8">
              <div className="flex items-center gap-2 font-pixel text-[10px] text-[#FF3366] uppercase mb-1">
                <span>FROM {letter.sender_name}</span>
                <span>•</span>
                <span>
                  {new Date(letter.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="font-pixel text-lg text-black leading-tight">
                {letter.title}
              </h2>
            </div>

            {/* Letter Body */}
            <div className="flex-1 overflow-y-auto py-4 pr-1">
              <div className="font-pixel-ui text-sm text-black leading-relaxed whitespace-pre-wrap">
                {letter.content}
              </div>
            </div>

            {/* Footer with stamp */}
            <div className="pt-3 border-t-2 border-black flex items-center justify-between font-pixel text-[10px] text-[#555]">
              <div className="flex items-center gap-1 text-[#06D6A0]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="text-black">SEAL OPENED IN US.</span>
              </div>
              <span className="text-[#FF3366]">★ WITH ALL MY LOVE ★</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
