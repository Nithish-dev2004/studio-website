-- =====================================================================
-- Migration: Add staff_users and staff_audit_log tables
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =====================================================================

-- Ensure set_updated_at helper exists
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
-- Table: staff_users (Team members, roles, and staff management)
-- ---------------------------------------------------------------------
create table if not exists public.staff_users (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid unique references auth.users(id) on delete cascade,
  employee_id     text not null unique check (char_length(trim(employee_id)) > 0),
  name            text not null check (char_length(trim(name)) between 2 and 80),
  email           text not null unique check (email = lower(trim(email)) and char_length(email) between 5 and 254),
  mobile          text not null check (char_length(trim(mobile)) between 10 and 15),
  role            text not null check (role in ('admin', 'manager', 'photographer', 'editor', 'staff')),
  salary          numeric(12,2) not null check (salary >= 0),
  status          text not null default 'active' check (status in ('active', 'inactive')),
  must_change_password boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- For existing tables, add must_change_password column if missing
alter table public.staff_users add column if not exists must_change_password boolean not null default true;

drop trigger if exists staff_users_set_updated_at on public.staff_users;
create trigger staff_users_set_updated_at
  before update on public.staff_users
  for each row execute function public.set_updated_at();

create index if not exists staff_users_employee_id_idx on public.staff_users (employee_id);
create index if not exists staff_users_email_idx on public.staff_users (email);
create index if not exists staff_users_role_idx on public.staff_users (role);
create index if not exists staff_users_status_idx on public.staff_users (status);
create index if not exists staff_users_must_change_password_idx on public.staff_users (must_change_password);
create index if not exists staff_users_created_at_idx on public.staff_users (created_at desc);

-- ---------------------------------------------------------------------
-- Table: staff_audit_log (Audit trail for staff management events)
-- ---------------------------------------------------------------------
create table if not exists public.staff_audit_log (
  id                  uuid primary key default gen_random_uuid(),
  performed_by_email  text not null check (char_length(performed_by_email) between 5 and 254),
  target_user_id      uuid references public.staff_users(id) on delete set null,
  action              text not null check (action in ('create', 'edit', 'activate', 'deactivate', 'reset_password')),
  details             jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists staff_audit_log_created_at_idx on public.staff_audit_log (created_at desc);
create index if not exists staff_audit_log_target_user_id_idx on public.staff_audit_log (target_user_id);
create index if not exists staff_audit_log_action_idx on public.staff_audit_log (action);

-- ---------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------
-- POLICY (staff_users): Row Level Security enabled with no public access.
-- No public user (anon) or standard authenticated client can read, insert, update or delete.
-- Only the server (service_role key) reads and writes, protecting salaries and staff details.
alter table public.staff_users enable row level security;

drop policy if exists "No public access to staff_users" on public.staff_users;
create policy "No public access to staff_users"
  on public.staff_users for all to anon, authenticated using (false) with check (false);

revoke all on table public.staff_users from anon, authenticated;

-- POLICY (staff_audit_log): Row Level Security enabled with no public access.
-- Logs who performed what action on which staff member without exposing passwords.
-- Only the server (service_role key) can insert and read audit records.
alter table public.staff_audit_log enable row level security;

drop policy if exists "No public access to staff_audit_log" on public.staff_audit_log;
create policy "No public access to staff_audit_log"
  on public.staff_audit_log for all to anon, authenticated using (false) with check (false);

revoke all on table public.staff_audit_log from anon, authenticated;
