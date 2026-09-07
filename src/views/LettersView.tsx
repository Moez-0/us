import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Plus, Lock, MailOpen, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Letter } from '../types';
import { WriteLetterModal } from '../components/WriteLetterModal';
import { LetterReaderModal } from '../components/LetterReaderModal';
import { pixelAudio } from '../lib/sound';

export const LettersView: React.FC = () => {
  const { letters, currentUser, partnerName, writeLetter, markLetterOpened } = useApp();
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'received' | 'sent' | 'sealed'>('all');

  const filteredLetters = letters.filter((l) => {
    if (filter === 'received') return l.sender_name === partnerName;
    if (filter === 'sent') return l.sender_name === currentUser;
    if (filter === 'sealed') {
      const isLocked = l.unlock_at && new Date(l.unlock_at).getTime() > new Date().getTime();
      return isLocked || !l.opened_at;
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-28 pt-3 px-3 sm:px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
        <div>
          <span className="font-pixel text-[10px] text-[#FF3366] uppercase tracking-wider block">
            &gt; TIME CAPSULE ARCHIVE &lt;
          </span>
          <h2 className="font-pixel text-base text-black dark:text-white mt-0.5">
            LETTERS
          </h2>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            pixelAudio.playBlip();
            setShowWriteModal(true);
          }}
          className="pixel-btn bg-[#FF3366] text-white font-pixel text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>WRITE</span>
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-[#1A1A2E] border-2 border-black shadow-[2px_2px_0px_#000]">
        {(['all', 'received', 'sent', 'sealed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              pixelAudio.playBlip();
              setFilter(f);
            }}
            className={`py-1.5 font-pixel text-[10px] uppercase transition-colors cursor-pointer border ${
              filter === f
                ? 'bg-[#FFD166] text-black border-black font-bold shadow-[1px_1px_0px_#000]'
                : 'text-[#666] dark:text-[#AAA] border-transparent hover:text-black dark:hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Letter List */}
      <div className="space-y-3">
        {filteredLetters.length === 0 ? (
          <div className="text-center py-12 px-4 pixel-card bg-white dark:bg-[#1A1A2E]">
            <div className="w-12 h-12 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] text-black dark:text-white flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_#000]">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="font-pixel text-xs text-black dark:text-white uppercase">
              ★ NO LETTERS IN ARCHIVE ★
            </h4>
            <p className="font-pixel-ui text-xs text-[#666] dark:text-[#AAA] mt-1 max-w-xs mx-auto">
              Real correspondence between Moez and Eliza. Click [WRITE] to send your first real private letter or future time capsule!
            </p>
            <button
              onClick={() => {
                pixelAudio.playBlip();
                setShowWriteModal(true);
              }}
              className="mt-3 pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-1.5 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>COMPOSE LETTER</span>
            </button>
          </div>
        ) : (
          filteredLetters.map((letter) => {
            const isLocked =
              letter.unlock_at && new Date(letter.unlock_at).getTime() > new Date().getTime();
            const isUnopened = !letter.opened_at && letter.sender_name !== currentUser;

            return (
              <motion.div
                key={letter.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  pixelAudio.playBlip();
                  setSelectedLetter(letter);
                }}
                className={`p-3.5 border-2 border-black transition-all cursor-pointer relative shadow-[3px_3px_0px_#000] hover:translate-x-0.5 ${
                  isLocked
                    ? 'bg-[#FAF8F5] dark:bg-[#121224] border-dashed'
                    : isUnopened
                    ? 'bg-[#FFD166]/20 dark:bg-[#FFD166]/10 border-2 border-[#FF3366]'
                    : 'bg-white dark:bg-[#1A1A2E]'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-black/15 dark:border-white/15">
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-[10px] text-[#FF3366] uppercase">
                      {letter.sender_name === currentUser ? 'YOU WROTE' : `FROM ${letter.sender_name.toUpperCase()}`}
                    </span>
                    <span className="font-pixel-ui text-[10px] text-[#777]">
                      {new Date(letter.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 font-pixel text-[9px] text-[#FF5400] bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 border border-black">
                      <Lock className="w-2.5 h-2.5" />
                      LOCKED
                    </span>
                  ) : isUnopened ? (
                    <span className="inline-flex items-center gap-1 font-pixel text-[9px] bg-[#FF3366] text-white px-1.5 py-0.5 border border-black">
                      <Sparkles className="w-2.5 h-2.5" />
                      NEW
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-pixel-ui text-[10px] text-[#888]">
                      <MailOpen className="w-3 h-3" />
                      Opened
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-pixel text-xs text-black dark:text-white mb-1">
                  {letter.title}
                </h3>

                {/* Content preview or lock notice */}
                {isLocked ? (
                  <p className="font-pixel-ui text-[11px] text-[#FF5400] italic flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-[#FF5400]" />
                    <span>
                      Opens on{' '}
                      {new Date(letter.unlock_at!).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                ) : isUnopened ? (
                  <p className="font-pixel-ui text-[11px] text-[#FF3366] italic mt-1">
                    Open this letter to read its contents.
                  </p>
                ) : (
                  <p className="font-pixel-ui text-[11px] text-[#555] dark:text-[#AAA] line-clamp-2 leading-relaxed">
                    {letter.content}
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Write Letter Modal */}
      <WriteLetterModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        partnerName={partnerName}
        onSendLetter={writeLetter}
      />

      {/* Letter Reader Modal */}
      <LetterReaderModal
        letter={selectedLetter}
        isOpen={!!selectedLetter}
        onClose={() => setSelectedLetter(null)}
        currentUser={currentUser || 'Moez'}
        onMarkOpened={markLetterOpened}
      />
    </div>
  );
};
