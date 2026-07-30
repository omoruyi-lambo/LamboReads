alter table if exists public.books add column if not exists external_id text;
alter table if exists public.books add column if not exists normalized_title text;
alter table if exists public.books add column if not exists normalized_author text;
alter table if exists public.books add column if not exists views bigint not null default 0;
alter table if exists public.books add column if not exists downloads bigint not null default 0;
alter table if exists public.books add column if not exists deleted_at timestamptz;

create unique index if not exists books_external_id_unique on public.books(external_id) where external_id is not null;
create index if not exists books_catalog_genre_idx on public.books(genre);
create index if not exists books_catalog_popular_idx on public.books(views desc nulls last, downloads desc nulls last) where deleted_at is null and status = 'published';

create or replace function public.normalize_book_catalog_fields() returns trigger language plpgsql as $$
begin
  new.normalized_title := lower(regexp_replace(trim(coalesce(new.title, '')), '[^a-zA-Z0-9]+', ' ', 'g'));
  new.normalized_author := lower(regexp_replace(trim(coalesce(new.author, '')), '[^a-zA-Z0-9]+', ' ', 'g'));
  return new;
end; $$;

drop trigger if exists books_catalog_normalize_trigger on public.books;
create trigger books_catalog_normalize_trigger before insert or update of title, author on public.books for each row execute function public.normalize_book_catalog_fields();

create unique index if not exists books_normalized_title_author_unique on public.books(normalized_title, normalized_author) where external_id is null and deleted_at is null;
