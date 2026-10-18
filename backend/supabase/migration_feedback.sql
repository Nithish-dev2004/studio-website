-- =====================================================================
-- Migration: Add feedback table with Row Level Security (RLS)
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table: feedback (one row per review submitted via the Feedback page)
-- ---------------------------------------------------------------------
create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(trim(name)) between 2 and 100),
  email        text check (email is null or char_length(email) <= 254),
  rating       int not null check (rating between 1 and 5),
  service      text check (service is null or service in ('wedding', 'portrait', 'product', 'events', 'studio rental', 'other')),
  message      text not null check (char_length(trim(message)) between 10 and 1000),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at   timestamptz not null default now(),
  approved_at  timestamptz
);

-- Indexes for performant filtering and sorting
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_status_idx on public.feedback (status);
create index if not exists feedback_rating_idx on public.feedback (rating);
create index if not exists feedback_approved_at_idx on public.feedback (approved_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------
-- RLS ensures that neither anonymous visitors (anon) nor standard authenticated
-- users have direct read, insert, update, or delete privileges on the feedback table.
-- All submissions (POST /api/feedback) and public queries (GET approved reviews)
-- run exclusively through server-side code using the service role key.
-- This guarantees that emails and pending/hidden feedback are never exposed.

alter table public.feedback enable row level security;

drop policy if exists "No public access to feedback" on public.feedback;
create policy "No public access to feedback"
  on public.feedback for all to anon, authenticated using (false) with check (false);

revoke all on table public.feedback from anon, authenticated;
