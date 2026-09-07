import React from 'react';
import { Heart, Mail, Image as ImageIcon, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ActiveTab } from '../types';
import { pixelAudio } from '../lib/sound';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unreadLettersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadLettersCount = 0,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'WORLD', icon: Heart },
    { id: 'letters', label: 'LETTERS', icon: Mail },
    { id: 'memories', label: 'ALBUM', icon: ImageIcon },
    { id: 'together', label: 'TOGETHER', icon: Sparkles },
    { id: 'more', label: 'SYSTEM', icon: SlidersHorizontal },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    pixelAudio.playBlip();
    onChangeTab(tabId);
  };

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFF] dark:bg-[#1A1A2E] border-t-4 border-black transition-colors pb-safe select-none shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.1)]"
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 w-[70px] cursor-pointer transition-transform ${
                isActive
                  ? 'bg-[#FF3366] text-white border-2 border-black shadow-[2px_2px_0px_#000] -translate-y-1'
                  : 'text-black dark:text-[#AAA] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 ${isActive && tab.id === 'home' ? 'fill-current' : ''}`}
                />

                {/* Pixel Badge for unread letters */}
                {tab.id === 'letters' && unreadLettersCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#FFD166] text-black font-pixel text-[8px] px-1 border border-black animate-bounce">
                    !
                  </span>
                )}
              </div>

              <span className="font-pixel text-[9px] mt-0.5 tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
