-- ─────────────────────────────────────────────────────────────────────────────
-- Storage URL / path columns for books and profiles
--
-- Run after storage.sql.  Safe to re-run (all operations are idempotent).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── books table ──────────────────────────────────────────────────────────────

-- Public URL of the cover image (book-covers bucket)
alter table public.books
  add column if not exists cover_url    text;

-- Storage object path inside the book-covers bucket, e.g.
--   book-covers/covers/{bookId}/{uuid}.webp
-- Kept separately so we can delete / replace without parsing the public URL.
alter table public.books
  add column if not exists cover_path   text;

-- Storage object path inside the books bucket (private — serve via signed URL)
--   books/books/{bookId}/{uuid}.pdf
alter table public.books
  add column if not exists book_url     text;   -- legacy column, keep for compat
alter table public.books
  add column if not exists book_path    text;

-- Original filename as uploaded (shown in the UI)
alter table public.books
  add column if not exists book_file_name text;

-- Public URL of the sample / preview file (samples bucket)
alter table public.books
  add column if not exists sample_url   text;

-- Storage object path inside the samples bucket
alter table public.books
  add column if not exists sample_path  text;

-- Storage object path inside the audiobooks bucket (private)
alter table public.books
  add column if not exists audiobook_path text;

-- Original audiobook filename
alter table public.books
  add column if not exists audiobook_file_name text;

-- who created this book row (foreign key to auth.users)
alter table public.books
  add column if not exists created_by   uuid references auth.users(id) on delete set null;

create index if not exists books_created_by_idx on public.books(created_by);

-- ── profiles table ────────────────────────────────────────────────────────────

-- Public URL for the author's profile photo (author-images bucket)
alter table public.profiles
  add column if not exists author_image_url  text;

-- Storage object path inside the author-images bucket
alter table public.profiles
  add column if not exists author_image_path text;
