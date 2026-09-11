import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingAuth } from './components/OnboardingAuth';
import { BottomNav } from './components/BottomNav';
import { IncomingLoveAlert } from './components/IncomingLoveAlert';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HomeView } from './views/HomeView';
import { LettersView } from './views/LettersView';
import { MemoriesView } from './views/MemoriesView';
import { TogetherView } from './views/TogetherView';
import { MoreView } from './views/MoreView';
import { usePWAInstall } from './hooks/usePWAInstall';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    loginAs,
    activeTab,
    setActiveTab,
    letters,
    activeIncomingLoveEvent,
    dismissIncomingLoveEvent,
    showInstallGuide,
    setShowInstallGuide,
    pushSubscribed,
    enablePushNotifications,
  } = useApp();

  const { isInstalled } = usePWAInstall();

  useEffect(() => {
    if (!currentUser || pushSubscribed || !('Notification' in window)) return;
    if (Notification.permission === 'default') setShowInstallGuide(true);
  }, [currentUser, pushSubscribed, setShowInstallGuide]);

  // If no persona selected yet, show frictionless first-launch selection
  if (!currentUser) {
    return <OnboardingAuth onSelectPartner={loginAs} />;
  }

  // Count unread letters from partner
  const unreadLetters = letters.filter(
    (l) => !l.opened_at && l.sender_name !== currentUser
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0D0F18] text-[#121526] dark:text-[#F5F4F0] font-sans antialiased transition-colors selection:bg-[#E06D53]/20">
      <OfflineIndicator />

      {/* Realtime Incoming Love Event Banner & Ripple */}
      <IncomingLoveAlert
        event={activeIncomingLoveEvent}
        onDismiss={dismissIncomingLoveEvent}
      />

      {/* Main View Area */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HomeView />
            </motion.div>
          )}

          {activeTab === 'letters' && (
            <motion.div
              key="letters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LettersView />
            </motion.div>
          )}

          {activeTab === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MemoriesView />
            </motion.div>
          )}

          {activeTab === 'together' && (
            <motion.div
              key="together"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TogetherView />
            </motion.div>
          )}

          {activeTab === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MoreView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unreadLettersCount={unreadLetters}
      />

      {/* Safari / iPhone Installation Walkthrough */}
      <PWAInstallModal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        onEnablePush={enablePushNotifications}
        pushSubscribed={pushSubscribed}
        isInstalled={isInstalled}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
