import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  PartnerName,
  LoveEventType,
  StatusFeeling,
  UserStatus,
  Letter,
  Memory,
  Countdown,
  BucketItem,
  BucketCategory,
  Question,
  QuestionAnswer,
  Song,
  StoryMilestone,
  LittleMoment,
  ActiveTab,
  MemoryReaction,
} from '../types';
import {
  INITIAL_COUPLE,
  INITIAL_MEMBERS,
  INITIAL_STATUSES,
  INITIAL_LETTERS,
  INITIAL_MEMORIES,
  INITIAL_COUNTDOWN,
  INITIAL_BUCKET_ITEMS,
  INITIAL_QUESTIONS,
  INITIAL_QUESTION_ANSWERS,
  INITIAL_SONGS,
  INITIAL_STORY_MILESTONES,
  INITIAL_LITTLE_MOMENTS,
} from '../data/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getRealGPSPosition, calculateHaversineDistance } from '../lib/gps';
import { pixelAudio } from '../lib/sound';

interface AppContextValue {
  currentUser: PartnerName | null;
  partnerName: PartnerName;
  loginAs: (name: PartnerName) => void;
  disconnectDevice: () => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  // Statuses & Real GPS
  statuses: Record<string, UserStatus>;
  myStatus?: UserStatus;
  partnerStatus?: UserStatus;
  updateStatus: (feeling: StatusFeeling) => Promise<void>;
  refreshGPSLocation: () => Promise<void>;
  isGpsLoading: boolean;
  gpsError: string | null;
  gpsDistance: { km: number; miles: number } | null;
  // Love Interactions
  sendLoveAction: (type: LoveEventType) => Promise<void>;
  activeIncomingLoveEvent: { sender: PartnerName; type: LoveEventType; id: string } | null;
  dismissIncomingLoveEvent: () => void;
  lastSentAction: LoveEventType | null;
  // Letters
  letters: Letter[];
  writeLetter: (title: string, content: string, unlock_at?: string | null) => Promise<void>;
  markLetterOpened: (letterId: string) => Promise<void>;
  // Memories
  memories: Memory[];
  addMemory: (caption: string, memory_date: string, imagePath: string) => Promise<void>;
  reactToMemory: (memoryId: string, reaction: MemoryReaction['reaction']) => Promise<void>;
  // Countdown
  countdown: Countdown;
  updateCountdown: (title: string, date: string, location?: string) => Promise<void>;
  // Bucket List
  bucketItems: BucketItem[];
  toggleBucketItem: (id: string) => Promise<void>;
  addBucketItem: (title: string, category: BucketCategory) => Promise<void>;
  // Questions
  currentQuestion: Question;
  myAnswer?: QuestionAnswer;
  partnerAnswer?: QuestionAnswer;
  canRevealQuestion: boolean;
  submitQuestionAnswer: (answer: string) => Promise<void>;
  rotateQuestion: () => void;
  // Soundtrack
  songs: Song[];
  addSong: (title: string, artist: string, url?: string, note?: string) => Promise<void>;
  // Story
  storyMilestones: StoryMilestone[];
  addStoryMilestone: (title: string, description: string, date: string) => Promise<void>;
  // Moments
  littleMoments: LittleMoment[];
  // Browser notification permission state
  pushSubscribed: boolean;
  enablePushNotifications: () => Promise<boolean>;
  showInstallGuide: boolean;
  setShowInstallGuide: (val: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// v3 clean storage keys ensure any legacy fake mock data from prior runs is purged
const STORAGE_KEYS = {
  USER: 'us_auth_partner_v3',
  THEME: 'us_theme_pref_v3',
  LETTERS: 'us_letters_real_v3',
  MEMORIES: 'us_memories_real_v3',
  STATUSES: 'us_statuses_real_v3',
  COUNTDOWN: 'us_countdown_real_v3',
  BUCKET: 'us_bucket_real_v3',
  ANSWERS: 'us_answers_real_v3',
  QUESTION_INDEX: 'us_question_idx_real_v3',
  SONGS: 'us_songs_real_v3',
  STORY: 'us_story_real_v3',
  MOMENTS: 'us_moments_real_v3',
};

// Safe JSON parser for localStorage
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

async function showRealtimeNotification(title: string, body: string, tag: string) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag,
        data: { url: '/' },
      });
      return;
    }

    new Notification(title, { body, tag });
  } catch (error) {
    console.warn('Realtime notification error:', error);
  }
}

function decodeVapidKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

async function sendPushNotification(
  recipientName: PartnerName,
  title: string,
  body: string,
  tag: string,
) {
  if (!supabase || !isSupabaseConfigured) return;

  const { error } = await supabase.functions.invoke('send-push', {
    body: {
      couple_id: INITIAL_COUPLE.id,
      recipient_name: recipientName,
      title,
      body,
      tag,
      url: '/',
    },
  });

  if (error) console.warn('Push notification delivery error:', error.message);
}

function getLoveNotification(type: LoveEventType, sender: PartnerName) {
  const messages: Record<LoveEventType, string> = {
    thinking: 'is thinking of you',
    miss_you: 'is missing you',
    hug: 'sent you a warm hug',
    kiss: 'sent you a kiss',
    good_morning: 'wished you good morning',
    good_night: 'wished you good night',
    love: 'sent all their love',
    laugh: 'sent a smile and laugh',
  };

  return {
    title: `${sender} ${messages[type]}`,
    body: 'Open Us. to see it.',
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Device Identity
  const [currentUser, setCurrentUser] = useState<PartnerName | null>(() => {
    return (sessionStorage.getItem(STORAGE_KEYS.USER) as PartnerName) || null;
  });

  const partnerName: PartnerName = currentUser === 'Moez' ? 'Eliza' : 'Moez';

  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | 'system') || 'dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    if (!currentUser || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setPushSubscribed(Boolean(subscription)))
      .catch(() => setPushSubscribed(false));
  }, [currentUser]);

  // App Domain Data States
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>(() =>
    loadLocal(STORAGE_KEYS.STATUSES, INITIAL_STATUSES)
  );
  const [letters, setLetters] = useState<Letter[]>(() =>
    loadLocal(STORAGE_KEYS.LETTERS, INITIAL_LETTERS)
  );
  const [memories, setMemories] = useState<Memory[]>(() =>
    loadLocal(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES)
  );
  const [countdown, setCountdown] = useState<Countdown>(() =>
    loadLocal(STORAGE_KEYS.COUNTDOWN, INITIAL_COUNTDOWN)
  );
  const [bucketItems, setBucketItems] = useState<BucketItem[]>(() =>
    loadLocal(STORAGE_KEYS.BUCKET, INITIAL_BUCKET_ITEMS)
  );
  const [questionIndex, setQuestionIndex] = useState<number>(() =>
    loadLocal(STORAGE_KEYS.QUESTION_INDEX, 0)
  );
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>(() =>
    loadLocal(STORAGE_KEYS.ANSWERS, INITIAL_QUESTION_ANSWERS)
  );
  const [songs, setSongs] = useState<Song[]>(() =>
    loadLocal(STORAGE_KEYS.SONGS, INITIAL_SONGS)
  );
  const [storyMilestones, setStoryMilestones] = useState<StoryMilestone[]>(() =>
    loadLocal(STORAGE_KEYS.STORY, INITIAL_STORY_MILESTONES)
  );
  const [littleMoments, setLittleMoments] = useState<LittleMoment[]>(() =>
    loadLocal(STORAGE_KEYS.MOMENTS, INITIAL_LITTLE_MOMENTS)
  );

  // Incoming Realtime Love Event Toast / Ripple
  const [activeIncomingLoveEvent, setActiveIncomingLoveEvent] = useState<{
    sender: PartnerName;
    type: LoveEventType;
    id: string;
  } | null>(null);

  const [lastSentAction, setLastSentAction] = useState<LoveEventType | null>(null);
  const notifiedLoveEventIds = useRef(new Set<string>());

  // Real GPS state
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Distance calculated from real GPS coordinates
  const gpsDistance = useMemo(() => {
    const myStat = currentUser ? statuses[currentUser] : undefined;
    const pStat = partnerName ? statuses[partnerName] : undefined;
    if (
      myStat?.latitude != null &&
      myStat?.longitude != null &&
      pStat?.latitude != null &&
      pStat?.longitude != null
    ) {
      return calculateHaversineDistance(
        myStat.latitude,
        myStat.longitude,
        pStat.latitude,
        pStat.longitude
      );
    }
    return null;
  }, [currentUser, partnerName, statuses]);

  // Apply Theme class
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = useCallback((t: 'dark' | 'light' | 'system') => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEYS.THEME, t);
  }, []);

  // Broadcast Channel for Instant Multi-tab / Multi-device Sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('us_couple_realtime');
      bc.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (!payload) return;

        if (type === 'LOVE_ACTION') {
          // If the other partner sent it, trigger incoming ripple / notification
          if (currentUser && payload.sender !== currentUser) {
            setActiveIncomingLoveEvent({
              sender: payload.sender,
              type: payload.type,
              id: payload.id || String(Date.now()),
            });
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 150]);
            }
            const notification = getLoveNotification(payload.type, payload.sender);
            const eventId = payload.id || `${payload.sender}-${payload.timestamp}`;
            if (!notifiedLoveEventIds.current.has(eventId)) {
              notifiedLoveEventIds.current.add(eventId);
              showRealtimeNotification(notification.title, notification.body, `love-event-${eventId}`);
            }
          }
        } else if (type === 'STATUS_UPDATE') {
          setStatuses((prev) => {
            const next = { ...prev, [payload.user_name]: payload };
            saveLocal(STORAGE_KEYS.STATUSES, next);
            return next;
          });
        } else if (type === 'NEW_LETTER') {
          setLetters((prev) => {
            if (prev.some((letter) => letter.id === payload.id)) return prev;
            const next = [payload, ...prev];
            saveLocal(STORAGE_KEYS.LETTERS, next);
            return next;
          });
        } else if (type === 'LETTER_OPENED') {
          setLetters((prev) => {
            const next = prev.map((l) => (l.id === payload.id ? { ...l, opened_at: payload.opened_at } : l));
            saveLocal(STORAGE_KEYS.LETTERS, next);
            return next;
          });
        } else if (type === 'NEW_MEMORY') {
          setMemories((prev) => {
            const next = [payload, ...prev];
            saveLocal(STORAGE_KEYS.MEMORIES, next);
            return next;
          });
        } else if (type === 'MEMORY_REACTION') {
          setMemories((prev) => {
            const next = prev.map((m) => {
              if (m.id === payload.memoryId) {
                const existing = m.reactions || [];
                const filtered = existing.filter((r) => r.user_id !== payload.reaction.user_id);
                return { ...m, reactions: [...filtered, payload.reaction] };
              }
              return m;
            });
            saveLocal(STORAGE_KEYS.MEMORIES, next);
            return next;
          });
        } else if (type === 'BUCKET_TOGGLE') {
          setBucketItems((prev) => {
            const next = prev.map((b) => (b.id === payload.id ? payload : b));
            saveLocal(STORAGE_KEYS.BUCKET, next);
            return next;
          });
        } else if (type === 'NEW_QUESTION_ANSWER') {
          setQuestionAnswers((prev) => {
            const filtered = prev.filter(
              (a) => !(a.question_id === payload.question_id && a.user_name === payload.user_name)
            );
            const next = [...filtered, payload];
            saveLocal(STORAGE_KEYS.ANSWERS, next);
            return next;
          });
        } else if (type === 'NEW_MOMENT') {
          setLittleMoments((prev) => {
            const next = [payload, ...prev];
            saveLocal(STORAGE_KEYS.MOMENTS, next);
            return next;
          });
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }

    return () => {
      bc?.close();
    };
  }, [currentUser]);

  // Supabase Realtime Subscription (if Supabase is configured with keys)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase.channel('couple_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'love_events' }, (payload) => {
        const newEvent = payload.new;
        if (currentUser && newEvent.sender_name !== currentUser) {
          setActiveIncomingLoveEvent({
            sender: newEvent.sender_name,
            type: newEvent.type,
            id: newEvent.id,
          });
          const notification = getLoveNotification(newEvent.type, newEvent.sender_name);
          if (!notifiedLoveEventIds.current.has(newEvent.id)) {
            notifiedLoveEventIds.current.add(newEvent.id);
            showRealtimeNotification(notification.title, notification.body, `love-event-${newEvent.id}`);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partner_statuses' }, (payload) => {
        const newStatus = payload.new as UserStatus;
        if (newStatus && newStatus.user_name) {
          setStatuses((prev) => ({ ...prev, [newStatus.user_name]: newStatus }));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, (payload) => {
        setMemories((prev) => [payload.new as Memory, ...prev]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'letters' }, (payload) => {
        const newLetter = payload.new as Letter;
        if (currentUser && newLetter.sender_name !== currentUser) {
          setLetters((prev) => {
            if (prev.some((letter) => letter.id === newLetter.id)) return prev;
            const next = [newLetter, ...prev];
            saveLocal(STORAGE_KEYS.LETTERS, next);
            return next;
          });
          showRealtimeNotification(
            `${newLetter.sender_name} wrote you a letter`,
            newLetter.title,
            `letter-${newLetter.id}`
          );
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'letters' }, (payload) => {
        const updatedLetter = payload.new as Letter;
        setLetters((prev) => {
          const next = prev.map((letter) =>
            letter.id === updatedLetter.id ? { ...letter, ...updatedLetter } : letter
          );
          saveLocal(STORAGE_KEYS.LETTERS, next);
          return next;
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bucket_items' }, (payload) => {
        setBucketItems((prev) => prev.map((b) => (b.id === payload.new.id ? (payload.new as BucketItem) : b)));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'songs' }, (payload) => {
        const newSong = payload.new as Song;
        setSongs((prev) => {
          if (prev.some((song) => song.id === newSong.id)) return prev;
          const next = [newSong, ...prev];
          saveLocal(STORAGE_KEYS.SONGS, next);
          return next;
        });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Supabase Realtime subscription ${status.toLowerCase()}`);
        }
      });

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [currentUser]);

  // Load shared data from Supabase after the anonymous session is ready.
  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured || !supabase) return;
    let active = true;

    const loadSharedData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const [statusResult, letterResult, memoryResult, answerResult, bucketResult, countdownResult, songResult] =
        await Promise.all([
          supabase.from('partner_statuses').select('*').eq('couple_id', INITIAL_COUPLE.id),
          supabase
            .from('letters')
            .select('*')
            .eq('couple_id', INITIAL_COUPLE.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('memories')
            .select('*')
            .eq('couple_id', INITIAL_COUPLE.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('question_answers')
            .select('*')
            .eq('couple_id', INITIAL_COUPLE.id),
          supabase
            .from('bucket_items')
            .select('*')
            .eq('couple_id', INITIAL_COUPLE.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('countdowns')
            .select('*')
            .eq('couple_id', INITIAL_COUPLE.id)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('songs')
            .select('*')
            .eq('couple_id', INITIAL_COUPLE.id)
            .order('created_at', { ascending: false }),
        ]);

      if (!active) return;

      if (statusResult.error) console.warn('Could not load partner statuses:', statusResult.error);
      if (statusResult.data) {
        const nextStatuses = statusResult.data.reduce<Record<string, UserStatus>>((result, status) => {
          result[status.user_name] = status as UserStatus;
          return result;
        }, {});
        setStatuses((previous) => {
          const next = { ...previous, ...nextStatuses };
          saveLocal(STORAGE_KEYS.STATUSES, next);
          return next;
        });
      }

      if (letterResult.error) console.warn('Could not load letters:', letterResult.error);
      if (letterResult.data) {
        setLetters(letterResult.data as Letter[]);
        saveLocal(STORAGE_KEYS.LETTERS, letterResult.data);
      }

      if (memoryResult.error) console.warn('Could not load memories:', memoryResult.error);
      if (memoryResult.data) {
        setMemories(memoryResult.data as Memory[]);
        saveLocal(STORAGE_KEYS.MEMORIES, memoryResult.data);
      }

      if (answerResult.error) console.warn('Could not load question answers:', answerResult.error);
      if (answerResult.data) {
        setQuestionAnswers(answerResult.data as QuestionAnswer[]);
        saveLocal(STORAGE_KEYS.ANSWERS, answerResult.data);
      }

      if (bucketResult.error) console.warn('Could not load shared plans:', bucketResult.error);
      if (bucketResult.data) {
        setBucketItems(bucketResult.data as BucketItem[]);
        saveLocal(STORAGE_KEYS.BUCKET, bucketResult.data);
      }

      if (countdownResult.error) console.warn('Could not load countdown:', countdownResult.error);
      if (countdownResult.data?.[0]) {
        setCountdown(countdownResult.data[0] as Countdown);
        saveLocal(STORAGE_KEYS.COUNTDOWN, countdownResult.data[0]);
      }

      if (songResult.error) console.warn('Could not load songs:', songResult.error);
      if (songResult.data) {
        setSongs(songResult.data as Song[]);
        saveLocal(STORAGE_KEYS.SONGS, songResult.data);
      }
    };

    loadSharedData().catch((error) => {
      console.warn('Supabase shared data sync error:', error);
    });

    return () => {
      active = false;
    };
  }, [currentUser]);

  // Invisible Authentication - select user once and persist session
  const loginAs = useCallback(async (name: PartnerName) => {
    // If Supabase is active, sign in anonymously or establish session
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          const { data: anonymousData, error } = await supabase.auth.signInAnonymously();
          if (error || !anonymousData.session) {
            console.error('Supabase login failed. Enable Anonymous sign-ins in Supabase Auth.', error);
            return;
          }
        }
      } catch (err) {
        console.error('Supabase login failed:', err);
        return;
      }
    }

    // Keep identity per tab so two tabs can test the two partners independently.
    setCurrentUser(name);
    sessionStorage.setItem(STORAGE_KEYS.USER, name);
  }, []);

  const disconnectDevice = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    setCurrentUser(null);
  }, []);

  // Broadcast helper
  const broadcast = useCallback((type: string, payload: any) => {
    try {
      const bc = new BroadcastChannel('us_couple_realtime');
      bc.postMessage({ type, payload });
      bc.close();
    } catch {}
  }, []);

  // Add Little Moment helper
  const addMoment = useCallback((action_text: string, type: LittleMoment['type'], actor?: PartnerName) => {
    const actor_name = actor || currentUser || 'Moez';
    const moment: LittleMoment = {
      id: 'lm-' + Date.now() + Math.random().toString(36).slice(2, 6),
      couple_id: INITIAL_COUPLE.id,
      actor_name,
      action_text,
      type,
      created_at: new Date().toISOString(),
    };
    setLittleMoments((prev) => {
      const next = [moment, ...prev];
      saveLocal(STORAGE_KEYS.MOMENTS, next);
      return next;
    });
    broadcast('NEW_MOMENT', moment);
  }, [currentUser, broadcast]);

  // Update Status
  const updateStatus = useCallback(async (status: StatusFeeling) => {
    if (!currentUser) return;
    const newStatus: UserStatus = {
      couple_id: INITIAL_COUPLE.id,
      user_id: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
      user_name: currentUser,
      status,
      updated_at: new Date().toISOString(),
    };

    setStatuses((prev) => {
      const next = { ...prev, [currentUser]: newStatus };
      saveLocal(STORAGE_KEYS.STATUSES, next);
      return next;
    });

    broadcast('STATUS_UPDATE', newStatus);
    addMoment(`is feeling ${status.toLowerCase()}`, 'status');

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('partner_statuses')
          .upsert(newStatus, { onConflict: 'couple_id,user_name' });
        if (error) console.warn('Supabase status error:', error);
      } catch (err) {
        console.warn('Supabase status error:', err);
      }
    }
  }, [currentUser, broadcast, addMoment]);

  // Real GPS location update from browser / device
  const refreshGPSLocation = useCallback(async () => {
    if (!currentUser) return;
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const loc = await getRealGPSPosition();
      setStatuses((prev) => {
        const current = prev[currentUser] || {
          couple_id: INITIAL_COUPLE.id,
          user_id: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
          user_name: currentUser,
          status: 'Feeling loved',
          updated_at: new Date().toISOString(),
        };
        const updated: UserStatus = {
          ...current,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          city: loc.city,
          country: loc.country,
          gps_updated_at: loc.timestamp,
          updated_at: new Date().toISOString(),
        };
        const next = { ...prev, [currentUser]: updated };
        saveLocal(STORAGE_KEYS.STATUSES, next);
        broadcast('STATUS_UPDATE', updated);
        return next;
      });

      addMoment(`updated GPS location (${loc.city || 'Coordinates acquired'})`, 'status');

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('partner_statuses').upsert(
            {
              couple_id: INITIAL_COUPLE.id,
              user_id: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
              user_name: currentUser,
              status: statuses[currentUser]?.status || 'Feeling loved',
              latitude: loc.latitude,
              longitude: loc.longitude,
              accuracy: loc.accuracy,
              city: loc.city,
              country: loc.country,
              gps_updated_at: loc.timestamp,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'couple_id,user_name' }
          );
        } catch (e) {
          console.warn('Supabase GPS sync error:', e);
        }
      }
    } catch (err: any) {
      console.warn('GPS location acquisition error:', err);
      setGpsError(err?.message || 'GPS location not permitted');
    } finally {
      setIsGpsLoading(false);
    }
  }, [currentUser, broadcast, addMoment, statuses]);

  // Automatically request GPS position when user is active
  useEffect(() => {
    if (currentUser) {
      refreshGPSLocation().catch(() => {});
    }
  }, [currentUser]);

  // Send Love Action
  const sendLoveAction = useCallback(async (type: LoveEventType) => {
    if (!currentUser) return;
    setLastSentAction(type);
    setTimeout(() => setLastSentAction(null), 2500);

    // Retro 8-bit sound effect
    pixelAudio.playHeart();

    // Subtle device haptic feedback where supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'hug' ? [120, 80, 200] : 80);
    }

    const labels: Record<LoveEventType, string> = {
      thinking: 'is thinking of you',
      miss_you: 'is missing you',
      hug: 'sent you a warm hug',
      kiss: 'sent you a kiss',
      good_morning: 'wished you good morning',
      good_night: 'wished you good night',
      love: 'sent all their love',
      laugh: 'sent a smile and laugh',
    };

    const payload = {
      id: 'le-' + Date.now(),
      sender: currentUser,
      type,
      timestamp: new Date().toISOString(),
    };

    broadcast('LOVE_ACTION', payload);
    addMoment(labels[type], type === 'hug' ? 'hug' : 'love_action');

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('love_events').insert({
          id: payload.id,
          couple_id: INITIAL_COUPLE.id,
          sender_id: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
          sender_name: currentUser,
          type,
        });
        if (error) throw error;

        const notification = getLoveNotification(type, currentUser);
        await sendPushNotification(partnerName, notification.title, notification.body, `love-event-${payload.id}`);
      } catch (e) {
        console.warn('Love action realtime sync error:', e);
      }
    }
  }, [currentUser, partnerName, broadcast, addMoment]);

  const dismissIncomingLoveEvent = useCallback(() => {
    setActiveIncomingLoveEvent(null);
  }, []);

  // Write Letter
  const writeLetter = useCallback(async (title: string, content: string, unlock_at?: string | null) => {
    if (!currentUser) return;
    const newLetter: Letter = {
      id: 'let-' + Date.now(),
      couple_id: INITIAL_COUPLE.id,
      sender_id: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
      sender_name: currentUser,
      title,
      content,
      unlock_at: unlock_at || null,
      opened_at: null,
      created_at: new Date().toISOString(),
    };

    setLetters((prev) => {
      const next = [newLetter, ...prev];
      saveLocal(STORAGE_KEYS.LETTERS, next);
      return next;
    });

    broadcast('NEW_LETTER', newLetter);
    addMoment(`wrote a new letter: "${title}"`, 'letter');

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('letters').insert(newLetter);
        if (error) throw error;

        await sendPushNotification(
          partnerName,
          `${currentUser} wrote you a letter`,
          title,
          `letter-${newLetter.id}`,
        );
      } catch (e) {
        console.warn('Letter write error:', e);
      }
    }
  }, [currentUser, broadcast, addMoment]);

  // Mark Letter Opened
  const markLetterOpened = useCallback(async (letterId: string) => {
    const opened_at = new Date().toISOString();
    setLetters((prev) => {
      const next = prev.map((l) => (l.id === letterId ? { ...l, opened_at } : l));
      saveLocal(STORAGE_KEYS.LETTERS, next);
      return next;
    });

    broadcast('LETTER_OPENED', { id: letterId, opened_at });
    const letter = letters.find((l) => l.id === letterId);
    if (letter) {
      addMoment(`opened the letter "${letter.title}"`, 'letter');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('letters').update({ opened_at }).eq('id', letterId);
      } catch (e) {}
    }
  }, [letters, broadcast, addMoment]);

  // Add Memory
  const addMemory = useCallback(async (caption: string, memory_date: string, imagePath: string) => {
    if (!currentUser) return;
    let storedImagePath = imagePath;

    if (isSupabaseConfigured && supabase && imagePath.startsWith('data:')) {
      try {
        const imageResponse = await fetch(imagePath);
        const imageBlob = await imageResponse.blob();
        const extension = imageBlob.type.split('/')[1] || 'jpg';
        const storagePath = `${INITIAL_COUPLE.id}/${currentUser.toLowerCase()}-${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('memories')
          .upload(storagePath, imageBlob, { contentType: imageBlob.type, upsert: false });

        if (!uploadError) {
          const { data } = supabase.storage.from('memories').getPublicUrl(storagePath);
          storedImagePath = data.publicUrl;
        } else {
          console.warn('Memory image upload error:', uploadError);
        }
      } catch (error) {
        console.warn('Memory image preparation error:', error);
      }
    }

    const newMemory: Memory = {
      id: 'mem-' + Date.now(),
      couple_id: INITIAL_COUPLE.id,
      created_by: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
      creator_name: currentUser,
      image_path: storedImagePath,
      caption,
      memory_date,
      created_at: new Date().toISOString(),
      reactions: [],
    };

    setMemories((prev) => {
      const next = [newMemory, ...prev];
      saveLocal(STORAGE_KEYS.MEMORIES, next);
      return next;
    });

    broadcast('NEW_MEMORY', newMemory);
    addMoment(`added a new memory: "${caption.slice(0, 30)}..."`, 'memory');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('memories').insert({
          couple_id: newMemory.couple_id,
          created_by: newMemory.created_by,
          creator_name: newMemory.creator_name,
          image_path: newMemory.image_path,
          caption: newMemory.caption,
          memory_date: newMemory.memory_date,
        });
      } catch (e) {}
    }
  }, [currentUser, broadcast, addMoment]);

  // Memory Reaction
  const reactToMemory = useCallback(async (memoryId: string, reaction: MemoryReaction['reaction']) => {
    if (!currentUser) return;
    const reactionObj: MemoryReaction = {
      id: 'r-' + Date.now(),
      memory_id: memoryId,
      user_id: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
      user_name: currentUser,
      reaction,
      created_at: new Date().toISOString(),
    };

    setMemories((prev) => {
      const next = prev.map((m) => {
        if (m.id === memoryId) {
          const filtered = (m.reactions || []).filter((r) => r.user_name !== currentUser);
          return { ...m, reactions: [...filtered, reactionObj] };
        }
        return m;
      });
      saveLocal(STORAGE_KEYS.MEMORIES, next);
      return next;
    });

    broadcast('MEMORY_REACTION', { memoryId, reaction: reactionObj });
  }, [currentUser, broadcast]);

  // Countdown
  const updateCountdown = useCallback(async (title: string, date: string, location?: string) => {
    const updated: Countdown = {
      ...countdown,
      title,
      date,
      location,
    };
    setCountdown(updated);
    saveLocal(STORAGE_KEYS.COUNTDOWN, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('countdowns').upsert(updated);
      } catch (e) {}
    }
  }, [countdown]);

  // Bucket list
  const toggleBucketItem = useCallback(async (id: string) => {
    setBucketItems((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const completed = !item.completed;
          const updated = {
            ...item,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            completed_by: completed ? currentUser || undefined : undefined,
          };
          broadcast('BUCKET_TOGGLE', updated);
          if (completed) {
            addMoment(`completed "${item.title}" from the bucket list`, 'bucket');
          }
          return updated;
        }
        return item;
      });
      saveLocal(STORAGE_KEYS.BUCKET, next);
      return next;
    });
  }, [currentUser, broadcast, addMoment]);

  const addBucketItem = useCallback(async (title: string, category: BucketCategory) => {
    const newItem: BucketItem = {
      id: 'b-' + Date.now(),
      couple_id: INITIAL_COUPLE.id,
      title,
      category,
      completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    setBucketItems((prev) => {
      const next = [...prev, newItem];
      saveLocal(STORAGE_KEYS.BUCKET, next);
      return next;
    });
    addMoment(`added "${title}" to the bucket list`, 'bucket');
  }, [addMoment]);

  // Questions
  const currentQuestion = INITIAL_QUESTIONS[questionIndex % INITIAL_QUESTIONS.length];

  const myAnswer = useMemo(() => {
    return questionAnswers.find(
      (a) => a.question_id === currentQuestion.id && a.user_name === currentUser
    );
  }, [questionAnswers, currentQuestion.id, currentUser]);

  const partnerAnswer = useMemo(() => {
    return questionAnswers.find(
      (a) => a.question_id === currentQuestion.id && a.user_name === partnerName
    );
  }, [questionAnswers, currentQuestion.id, partnerName]);

  const canRevealQuestion = Boolean(myAnswer && partnerAnswer);

  const submitQuestionAnswer = useCallback(async (answer: string) => {
    if (!currentUser) return;
    const newAnswer: QuestionAnswer = {
      id: 'qa-' + Date.now(),
      question_id: currentQuestion.id,
      couple_id: INITIAL_COUPLE.id,
      user_id: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
      user_name: currentUser,
      answer,
      created_at: new Date().toISOString(),
    };

    setQuestionAnswers((prev) => {
      const filtered = prev.filter(
        (a) => !(a.question_id === currentQuestion.id && a.user_name === currentUser)
      );
      const next = [...filtered, newAnswer];
      saveLocal(STORAGE_KEYS.ANSWERS, next);
      return next;
    });

    broadcast('NEW_QUESTION_ANSWER', newAnswer);
    addMoment(`answered today's question`, 'question');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('question_answers')
          .upsert(newAnswer, { onConflict: 'question_id,couple_id,user_name' });
      } catch (e) {}
    }
  }, [currentUser, currentQuestion.id, broadcast, addMoment]);

  const rotateQuestion = useCallback(() => {
    setQuestionIndex((prev) => {
      const next = (prev + 1) % INITIAL_QUESTIONS.length;
      saveLocal(STORAGE_KEYS.QUESTION_INDEX, next);
      return next;
    });
  }, []);

  // Songs
  const addSong = useCallback(async (title: string, artist: string, url?: string, note?: string) => {
    if (!currentUser) return;
    const newSong: Song = {
      id: 's-' + Date.now(),
      couple_id: INITIAL_COUPLE.id,
      added_by: currentUser === 'Moez' ? 'user-moez' : 'user-eliza',
      adder_name: currentUser,
      title,
      artist,
      url,
      note,
      created_at: new Date().toISOString(),
    };

    setSongs((prev) => {
      const next = [newSong, ...prev];
      saveLocal(STORAGE_KEYS.SONGS, next);
      return next;
    });

    addMoment(`added "${title}" by ${artist} to Our Soundtrack`, 'song');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          const { error: authError } = await supabase.auth.signInAnonymously();
          if (authError) throw authError;
        }

        const { error } = await supabase.from('songs').insert({
          id: newSong.id,
          couple_id: newSong.couple_id,
          added_by: newSong.added_by,
          adder_name: newSong.adder_name,
          title: newSong.title,
          artist: newSong.artist,
          url: newSong.url,
          note: newSong.note,
        });
        if (error) {
          console.error('Song sync error:', error);
          window.alert(`Could not save this song online: ${error.message}`);
        }
      } catch (error) {
        console.error('Song sync error:', error);
        window.alert('Could not save this song online. Check the connection and try again.');
      }
    } else {
      window.alert('Supabase is not configured in this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify.');
    }
  }, [currentUser, addMoment]);

  // Story Milestones
  const addStoryMilestone = useCallback(async (title: string, description: string, date: string) => {
    const newMilestone: StoryMilestone = {
      id: 'm-' + Date.now(),
      couple_id: INITIAL_COUPLE.id,
      title,
      description,
      date,
      order: storyMilestones.length + 1,
    };

    setStoryMilestones((prev) => {
      const next = [...prev, newMilestone];
      saveLocal(STORAGE_KEYS.STORY, next);
      return next;
    });
  }, [storyMilestones.length]);

  const enablePushNotifications = useCallback(async () => {
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !vapidPublicKey) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(vapidPublicKey),
      });
      const json = subscription.toJSON();
      const keys = json.keys;

      if (!supabase || !keys?.p256dh || !keys.auth || !currentUser) return false;

      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          couple_id: INITIAL_COUPLE.id,
          user_name: currentUser,
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        { onConflict: 'endpoint' },
      );

      if (error) throw error;
      setPushSubscribed(true);
      return true;
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  }, [currentUser]);

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      partnerName,
      loginAs,
      disconnectDevice,
      theme,
      setTheme,
      activeTab,
      setActiveTab,
      statuses,
      myStatus: currentUser ? statuses[currentUser] : undefined,
      partnerStatus: statuses[partnerName],
      updateStatus,
      refreshGPSLocation,
      isGpsLoading,
      gpsError,
      gpsDistance,
      sendLoveAction,
      activeIncomingLoveEvent,
      dismissIncomingLoveEvent,
      lastSentAction,
      letters,
      writeLetter,
      markLetterOpened,
      memories,
      addMemory,
      reactToMemory,
      countdown,
      updateCountdown,
      bucketItems,
      toggleBucketItem,
      addBucketItem,
      currentQuestion,
      myAnswer,
      partnerAnswer,
      canRevealQuestion,
      submitQuestionAnswer,
      rotateQuestion,
      songs,
      addSong,
      storyMilestones,
      addStoryMilestone,
      littleMoments,
      pushSubscribed,
      enablePushNotifications,
      showInstallGuide,
      setShowInstallGuide,
    }),
    [
      currentUser,
      partnerName,
      loginAs,
      disconnectDevice,
      theme,
      setTheme,
      activeTab,
      setActiveTab,
      statuses,
      updateStatus,
      refreshGPSLocation,
      isGpsLoading,
      gpsError,
      gpsDistance,
      sendLoveAction,
      activeIncomingLoveEvent,
      dismissIncomingLoveEvent,
      lastSentAction,
      letters,
      writeLetter,
      markLetterOpened,
      memories,
      addMemory,
      reactToMemory,
      countdown,
      updateCountdown,
      bucketItems,
      toggleBucketItem,
      addBucketItem,
      currentQuestion,
      myAnswer,
      partnerAnswer,
      canRevealQuestion,
      submitQuestionAnswer,
      rotateQuestion,
      songs,
      addSong,
      storyMilestones,
      addStoryMilestone,
      littleMoments,
      pushSubscribed,
      enablePushNotifications,
      showInstallGuide,
      setShowInstallGuide,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
