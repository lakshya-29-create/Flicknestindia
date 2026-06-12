-- ============================================================================
-- Flicknest — Discover
-- Migration 002: Community movie discovery & voting
-- Tables: genres, discover_movies
-- RPC: increment_upvote
-- ============================================================================

-- 1. Genres (lookup table with UI metadata)
-- ============================================================================
create table if not exists public.genres (
  id          bigint        generated always as identity primary key,
  name        text          not null unique,
  emoji       text          not null,
  color_hex   text          not null
);

-- Seed genres
insert into public.genres (name, emoji, color_hex) values
  ('Drama',       '🎭', '#8B4513'),
  ('Thriller',    '🔪', '#2F4F4F'),
  ('Sci-Fi',      '🚀', '#4682B4'),
  ('Romance',     '💕', '#DC143C'),
  ('Action',      '💥', '#FF4500'),
  ('Horror',      '👻', '#2E0854'),
  ('Documentary', '📽️', '#556B2F'),
  ('Animation',   '🐭', '#FF69B4'),
  ('Comedy',      '😂', '#FFD700'),
  ('World Cinema','🌍', '#20B2AA')
on conflict (name) do nothing;

-- 2. Discover Movies
-- ============================================================================
create table if not exists public.discover_movies (
  id            uuid        default gen_random_uuid() primary key,
  title         text        not null,
  genre         text        not null default '',
  description   text        not null default '',
  what_it_means text        not null default '',
  submitted_by  text        not null default '',
  poster_url    text        not null default '',
  trailer_url   text        not null default '',
  release_year  integer     check (release_year >= 1888 and release_year <= 2030),
  upvotes       integer     not null default 0,
  is_featured   boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_discover_movies_upvotes   on public.discover_movies(upvotes desc);
create index if not exists idx_discover_movies_featured   on public.discover_movies(is_featured) where is_featured = true;
create index if not exists idx_discover_movies_genre      on public.discover_movies(genre);
create index if not exists idx_discover_movies_created_at on public.discover_movies(created_at desc);

-- 3. RPC: increment_upvote
-- ============================================================================
create or replace function public.increment_upvote(movie_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.discover_movies
  set upvotes = upvotes + 1
  where id = movie_id;
end;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Genres: publicly readable
alter table public.genres enable row level security;

create policy "Genres are publicly readable"
  on public.genres for select
  using (true);

-- Discover Movies: publicly readable, authenticated users can insert
alter table public.discover_movies enable row level security;

create policy "Discover movies are publicly readable"
  on public.discover_movies for select
  using (true);

create policy "Authenticated users can submit movies"
  on public.discover_movies for insert
  with check (auth.role() = 'authenticated');

-- No update or delete policies — submissions are immutable via public API.
-- Admin operations go through the service role key in API routes.
