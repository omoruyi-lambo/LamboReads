-- Add unique constraint on external_id so the importer can upsert without duplicates.
-- external_id stores the Gutenberg book ID (e.g. "1342" for Pride and Prejudice).
-- Safe to run multiple times.

-- First add the column if it doesn't exist yet
alter table public.books
  add column if not exists external_id text;

-- Add the unique constraint
alter table public.books
  drop constraint if exists books_external_id_key;

alter table public.books
  add constraint books_external_id_key unique (external_id);

-- Index for fast lookups by external_id
create index if not exists books_external_id_idx on public.books (external_id);
