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

-- POLICY 1 (bookings): nobody using the public keys (anon = visitors,
-- authenticated = logged-in users) can read, insert, update or delete.
-- "using (false)" and "with check (false)" mean "never allowed".
-- Only the server (service role) can write, because it bypasses RLS.
drop policy if exists "No public access to bookings" on public.bookings;
create policy "No public access to bookings"
  on public.bookings
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- POLICY 2 (contacts): same rule. Messages contain personal details,
-- so they must never be readable or writable from the browser.
drop policy if exists "No public access to contacts" on public.contacts;
create policy "No public access to contacts"
  on public.contacts
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- Extra safety layer: also remove the table permissions from the public
-- roles, so even a mistake in a future policy cannot expose these tables.
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.contacts from anon, authenticated;

-- TODO (later): when you build an admin dashboard, add a login with Supabase
-- Auth and a policy that lets ONLY your admin user read and update these
-- tables, for example by checking auth.uid() against an "admins" table.
