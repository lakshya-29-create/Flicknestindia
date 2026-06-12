import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ============================================================================
// Movies
// ============================================================================
export interface MovieRow {
  id: string;
  title: string;
  genre: string;
  description: string;
  what_it_means: string;
  submitted_by: string;
  poster_url: string;
  trailer_url: string;
  release_year: number | null;
  upvotes: number;
  is_featured: boolean;
  created_at: string;
}

// ============================================================================
// Profiles
// ============================================================================
export interface ProfileRow {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

// ============================================================================
// Watchlist
// ============================================================================
export interface WatchlistRow {
  id: string;
  user_id: string;
  movie_id: string;
  added_at: string;
}

// ============================================================================
// Reviews
// ============================================================================
export interface ReviewRow {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Genres
// ============================================================================
export interface GenreRow {
  id: number;
  name: string;
  emoji: string;
  color_hex: string;
}

// ============================================================================
// Table type maps (for type-safe Supabase queries)
// ============================================================================
export type Tables = {
  movies: MovieRow;
  profiles: ProfileRow;
  watchlist: WatchlistRow;
  reviews: ReviewRow;
  genres: GenreRow;
};
