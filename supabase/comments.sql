create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  book_id bigint not null, body text not null check (char_length(body) between 1 and 5000), likes_count integer not null default 0,
  status text not null default 'published' check (status in ('published','hidden','reported')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.comment_replies (
  id uuid primary key default gen_random_uuid(), comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, body text not null check (char_length(body) between 1 and 5000),
  likes_count integer not null default 0, status text not null default 'published' check (status in ('published','hidden','reported')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade, reply_id uuid references public.comment_replies(id) on delete cascade,
  created_at timestamptz not null default now(), check ((comment_id is not null) <> (reply_id is not null)), unique(user_id, comment_id), unique(user_id, reply_id)
);
create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade, reply_id uuid references public.comment_replies(id) on delete cascade,
  reason text not null check (reason in ('spam','offensive','false_information','other')), details text,
  status text not null default 'open' check (status in ('open','resolved','dismissed')), created_at timestamptz not null default now(),
  check ((comment_id is not null) <> (reply_id is not null))
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null, type text not null, entity_id uuid, book_id bigint, message text not null,
  read_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists comments_book_created_idx on public.comments(book_id,status,created_at desc);
create index if not exists comment_replies_parent_idx on public.comment_replies(comment_id,status,created_at asc);
create index if not exists comment_reports_status_idx on public.comment_reports(status,created_at desc);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id,created_at desc);
create or replace function public.refresh_comment_like_count() returns trigger language plpgsql security definer as $$
begin
  if coalesce(new.comment_id, old.comment_id) is not null then update public.comments set likes_count=(select count(*) from public.comment_likes where comment_id=coalesce(new.comment_id,old.comment_id)) where id=coalesce(new.comment_id,old.comment_id); end if;
  if coalesce(new.reply_id, old.reply_id) is not null then update public.comment_replies set likes_count=(select count(*) from public.comment_likes where reply_id=coalesce(new.reply_id,old.reply_id)) where id=coalesce(new.reply_id,old.reply_id); end if;
  return coalesce(new,old);
end; $$;
drop trigger if exists comment_like_count_trigger on public.comment_likes;
create trigger comment_like_count_trigger after insert or delete on public.comment_likes for each row execute function public.refresh_comment_like_count();
create or replace function public.comments_is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;
alter table public.comments enable row level security; alter table public.comment_replies enable row level security; alter table public.comment_likes enable row level security; alter table public.comment_reports enable row level security; alter table public.notifications enable row level security;
drop policy if exists comments_read on public.comments; drop policy if exists comments_insert on public.comments; drop policy if exists comments_update on public.comments; drop policy if exists comments_delete on public.comments;
drop policy if exists replies_read on public.comment_replies; drop policy if exists replies_insert on public.comment_replies; drop policy if exists replies_update on public.comment_replies; drop policy if exists replies_delete on public.comment_replies;
drop policy if exists comment_likes_read on public.comment_likes; drop policy if exists comment_likes_insert on public.comment_likes; drop policy if exists comment_likes_delete on public.comment_likes;
drop policy if exists comment_reports_insert on public.comment_reports; drop policy if exists comment_reports_admin on public.comment_reports; drop policy if exists comment_reports_admin_update on public.comment_reports; drop policy if exists notifications_read on public.notifications; drop policy if exists notifications_update on public.notifications;
create policy comments_read on public.comments for select using(status='published' or user_id=auth.uid() or public.comments_is_admin());
create policy comments_insert on public.comments for insert with check(user_id=auth.uid());
create policy comments_update on public.comments for update using(user_id=auth.uid() or public.comments_is_admin());
create policy comments_delete on public.comments for delete using(user_id=auth.uid() or public.comments_is_admin());
create policy replies_read on public.comment_replies for select using(status='published' or user_id=auth.uid() or public.comments_is_admin());
create policy replies_insert on public.comment_replies for insert with check(user_id=auth.uid());
create policy replies_update on public.comment_replies for update using(user_id=auth.uid() or public.comments_is_admin());
create policy replies_delete on public.comment_replies for delete using(user_id=auth.uid() or public.comments_is_admin());
create policy comment_likes_read on public.comment_likes for select using(true); create policy comment_likes_insert on public.comment_likes for insert with check(user_id=auth.uid()); create policy comment_likes_delete on public.comment_likes for delete using(user_id=auth.uid());
create policy comment_reports_insert on public.comment_reports for insert with check(user_id=auth.uid()); create policy comment_reports_admin on public.comment_reports for select using(public.comments_is_admin()); create policy comment_reports_admin_update on public.comment_reports for update using(public.comments_is_admin());
create policy notifications_read on public.notifications for select using(recipient_id=auth.uid()); create policy notifications_update on public.notifications for update using(recipient_id=auth.uid());
