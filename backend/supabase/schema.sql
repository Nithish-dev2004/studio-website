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
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 100),
  email           text not null check (char_length(email) between 5 and 254),
  phone           text,                                                          -- legacy/optional (plain numbers removed)
  phone_encrypted text,                                                          -- AES-256-GCM ciphertext: iv:authTag:cipher
  phone_hash      text,                                                          -- HMAC-SHA256 blind index for fast lookup
  service         text not null check (char_length(service) between 1 and 100),  -- service slug, e.g. 'wedding'
  event_date      date not null,
  location        text check (char_length(location) <= 200),                     -- optional
  message         text check (char_length(message) <= 1000),                     -- optional
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Handy for admin search & newest bookings / filter by status.
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_phone_hash_idx on public.bookings (phone_hash);


-- ---------------------------------------------------------------------
-- Table: contacts  (one row per message from the Contact page)
-- ---------------------------------------------------------------------
create table if not exists public.contacts (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 100),
  email           text not null check (char_length(email) between 5 and 254),
  phone           text,                                                          -- legacy/optional
  phone_encrypted text,                                                          -- AES-256-GCM
  phone_hash      text,                                                          -- HMAC-SHA256
  message         text not null check (char_length(message) between 10 and 1000),
  is_read         boolean not null default false,                                -- for the future admin inbox
  created_at      timestamptz not null default now()
);

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists contacts_phone_hash_idx on public.contacts (phone_hash);


-- ---------------------------------------------------------------------
-- Table: event_consultations (one row per consultation from Sivagangai Events)
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

drop trigger if exists event_consultations_set_updated_at on public.event_consultations;
create trigger event_consultations_set_updated_at
  before update on public.event_consultations
  for each row execute function public.set_updated_at();

create index if not exists event_consultations_created_at_idx on public.event_consultations (created_at desc);
create index if not exists event_consultations_status_idx on public.event_consultations (status);
create index if not exists event_consultations_phone_hash_idx on public.event_consultations (phone_hash);


-- ---------------------------------------------------------------------
-- Table: quotes (one row per quote request from Sivagangai Sign Board)
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

create index if not exists quotes_created_at_idx on public.quotes (created_at desc);
create index if not exists quotes_phone_hash_idx on public.quotes (phone_hash);

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- Table: audit_requests (one row per digital marketing audit request)
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

create index if not exists audit_requests_created_at_idx on public.audit_requests (created_at desc);
create index if not exists audit_requests_phone_hash_idx on public.audit_requests (phone_hash);

drop trigger if exists audit_requests_set_updated_at on public.audit_requests;
create trigger audit_requests_set_updated_at
  before update on public.audit_requests
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- Table: digital_marketing_bookings (Sivagangai Digital Marketing audit & booking requests)
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
alter table public.event_consultations enable row level security;
alter table public.quotes enable row level security;
alter table public.audit_requests enable row level security;
alter table public.digital_marketing_bookings enable row level security;

-- POLICY 1 (bookings): nobody using the public keys can read, insert, update or delete.
drop policy if exists "No public access to bookings" on public.bookings;
create policy "No public access to bookings"
  on public.bookings for all to anon, authenticated using (false) with check (false);

-- POLICY 2 (contacts): same rule.
drop policy if exists "No public access to contacts" on public.contacts;
create policy "No public access to contacts"
  on public.contacts for all to anon, authenticated using (false) with check (false);

-- POLICY 3 (digital_marketing_bookings): same rule.
-- POLICY 3 (event_consultations): same rule.
drop policy if exists "No public access to event_consultations" on public.event_consultations;
create policy "No public access to event_consultations"
  on public.event_consultations for all to anon, authenticated using (false) with check (false);

-- POLICY 4 (quotes): same rule.
drop policy if exists "No public access to quotes" on public.quotes;
create policy "No public access to quotes"
  on public.quotes for all to anon, authenticated using (false) with check (false);

-- POLICY 5 (audit_requests): same rule.
drop policy if exists "No public access to audit_requests" on public.audit_requests;
create policy "No public access to audit_requests"
  on public.audit_requests for all to anon, authenticated using (false) with check (false);

-- POLICY 6 (digital_marketing_bookings): same rule.
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
-- Extra safety layer: revoke permissions from public roles
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.contacts from anon, authenticated;
revoke all on table public.event_consultations from anon, authenticated;
revoke all on table public.quotes from anon, authenticated;
revoke all on table public.audit_requests from anon, authenticated;
revoke all on table public.digital_marketing_bookings from anon, authenticated;

-- TODO (later): when you build an admin dashboard, add a login with Supabase
-- Auth and a policy that lets ONLY your admin user read and update these
-- tables, for example by checking auth.uid() against an "admins" table.
