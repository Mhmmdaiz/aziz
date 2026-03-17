-- SQL Migration to create journals table (FORCED CLEAN RESTART)

-- 0. Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DROP existing table and ALL dependent objects (like views)
-- This will handle the "view posts depends on table journals" issue.
DROP TABLE IF EXISTS public.journals CASCADE;

-- 2. Create the table with all necessary columns
CREATE TABLE public.journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ
);

-- 3. Enable Row Level Security
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
-- Allow everyone to read published journals
CREATE POLICY "Allow public read-access for published journals" ON public.journals
    FOR SELECT USING (status = 'published');

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow authenticated users to manage journals" ON public.journals
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Set up indexes for performance
CREATE INDEX IF NOT EXISTS journals_slug_idx ON public.journals (slug);
CREATE INDEX IF NOT EXISTS journals_status_idx ON public.journals (status);
CREATE INDEX IF NOT EXISTS journals_created_at_idx ON public.journals (created_at DESC);
