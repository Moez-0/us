import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Clock,
  MapPin,
  Edit2,
  Mail,
  Image as ImageIcon,
  Sparkles,
  Navigation,
  Compass,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VirtualHugButton } from '../components/VirtualHugButton';
import { CountdownCard } from '../components/CountdownCard';
import { DailyQuestionCard } from '../components/DailyQuestionCard';
import { QuickLoveActions } from '../components/QuickLoveActions';
import { StatusPickerModal } from '../components/StatusPickerModal';
import { pixelAudio } from '../lib/sound';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    partnerName,
    myStatus,
    partnerStatus,
    updateStatus,
    sendLoveAction,
    lastSentAction,
    countdown,
    updateCountdown,
    currentQuestion,
    myAnswer,
    partnerAnswer,
    canRevealQuestion,
    submitQuestionAnswer,
    rotateQuestion,
    setActiveTab,
    refreshGPSLocation,
    isGpsLoading,
    gpsError,
  } = useApp();

  const [showLoveActions, setShowLoveActions] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [now, setNow] = useState(new Date());

  // Clock updates every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Timezones: Moez in Tunis (Africa/Tunis, UTC+1), Eliza in Poland (Europe/Warsaw, UTC+1 / UTC+2 DST)
  const moezTime = now.toLocaleTimeString('en-US', {
    timeZone: 'Africa/Tunis',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const elizaTime = now.toLocaleTimeString('en-US', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const partnerTime = partnerName === 'Moez' ? moezTime : elizaTime;
  const myTime = currentUser === 'Moez' ? moezTime : elizaTime;

  // Real location resolution: from real GPS if present, else fallback
  const myCity = myStatus?.city || (currentUser === 'Moez' ? 'Tunis' : 'Warsaw');
  const partnerCity = partnerStatus?.city || (partnerName === 'Moez' ? 'Tunis' : 'Warsaw');

  const handleRefreshGPS = () => {
    pixelAudio.playBlip();
    refreshGPSLocation();
  };

  return (
    <div className="min-h-screen pb-28 pt-3 px-3 sm:px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-[#FF3366] text-white border-2 border-black font-pixel text-xs px-2 py-0.5 shadow-[1px_1px_0px_#000]">
            US.
          </div>
          <span className="font-pixel text-xs text-black dark:text-white tracking-wider">
            MOEZ & ELIZA
          </span>
        </div>

        {/* User's quick mood indicator & trigger */}
        <button
          onClick={() => {
            pixelAudio.playBlip();
            setShowStatusPicker(true);
          }}
          className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-[#1A1A2E] border-2 border-black text-black dark:text-white font-pixel text-[10px] shadow-[2px_2px_0px_#000] hover:translate-x-0.5 cursor-pointer"
        >
          <span className="w-2 h-2 bg-[#06D6A0] inline-block border border-black animate-pulse" />
          <span className="truncate max-w-[90px]">{myStatus?.status || 'SET STATUS'}</span>
          <Edit2 className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Shared Locations & Distance */}
      <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-3 relative">
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#FF3366] animate-pulse" />
            <span className="font-pixel text-[11px] text-black dark:text-white uppercase tracking-wider">
              OUR LOCATIONS
            </span>
          </div>

          <button
            onClick={handleRefreshGPS}
            disabled={isGpsLoading}
            className="font-pixel text-[9px] bg-[#FFD166] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] flex items-center gap-1 cursor-pointer hover:translate-x-0.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
            <span>{isGpsLoading ? 'UPDATING...' : 'UPDATE LOCATION'}</span>
          </button>
        </div>

        {/* Our two locations */}
        <div className="grid grid-cols-2 gap-2 font-pixel-ui text-xs">
          {/* Player 1 (Moez) */}
          <div className="border border-black bg-[#FAF8F5] dark:bg-[#121224] p-2">
            <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10 mb-1">
              <span className="font-pixel text-[10px] text-[#118AB2]">MOEZ</span>
              <span className="font-pixel text-[9px] text-[#777]">{moezTime}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-black dark:text-white truncate">
              <MapPin className="w-3 h-3 text-[#118AB2] shrink-0" />
              <span className="truncate">
                {currentUser === 'Moez' ? myCity : (partnerName === 'Moez' ? partnerCity : 'Tunisia')}
              </span>
            </div>
          </div>

          {/* Player 2 (Eliza) */}
          <div className="border border-black bg-[#FAF8F5] dark:bg-[#121224] p-2">
            <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10 mb-1">
              <span className="font-pixel text-[10px] text-[#FF3366]">ELIZA</span>
              <span className="font-pixel text-[9px] text-[#777]">{elizaTime}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-black dark:text-white truncate">
              <MapPin className="w-3 h-3 text-[#FF3366] shrink-0" />
              <span className="truncate">
                {currentUser === 'Eliza' ? myCity : (partnerName === 'Eliza' ? partnerCity : 'Poland')}
              </span>
            </div>
          </div>
        </div>

        {gpsError && (
          <div className="mt-2 text-[10px] font-pixel text-[#FF3366] text-center">
            [NOTE: {gpsError}. Please allow GPS location in browser.]
          </div>
        )}
      </div>

      {/* PARTNER RPG STATUS CARD */}
      <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-3.5 relative">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-3">
          <div>
            <span className="font-pixel text-[9px] text-[#FF3366] uppercase tracking-wider block">
              &gt; PARTNER STATUS &lt;
            </span>
            <h2 className="font-pixel text-base text-black dark:text-white mt-0.5">
              PARTNER: {partnerName.toUpperCase()}
            </h2>
          </div>

          {/* Partner HP Bar */}
          <div className="text-right">
            <div className="font-pixel text-[9px] text-black dark:text-[#AAA]">LOVE: 100%</div>
            <div className="flex gap-0.5 text-xs text-[#FF3366]">
              ♥♥♥♥♥
            </div>
          </div>
        </div>

        {/* Current status banner */}
        <div className="p-3 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] shadow-[2px_2px_0px_#000] flex items-center justify-between">
          <div>
            <span className="font-pixel text-[9px] text-[#777] dark:text-[#AAA] uppercase block">
              CURRENT STATUS:
            </span>
            <span className="font-pixel text-xs text-black dark:text-white">
              {partnerStatus?.status || 'FEELING LOVED'}
            </span>
          </div>

          <span className="font-pixel text-[9px] bg-black text-[#06D6A0] px-1.5 py-0.5 border border-black">
            {partnerStatus?.updated_at
              ? new Date(partnerStatus.updated_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'ONLINE'}
          </span>
        </div>
      </div>

      {/* INSTANT CONNECTION: ONE-TAP LOVE & ACTIONS */}
      <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-3.5 text-center">
        <div className="font-pixel text-xs text-black dark:text-white mb-2 uppercase tracking-wider">
          ★ SEND A LITTLE LOVE ★
        </div>

        {/* Large Thinking of you button */}
        <motion.button
          whileTap={{ scale: 0.97, y: 1 }}
          onClick={() => {
            pixelAudio.playHeart();
            sendLoveAction('thinking');
          }}
          className="w-full py-3 px-4 bg-[#FF3366] hover:bg-[#ff1a53] text-white border-2 border-black shadow-[3px_3px_0px_#000] font-pixel text-xs flex items-center justify-center gap-2 cursor-pointer mb-2"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>
            {lastSentAction === 'thinking'
              ? '★ MESSAGE SENT WITH LOVE! ★'
              : `SEND "THINKING OF YOU" TO ${partnerName.toUpperCase()}`}
          </span>
        </motion.button>

        {/* Open full actions drawer */}
        <button
          onClick={() => {
            pixelAudio.playBlip();
            setShowLoveActions(true);
          }}
          className="w-full py-2 bg-[#FAF8F5] dark:bg-[#121224] text-black dark:text-white border-2 border-black font-pixel text-[10px] shadow-[2px_2px_0px_#000] hover:translate-x-0.5 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-[#FF3366]" />
          <span>OPEN LOVE ACTIONS (KISS, HUG, GOOD MORNING...)</span>
        </button>
      </div>

      {/* SIGNATURE VIRTUAL HUG CARD */}
      <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-4 text-center">
        <div className="font-pixel text-xs text-black dark:text-white mb-3 uppercase tracking-wider">
          &gt; SEND A VIRTUAL HUG &lt;
        </div>

        <VirtualHugButton
          partnerName={partnerName}
          onSendHug={() => sendLoveAction('hug')}
        />
      </div>

      {/* COUNTDOWN PREVIEW */}
      <CountdownCard countdown={countdown} onUpdate={updateCountdown} />

      {/* DAILY QUESTION */}
      <DailyQuestionCard
        question={currentQuestion}
        currentUser={currentUser || 'Moez'}
        partnerName={partnerName}
        myAnswer={myAnswer}
        partnerAnswer={partnerAnswer}
        canReveal={canRevealQuestion}
        onSubmitAnswer={submitQuestionAnswer}
        onRotateQuestion={rotateQuestion}
      />

      {/* QUICK SHORTCUTS */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => {
            pixelAudio.playBlip();
            setActiveTab('letters');
          }}
          className="pixel-card bg-white dark:bg-[#1A1A2E] p-3 text-left hover:bg-[#FFD166]/15 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 border-2 border-black bg-[#118AB2] text-white flex items-center justify-center mb-2 shadow-[1px_1px_0px_#000]">
            <Mail className="w-4 h-4" />
          </div>
          <span className="block font-pixel text-xs text-black dark:text-white">
            WRITE LETTER
          </span>
          <span className="block font-pixel-ui text-[10px] text-[#666] dark:text-[#AAA] mt-0.5">
            Private Time Capsule
          </span>
        </button>

        <button
          onClick={() => {
            pixelAudio.playBlip();
            setActiveTab('memories');
          }}
          className="pixel-card bg-white dark:bg-[#1A1A2E] p-3 text-left hover:bg-[#FFD166]/15 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 border-2 border-black bg-[#8338EC] text-white flex items-center justify-center mb-2 shadow-[1px_1px_0px_#000]">
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className="block font-pixel text-xs text-black dark:text-white">
            RECORD PHOTO
          </span>
          <span className="block font-pixel-ui text-[10px] text-[#666] dark:text-[#AAA] mt-0.5">
            Real Memory Crystals
          </span>
        </button>
      </div>

      {/* Quick Love Actions Drawer */}
      <AnimatePresence>
        {showLoveActions && (
          <QuickLoveActions
            partnerName={partnerName}
            onSelectAction={sendLoveAction}
            onClose={() => setShowLoveActions(false)}
          />
        )}
      </AnimatePresence>

      {/* Status Picker Modal */}
      <AnimatePresence>
        {showStatusPicker && (
          <StatusPickerModal
            currentStatus={myStatus?.status}
            onSelectStatus={updateStatus}
            onClose={() => setShowStatusPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
