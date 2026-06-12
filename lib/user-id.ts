"use client";

const STORAGE_KEY = "flicknest_user_id";

/**
 * Returns a stable user ID stored in localStorage.
 * Generates one on first visit and persists it.
 * This lets the watchlist work immediately without auth.
 * When Supabase auth is added, replace with the real user ID.
 */
export function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";

  let userId = localStorage.getItem(STORAGE_KEY);
  if (!userId) {
    userId = crypto.randomUUID
      ? crypto.randomUUID()
      : `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }
  return userId;
}

// ============================================================================
// Watchlist localStorage Cache — persists heart icon state across refreshes
// ============================================================================

const WATCHLIST_CACHE_KEY = "flicknest_watchlist_ids";

function getWatchlistCacheKey(): string {
  const userId = getUserId();
  return `${WATCHLIST_CACHE_KEY}_${userId}`;
}

/** Get cached watchlist movie IDs (instant, no API call) */
export function getCachedWatchlistIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(getWatchlistCacheKey());
    if (!raw) return new Set();
    return new Set<string>(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/** Replace the entire watchlist cache with a set of IDs */
export function setCachedWatchlistIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      getWatchlistCacheKey(),
      JSON.stringify(Array.from(ids))
    );
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/** Add a movie ID to the watchlist cache */
export function addToWatchlistCache(movieId: string): void {
  const ids = getCachedWatchlistIds();
  ids.add(movieId);
  setCachedWatchlistIds(ids);
}

/** Remove a movie ID from the watchlist cache */
export function removeFromWatchlistCache(movieId: string): void {
  const ids = getCachedWatchlistIds();
  ids.delete(movieId);
  setCachedWatchlistIds(ids);
}
