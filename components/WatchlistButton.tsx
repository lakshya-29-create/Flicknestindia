"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/api";
import {
  getUserId,
  getCachedWatchlistIds,
  addToWatchlistCache,
  removeFromWatchlistCache,
} from "@/lib/user-id";

interface WatchlistButtonProps {
  movieId: string;
  className?: string;
  size?: "sm" | "md";
}

export default function WatchlistButton({
  movieId,
  className = "",
  size = "sm",
}: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Check watchlist status on mount
  useEffect(() => {
    // Check localStorage cache FIRST — instant, no API call
    const cachedIds = getCachedWatchlistIds();
    if (cachedIds.has(movieId)) {
      setInWatchlist(true);
    }

    // Then sync with Supabase for accurate state
    let cancelled = false;
    async function syncWithServer() {
      try {
        const userId = getUserId();
        const result = await isInWatchlist(userId, movieId);
        if (!cancelled) {
          setInWatchlist(result);
          // Sync cache with server truth
          if (result) {
            addToWatchlistCache(movieId);
          } else {
            removeFromWatchlistCache(movieId);
          }
        }
      } catch {
        // Silently fail — keep showing cached state
      }
    }
    syncWithServer();
    return () => { cancelled = true; };
  }, [movieId]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (toggling) return;
      setToggling(true);

      try {
        const userId = getUserId();
        if (inWatchlist) {
          await removeFromWatchlist(userId, movieId);
          setInWatchlist(false);
          removeFromWatchlistCache(movieId);
        } else {
          await addToWatchlist(userId, movieId);
          setInWatchlist(true);
          addToWatchlistCache(movieId);
        }
      } catch {
        // Revert on error
        setInWatchlist((prev) => !prev);
      } finally {
        setToggling(false);
      }
    },
    [movieId, inWatchlist, toggling]
  );

  const iconSize = size === "md" ? "text-xl" : "text-base";
  const btnSize = size === "md" ? "w-10 h-10" : "w-8 h-8";

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      className={`${btnSize} rounded-full flex items-center justify-center
        backdrop-blur-sm border transition-all duration-300
        ${
          inWatchlist
            ? "bg-gold/20 border-gold/40 text-gold"
            : "bg-cinema-black/70 border-white/15 text-white/40 hover:text-gold/70 hover:border-gold/30"
        }
        ${className}`}
      title={inWatchlist ? "Remove from watchlist" : "Save to watchlist"}
    >
      <motion.span
        className={`${iconSize} leading-none`}
        animate={
          toggling
            ? { scale: [1, 1.4, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.4 }}
      >
        {inWatchlist ? "❤️" : "🤍"}
      </motion.span>
    </motion.button>
  );
}
