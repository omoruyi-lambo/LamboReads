-- import_logs table
-- Tracks every admin import session from Project Gutenberg.
-- Safe to run multiple times.

create table if not exists public.import_logs (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid references auth.users(id) on delete set null,
  admin_email   text,
  source        text not null default 'Project Gutenberg',
  imported_count  integer not null default 0,
  skipped_count   integer not null default 0,
  failed_count    integer not null default 0,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  duration_ms   integer,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Index for fast admin lookups
create index if not exists import_logs_admin_id_idx on public.import_logs (admin_id);
create index if not exists import_logs_started_at_idx on public.import_logs (started_at desc);

-- RLS: only admins can read/write
alter table public.import_logs enable row level security;

drop policy if exists "Admins can manage import_logs" on public.import_logs;
create policy "Admins can manage import_logs"
  on public.import_logs
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
