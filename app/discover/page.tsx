"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DiscoverCard from "@/components/DiscoverCard";
import GlowBadge from "@/components/GlowBadge";
import GradientButton from "@/components/GradientButton";
import SpotlightHover from "@/components/SpotlightHover";
import { getMovies, getGenres, incrementUpvote } from "@/lib/api";
import type { MovieRow, GenreRow } from "@/lib/supabase";

// ============================================================================
// Types
// ============================================================================

type SortOption = "upvotes" | "created_at" | "release_year" | "title";

// ============================================================================
// Constants
// ============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "upvotes", label: "Most Upvoted" },
  { value: "created_at", label: "Newest" },
  { value: "release_year", label: "Release Year" },
  { value: "title", label: "Title A-Z" },
];

// ============================================================================
// Page Component
// ============================================================================

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [genres, setGenres] = useState<GenreRow[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(
    searchParams.get("genre") || null
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sortBy") as SortOption) || "upvotes"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 12;

  // ============================================================================
  // Fetch genres on mount
  // ============================================================================

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {}); // silently fail — genres are optional UI
  }, []);

  // ============================================================================
  // Fetch movies
  // ============================================================================

  const fetchMovies = useCallback(
    async (append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const offset = append ? movies.length : 0;

        const result = await getMovies({
          genre: selectedGenre || undefined,
          search: search || undefined,
          sortBy,
          sortOrder: "desc",
          limit,
          offset,
        });

        if (append) {
          setMovies((prev) => [...prev, ...result.data]);
        } else {
          setMovies(result.data);
        }

        setTotalCount(result.count);
        setHasMore(offset + limit < result.count);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load movies"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedGenre, sortBy, search, movies.length]
  );

  // Fetch when filters change
  useEffect(() => {
    fetchMovies();
  },    [selectedGenre, sortBy, search]
  );

  // ============================================================================
  // URL sync
  // ============================================================================

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenre) params.set("genre", selectedGenre);
    if (sortBy !== "upvotes") params.set("sortBy", sortBy);
    if (search) params.set("search", search);
    const qs = params.toString();
    router.replace(`/discover${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [selectedGenre, sortBy, search, router]);

  // ============================================================================
  // Search debounce
  // ============================================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ============================================================================
  // Upvote handler
  // ============================================================================

  const handleUpvote = async (movieId: string) => {
    if (upvotingIds.has(movieId)) return;

    setUpvotingIds((prev) => new Set(prev).add(movieId));

    // Optimistic update
    setMovies((prev) =>
      prev.map((m) =>
        m.id === movieId ? { ...m, upvotes: m.upvotes + 1 } : m
      )
    );

    try {
      await incrementUpvote(movieId);
    } catch {
      // Revert on failure
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, upvotes: m.upvotes - 1 } : m
        )
      );
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(movieId);
        return next;
      });
    }
  };

  // ============================================================================
  // Filter handlers
  // ============================================================================

  const handleGenreClick = (genre: string | null) => {
    setSelectedGenre(genre);
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  const handleClearFilters = () => {
    setSelectedGenre(null);
    setSortBy("upvotes");
    setSearchInput("");
    setSearch("");
  };

  // ============================================================================
  // Animation variants
  // ============================================================================

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const hasActiveFilters = selectedGenre || sortBy !== "upvotes" || search;

  // ============================================================================
  // Loading skeleton
  // ============================================================================

  function LoadingSkeleton() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-cinema-card border border-white/[0.06] overflow-hidden animate-pulse"
          >
            <div className="aspect-[16/9] bg-cinema-dark" />
            <div className="p-5 space-y-3">
              <div className="h-6 bg-cinema-dark rounded w-3/4" />
              <div className="h-3 bg-cinema-dark rounded w-full" />
              <div className="h-3 bg-cinema-dark rounded w-2/3" />
              <div className="h-8 bg-cinema-dark rounded w-1/3 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <main className="min-h-screen bg-cinema-black">
      {/* ================================================================ */}
      {/* Hero Section */}
      {/* ================================================================ */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy/10 via-transparent to-cinema-black" />
        <div className="absolute inset-0 bg-glow-gradient" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-burgundy/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-ember/10 rounded-full blur-[150px]" />

        <div className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlowBadge variant="gradient" size="lg" pulse className="mb-4">
              ✦ Community Discovery
            </GlowBadge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl text-white leading-none mb-4 tracking-tight"
          >
            <span className="text-gradient">Discover</span> Films
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Dive into the community&apos;s most talked-about films.
            Each submission includes the deeper meaning behind the story.
          </motion.p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Filters & Controls */}
      {/* ================================================================ */}
      <SpotlightHover>
        <section className="px-4 md:px-8 max-w-7xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel p-4 md:p-6 space-y-4"
          >
            {/* Search + Sort row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search films..."
                  className="w-full pl-10 pr-4 py-2.5 bg-cinema-black/60 border border-white/10 
                    rounded-xl text-white text-sm font-body placeholder:text-white/20
                    focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20
                    transition-all duration-300"
                />
              </div>

              {/* Sort */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-body font-bold 
                      transition-all duration-300 border
                      ${
                        sortBy === option.value
                          ? "bg-gold/10 border-gold/30 text-gold shadow-glow"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:bg-white/10"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre filters */}
            <div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenreClick(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-body font-bold 
                    transition-all duration-300 border
                    ${
                      !selectedGenre
                        ? "bg-cinema-gradient text-white border-transparent"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:bg-white/10"
                    }`}
                >
                  All
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.name}
                    onClick={() => handleGenreClick(genre.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-body font-bold 
                      transition-all duration-300 border flex items-center gap-1.5
                      ${
                        selectedGenre === genre.name
                          ? "bg-cinema-gradient text-white border-transparent"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:bg-white/10"
                      }`}
                  >
                    <span>{genre.emoji}</span>
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters bar */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <p className="text-xs text-white/30 font-body">
                  {totalCount} film{totalCount !== 1 ? "s" : ""} found
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-gold/60 hover:text-gold font-body font-bold transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        </section>
      </SpotlightHover>

      {/* ================================================================ */}
      {/* Movie Grid */}
      {/* ================================================================ */}
      <section className="px-4 md:px-8 pb-20 max-w-7xl mx-auto">
        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-ember/70 font-body mb-4">{error}</p>
            <GradientButton variant="secondary" onClick={() => fetchMovies()}>
              Try Again
            </GradientButton>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && !error && <LoadingSkeleton />}

        {/* Empty state */}
        {!loading && !error && movies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4 opacity-30">🎬</div>
            <h3 className="font-display text-3xl text-white/60 mb-2">
              No films found
            </h3>
            <p className="font-body text-white/30 max-w-md mx-auto mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search query to discover more films."
                : "No films have been submitted yet. Be the first!"}
            </p>
            {hasActiveFilters && (
              <GradientButton variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </GradientButton>
            )}
          </motion.div>
        )}

        {/* Movie grid */}
        {!loading && !error && movies.length > 0 && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {movies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    variants={itemVariants}
                    layout
                  >
                    <DiscoverCard
                      movie={movie}
                      onUpvote={handleUpvote}
                      isUpvoting={upvotingIds.has(movie.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load more */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-10"
              >
                <GradientButton
                  variant="secondary"
                  size="lg"
                  onClick={() => fetchMovies(true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-gold/30 border-t-gold 
                        rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `Load More (${movies.length}/${totalCount})`
                  )}
                </GradientButton>
              </motion.div>
            )}
          </>
        )}
      </section>

      {/* ================================================================ */}
      {/* Footer */}
      {/* ================================================================ */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-display text-2xl text-gradient mb-2">Flicknest</p>
          <p className="font-body text-sm text-white/20">
            Discover — Powered by the community
          </p>
        </div>
      </footer>
    </main>
  );
}
