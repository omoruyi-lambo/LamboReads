-- ─────────────────────────────────────────────────────────────────────────────
-- profiles table
-- Mirrors auth.users and stores app-level metadata including the user's role.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  role          text        not null default 'user'
                            check (role in ('user', 'author', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index on role for fast admin/author lookups
create index if not exists profiles_role_idx on public.profiles(role);

-- ── Auto-create a profile row when a new user signs up ────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set
      email      = excluded.email,
      full_name  = coalesce(excluded.full_name, profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Keep updated_at in sync ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Helper: read the current user's role without triggering RLS recursion.
-- security definer bypasses RLS so the sub-query doesn't loop.
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Users can read their own profile; admins can read all.
-- Uses get_my_role() instead of a sub-select on profiles to avoid
-- the RLS self-reference deadlock.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (
    auth.uid() = id
    or public.get_my_role() = 'admin'
  );

-- Users can update their own profile (but not their role).
-- Uses get_my_role() to avoid the same RLS recursion issue.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      role = public.get_my_role()
      or public.get_my_role() = 'admin'
    )
  );

-- Service-role and triggers can insert
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);
