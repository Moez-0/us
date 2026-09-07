import React from 'react';
import { motion } from 'motion/react';
import { Heart, Shield } from 'lucide-react';
import { PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface OnboardingAuthProps {
  onSelectPartner: (partner: PartnerName) => void;
}

export const OnboardingAuth: React.FC<OnboardingAuthProps> = ({ onSelectPartner }) => {
  const handleSelect = (partner: PartnerName) => {
    pixelAudio.playBlip();
    pixelAudio.playHeart();
    onSelectPartner(partner);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between px-4 py-8 max-w-md mx-auto relative select-none">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-6"
      >
        {/* App description */}
        <div className="inline-block bg-[#FFD166] text-black border-2 border-black font-pixel text-xs px-3 py-1 mb-4 shadow-[2px_2px_0px_0px_#000]">
          ★ A PRIVATE SPACE FOR TWO ★
        </div>

        {/* App logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-[#FF3366] fill-[#FF3366]" />
          <h1 className="text-4xl font-pixel tracking-wider text-black dark:text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            US.
          </h1>
          <Heart className="w-8 h-8 text-[#FF3366] fill-[#FF3366]" />
        </div>

        <p className="font-pixel-ui text-sm text-[#555] dark:text-[#AAA] max-w-xs mx-auto leading-relaxed border-t-2 border-b-2 border-dashed border-black/20 dark:border-white/20 py-1.5 my-2">
          "Make being apart feel a little less apart."
        </p>
      </motion.div>

      {/* Identity Choice Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="my-auto py-4"
      >
        <div className="pixel-card bg-white dark:bg-[#1A1A2E] p-4 text-center mb-4">
          <div className="font-pixel text-sm text-[#FF3366] mb-1">
            &gt; CHOOSE YOUR NAME &lt;
          </div>
          <p className="font-pixel-ui text-xs text-[#777] dark:text-[#BBB]">
            Select your name once. No passwords or logins needed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Moez Player Card */}
          <motion.button
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={() => handleSelect('Moez')}
            className="pixel-card bg-[#118AB2]/10 hover:bg-[#118AB2]/25 dark:bg-[#118AB2]/20 dark:hover:bg-[#118AB2]/35 p-4 text-center cursor-pointer transition-colors group relative"
          >
            {/* Player 1 Tag */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#118AB2] text-white font-pixel text-[10px] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
              MOEZ
            </div>

            {/* Pixel Sprite Avatar */}
            <div className="w-16 h-16 mx-auto mb-3 border-2 border-black bg-[#118AB2] text-white flex items-center justify-center font-pixel text-2xl shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
              M
            </div>

            <div className="font-pixel text-base text-black dark:text-white mb-1">
              MOEZ
            </div>
            <div className="font-pixel-ui text-xs text-[#555] dark:text-[#CCC]">
              Tunisia 🇹🇳
            </div>
            <div className="mt-3 bg-[#118AB2] text-white font-pixel text-xs py-1 border border-black shadow-[2px_2px_0px_#000]">
              ENTER
            </div>
          </motion.button>

          {/* Eliza Player Card */}
          <motion.button
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={() => handleSelect('Eliza')}
            className="pixel-card bg-[#FF3366]/10 hover:bg-[#FF3366]/25 dark:bg-[#FF3366]/20 dark:hover:bg-[#FF3366]/35 p-4 text-center cursor-pointer transition-colors group relative"
          >
            {/* Player 2 Tag */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF3366] text-white font-pixel text-[10px] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
              ELIZA
            </div>

            {/* Pixel Sprite Avatar */}
            <div className="w-16 h-16 mx-auto mb-3 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center font-pixel text-2xl shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
              E
            </div>

            <div className="font-pixel text-base text-black dark:text-white mb-1">
              ELIZA
            </div>
            <div className="font-pixel-ui text-xs text-[#555] dark:text-[#CCC]">
              Poland 🇵🇱
            </div>
            <div className="mt-3 bg-[#FF3366] text-white font-pixel text-xs py-1 border border-black shadow-[2px_2px_0px_#000]">
              ENTER
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-center pb-2"
      >
        <div className="inline-flex items-center gap-1.5 font-pixel-ui text-xs text-[#666] dark:text-[#AAA]">
          <Shield className="w-3.5 h-3.5 text-[#06D6A0]" />
          <span>Encrypted private connection</span>
        </div>
      </motion.div>
    </div>
  );
};
