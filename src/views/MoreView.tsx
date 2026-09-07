import React from 'react';
import {
  Bell,
  Smartphone,
  Moon,
  Sun,
  Laptop,
  Heart,
  LogOut,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { pixelAudio } from '../lib/sound';

export const MoreView: React.FC = () => {
  const {
    currentUser,
    partnerName,
    disconnectDevice,
    theme,
    setTheme,
    pushSubscribed,
    enablePushNotifications,
    setShowInstallGuide,
  } = useApp();

  const { isInstalled, isInstallable, install } = usePWAInstall();

  const handleTestSound = () => {
    pixelAudio.playFanfare();
  };

  return (
    <div className="min-h-screen pb-28 pt-3 px-3 sm:px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Header */}
      <div className="pb-2 border-b-2 border-black">
        <span className="font-pixel text-[10px] text-[#FF3366] uppercase tracking-wider block">
          &gt; SYSTEM CONFIG &lt;
        </span>
        <h2 className="font-pixel text-base text-black dark:text-white mt-0.5">
          PREFERENCES & CONNECTION
        </h2>
      </div>

      {/* Active Identity Card */}
      <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-black bg-[#FFD166] text-black font-pixel text-sm flex items-center justify-center shadow-[2px_2px_0px_#000]">
            {currentUser ? currentUser[0] : 'U'}
          </div>
          <div>
            <span className="font-pixel text-[9px] text-[#FF3366] uppercase tracking-wider block">
              ACTIVE PROFILE
            </span>
            <h3 className="font-pixel text-sm text-black dark:text-white">
              YOU: {currentUser?.toUpperCase()}
            </h3>
            <span className="font-pixel-ui text-xs text-[#555] dark:text-[#AAA]">
              Connected with {partnerName}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            pixelAudio.playBlip();
            disconnectDevice();
          }}
          className="p-2 border-2 border-black bg-[#FF3366] text-white shadow-[2px_2px_0px_#000] hover:translate-x-0.5 cursor-pointer"
          title="Switch persona or disconnect device"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* SOUND EFFECTS CONTROLS */}
      <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#06D6A0]" />
            <span className="font-pixel text-xs text-black dark:text-white uppercase">
              SOUND EFFECTS
            </span>
          </div>

          <button
            onClick={handleTestSound}
            className="font-pixel text-[9px] bg-[#06D6A0] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] hover:translate-x-0.5 cursor-pointer"
          >
            TEST BLIP ♪
          </button>
        </div>
        <p className="font-pixel-ui text-xs text-[#555] dark:text-[#AAA]">
          Gentle sound effects for hugs, love messages, and shared questions.
        </p>
      </div>

      {/* NOTIFICATIONS & INSTALLATION */}
      <div className="space-y-2">
        <h3 className="font-pixel text-[10px] uppercase text-[#777] px-1">
          HOME SCREEN & REALTIME ALERTS
        </h3>

        <div className="border-2 border-black bg-white dark:bg-[#1A1A2E] shadow-[3px_3px_0px_#000] divide-y-2 divide-black">
          {/* Browser notification toggle */}
          <div className="p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-pixel text-xs text-black dark:text-white">
                  REALTIME ALERTS
                </h4>
                <p className="font-pixel-ui text-[11px] text-[#555] dark:text-[#AAA]">
                  {pushSubscribed
                    ? 'Receiving realtime messages & hugs'
                    : 'Alerts when your partner reaches out'}
                </p>
              </div>
            </div>

            {pushSubscribed ? (
              <span className="font-pixel text-[10px] text-black bg-[#06D6A0] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                ACTIVE
              </span>
            ) : (
              <button
                onClick={() => {
                  pixelAudio.playBlip();
                  enablePushNotifications();
                }}
                className="pixel-btn bg-[#FF3366] text-white font-pixel text-[10px] px-2.5 py-1 cursor-pointer"
              >
                ENABLE
              </button>
            )}
          </div>

          {/* Add to Home Screen */}
          <div className="p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 border-2 border-black bg-[#118AB2] text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-pixel text-xs text-black dark:text-white">
                  {isInstalled ? 'INSTALLED ON DEVICE' : 'INSTALL MOBILE PWA'}
                </h4>
                <p className="font-pixel-ui text-[11px] text-[#555] dark:text-[#AAA]">
                  {isInstalled
                    ? 'Standalone app mode active'
                    : 'Full screen app with home screen icon'}
                </p>
              </div>
            </div>

            {!isInstalled && (
              <button
                onClick={() => {
                  pixelAudio.playBlip();
                  if (isInstallable) {
                    install();
                  } else {
                    setShowInstallGuide(true);
                  }
                }}
                className="font-pixel text-[10px] bg-[#FFD166] text-black px-2.5 py-1 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
              >
                INSTALL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* APPEARANCE */}
      <div className="space-y-2">
        <h3 className="font-pixel text-[10px] uppercase text-[#777] px-1">
          GRAPHIC THEME DISPLAY
        </h3>

        <div className="p-1 bg-white dark:bg-[#1A1A2E] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1">
          {[
            { id: 'dark', label: 'DARK', icon: Moon },
            { id: 'light', label: 'LIGHT', icon: Sun },
            { id: 'system', label: 'AUTO', icon: Laptop },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = theme === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  pixelAudio.playBlip();
                  setTheme(mode.id as any);
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 font-pixel text-[10px] border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#FFD166] text-black border-black font-bold shadow-[1px_1px_0px_#000]'
                    : 'text-[#666] dark:text-[#AAA] border-transparent hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3 stroke-[2.5]" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIVACY & ABOUT */}
      <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-3.5 space-y-2">
        <div className="flex items-center gap-2 font-pixel text-xs text-black dark:text-white">
          <Shield className="w-4 h-4 text-[#FF3366]" />
          <span>ZERO EXTERNAL TRACKERS / PRIVACY</span>
        </div>
        <p className="font-pixel-ui text-xs text-[#555] dark:text-[#AAA] leading-relaxed">
          Us. is engineered strictly for Moez and Eliza. No ads, no third-party feeds, and zero public exposure.
        </p>
        <div className="pt-2 border-t-2 border-black flex items-center justify-between font-pixel text-[9px] text-[#777]">
          <span>VERSION 1.0 • PWA</span>
          <span className="flex items-center gap-1 text-[#FF3366]">
            CRAFTED WITH <Heart className="w-3 h-3 fill-[#FF3366]" /> FOR US
          </span>
        </div>
      </div>
    </div>
  );
};
