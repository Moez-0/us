-- Us. app - clean Supabase setup
-- Run this once in Supabase Dashboard > SQL Editor on a new project.
-- This schema matches the current app: text IDs, anonymous Auth, and Realtime.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Core tables
-- -----------------------------------------------------------------------------
create table if not exists public.couples (
  id text primary key,
  relationship_date date not null default date '2023-11-14',
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id text primary key,
  couple_id text not null references public.couples(id) on delete cascade,
  user_id text not null,
  name text not null check (name in ('Moez', 'Eliza')),
  created_at timestamptz not null default now(),
  unique (couple_id, name)
);

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
  unique (couple_id, user_name)
);

create table if not exists public.love_events (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  sender_id text not null,
  sender_name text not null check (sender_name in ('Moez', 'Eliza')),
  type text not null check (type in ('thinking', 'miss_you', 'hug', 'kiss', 'good_morning', 'good_night', 'love', 'laugh')),
  created_at timestamptz not null default now()
);

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

create table if not exists public.memory_reactions (
  id text primary key default gen_random_uuid()::text,
  memory_id text not null references public.memories(id) on delete cascade,
  user_id text not null,
  user_name text not null check (user_name in ('Moez', 'Eliza')),
  reaction text not null check (reaction in ('heart', 'sparkles', 'smile', 'cry', 'star')),
  created_at timestamptz not null default now(),
  unique (memory_id, user_name, reaction)
);

create table if not exists public.countdowns (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  title text not null default 'Next Reunion',
  date date not null,
  location text,
  created_at timestamptz not null default now()
);

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
  unique (question_id, couple_id, user_name)
);

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

create table if not exists public.story_milestones (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  title text not null,
  description text not null,
  date date not null,
  order_idx integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.little_moments (
  id text primary key default gen_random_uuid()::text,
  couple_id text not null references public.couples(id) on delete cascade,
  actor_name text not null check (actor_name in ('Moez', 'Eliza')),
  action_text text not null,
  type text not null default 'love_action',
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists love_events_couple_created_idx on public.love_events(couple_id, created_at desc);
create index if not exists letters_couple_created_idx on public.letters(couple_id, created_at desc);
create index if not exists memories_couple_date_idx on public.memories(couple_id, memory_date desc);
create index if not exists moments_couple_created_idx on public.little_moments(couple_id, created_at desc);

-- -----------------------------------------------------------------------------
-- RLS
-- The app signs users in anonymously. Only authenticated sessions can access data.
-- The app uses a fixed two-person couple identity, so table access is limited to
-- authenticated users of this project rather than an unrestricted public policy.
-- -----------------------------------------------------------------------------
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'couples', 'members', 'partner_statuses', 'love_events', 'letters',
    'memories', 'memory_reactions', 'countdowns', 'bucket_items', 'questions',
    'question_answers', 'songs', 'story_milestones', 'little_moments'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "authenticated_select" on public.%I', table_name);
    execute format('drop policy if exists "authenticated_insert" on public.%I', table_name);
    execute format('drop policy if exists "authenticated_update" on public.%I', table_name);
    execute format('drop policy if exists "authenticated_delete" on public.%I', table_name);
    execute format('create policy "authenticated_select" on public.%I for select to authenticated using (true)', table_name);
    execute format('create policy "authenticated_insert" on public.%I for insert to authenticated with check (true)', table_name);
    execute format('create policy "authenticated_update" on public.%I for update to authenticated using (true) with check (true)', table_name);
    execute format('create policy "authenticated_delete" on public.%I for delete to authenticated using (true)', table_name);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Realtime
-- -----------------------------------------------------------------------------
alter table public.partner_statuses replica identity full;
alter table public.love_events replica identity full;
alter table public.letters replica identity full;
alter table public.memories replica identity full;
alter table public.bucket_items replica identity full;
alter table public.question_answers replica identity full;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'partner_statuses', 'love_events', 'letters', 'memories',
    'bucket_items', 'question_answers', 'songs', 'little_moments'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Storage bucket for future photo uploads
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do update set public = true;

drop policy if exists "memories_public_read" on storage.objects;
drop policy if exists "memories_authenticated_insert" on storage.objects;
drop policy if exists "memories_authenticated_update" on storage.objects;
drop policy if exists "memories_authenticated_delete" on storage.objects;

create policy "memories_public_read"
on storage.objects for select
using (bucket_id = 'memories');

create policy "memories_authenticated_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'memories');

create policy "memories_authenticated_update"
on storage.objects for update to authenticated
using (bucket_id = 'memories')
with check (bucket_id = 'memories');

create policy "memories_authenticated_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'memories');

-- -----------------------------------------------------------------------------
-- Seed the couple and daily questions
-- -----------------------------------------------------------------------------
insert into public.couples (id, relationship_date)
values ('couple-moez-eliza', date '2023-11-14')
on conflict (id) do nothing;

insert into public.members (id, couple_id, user_id, name)
values
  ('mem-moez', 'couple-moez-eliza', 'user-moez', 'Moez'),
  ('mem-eliza', 'couple-moez-eliza', 'user-eliza', 'Eliza')
on conflict (id) do nothing;

insert into public.partner_statuses (couple_id, user_id, user_name, status)
values
  ('couple-moez-eliza', 'user-moez', 'Moez', 'Feeling loved'),
  ('couple-moez-eliza', 'user-eliza', 'Eliza', 'Missing you')
on conflict (couple_id, user_name) do nothing;

insert into public.questions (id, question, category)
values
  ('q-1', 'What is one little thing I do that always makes you smile?', 'romantic'),
  ('q-2', 'What is our funniest memory together that still makes you laugh?', 'funny'),
  ('q-3', 'If we could go anywhere right now for one hour, where would we go?', 'future'),
  ('q-4', 'What song immediately makes you think of me?', 'memories'),
  ('q-5', 'What is something you appreciate about how we communicate?', 'deep'),
  ('q-6', 'What are you looking forward to in our future together?', 'future'),
  ('q-7', 'When did you realize you had fallen in love with me?', 'romantic'),
  ('q-8', 'What meal should we cook together next time?', 'funny'),
  ('q-9', 'What is one dream you want us to share?', 'future'),
  ('q-10', 'If our relationship had a movie title, what would it be?', 'funny')
on conflict (id) do nothing;
