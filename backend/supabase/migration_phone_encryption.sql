-- =====================================================================
-- Migration: Customer Mobile Number Encryption & Blind Index
--
-- Adds:
-- 1. phone_encrypted (AES-256-GCM ciphertext + IV + auth tag)
-- 2. phone_hash (HMAC-SHA256 blind index for search/duplicates)
-- 3. Indexes on phone_hash
-- 4. Modifies old phone constraints to allow null (plain numbers removed)
-- 5. Adds quotes and audit_requests tables with encryption
--
-- HOW TO RUN:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Paste this file and click "Run"
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table: bookings
-- ---------------------------------------------------------------------
alter table public.bookings add column if not exists phone_encrypted text;
alter table public.bookings add column if not exists phone_hash text;
create index if not exists bookings_phone_hash_idx on public.bookings (phone_hash);

-- Allow legacy plain phone column to be nullable, and drop old constraint
alter table public.bookings alter column phone drop not null;
alter table public.bookings drop constraint if exists bookings_phone_check;


-- ---------------------------------------------------------------------
-- 2. Table: contacts
-- ---------------------------------------------------------------------
alter table public.contacts add column if not exists phone_encrypted text;
alter table public.contacts add column if not exists phone_hash text;
create index if not exists contacts_phone_hash_idx on public.contacts (phone_hash);

alter table public.contacts alter column phone drop not null;
alter table public.contacts drop constraint if exists contacts_phone_check;


-- ---------------------------------------------------------------------
-- 3. Table: event_consultations
-- ---------------------------------------------------------------------
create table if not exists public.event_consultations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 100),
  phone           text,                                                          -- legacy/optional
  phone_encrypted text,                                                          -- AES-256-GCM
  phone_hash      text,                                                          -- HMAC-SHA256
  email           text check (email is null or char_length(email) <= 254),
  event_type      text not null check (char_length(event_type) between 1 and 100),
  event_date      date,
  guest_count     text check (guest_count is null or char_length(guest_count) <= 100),
  notes           text check (notes is null or char_length(notes) <= 2000),
  status          text not null default 'pending'
                  check (status in ('pending', 'contacted', 'confirmed', 'cancelled', 'completed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.event_consultations add column if not exists phone_encrypted text;
alter table public.event_consultations add column if not exists phone_hash text;
create index if not exists event_consultations_phone_hash_idx on public.event_consultations (phone_hash);

alter table public.event_consultations alter column phone drop not null;
alter table public.event_consultations drop constraint if exists event_consultations_phone_check;

-- Trigger to refresh updated_at
drop trigger if exists event_consultations_set_updated_at on public.event_consultations;
create trigger event_consultations_set_updated_at
  before update on public.event_consultations
  for each row execute function public.set_updated_at();

alter table public.event_consultations enable row level security;
drop policy if exists "No public access to event_consultations" on public.event_consultations;
create policy "No public access to event_consultations"
  on public.event_consultations for all to anon, authenticated using (false) with check (false);
revoke all on table public.event_consultations from anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. Table: quotes
-- ---------------------------------------------------------------------
create table if not exists public.quotes (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 100),
  phone_encrypted text not null,
  phone_hash      text not null,
  email           text check (email is null or char_length(email) <= 254),
  service         text check (service is null or char_length(service) <= 100),
  message         text check (message is null or char_length(message) <= 2000),
  status          text not null default 'pending'
                  check (status in ('pending', 'contacted', 'closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists quotes_phone_hash_idx on public.quotes (phone_hash);
create index if not exists quotes_created_at_idx on public.quotes (created_at desc);

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;
drop policy if exists "No public access to quotes" on public.quotes;
create policy "No public access to quotes"
  on public.quotes for all to anon, authenticated using (false) with check (false);
revoke all on table public.quotes from anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. Table: audit_requests
-- ---------------------------------------------------------------------
create table if not exists public.audit_requests (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 100),
  phone_encrypted text not null,
  phone_hash      text not null,
  email           text check (email is null or char_length(email) <= 254),
  website_url     text check (website_url is null or char_length(website_url) <= 300),
  notes           text check (notes is null or char_length(notes) <= 2000),
  status          text not null default 'pending'
                  check (status in ('pending', 'contacted', 'completed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists audit_requests_phone_hash_idx on public.audit_requests (phone_hash);
create index if not exists audit_requests_created_at_idx on public.audit_requests (created_at desc);

drop trigger if exists audit_requests_set_updated_at on public.audit_requests;
create trigger audit_requests_set_updated_at
  before update on public.audit_requests
  for each row execute function public.set_updated_at();

alter table public.audit_requests enable row level security;
drop policy if exists "No public access to audit_requests" on public.audit_requests;
create policy "No public access to audit_requests"
  on public.audit_requests for all to anon, authenticated using (false) with check (false);
revoke all on table public.audit_requests from anon, authenticated;
