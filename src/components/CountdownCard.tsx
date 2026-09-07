import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Edit3, X, Check, Clock } from 'lucide-react';
import { Countdown } from '../types';
import { pixelAudio } from '../lib/sound';

interface CountdownCardProps {
  countdown: Countdown;
  onUpdate: (title: string, date: string, location?: string) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  hasDate: boolean;
}

function calculateTimeLeft(targetDateStr?: string): TimeLeft {
  if (!targetDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, hasDate: false };
  }
  const target = new Date(targetDateStr).getTime();
  if (isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, hasDate: false };
  }
  const difference = target - new Date().getTime();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, hasDate: true };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isPast: false,
    hasDate: true,
  };
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ countdown, onUpdate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(countdown?.date));
  const [isEditing, setIsEditing] = useState(false);

  // Form edit fields
  const [editTitle, setEditTitle] = useState(countdown?.title || 'Next Reunion');
  const [editDate, setEditDate] = useState(() => {
    try {
      return countdown?.date ? new Date(countdown.date).toISOString().slice(0, 16) : '';
    } catch {
      return '';
    }
  });
  const [editLocation, setEditLocation] = useState(countdown?.location || '');

  useEffect(() => {
    if (!countdown?.date) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(countdown.date));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown?.date]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate) return;
    pixelAudio.playQuestComplete();
    onUpdate(editTitle.trim(), new Date(editDate).toISOString(), editLocation.trim() || undefined);
    setIsEditing(false);
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <div className="w-full pixel-card bg-white dark:bg-[#1A1A2E] p-4 relative select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF3366]" />
            <span className="font-pixel text-xs text-black dark:text-white uppercase tracking-wider">
              {countdown?.title || 'NEXT REUNION'}
            </span>
          </div>

          <button
            onClick={() => {
              pixelAudio.playBlip();
              setEditTitle(countdown?.title || 'Next Reunion');
              setEditLocation(countdown?.location || '');
              setIsEditing(true);
            }}
            className="font-pixel text-[10px] bg-[#FFD166] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] hover:translate-x-0.5 cursor-pointer"
          >
            EDIT [✎]
          </button>
        </div>

        {/* Live Counters */}
        {!timeLeft.hasDate ? (
          <div className="py-4 text-center border-2 border-dashed border-black/30 dark:border-white/30 p-4">
            <div className="font-pixel text-xs text-black dark:text-white mb-2">
              ★ NO REUNION DATE SET YET ★
            </div>
            <p className="font-pixel-ui text-xs text-[#666] dark:text-[#AAA] mb-3">
              When are you and your partner reuniting? Set your real countdown!
            </p>
            <button
              onClick={() => {
                pixelAudio.playBlip();
                setIsEditing(true);
              }}
              className="pixel-btn bg-[#FF3366] text-white font-pixel text-xs px-4 py-1.5"
            >
              + SET REAL COUNTDOWN
            </button>
          </div>
        ) : timeLeft.isPast ? (
          <div className="py-4 text-center bg-[#06D6A0]/20 border-2 border-black p-3">
            <h4 className="font-pixel text-sm text-black dark:text-white">
              ★ TOGETHER RIGHT NOW! ★
            </h4>
            <p className="font-pixel-ui text-xs text-black/80 dark:text-white/80 mt-1">
              Cherish every moment together.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center py-1">
            {/* Days */}
            <div className="border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] p-2 shadow-[2px_2px_0px_#000]">
              <div className="font-pixel text-2xl text-[#FF3366] font-mono leading-none">
                {timeLeft.days}
              </div>
              <div className="font-pixel text-[9px] uppercase text-black dark:text-[#AAA] mt-1">
                DAYS
              </div>
            </div>

            {/* Hours */}
            <div className="border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] p-2 shadow-[2px_2px_0px_#000]">
              <div className="font-pixel text-2xl text-[#118AB2] font-mono leading-none">
                {pad(timeLeft.hours)}
              </div>
              <div className="font-pixel text-[9px] uppercase text-black dark:text-[#AAA] mt-1">
                HOURS
              </div>
            </div>

            {/* Minutes */}
            <div className="border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] p-2 shadow-[2px_2px_0px_#000]">
              <div className="font-pixel text-2xl text-[#8338EC] font-mono leading-none">
                {pad(timeLeft.minutes)}
              </div>
              <div className="font-pixel text-[9px] uppercase text-black dark:text-[#AAA] mt-1">
                MINUTES
              </div>
            </div>
          </div>
        )}

        {/* Location tag if set */}
        {countdown?.location && timeLeft.hasDate && (
          <div className="mt-3 pt-2 border-t-2 border-dashed border-black/20 dark:border-white/20 flex items-center justify-center gap-1.5 font-pixel-ui text-xs text-black dark:text-[#AAA]">
            <MapPin className="w-3.5 h-3.5 text-[#FF3366]" />
            <span>Target: {countdown.location}</span>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-5"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <h3 className="font-pixel text-sm text-black dark:text-white">
                  &gt; EDIT REUNION DATE &lt;
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-6 h-6 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 font-pixel-ui text-xs">
                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-black dark:text-white text-xs focus:outline-none"
                    placeholder="Next time we meet..."
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Reunion Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Airport, Warsaw, Tunis"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border-2 border-black bg-gray-200 dark:bg-gray-800 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-1.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    SAVE COUNTDOWN
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
