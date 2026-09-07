import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-[#FF3366] text-white font-pixel text-[10px] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 pointer-events-none uppercase">
      <WifiOff className="w-3.5 h-3.5" />
      <span>[OFFLINE MODE • LOCAL STORAGE ACTIVE]</span>
    </div>
  );
};
