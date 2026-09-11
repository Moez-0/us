/**
 * Core Domain Types for "Us." - A Private Space for Moez & Eliza
 */

export type PartnerName = 'Moez' | 'Eliza';

export interface Couple {
  id: string;
  relationship_date: string;
  created_at: string;
}

export interface Member {
  id: string;
  couple_id: string;
  user_id: string;
  name: PartnerName;
  created_at: string;
}

export type LoveEventType =
  | 'thinking'
  | 'miss_you'
  | 'hug'
  | 'kiss'
  | 'good_morning'
  | 'good_night'
  | 'love'
  | 'laugh';

export interface LoveEvent {
  id: string;
  couple_id: string;
  sender_id: string;
  sender_name: PartnerName;
  type: LoveEventType;
  created_at: string;
}

export type StatusFeeling =
  | 'Happy'
  | 'Missing you'
  | 'Feeling loved'
  | 'Tired'
  | 'Excited'
  | 'Need a hug'
  | 'Having a good day'
  | 'Having a difficult day'
  | 'Going to sleep';

export interface UserStatus {
  id?: string;
  couple_id: string;
  user_id: string;
  user_name: PartnerName;
  status: StatusFeeling;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  accuracy?: number;
  gps_updated_at?: string;
  updated_at: string;
}

export interface Letter {
  id: string;
  couple_id: string;
  sender_id: string;
  sender_name: PartnerName;
  title: string;
  content: string;
  unlock_at: string | null;
  opened_at: string | null;
  created_at: string;
}

export interface MemoryReaction {
  id: string;
  memory_id: string;
  user_id: string;
  user_name: PartnerName;
  reaction: 'heart' | 'sparkles' | 'smile' | 'cry' | 'star';
  created_at: string;
}

export interface Memory {
  id: string;
  couple_id: string;
  created_by: string;
  creator_name: PartnerName;
  image_path: string;
  caption: string;
  memory_date: string;
  created_at: string;
  reactions?: MemoryReaction[];
}

export interface Countdown {
  id: string;
  couple_id: string;
  title: string;
  date: string;
  location?: string;
  created_at: string;
}

export type BucketCategory =
  | 'Together'
  | 'Travel'
  | 'Tunisia'
  | 'Poland'
  | 'Food'
  | 'Movies'
  | 'Random';

export interface BucketItem {
  id: string;
  couple_id: string;
  title: string;
  category: BucketCategory;
  completed: boolean;
  completed_at: string | null;
  completed_by?: PartnerName;
  created_at: string;
}

export type QuestionCategory =
  | 'romantic'
  | 'funny'
  | 'deep'
  | 'future'
  | 'memories'
  | 'random';

export interface Question {
  id: string;
  question: string;
  category: QuestionCategory;
}

export interface QuestionAnswer {
  id: string;
  question_id: string;
  couple_id: string;
  user_id: string;
  user_name: PartnerName;
  answer: string;
  created_at: string;
}

export interface Song {
  id: string;
  couple_id: string;
  added_by: string;
  adder_name: PartnerName;
  title: string;
  artist: string;
  url?: string;
  note?: string;
  created_at: string;
}

export interface StoryMilestone {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  date: string;
  iconName?: string;
  order: number;
}

export interface LittleMoment {
  id: string;
  couple_id: string;
  actor_name: PartnerName;
  action_text: string;
  type: 'love_action' | 'hug' | 'memory' | 'letter' | 'question' | 'bucket' | 'song' | 'status';
  created_at: string;
}

export interface PushSubscriptionRecord {
  id?: string;
  user_name: PartnerName;
  couple_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at?: string;
}

export type ActiveTab = 'home' | 'letters' | 'memories' | 'together' | 'more';
