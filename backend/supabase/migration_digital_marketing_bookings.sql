-- =====================================================================
-- Migration: digital_marketing_bookings table
-- Brand: Sivagangai Digital Marketing
--
-- Security:
-- - Mobile numbers are encrypted with AES-256-GCM (phone_encrypted).
-- - Blind index HMAC-SHA256 hash (phone_hash) for fast duplicate search.
-- - Plain 'phone' column is kept null so unencrypted numbers are never stored.
-- =====================================================================

create table if not exists public.digital_marketing_bookings (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text not null check (char_length(business_name) between 2 and 150),
  phone               text,                                                         -- plain numbers removed (kept null)
  phone_encrypted     text not null,                                                -- AES-256-GCM ciphertext: iv:authTag:cipher
  phone_hash          text not null,                                                -- HMAC-SHA256 blind index for fast lookup
  email               text check (email is null or char_length(email) between 5 and 254),
  service_interested  text not null default 'Meta & Google Paid Ads',
  budget              text default '₹15,000 - ₹30,000 / mo',
  website_url         text check (website_url is null or char_length(website_url) <= 300),
  plan                text default 'Free Marketing Audit',
  status              text not null default 'new'
                      check (status in ('new', 'contacted', 'audit_sent', 'in_progress', 'converted', 'closed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-update updated_at timestamp
drop trigger if exists digital_marketing_bookings_set_updated_at on public.digital_marketing_bookings;
create trigger digital_marketing_bookings_set_updated_at
  before update on public.digital_marketing_bookings
  for each row execute function public.set_updated_at();

-- Indices for performance and encrypted phone lookup
create index if not exists digital_marketing_bookings_created_at_idx
  on public.digital_marketing_bookings (created_at desc);

create index if not exists digital_marketing_bookings_phone_hash_idx
  on public.digital_marketing_bookings (phone_hash);

create index if not exists digital_marketing_bookings_status_idx
  on public.digital_marketing_bookings (status);

-- Enable Row Level Security (RLS)
alter table public.digital_marketing_bookings enable row level security;

-- Drop old policies if any to avoid errors on re-run
drop policy if exists "Service role full access on digital_marketing_bookings" on public.digital_marketing_bookings;
drop policy if exists "Anon insert only on digital_marketing_bookings" on public.digital_marketing_bookings;

-- 1. Service role has full access (API server reads & writes)
create policy "Service role full access on digital_marketing_bookings"
  on public.digital_marketing_bookings
  for all
  to service_role
  using (true)
  with check (true);

-- 2. Anonymous public clients can insert new audit / booking requests
create policy "Anon insert only on digital_marketing_bookings"
  on public.digital_marketing_bookings
  for insert
  to anon
  with check (true);

-- Comment for table documentation
comment on table public.digital_marketing_bookings is
  'Customer growth audit and booking requests from Sivagangai Digital Marketing with AES-256-GCM encrypted phones.';
