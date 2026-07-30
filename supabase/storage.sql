-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Storage — LamboReads
--
-- Run this entire file in your Supabase SQL editor (Dashboard → SQL Editor).
-- Creates 5 buckets and their RLS policies.
--
-- Buckets:
--   book-covers   (public)  — cover images, jpg/png/webp, max 5 MB
--   books         (private) — full book files, pdf/epub/mobi/txt/html, max 100 MB
--   samples       (public)  — preview/sample files, pdf/epub/txt/html, max 20 MB
--   audiobooks    (private) — audio files, mp3/m4a, max 500 MB
--   author-images (public)  — author profile images, jpg/png/webp, max 5 MB
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS (in public schema — storage schema is not user-writable)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Is the current user an admin?
create or replace function public.storage_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Is the current user an approved author OR admin?
create or replace function public.storage_is_author_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('author', 'admin')
  );
$$;

-- Does the book in the storage path belong to the current user?
-- Path pattern for book buckets: {folder}/{bookId}/{filename}
-- e.g.  book-covers/covers/abc-uuid/image.webp  → bookId = split_part(name,'/',2)
create or replace function public.storage_owns_book(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.books
    where id::text = split_part(object_name, '/', 2)
      and created_by = auth.uid()
  );
$$;

-- Does the author-images path belong to the current user?
-- Path pattern: {userId}/{filename}
create or replace function public.storage_owns_profile_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select split_part(object_name, '/', 1) = auth.uid()::text;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('book-covers',   'book-covers',   true,  5242880,   array['image/jpeg','image/jpg','image/png','image/webp']),
  ('books',         'books',         false, 104857600, array['application/pdf','application/epub+zip','application/x-mobipocket-ebook','text/plain','text/html','application/octet-stream']),
  ('samples',       'samples',       true,  20971520,  array['application/pdf','application/epub+zip','text/plain','text/html']),
  ('audiobooks',    'audiobooks',    false, 524288000, array['audio/mpeg','audio/mp3','audio/x-m4a','audio/mp4','audio/aac']),
  ('author-images', 'author-images', true,  5242880,   array['image/jpeg','image/jpg','image/png','image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES — book-covers (PUBLIC bucket)
-- ═══════════════════════════════════════════════════════════════════════════════

drop policy if exists "book-covers: public read"          on storage.objects;
drop policy if exists "book-covers: admin or owner insert" on storage.objects;
drop policy if exists "book-covers: admin or owner update" on storage.objects;
drop policy if exists "book-covers: admin or owner delete" on storage.objects;

create policy "book-covers: public read"
  on storage.objects for select
  using (bucket_id = 'book-covers');

create policy "book-covers: admin or owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'book-covers'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "book-covers: admin or owner update"
  on storage.objects for update
  using (
    bucket_id = 'book-covers'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "book-covers: admin or owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'book-covers'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES — books (PRIVATE bucket)
-- ═══════════════════════════════════════════════════════════════════════════════

drop policy if exists "books: authenticated read"         on storage.objects;
drop policy if exists "books: admin or owner insert"      on storage.objects;
drop policy if exists "books: admin or owner update"      on storage.objects;
drop policy if exists "books: admin or owner delete"      on storage.objects;

create policy "books: authenticated read"
  on storage.objects for select
  using (bucket_id = 'books' and auth.role() = 'authenticated');

create policy "books: admin or owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'books'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "books: admin or owner update"
  on storage.objects for update
  using (
    bucket_id = 'books'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "books: admin or owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'books'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES — samples (PUBLIC bucket)
-- ═══════════════════════════════════════════════════════════════════════════════

drop policy if exists "samples: public read"              on storage.objects;
drop policy if exists "samples: admin or owner insert"    on storage.objects;
drop policy if exists "samples: admin or owner update"    on storage.objects;
drop policy if exists "samples: admin or owner delete"    on storage.objects;

create policy "samples: public read"
  on storage.objects for select
  using (bucket_id = 'samples');

create policy "samples: admin or owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'samples'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "samples: admin or owner update"
  on storage.objects for update
  using (
    bucket_id = 'samples'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "samples: admin or owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'samples'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES — audiobooks (PRIVATE bucket)
-- ═══════════════════════════════════════════════════════════════════════════════

drop policy if exists "audiobooks: authenticated read"    on storage.objects;
drop policy if exists "audiobooks: admin or owner insert" on storage.objects;
drop policy if exists "audiobooks: admin or owner update" on storage.objects;
drop policy if exists "audiobooks: admin or owner delete" on storage.objects;

create policy "audiobooks: authenticated read"
  on storage.objects for select
  using (bucket_id = 'audiobooks' and auth.role() = 'authenticated');

create policy "audiobooks: admin or owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'audiobooks'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "audiobooks: admin or owner update"
  on storage.objects for update
  using (
    bucket_id = 'audiobooks'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );

create policy "audiobooks: admin or owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'audiobooks'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or (public.storage_is_author_or_admin() and public.storage_owns_book(name)))
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES — author-images (PUBLIC bucket)
-- ═══════════════════════════════════════════════════════════════════════════════

drop policy if exists "author-images: public read"              on storage.objects;
drop policy if exists "author-images: admin or owner insert"    on storage.objects;
drop policy if exists "author-images: admin or owner update"    on storage.objects;
drop policy if exists "author-images: admin or owner delete"    on storage.objects;

create policy "author-images: public read"
  on storage.objects for select
  using (bucket_id = 'author-images');

create policy "author-images: admin or owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'author-images'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or public.storage_owns_profile_path(name))
  );

create policy "author-images: admin or owner update"
  on storage.objects for update
  using (
    bucket_id = 'author-images'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or public.storage_owns_profile_path(name))
  );

create policy "author-images: admin or owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'author-images'
    and auth.role() = 'authenticated'
    and (public.storage_is_admin() or public.storage_owns_profile_path(name))
  );
