-- ==========================================================
-- oldman.voice - Database Schema & Row Level Security (RLS)
-- Concept: Daily Anonymous Question-and-Response Platform
-- Absolute Privacy: Zero identity, zero IP, zero tracking.
-- ==========================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL CHECK (char_length(trim(question)) > 0 AND char_length(question) <= 1000),
    question_date DATE UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast daily question lookups
CREATE INDEX IF NOT EXISTS idx_questions_date ON public.questions (question_date);
CREATE INDEX IF NOT EXISTS idx_questions_active_date ON public.questions (is_active, question_date);

-- 2. RESPONSES TABLE
-- Note: Intentionally minimal columns. Strictly no user_id, no ip, no user_agent, no location, no session_id.
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    response TEXT NOT NULL CHECK (char_length(trim(response)) > 0 AND char_length(response) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on question_id for archive counts and viewing
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses (question_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON public.responses (created_at DESC);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- Questions Policies
-- ----------------------------------------------------------

-- Anyone (public anonymous) can view active questions scheduled on or before today
DROP POLICY IF EXISTS "Public can view active daily questions" ON public.questions;
CREATE POLICY "Public can view active daily questions"
ON public.questions
FOR SELECT
TO public
USING (is_active = true AND question_date <= CURRENT_DATE);

-- Authenticated admins can view all questions (including inactive and future scheduled)
DROP POLICY IF EXISTS "Admins have full access to questions" ON public.questions;
CREATE POLICY "Admins have full access to questions"
ON public.questions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------
-- Responses Policies
-- ----------------------------------------------------------

-- Anyone can submit an anonymous response to an active question scheduled for today (or prior active question)
-- Crucial: Public can ONLY insert, NEVER select, update, or delete.
DROP POLICY IF EXISTS "Public can insert anonymous response" ON public.responses;
CREATE POLICY "Public can insert anonymous response"
ON public.responses
FOR INSERT
TO public
WITH CHECK (
    char_length(trim(response)) > 0 
    AND char_length(response) <= 2000
    AND EXISTS (
        SELECT 1 FROM public.questions q 
        WHERE q.id = question_id 
        AND q.is_active = true 
        AND q.question_date <= CURRENT_DATE
    )
);

-- Deny SELECT for public explicitly:
-- Since no SELECT policy is defined for 'public' / 'anon', all SELECT queries from unauthenticated clients will fail.

-- Authenticated admin can read responses
DROP POLICY IF EXISTS "Admins can view responses" ON public.responses;
CREATE POLICY "Admins can view responses"
ON public.responses
FOR SELECT
TO authenticated
USING (true);

-- Authenticated admin can delete responses
DROP POLICY IF EXISTS "Admins can delete responses" ON public.responses;
CREATE POLICY "Admins can delete responses"
ON public.responses
FOR DELETE
TO authenticated
USING (true);

-- ==========================================================
-- SEED DATA (Curated thoughtful literary questions)
-- ==========================================================

INSERT INTO public.questions (question, question_date, is_active)
VALUES
    ('What is something you wish you had said?', CURRENT_DATE, true),
    ('When did you last feel completely understood?', CURRENT_DATE - INTERVAL '1 day', true),
    ('What is something you are slowly learning to let go of?', CURRENT_DATE - INTERVAL '2 days', true),
    ('What is a small thing that always makes your day better?', CURRENT_DATE - INTERVAL '3 days', true),
    ('What is something you understand now that you didn''t understand five years ago?', CURRENT_DATE - INTERVAL '4 days', true),
    ('Who made you feel understood without saying much?', CURRENT_DATE + INTERVAL '1 day', true),
    ('What is something ordinary that you find beautiful?', CURRENT_DATE + INTERVAL '2 days', true),
    ('What would you tell your younger self if they were sitting across from you?', CURRENT_DATE + INTERVAL '3 days', true)
ON CONFLICT (question_date) DO NOTHING;
