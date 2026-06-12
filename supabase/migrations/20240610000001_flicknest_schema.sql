-- ============================================================================
-- Flicknest — Cinema Redefined
-- Initial Schema Migration
-- Tables: movies, profiles (extends auth.users), watchlist, reviews
-- ============================================================================

-- 1. Movies
-- ============================================================================
create table if not exists public.movies (
  id            uuid        default gen_random_uuid() primary key,
  title         text        not null,
  year          integer     not null check (year >= 1888 and year <= 2030),
  genre         text        not null default '',
  rating        numeric(3,1) not null check (rating >= 0 and rating <= 10),
  poster_url    text        not null default '',
  backdrop_url  text,
  description   text        not null default '',
  director      text        not null default '',
  cast          text[]      not null default '{}',
  duration_minutes integer  not null check (duration_minutes > 0),
  created_at    timestamptz not null default now()
);

-- 2. Profiles (extends Supabase Auth users)
-- ============================================================================
create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null,
  username      text        not null unique,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3. Watchlist
-- ============================================================================
create table if not exists public.watchlist (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  movie_id      uuid        not null references public.movies(id) on delete cascade,
  added_at      timestamptz not null default now(),
  unique(user_id, movie_id)
);

-- 4. Reviews
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

create or replace trigger on_review_updated
  before update on public.reviews
  for each row
  execute function public.update_updated_at_column();

-- ============================================================================
-- Indexes
-- ============================================================================
create index if not exists idx_movies_year        on public.movies(year desc);
create index if not exists idx_movies_rating      on public.movies(rating desc);
create index if not exists idx_movies_genre       on public.movies(genre);
create index if not exists idx_watchlist_user     on public.watchlist(user_id);
create index if not exists idx_watchlist_movie    on public.watchlist(movie_id);
create index if not exists idx_reviews_movie      on public.reviews(movie_id);
create index if not exists idx_reviews_user       on public.reviews(user_id);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Movies: publicly readable, admin-only write
alter table public.movies enable row level security;

create policy "Movies are publicly readable"
  on public.movies for select
  using (true);

create policy "Movies are insertable by authenticated users only"
  on public.movies for insert
  with check (auth.role() = 'authenticated');

create policy "Movies are updatable by authenticated users only"
  on public.movies for update
  using (auth.role() = 'authenticated');

create policy "Movies are deletable by authenticated users only"
  on public.movies for delete
  using (auth.role() = 'authenticated');

-- Profiles: users can read all profiles, update only their own
alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

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
