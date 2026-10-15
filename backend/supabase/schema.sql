-- =====================================================================
-- Studio website database schema (Supabase / PostgreSQL)
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query ->
-- paste this whole file -> click "Run".
-- It is safe to run more than once (it will not delete any data).
-- =====================================================================


-- ---------------------------------------------------------------------
-- Helper: automatically refresh "updated_at" whenever a row is changed
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
-- Table: bookings  (one row per booking request from the Booking page)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (char_length(email) between 5 and 254),
  phone       text not null check (char_length(phone) between 7 and 30),
  service     text not null check (char_length(service) between 1 and 100),  -- service slug, e.g. 'wedding'
  event_date  date not null,
  location    text check (char_length(location) <= 200),                     -- optional
  message     text check (char_length(message) <= 1000),                     -- optional
  status      text not null default 'pending'
              check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Handy for the future admin page: newest bookings / filter by status.
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);


-- ---------------------------------------------------------------------
-- Table: contacts  (one row per message from the Contact page)
-- ---------------------------------------------------------------------
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (char_length(email) between 5 and 254),
  phone       text check (char_length(phone) <= 30),                         -- optional
  message     text not null check (char_length(message) between 10 and 1000),
  is_read     boolean not null default false,                                -- for the future admin inbox
  created_at  timestamptz not null default now()
);

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);


-- ---------------------------------------------------------------------
-- Table: digital_marketing_bookings (Sivagangai Digital Marketing)
-- ---------------------------------------------------------------------
create table if not exists public.digital_marketing_bookings (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text not null check (char_length(business_name) between 2 and 150),
  phone               text,                                                         -- plain numbers removed (null)
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

create index if not exists digital_marketing_bookings_created_at_idx on public.digital_marketing_bookings (created_at desc);
create index if not exists digital_marketing_bookings_phone_hash_idx on public.digital_marketing_bookings (phone_hash);
create index if not exists digital_marketing_bookings_status_idx on public.digital_marketing_bookings (status);

drop trigger if exists digital_marketing_bookings_set_updated_at on public.digital_marketing_bookings;
create trigger digital_marketing_bookings_set_updated_at
  before update on public.digital_marketing_bookings
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- Table: signboard_bookings (Sivagangai Sign Board)
-- ---------------------------------------------------------------------
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

create index if not exists signboard_bookings_created_at_idx on public.signboard_bookings (created_at desc);
create index if not exists signboard_bookings_phone_hash_idx on public.signboard_bookings (phone_hash);
create index if not exists signboard_bookings_status_idx on public.signboard_bookings (status);

drop trigger if exists signboard_bookings_set_updated_at on public.signboard_bookings;
create trigger signboard_bookings_set_updated_at
  before update on public.signboard_bookings
  for each row execute function public.set_updated_at();


-- =====================================================================
-- SECURITY: Row Level Security (RLS)
--
-- Your browser-side "anon" key is public (anyone can see it in the page
-- source). RLS is what stops people from using it to read or change data.
--
-- The website's API routes use the SERVICE ROLE key, which bypasses RLS,
-- so they can still insert rows. Nobody else can do anything.
-- =====================================================================

-- Turn RLS on. With RLS on and no matching policy, access is denied.
alter table public.bookings enable row level security;
alter table public.contacts enable row level security;
alter table public.digital_marketing_bookings enable row level security;
alter table public.signboard_bookings enable row level security;

-- POLICY 1 (bookings): nobody using the public keys can read, insert, update or delete.
drop policy if exists "No public access to bookings" on public.bookings;
create policy "No public access to bookings"
  on public.bookings for all to anon, authenticated using (false) with check (false);

-- POLICY 2 (contacts): same rule.
drop policy if exists "No public access to contacts" on public.contacts;
create policy "No public access to contacts"
  on public.contacts for all to anon, authenticated using (false) with check (false);

-- POLICY 3 (digital_marketing_bookings): same rule.
drop policy if exists "No public access to digital_marketing_bookings" on public.digital_marketing_bookings;
create policy "No public access to digital_marketing_bookings"
  on public.digital_marketing_bookings for all to anon, authenticated using (false) with check (false);

-- POLICY 4 (signboard_bookings): same rule.
drop policy if exists "No public access to signboard_bookings" on public.signboard_bookings;
create policy "No public access to signboard_bookings"
  on public.signboard_bookings for all to anon, authenticated using (false) with check (false);

-- Extra safety layer: revoke permissions from public roles
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.contacts from anon, authenticated;
revoke all on table public.digital_marketing_bookings from anon, authenticated;
revoke all on table public.signboard_bookings from anon, authenticated;

-- TODO (later): when you build an admin dashboard, add a login with Supabase
-- Auth and a policy that lets ONLY your admin user read and update these
-- tables, for example by checking auth.uid() against an "admins" table.
