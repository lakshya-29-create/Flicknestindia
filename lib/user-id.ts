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
