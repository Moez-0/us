import React from 'react';
import { motion } from 'motion/react';
import { Share, PlusSquare, Bell, Smartphone, X, Check } from 'lucide-react';
import { pixelAudio } from '../lib/sound';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnablePush: () => void;
  pushSubscribed: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onEnablePush,
  pushSubscribed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#1A1A2E] border-4 border-black p-5 shadow-[8px_8px_0px_#000] overflow-hidden"
      >
        <button
          onClick={() => {
            pixelAudio.playBlip();
            onClose();
          }}
          className="absolute top-3 right-3 w-7 h-7 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000]"
        >
          <X className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <div className="text-center mb-4">
          <div className="w-10 h-10 border-2 border-black bg-[#FFD166] text-black flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_#000]">
            <Smartphone className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="font-pixel text-sm text-black dark:text-white uppercase">
            INSTALL "US." PWA
          </h3>
          <p className="font-pixel-ui text-xs text-[#555] dark:text-[#AAA] mt-1 leading-tight">
            Install to your iPhone or Android home screen for instant access and realtime alerts.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-2 mb-4 font-pixel-ui text-xs text-black dark:text-white">
          <div className="flex items-start gap-2.5 p-2 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] shadow-[1px_1px_0px_#000]">
            <div className="w-5 h-5 border border-black bg-[#FF3366] text-white font-pixel text-[10px] flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <p className="font-bold">Tap Share in Safari / Browser</p>
              <div className="flex items-center gap-1 text-[10px] text-[#777] mt-0.5">
                <span>Look for the</span>
                <Share className="w-3 h-3 inline text-[#FF3366]" />
                <span>icon</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] shadow-[1px_1px_0px_#000]">
            <div className="w-5 h-5 border border-black bg-[#FF3366] text-white font-pixel text-[10px] flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <p className="font-bold">Select "Add to Home Screen"</p>
              <div className="flex items-center gap-1 text-[10px] text-[#777] mt-0.5">
                <PlusSquare className="w-3 h-3 inline text-[#FF3366]" />
                <span>in the action sheet</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] shadow-[1px_1px_0px_#000]">
            <div className="w-5 h-5 border border-black bg-[#FF3366] text-white font-pixel text-[10px] flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <p className="font-bold">Tap "Add" in Top Corner</p>
              <p className="text-[10px] text-[#777]">
                App appears on your phone screen!
              </p>
            </div>
          </div>
        </div>

        {/* Direct Action Button */}
        <div className="space-y-2">
          {pushSubscribed ? (
            <div className="w-full py-2 border-2 border-black bg-[#06D6A0] text-black font-pixel text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]">
              <Check className="w-4 h-4 stroke-[3]" />
              REALTIME ALERTS ACTIVE
            </div>
          ) : (
            <button
              onClick={() => {
                pixelAudio.playBlip();
                onEnablePush();
              }}
              className="w-full py-2.5 pixel-btn bg-[#FF3366] text-white font-pixel text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              ENABLE REALTIME ALERTS
            </button>
          )}

          <button
            onClick={() => {
              pixelAudio.playBlip();
              onClose();
            }}
            className="w-full py-1.5 font-pixel text-[10px] text-[#777] hover:text-black dark:hover:text-white cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </motion.div>
    </div>
  );
};
