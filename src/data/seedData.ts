import {
  Couple,
  Member,
  Letter,
  Memory,
  Countdown,
  BucketItem,
  Question,
  QuestionAnswer,
  Song,
  StoryMilestone,
  LittleMoment,
  UserStatus
} from '../types';

export const INITIAL_COUPLE: Couple = {
  id: 'couple-moez-eliza',
  relationship_date: '2023-11-14',
  created_at: '2023-11-14T00:00:00.000Z',
};

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-moez',
    couple_id: 'couple-moez-eliza',
    user_id: 'user-moez',
    name: 'Moez',
    created_at: '2023-11-14T00:00:00.000Z',
  },
  {
    id: 'mem-eliza',
    couple_id: 'couple-moez-eliza',
    user_id: 'user-eliza',
    name: 'Eliza',
    created_at: '2023-11-14T00:00:00.000Z',
  },
];

// Initial status states waiting for live GPS update from device
export const INITIAL_STATUSES: Record<string, UserStatus> = {
  Moez: {
    couple_id: 'couple-moez-eliza',
    user_id: 'user-moez',
    user_name: 'Moez',
    status: 'Feeling loved',
    updated_at: new Date().toISOString(),
  },
  Eliza: {
    couple_id: 'couple-moez-eliza',
    user_id: 'user-eliza',
    user_name: 'Eliza',
    status: 'Missing you',
    updated_at: new Date().toISOString(),
  },
};

// Pure real data only - starts empty
export const INITIAL_LETTERS: Letter[] = [];

export const INITIAL_MEMORIES: Memory[] = [];

export const INITIAL_COUNTDOWN: Countdown = {
  id: 'count-initial',
  couple_id: 'couple-moez-eliza',
  title: 'Next Time We Meet',
  date: '',
  location: '',
  created_at: new Date().toISOString(),
};

export const INITIAL_BUCKET_ITEMS: BucketItem[] = [];

export const INITIAL_QUESTIONS: Question[] = [
  { id: 'q-1', question: 'What is one little thing I do that always makes you smile?', category: 'romantic' },
  { id: 'q-2', question: 'What is our funniest memory together that still makes you laugh?', category: 'funny' },
  { id: 'q-3', question: 'If we could teleport anywhere in the world right now for an hour, where would we go?', category: 'future' },
  { id: 'q-4', question: 'What song immediately makes you think of me whenever it plays?', category: 'memories' },
  { id: 'q-5', question: 'What is something you really appreciate about how we communicate?', category: 'deep' },
  { id: 'q-6', question: 'What is our dream weekend together when there are no planes or borders in the way?', category: 'future' },
  { id: 'q-7', question: 'What was the exact moment you realized you had fallen in love with me?', category: 'romantic' },
  { id: 'q-8', question: 'What is one delicious meal we must cook together next time we are reunited?', category: 'funny' },
  { id: 'q-9', question: 'What is something you are looking forward to in our future together?', category: 'future' },
  { id: 'q-10', question: 'If our relationship had a retro RPG quest title, what would it be?', category: 'funny' },
];

export const INITIAL_QUESTION_ANSWERS: QuestionAnswer[] = [];

export const INITIAL_SONGS: Song[] = [];

export const INITIAL_STORY_MILESTONES: StoryMilestone[] = [];

export const INITIAL_LITTLE_MOMENTS: LittleMoment[] = [];
