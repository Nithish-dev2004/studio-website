-- =====================================================================
-- Migration: signboard_bookings table
-- Brand: Sivagangai Sign Board
--
-- Security:
-- - Mobile numbers are encrypted with AES-256-GCM (phone_encrypted).
-- - Blind index HMAC-SHA256 hash (phone_hash) for fast duplicate search.
-- - Plain 'phone' column is kept null so unencrypted numbers are never stored.
-- =====================================================================

create table if not exists public.signboard_bookings (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text not null check (char_length(business_name) between 2 and 150),
  phone               text,                                                         -- plain numbers removed (kept null)
  phone_encrypted     text not null,                                                -- AES-256-GCM ciphertext: iv:authTag:cipher
  phone_hash          text not null,                                                -- HMAC-SHA256 blind index for fast lookup
  city                text not null default 'Sivagangai',
  sign_type           text not null default '3D LED Acrylic Letters',
  dimensions          text default '10 ft x 3 ft',
  notes               text check (notes is null or char_length(notes) <= 2000),
  status              text not null default 'new'
                      check (status in ('new', 'site_visit_scheduled', 'measurement_done', 'render_sent', 'approved', 'installed', 'closed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Helper function for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auto-update updated_at timestamp
drop trigger if exists signboard_bookings_set_updated_at on public.signboard_bookings;
create trigger signboard_bookings_set_updated_at
  before update on public.signboard_bookings
  for each row execute function public.set_updated_at();

-- Indices for performance and encrypted phone lookup
create index if not exists signboard_bookings_created_at_idx
  on public.signboard_bookings (created_at desc);

create index if not exists signboard_bookings_phone_hash_idx
  on public.signboard_bookings (phone_hash);

create index if not exists signboard_bookings_status_idx
  on public.signboard_bookings (status);

-- Enable Row Level Security (RLS)
alter table public.signboard_bookings enable row level security;

-- Drop old policies if any to avoid errors on re-run
drop policy if exists "Service role full access on signboard_bookings" on public.signboard_bookings;
drop policy if exists "No public access to signboard_bookings" on public.signboard_bookings;

-- 1. Service role has full access (API server reads & writes)
create policy "Service role full access on signboard_bookings"
  on public.signboard_bookings
  for all
  to service_role
  using (true)
  with check (true);

-- 2. Public / anon direct access denied (API server handles validation & encryption)
create policy "No public access to signboard_bookings"
  on public.signboard_bookings
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- Extra safety layer: revoke permissions from public roles
revoke all on table public.signboard_bookings from anon, authenticated;

-- Comment for table documentation
comment on table public.signboard_bookings is
  'Site measurement and 3D render quote requests from Sivagangai Sign Board with AES-256-GCM encrypted phones.';
