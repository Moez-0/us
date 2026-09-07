-- ====================================================================
-- "Us." - Private Two-Person App Database Migration (Moez & Eliza)
-- PostgreSQL / Supabase Schema with Row Level Security & Realtime
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Couples (strictly holds the one couple)
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Members (Moez and Eliza)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase Auth
    name TEXT NOT NULL CHECK (name IN ('Moez', 'Eliza')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_member_per_couple UNIQUE (couple_id, name)
);

-- Love Events (Instant taps, hugs, ripples)
CREATE TABLE IF NOT EXISTS public.love_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('thinking', 'miss_you', 'hug', 'kiss', 'good_morning', 'good_night', 'love', 'laugh')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Statuses (Realtime emotional check-in)
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_status UNIQUE (couple_id, user_id)
);

-- Letters ("Open when..." and timed personal letters)
CREATE TABLE IF NOT EXISTS public.letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    unlock_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Memories (Private photo journal)
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    image_path TEXT NOT NULL,
    caption TEXT NOT NULL,
    memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Memory Reactions
CREATE TABLE IF NOT EXISTS public.memory_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_memory_reaction UNIQUE (memory_id, user_id)
);

-- Countdowns (Until we see each other)
CREATE TABLE IF NOT EXISTS public.countdowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Bucket Items (Things We Need To Do)
CREATE TABLE IF NOT EXISTS public.bucket_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Together', 'Travel', 'Tunisia', 'Poland', 'Food', 'Movies', 'Random')),
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Daily Questions Pool
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('romantic', 'funny', 'deep', 'future', 'memories', 'random'))
);

-- Question Answers (Private until both have submitted)
CREATE TABLE IF NOT EXISTS public.question_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_question_answer UNIQUE (question_id, couple_id, user_id)
);

-- Songs (Our Soundtrack)
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    added_by UUID NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Push Subscriptions (Web Push API)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_love_events_couple_created ON public.love_events (couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_couple_date ON public.memories (couple_id, memory_date DESC);
CREATE INDEX IF NOT EXISTS idx_letters_couple_created ON public.letters (couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bucket_items_couple ON public.bucket_items (couple_id, category);
CREATE INDEX IF NOT EXISTS idx_question_answers_couple ON public.question_answers (question_id, couple_id);
CREATE INDEX IF NOT EXISTS idx_statuses_couple ON public.statuses (couple_id);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper security function: checks if user is part of the couple
CREATE OR REPLACE FUNCTION public.is_member_of_couple(couple_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members
    WHERE members.couple_id = is_member_of_couple.couple_id
    AND members.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Couples policies
CREATE POLICY "Members can view their own couple" ON public.couples
    FOR SELECT USING (public.is_member_of_couple(id));

-- Members policies
CREATE POLICY "Members can view their couple members" ON public.members
    FOR SELECT USING (public.is_member_of_couple(couple_id));

-- Love Events policies
CREATE POLICY "Members can view love events" ON public.love_events
    FOR SELECT USING (public.is_member_of_couple(couple_id));
CREATE POLICY "Members can insert love events" ON public.love_events
    FOR INSERT WITH CHECK (public.is_member_of_couple(couple_id));

-- Statuses policies
CREATE POLICY "Members can view statuses" ON public.statuses
    FOR SELECT USING (public.is_member_of_couple(couple_id));
CREATE POLICY "Members can upsert their status" ON public.statuses
    FOR ALL USING (public.is_member_of_couple(couple_id))
    WITH CHECK (public.is_member_of_couple(couple_id) AND user_id = auth.uid());

-- Letters policies (Private letters with unlock date check)
CREATE POLICY "Members can view letters" ON public.letters
    FOR SELECT USING (public.is_member_of_couple(couple_id));
CREATE POLICY "Members can insert letters" ON public.letters
    FOR INSERT WITH CHECK (public.is_member_of_couple(couple_id));
CREATE POLICY "Members can update letters (e.g. mark opened)" ON public.letters
    FOR UPDATE USING (public.is_member_of_couple(couple_id));

-- Memories policies
CREATE POLICY "Members can view memories" ON public.memories
    FOR SELECT USING (public.is_member_of_couple(couple_id));
CREATE POLICY "Members can insert memories" ON public.memories
    FOR INSERT WITH CHECK (public.is_member_of_couple(couple_id));

-- Memory Reactions
CREATE POLICY "Members can view reactions" ON public.memory_reactions
    FOR SELECT USING (EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = memory_reactions.memory_id
      AND public.is_member_of_couple(memories.couple_id)
    ));
CREATE POLICY "Members can add reactions" ON public.memory_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members can remove their reactions" ON public.memory_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Countdowns
CREATE POLICY "Members can view and manage countdowns" ON public.countdowns
    FOR ALL USING (public.is_member_of_couple(couple_id));

-- Bucket Items
CREATE POLICY "Members can view and manage bucket items" ON public.bucket_items
    FOR ALL USING (public.is_member_of_couple(couple_id));

-- Questions (Public read for all members)
CREATE POLICY "Members can view questions" ON public.questions
    FOR SELECT USING (true);

-- Question answers: users can read answers for their couple
CREATE POLICY "Members can view answers" ON public.question_answers
    FOR SELECT USING (public.is_member_of_couple(couple_id));
CREATE POLICY "Members can insert answers" ON public.question_answers
    FOR INSERT WITH CHECK (public.is_member_of_couple(couple_id) AND user_id = auth.uid());

-- Songs
CREATE POLICY "Members can view and add songs" ON public.songs
    FOR ALL USING (public.is_member_of_couple(couple_id));

-- Push Subscriptions
CREATE POLICY "Members can manage their push subscriptions" ON public.push_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- 5. REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.love_events,
    public.statuses,
    public.letters,
    public.memories,
    public.memory_reactions,
    public.countdowns,
    public.bucket_items,
    public.question_answers,
    public.songs;

-- 6. SEED ESSENTIAL QUESTIONS POOL
INSERT INTO public.questions (question, category) VALUES
('What is one thing you wish we could do together tonight?', 'romantic'),
('What was running through your mind during our first late-night phone call?', 'memories'),
('What is something small I do that always makes you happy?', 'romantic'),
('If we could teleport to any place in the world for just one hour, where would we go?', 'future'),
('What is your favorite memory of us laughing until our stomachs hurt?', 'funny'),
('What song makes you think of me the moment you hear it?', 'memories'),
('What is one silly adventure we definitely need to have this year?', 'funny'),
('What is something you are proud of yourself for lately that I should celebrate?', 'deep'),
('When did you realize you were completely falling for me?', 'romantic'),
('If we had a whole rainy Sunday with no phones or plans, what would we do?', 'romantic'),
('What is something you want us to still be doing together 40 years from now?', 'future'),
('What is a food you cannot wait to cook for me or try together?', 'random')
ON CONFLICT DO NOTHING;
