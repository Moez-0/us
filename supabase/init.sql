-- ==============================================================================
-- US. - Supabase Database Schema & Realtime Setup for Moez & Eliza
-- ==============================================================================
-- Run this SQL in your Supabase Project's SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It will create all tables, enable Row Level Security (RLS), and configure
-- Realtime broadcasts so instant hugs, love signals, GPS updates, and letters work in realtime!
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Couples Table
create table if not exists public.couples (
  id text primary key,
  relationship_date date not null default '2023-11-14',
  created_at timestamptz not null default now()
);

-- 2. Members Table
create table if not exists public.members (
  id text primary key,
  couple_id text not null references public.couples(id) on delete cascade,
  user_id text not null,
  name text not null check (name in ('Moez', 'Eliza')),
  created_at timestamptz not null default now()
);

-- 3. Partner Statuses & Real GPS Location
create table if not exists public.partner_statuses (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  user_id text not null,
  user_name text not null check (user_name in ('Moez', 'Eliza')),
  status text not null default 'Feeling loved',
  latitude double precision,
  longitude double precision,
  city text,
  country text,
  accuracy double precision,
  gps_updated_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint unique_couple_user unique(couple_id, user_name)
);

-- 4. Instant Love Events (Hugs, Kisses, Thinking of you)
create table if not exists public.love_events (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  sender_id text not null,
  sender_name text not null check (sender_name in ('Moez', 'Eliza')),
  type text not null,
  created_at timestamptz not null default now()
);

-- 5. Private Letters & Capsules
create table if not exists public.letters (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  sender_id text not null,
  sender_name text not null check (sender_name in ('Moez', 'Eliza')),
  title text not null,
  content text not null,
  unlock_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

-- 6. Real Memories & Photo Journal
create table if not exists public.memories (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  created_by text not null,
  creator_name text not null check (creator_name in ('Moez', 'Eliza')),
  image_path text not null,
  caption text not null default '',
  memory_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 7. Memory Reactions
create table if not exists public.memory_reactions (
  id text primary key default gen_random_uuid()::text,
  memory_id text not null references public.memories(id) on delete cascade,
  user_id text not null,
  user_name text not null check (user_name in ('Moez', 'Eliza')),
  reaction text not null check (reaction in ('heart', 'sparkles', 'smile', 'cry', 'star')),
  created_at timestamptz not null default now(),
  constraint unique_memory_user_reaction unique(memory_id, user_name, reaction)
);

-- 8. Visit Countdown
create table if not exists public.countdowns (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  title text not null default 'Next Time Together',
  date date not null,
  location text,
  created_at timestamptz not null default now()
);

-- 9. Bucket List Quest
create table if not exists public.bucket_items (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  title text not null,
  category text not null default 'Together',
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by text,
  created_at timestamptz not null default now()
);

-- 10. Questions Bank & Answers
create table if not exists public.questions (
  id text primary key,
  question text not null,
  category text not null default 'romantic'
);

create table if not exists public.question_answers (
  id text primary key default gen_random_uuid()::text,
  question_id text not null references public.questions(id) on delete cascade,
  couple_id text not null references public.couples(id) on delete cascade,
  user_id text not null,
  user_name text not null check (user_name in ('Moez', 'Eliza')),
  answer text not null,
  created_at timestamptz not null default now(),
  constraint unique_question_couple_user unique(question_id, couple_id, user_name)
);

-- 11. Soundtrack / Songs
create table if not exists public.songs (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  added_by text not null,
  adder_name text not null check (adder_name in ('Moez', 'Eliza')),
  title text not null,
  artist text not null,
  url text,
  note text,
  created_at timestamptz not null default now()
);

-- 12. Relationship Story Chapters / Milestones
create table if not exists public.story_milestones (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  title text not null,
  description text not null,
  date date not null,
  order_idx int not null default 0,
  created_at timestamptz not null default now()
);

-- 13. Little Moments Feed
create table if not exists public.little_moments (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  actor_name text not null check (actor_name in ('Moez', 'Eliza')),
  action_text text not null,
  type text not null default 'love_action',
  created_at timestamptz not null default now()
);

-- 14. Push Subscriptions
create table if not exists public.push_subscriptions (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null default 'couple-moez-eliza',
  user_name text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Allow full read & write access for the couple
alter table public.couples enable row level security;
alter table public.members enable row level security;
alter table public.partner_statuses enable row level security;
alter table public.love_events enable row level security;
alter table public.letters enable row level security;
alter table public.memories enable row level security;
alter table public.memory_reactions enable row level security;
alter table public.countdowns enable row level security;
alter table public.bucket_items enable row level security;
alter table public.questions enable row level security;
alter table public.question_answers enable row level security;
alter table public.songs enable row level security;
alter table public.story_milestones enable row level security;
alter table public.little_moments enable row level security;
alter table public.push_subscriptions enable row level security;

-- Public read/write policy for the private couple workspace
do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('drop policy if exists "allow_all_%I" on public.%I', t, t);
    execute format('create policy "allow_all_%I" on public.%I for all using (true) with check (true)', t, t);
  end loop;
end $$;

-- ==============================================================================
-- REALTIME REPLICATION SETUP
-- ==============================================================================
-- Enable Realtime publication so subscribers immediately receive changes
alter publication supabase_realtime add table public.partner_statuses;
alter publication supabase_realtime add table public.love_events;
alter publication supabase_realtime add table public.letters;
alter publication supabase_realtime add table public.memories;
alter publication supabase_realtime add table public.memory_reactions;
alter publication supabase_realtime add table public.countdowns;
alter publication supabase_realtime add table public.bucket_items;
alter publication supabase_realtime add table public.question_answers;
alter publication supabase_realtime add table public.songs;
alter publication supabase_realtime add table public.story_milestones;
alter publication supabase_realtime add table public.little_moments;

-- ==============================================================================
-- INITIAL BASE COUPLE RECORD & QUESTIONS (NO FAKE LETTERS OR MEMORIES)
-- ==============================================================================
insert into public.couples (id, relationship_date)
values ('couple-moez-eliza', '2023-11-14')
on conflict (id) do nothing;

insert into public.members (id, couple_id, user_id, name)
values
  ('mem-moez', 'couple-moez-eliza', 'user-moez', 'Moez'),
  ('mem-eliza', 'couple-moez-eliza', 'user-eliza', 'Eliza')
on conflict (id) do nothing;

-- Initial statuses
insert into public.partner_statuses (couple_id, user_id, user_name, status, updated_at)
values
  ('couple-moez-eliza', 'user-moez', 'Moez', 'Feeling loved', now()),
  ('couple-moez-eliza', 'user-eliza', 'Eliza', 'Missing you', now())
on conflict (couple_id, user_name) do nothing;

-- Question Bank
insert into public.questions (id, question, category) values
  ('q-1', 'What is one little thing I do that always makes you smile?', 'romantic'),
  ('q-2', 'What is our funniest memory together that still makes you laugh?', 'funny'),
  ('q-3', 'If we could teleport to any place in the world right now for one hour, where would we go?', 'future'),
  ('q-4', 'What song immediately makes you think of me whenever it plays?', 'memories'),
  ('q-5', 'What is something you really appreciate about how we communicate?', 'deep'),
  ('q-6', 'What is our dream weekend together when there are no planes or borders in the way?', 'future'),
  ('q-7', 'What was the exact moment you realized you had fallen in love with me?', 'romantic'),
  ('q-8', 'What is one delicious meal we must cook together next time we are reunited?', 'funny'),
  ('q-9', 'What is something you are looking forward to in our future together?', 'future'),
  ('q-10', 'If our relationship had a movie title, what would it be?', 'funny')
on conflict (id) do nothing;
