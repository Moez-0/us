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
    <div className="home-shell min-h-screen pb-32 pt-5 px-4 sm:px-5 max-w-md mx-auto space-y-4 select-none">
      {/* Top Header */}
      <div className="home-header flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="brand-mark text-white font-pixel text-lg">
            US.<span className="brand-heart">♥</span>
          </div>
          <div>
            <span className="block font-pixel text-xs text-white tracking-[0.16em] mt-1">MOEZ & ELIZA</span>
          </div>
        </div>

        {/* User's quick mood indicator & trigger */}
        <button
          onClick={() => {
            pixelAudio.playBlip();
            setShowStatusPicker(true);
          }}
          className="status-pill flex items-center gap-1.5 px-3 py-2 text-white/85 font-pixel text-[10px] cursor-pointer"
        >
          <span className="w-2 h-2 bg-[#06D6A0] inline-block border border-black animate-pulse" />
          <span className="truncate max-w-[90px]">{myStatus?.status || 'SET STATUS'}</span>
          <Edit2 className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Shared Locations & Distance */}
      <div className="pixel-card location-panel p-4 relative">
        <div className="flex items-center justify-between pb-3 mb-3 location-heading">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#ff4d91] animate-pulse" />
            <span className="font-pixel text-[11px] text-white/80 uppercase tracking-[0.16em]">
              OUR LOCATIONS
            </span>
          </div>

          <button
            onClick={handleRefreshGPS}
            disabled={isGpsLoading}
            className="ghost-action font-pixel text-[9px] text-[#ff77aa] px-3 py-2 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
            <span>{isGpsLoading ? 'UPDATING...' : 'UPDATE LOCATION'}</span>
          </button>
        </div>

        {/* Our two locations */}
        <div className="grid grid-cols-2 gap-2 font-pixel-ui text-xs">
          {/* Player 1 (Moez) */}
          <div className="location-card location-card-blue p-3">
            <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10 mb-1">
              <span className="font-pixel text-[10px] text-[#62aaff]">MOEZ</span>
              <span className="font-pixel text-[9px] text-white/45">{moezTime}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-white/75 truncate mt-3">
              <MapPin className="w-3.5 h-3.5 text-[#62aaff] shrink-0" />
              <span className="truncate">
                <span className="script-place">{currentUser === 'Moez' ? myCity : (partnerName === 'Moez' ? partnerCity : 'Tunisia')}</span>
              </span>
            </div>
          </div>

          {/* Player 2 (Eliza) */}
          <div className="location-card location-card-pink p-3">
            <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10 mb-1">
              <span className="font-pixel text-[10px] text-[#ff6d9f]">ELIZA</span>
              <span className="font-pixel text-[9px] text-white/45">{elizaTime}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-white/75 truncate mt-3">
              <MapPin className="w-3.5 h-3.5 text-[#ff6d9f] shrink-0" />
              <span className="truncate">
                <span className="script-place">{currentUser === 'Eliza' ? myCity : (partnerName === 'Eliza' ? partnerCity : 'Poland')}</span>
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
      <div className="pixel-card status-card p-4 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-pixel text-[10px] text-[#ff6d9f] uppercase tracking-[0.16em] block">
              ♥ PARTNER STATUS
            </span>
            <h2 className="font-pixel text-lg text-white mt-1 tracking-[0.12em]">
              PARTNER: {partnerName.toUpperCase()}
            </h2>
          </div>

          {/* Partner HP Bar */}
          <div className="text-right">
            <div className="font-pixel text-[9px] text-white/55">LOVE: 100%</div>
            <div className="flex gap-0.5 text-sm text-[#ff4d91] mt-1">
              ♥♥♥♥♥
            </div>
          </div>
        </div>

        {/* Current status banner */}
        <div className="status-inner p-4 flex items-center justify-between">
          <div>
            <span className="font-pixel text-[9px] text-white/45 uppercase block tracking-[0.14em]">
              CURRENT STATUS:
            </span>
            <span className="font-pixel text-sm text-white mt-1 block">
              {partnerStatus?.status || 'FEELING LOVED'}
            </span>
          </div>

          <span className="time-chip font-pixel text-[11px] text-[#42dfcf] px-3 py-2">
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
      <div className="pixel-card love-card p-4 text-center">
        <div className="font-pixel text-xs text-white/80 mb-3 uppercase tracking-[0.16em]">
          SEND A LITTLE LOVE
        </div>

        {/* Large Thinking of you button */}
        <motion.button
          whileTap={{ scale: 0.97, y: 1 }}
          onClick={() => {
            pixelAudio.playHeart();
            sendLoveAction('thinking');
          }}
          className="love-primary w-full py-4 px-4 text-white font-pixel text-xs flex items-center justify-center gap-2 cursor-pointer mb-3"
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
          className="love-secondary w-full py-3 px-3 text-white/75 font-pixel text-[10px] cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-[#FF3366]" />
          <span>OPEN LOVE ACTIONS (KISS, HUG, GOOD MORNING...)</span>
        </button>
      </div>

      {/* SIGNATURE VIRTUAL HUG CARD */}
      <div className="pixel-card hug-section p-4 text-center">
        <div className="font-pixel text-xs text-white/80 mb-3 uppercase tracking-[0.16em]">
          SEND A VIRTUAL HUG
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
