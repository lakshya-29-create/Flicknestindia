-- ============================================================================
-- Flicknest — Movies v2
-- Migration 003: Replace legacy movies table with simplified schema
-- New columns: id (uuid PK), title, genre, description, what_it_means
-- ============================================================================

-- 1. Drop dependent tables first (they reference public.movies)
-- ============================================================================
drop table if exists public.reviews cascade;
drop table if exists public.watchlist cascade;

-- 2. Drop old movies & discover_movies tables
-- ============================================================================
drop table if exists public.discover_movies cascade;
drop table if exists public.movies cascade;

-- 3. Create new simplified movies table
-- ============================================================================
create table if not exists public.movies (
  id              uuid        default gen_random_uuid() primary key,
  title           text        not null,
  genre           text        not null default '',
  description     text        not null default '',
  what_it_means   text        not null default '',
  submitted_by    text        not null default '',
  poster_url      text        not null default '',
  trailer_url     text        not null default '',
  release_year    integer     check (release_year >= 1888 and release_year <= 2030),
  upvotes         integer     not null default 0,
  is_featured     boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- 4. Indexes
-- ============================================================================
create index if not exists idx_movies_genre       on public.movies(genre);
create index if not exists idx_movies_upvotes     on public.movies(upvotes desc);
create index if not exists idx_movies_featured    on public.movies(is_featured) where is_featured = true;
create index if not exists idx_movies_created_at  on public.movies(created_at desc);

-- 5. Recreate watchlist (references movies.id)
-- ============================================================================
create table if not exists public.watchlist (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  movie_id      uuid        not null references public.movies(id) on delete cascade,
  added_at      timestamptz not null default now(),
  unique(user_id, movie_id)
);

create index if not exists idx_watchlist_user  on public.watchlist(user_id);
create index if not exists idx_watchlist_movie on public.watchlist(movie_id);

-- 6. Recreate reviews (references movies.id)
-- ============================================================================
create table if not exists public.reviews (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  movie_id      uuid        not null references public.movies(id) on delete cascade,
  rating        integer     not null check (rating >= 1 and rating <= 10),
  content       text        not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, movie_id)
);

create index if not exists idx_reviews_movie      on public.reviews(movie_id);
create index if not exists idx_reviews_user       on public.reviews(user_id);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);

-- Auto-update updated_at on reviews
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_review_updated on public.reviews;
create trigger on_review_updated
  before update on public.reviews
  for each row
  execute function public.update_updated_at_column();

-- 7. RPC: increment_upvote (now on movies table)
-- ============================================================================
create or replace function public.increment_upvote(movie_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.movies
  set upvotes = upvotes + 1
  where id = movie_id;
end;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Movies: publicly readable, authenticated users can insert
alter table public.movies enable row level security;

create policy "Movies are publicly readable"
  on public.movies for select
  using (true);

create policy "Authenticated users can insert movies"
  on public.movies for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update movies"
  on public.movies for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete movies"
  on public.movies for delete
  using (auth.role() = 'authenticated');

-- Watchlist: users manage their own entries
alter table public.watchlist enable row level security;

create policy "Users can read their own watchlist"
  on public.watchlist for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own watchlist"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
  on public.watchlist for delete
  using (auth.uid() = user_id);

-- Reviews: publicly readable, authenticated users manage their own
alter table public.reviews enable row level security;

create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Users can insert their own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);
