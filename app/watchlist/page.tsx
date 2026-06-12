"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GlowBadge from "@/components/GlowBadge";
import GradientButton from "@/components/GradientButton";
import { getWatchlist, removeFromWatchlist } from "@/lib/api";
import { getUserId } from "@/lib/user-id";
import type { MovieRow } from "@/lib/supabase";

// ============================================================================
// Animation Variants
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// Film Grain Overlay
// ============================================================================

function FilmGrainOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay opacity-[0.025]">
      <svg className="w-full h-full animate-film-grain" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilterWatchlist">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilterWatchlist)" opacity="0.8" />
      </svg>
    </div>
  );
}

// ============================================================================
// Watchlist Card
// ============================================================================

function WatchlistCard({
  movie,
  onRemove,
}: {
  movie: MovieRow;
  onRemove: (id: string) => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showImage = !!movie.poster_url && !imgError;

  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (removing) return;
      setRemoving(true);
      try {
        const userId = getUserId();
        await removeFromWatchlist(userId, movie.id);
        onRemove(movie.id);
      } catch {
        setRemoving(false);
      }
    },
    [movie.id, removing, onRemove]
  );

  return (
    <motion.div
      variants={cardReveal}
      layout
      className="group relative overflow-hidden rounded-2xl bg-cinema-card border border-white/[0.06] shadow-card transition-shadow duration-500 hover:shadow-glow"
    >
      <Link href={`/movies/${movie.id}`}>
        {/* Poster area */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <div className="absolute inset-0 bg-cinema-dark animate-pulse" />
          {showImage ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-burgundy/20 via-cinema-dark to-gold/10">
              <span className="font-display text-7xl text-white/10">{movie.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/30 to-transparent" />

          {/* Remove button */}
          <motion.button
            onClick={handleRemove}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-cinema-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/40 hover:text-ember transition-colors"
            title="Remove from watchlist"
          >
            <motion.span
              animate={removing ? { rotate: 90, opacity: 0 } : { rotate: 0, opacity: 1 }}
              className="text-sm"
            >
              ✕
            </motion.span>
          </motion.button>

          {/* Genre badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1 text-xs font-body font-bold bg-white/5 rounded-full text-white/70 border border-white/10 backdrop-blur-sm">
              {movie.genre.split(", ")[0]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl text-white group-hover:text-gradient transition-all duration-300 leading-tight">
              {movie.title}
            </h3>
            {movie.release_year && (
              <span className="flex-shrink-0 text-[11px] text-white/40 font-body bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">
                {movie.release_year}
              </span>
            )}
          </div>
          <p className="text-sm text-white/40 font-body leading-relaxed line-clamp-2">
            {movie.description}
          </p>
          <p className="text-xs text-gold/50 font-body italic line-clamp-1">
            &ldquo;{movie.what_it_means}&rdquo;
          </p>
        </div>
      </Link>

      {/* Animated border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          padding: "1px",
          background:
            "linear-gradient(135deg, #8B0000, #FFD700, #FF6B00, #FFD700, #8B0000)",
          backgroundSize: "300% 300%",
          animation: "border-dance 3s linear infinite",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </motion.div>
  );
}

// ============================================================================
// Watchlist Page
// ============================================================================

export default function WatchlistPage() {
  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────────
  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      const items = await getWatchlist(userId);
      setMovies(items.map((item) => item.movie));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // ─── Remove handler ────────────────────────────────────────────────────
  const handleRemove = useCallback((id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ─── Render: Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-cinema-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="h-6 w-48 bg-cinema-card rounded animate-pulse mb-4" />
          <div className="h-3 w-32 bg-cinema-card rounded animate-pulse mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-cinema-card animate-pulse h-[320px]" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="min-h-screen bg-cinema-black flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6 opacity-30">⚠️</div>
          <h1 className="font-display text-5xl text-white mb-4 tracking-tight">
            Something Went <span className="text-gradient">Wrong</span>
          </h1>
          <p className="font-body text-white/40 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={fetchWatchlist}>
              <GradientButton variant="primary" size="lg">↻ Try Again</GradientButton>
            </button>
            <Link href="/discover">
              <GradientButton variant="ghost" size="lg">✦ Discover Films</GradientButton>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Empty ─────────────────────────────────────────────────────
  if (movies.length === 0) {
    return (
      <main className="min-h-screen bg-cinema-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors font-body text-sm mb-12"
          >
            <span>←</span> Home
          </Link>
          <div className="text-center max-w-lg mx-auto pt-16">
            <div className="text-7xl mb-6 opacity-30">☆</div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-4 tracking-tight">
              Your Watchlist Is <span className="text-gradient">Empty</span>
            </h1>
            <p className="font-body text-white/40 mb-8 leading-relaxed">
              Save films you want to watch later by tapping the bookmark star on
              any film&apos;s page. Your collection will live here.
            </p>
            <Link href="/discover">
              <GradientButton variant="primary" size="lg">
                ✦ Discover Films
              </GradientButton>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Films ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-cinema-black">
      {/* Header with film grain */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy/10 via-cinema-dark to-gold/5" />
        <FilmGrainOverlay />
        <div className="absolute top-10 right-10 w-72 h-72 bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-burgundy/6 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors font-body text-sm mb-8"
          >
            <span>←</span> Home
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <GlowBadge variant="gold" size="sm" className="mb-4">
                ★ Your Collection
              </GlowBadge>
              <h1 className="font-display text-5xl md:text-7xl text-white tracking-tight leading-none">
                Watch<span className="text-gradient">list</span>
              </h1>
              <p className="font-body text-white/30 mt-3">
                {movies.length} film{movies.length !== 1 ? "s" : ""} saved
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/discover">
                <GradientButton variant="ghost" size="sm">
                  + Add More
                </GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {movies.map((movie) => (
              <WatchlistCard
                key={movie.id}
                movie={movie}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link
              href="/discover"
              className="font-body text-sm text-white/30 hover:text-white/50 transition-colors flex items-center gap-1"
            >
              <span>←</span> Discover Films
            </Link>
            <p className="font-display text-2xl text-gradient">Flicknest</p>
            <p className="font-body text-xs text-white/20">
              Every film has a story worth telling
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
