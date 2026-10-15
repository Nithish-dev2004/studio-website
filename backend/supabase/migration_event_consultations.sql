-- =====================================================================
-- Migration: Create event_consultations table
-- Sub-brand: Sivagangai Events
--
-- HOW TO RUN:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project (jcimhsywdzkjovvhalws)
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Click "New query", paste this file's contents, and click "Run" (or Ctrl+Enter)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper: automatically refresh "updated_at" if not already present
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Table: event_consultations
-- Records consultation inquiries submitted from Sivagangai Events sub-brand
-- ---------------------------------------------------------------------
create table if not exists public.event_consultations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 100),
  phone           text not null check (char_length(phone) between 7 and 30),
  email           text check (email is null or char_length(email) <= 254),
  event_type      text not null check (char_length(event_type) between 1 and 100),
  event_date      date,                                                          -- optional target event date
  guest_count     text check (guest_count is null or char_length(guest_count) <= 100), -- e.g. "200 - 500 Guests"
  notes           text check (notes is null or char_length(notes) <= 2000),      -- venue / themes / budget preferences
  status          text not null default 'pending'
                  check (status in ('pending', 'contacted', 'confirmed', 'cancelled', 'completed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Trigger to keep updated_at in sync
drop trigger if exists event_consultations_set_updated_at on public.event_consultations;
create trigger event_consultations_set_updated_at
  before update on public.event_consultations
  for each row execute function public.set_updated_at();

-- Indexes for performance and sorting
create index if not exists event_consultations_created_at_idx on public.event_consultations (created_at desc);
create index if not exists event_consultations_status_idx on public.event_consultations (status);

-- ---------------------------------------------------------------------
-- Security: Row Level Security (RLS)
-- ---------------------------------------------------------------------
alter table public.event_consultations enable row level security;

-- Only service role (backend API) can insert and read rows; block public direct access
drop policy if exists "No public access to event_consultations" on public.event_consultations;
create policy "No public access to event_consultations"
  on public.event_consultations
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- Revoke direct permissions from public anon and authenticated roles
revoke all on table public.event_consultations from anon, authenticated;
