import { supabase } from "./supabase";
import type {
  MovieRow,
  ProfileRow,
  WatchlistRow,
  ReviewRow,
  GenreRow,
} from "./supabase";

// ============================================================================
// Error Helpers
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function handleError(error: unknown, context: string): never {
  if (error instanceof ApiError) throw error;

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  throw new ApiError(`${context}: ${message}`, "UNKNOWN_ERROR", 500);
}

// ============================================================================
// Movies
// ============================================================================

export interface MoviesFilters {
  genre?: string;
  search?: string;
  featured?: boolean;
  sortBy?: "upvotes" | "created_at" | "release_year" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function getMovies(
  filters: MoviesFilters = {}
): Promise<{ data: MovieRow[]; count: number }> {
  try {
    let query = supabase
      .from("movies")
      .select("*", { count: "exact" });

    if (filters.genre) query = query.eq("genre", filters.genre);
    if (filters.search) query = query.ilike("title", `%${filters.search}%`);
    if (filters.featured !== undefined) query = query.eq("is_featured", filters.featured);

    const sortBy = filters.sortBy || "upvotes";
    const sortOrder = filters.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    if (filters.offset !== undefined) {
      const end = filters.offset + (filters.limit || 20) - 1;
      query = query.range(filters.offset, end);
    } else if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error, count } = await query;
    if (error) throw new ApiError(error.message, error.code, 400);
    return { data: (data as MovieRow[]) || [], count: count || 0 };
  } catch (error) {
    return handleError(error, "Failed to fetch movies");
  }
}

export async function getMovieById(
  id: string
): Promise<MovieRow | null> {
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new ApiError(error.message, error.code, 400);
    }
    return data as MovieRow;
  } catch (error) {
    return handleError(error, "Failed to fetch movie");
  }
}

export async function createMovie(
  movie: Omit<MovieRow, "id" | "created_at" | "upvotes" | "is_featured">
): Promise<MovieRow> {
  try {
    const { data, error } = await supabase
      .from("movies")
      .insert(movie)
      .select()
      .single();

    if (error) throw new ApiError(error.message, error.code, 400);
    return data as MovieRow;
  } catch (error) {
    return handleError(error, "Failed to create movie");
  }
}

export async function updateMovie(
  id: string,
  updates: Partial<Omit<MovieRow, "id" | "created_at">>
): Promise<MovieRow> {
  try {
    const { data, error } = await supabase
      .from("movies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(error.message, error.code, 400);
    return data as MovieRow;
  } catch (error) {
    return handleError(error, "Failed to update movie");
  }
}

export async function deleteMovie(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (error) throw new ApiError(error.message, error.code, 400);
  } catch (error) {
    return handleError(error, "Failed to delete movie");
  }
}

export async function incrementUpvote(movieId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("increment_upvote", {
      movie_id: movieId,
    });
    if (error) throw new ApiError(error.message, error.code, 400);
  } catch (error) {
    return handleError(error, "Failed to upvote movie");
  }
}

// ============================================================================
// Profiles
// ============================================================================

export async function getProfile(
  userId: string
): Promise<ProfileRow | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new ApiError(error.message, error.code, 400);
    }
    return data as ProfileRow;
  } catch (error) {
    return handleError(error, "Failed to fetch profile");
  }
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return getProfile(user.id);
  } catch (error) {
    return handleError(error, "Failed to fetch current profile");
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<ProfileRow, "username" | "avatar_url">>
): Promise<ProfileRow> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new ApiError(error.message, error.code, 400);
    return data as ProfileRow;
  } catch (error) {
    return handleError(error, "Failed to update profile");
  }
}

// ============================================================================
// Watchlist
// ============================================================================

export async function getWatchlist(
  userId: string
): Promise<(WatchlistRow & { movie: MovieRow })[]> {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*, movie:movies(*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) throw new ApiError(error.message, error.code, 400);
    return (data as (WatchlistRow & { movie: MovieRow })[]) || [];
  } catch (error) {
    return handleError(error, "Failed to fetch watchlist");
  }
}

export async function addToWatchlist(
  userId: string,
  movieId: string
): Promise<WatchlistRow> {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .insert({ user_id: userId, movie_id: movieId })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError("Movie is already in your watchlist", "DUPLICATE", 409);
      }
      throw new ApiError(error.message, error.code, 400);
    }
    return data as WatchlistRow;
  } catch (error) {
    return handleError(error, "Failed to add to watchlist");
  }
}

export async function removeFromWatchlist(
  userId: string,
  movieId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("movie_id", movieId);

    if (error) throw new ApiError(error.message, error.code, 400);
  } catch (error) {
    return handleError(error, "Failed to remove from watchlist");
  }
}

export async function isInWatchlist(
  userId: string,
  movieId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .maybeSingle();

    if (error) throw new ApiError(error.message, error.code, 400);
    return data !== null;
  } catch (error) {
    return handleError(error, "Failed to check watchlist status");
  }
}

// ============================================================================
// Reviews
// ============================================================================

export interface ReviewWithProfile extends ReviewRow {
  profile: Pick<ProfileRow, "username" | "avatar_url">;
}

export async function getMovieReviews(
  movieId: string
): Promise<ReviewWithProfile[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profile:profiles(username, avatar_url)")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (error) throw new ApiError(error.message, error.code, 400);
    return (data as ReviewWithProfile[]) || [];
  } catch (error) {
    return handleError(error, "Failed to fetch reviews");
  }
}

export async function getUserReview(
  userId: string,
  movieId: string
): Promise<ReviewRow | null> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("movie_id", movieId)
      .maybeSingle();

    if (error) throw new ApiError(error.message, error.code, 400);
    return data as ReviewRow | null;
  } catch (error) {
    return handleError(error, "Failed to fetch user review");
  }
}

export async function createReview(
  userId: string,
  movieId: string,
  review: { rating: number; content: string }
): Promise<ReviewRow> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: userId,
        movie_id: movieId,
        rating: review.rating,
        content: review.content,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError(
          "You have already reviewed this movie",
          "DUPLICATE",
          409
        );
      }
      if (error.code === "23514") {
        throw new ApiError(
          "Rating must be between 1 and 10",
          "INVALID_RATING",
          422
        );
      }
      throw new ApiError(error.message, error.code, 400);
    }
    return data as ReviewRow;
  } catch (error) {
    return handleError(error, "Failed to create review");
  }
}

export async function updateReview(
  reviewId: string,
  userId: string,
  updates: { rating?: number; content?: string }
): Promise<ReviewRow> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", reviewId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new ApiError("Review not found or not owned by you", "NOT_FOUND", 404);
      }
      throw new ApiError(error.message, error.code, 400);
    }
    return data as ReviewRow;
  } catch (error) {
    return handleError(error, "Failed to update review");
  }
}

export async function deleteReview(
  reviewId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId);

    if (error) throw new ApiError(error.message, error.code, 400);
  } catch (error) {
    return handleError(error, "Failed to delete review");
  }
}

// ============================================================================
// Genres
// ============================================================================

export async function getGenres(): Promise<GenreRow[]> {
  try {
    const { data, error } = await supabase
      .from("genres")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw new ApiError(error.message, error.code, 400);
    return (data as GenreRow[]) || [];
  } catch (error) {
    return handleError(error, "Failed to fetch genres");
  }
}

// ============================================================================
// Ratings Aggregate
// ============================================================================

export interface MovieRating {
  average: number;
  count: number;
}

export async function getMovieRating(
  movieId: string
): Promise<MovieRating> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("movie_id", movieId);

    if (error) throw new ApiError(error.message, error.code, 400);

    const ratings = (data as { rating: number }[]).map((r) => r.rating);
    const count = ratings.length;
    const average =
      count > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10
        : 0;

    return { average, count };
  } catch (error) {
    return handleError(error, "Failed to fetch movie rating");
  }
}
