"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import GlowBadge from "@/components/GlowBadge";
import GradientButton from "@/components/GradientButton";
import SpotlightHover from "@/components/SpotlightHover";
import { getMovieById, getMovies, addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/api";
import { getUserId } from "@/lib/user-id";
import type { MovieRow } from "@/lib/supabase";

// ============================================================================
// YouTube ID extraction helper
// ============================================================================

function getYouTubeId(url: string): string | null {
  return url.match(
    /(?:youtube\\.com\\/(?:watch\\?v=|embed\\/|v\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/
  )?.[1] || null;
}

// ============================================================================
// Film Grain Overlay
// ============================================================================

function FilmGrainOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay opacity-[0.025]">
      <svg className="w-full h-full animate-film-grain" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilterMovie">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilterMovie)" opacity="0.8" />
      </svg>
    </div>
  );
}

// ============================================================================
// Toast Notification
// ============================================================================

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -10, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-8 left-1/2 z-[200] pointer-events-none"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-cinema-card/95 backdrop-blur-xl border border-gold/20 shadow-glow font-body text-sm text-white/80 whitespace-nowrap">
            <span className="text-gold text-base">✓</span>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Insight Card — Cinematic Pull-Quote with Burgundy Left Border
// ============================================================================

function InsightCard({ whatItMeans, title }: { whatItMeans: string; title: string }) {
  return (
    <div className="relative p-8 md:p-12 rounded-2xl bg-cinema-card overflow-hidden shadow-[0_0_30px_rgba(139,0,0,0.08)]">
      {/* Burgundy left border accent */}
      <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b from-burgundy via-gold/60 to-ember/40 rounded-l" />

      {/* Subtle glow shadow layer */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/5 rounded-full blur-[80px]" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-burgundy/8 rounded-full blur-[60px]" />

      {/* Gold quotation marks */}
      <div className="relative z-10 mb-4">
        <span className="text-[4rem] md:text-[5rem] text-gold/25 font-display leading-none select-none">
          &ldquo;
        </span>
      </div>

      <div className="relative z-10 pl-2">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-[1px] bg-gold/40" />
          <GlowBadge variant="gold" size="sm" pulse>✦ The Deeper Meaning</GlowBadge>
        </div>

        <blockquote className="max-w-4xl">
          <p className="font-body text-xl md:text-2xl text-white/70 leading-relaxed italic relative z-10">
            {whatItMeans}
          </p>
        </blockquote>

        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 60 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-[1px] bg-gold/30 mt-6"
        />

        <p className="font-body text-sm text-white/30 mt-4">
          — from the film <span className="text-white/50">{title}</span>
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Gold Burst Animation — for upvote click
// ============================================================================

function GoldBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.5 }}
      animate={{ opacity: 0, scale: 2.5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{
        background: "radial-gradient(circle at center, rgba(255,215,0,0.3) 0%, transparent 70%)",
      }}
    />
  );
}

// ============================================================================
// Movie Page
// ============================================================================

export default function MoviePage() {
  const params = useParams();
  const id = params.id as string;

  // ─── State ────────────────────────────────────────────────────────────────
  const [movie, setMovie] = useState<MovieRow | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<MovieRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvoteCount, setUpvoteCount] = useState<number | null>(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [togglingWatchlist, setTogglingWatchlist] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ─── Scroll Progress ─────────────────────────────────────────────────────
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // ─── Toast helper ────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  // ─── Fetch movie ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getMovieById(id);
        if (cancelled) return;

        if (!data) {
          setError("not-found");
          return;
        }

        setMovie(data);
        setUpvoteCount(data.upvotes);

        // Fetch related films (same genre, excl current — limit 3 +1 buffer)
        const related = await getMovies({
          genre: data.genre.split(", ")[0],
          sortBy: "upvotes",
          limit: 4,
        });
        if (!cancelled) {
          const filtered = related.data.filter((m) => m.id !== data.id);
          setRelatedMovies(filtered.slice(0, 3));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load film");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  // ─── Watchlist check ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const userId = getUserId();
        const result = await isInWatchlist(userId, id);
        if (!cancelled) setInWatchlist(result);
      } catch {
        // Silent
      }
    }
    check();
    return () => { cancelled = true; };
  }, [id]);

  // ─── Upvote handler — POST /api/upvote ──────────────────────────────────
  const handleUpvote = useCallback(async () => {
    if (isUpvoting || upvoteCount === null) return;
    setIsUpvoting(true);
    setBurstActive(true);
    setTimeout(() => setBurstActive(false), 700);

    // Optimistic
    setUpvoteCount((prev) => (prev !== null ? prev + 1 : prev));

    try {
      const res = await fetch("/api/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: id }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setUpvoteCount((prev) => (prev !== null ? prev - 1 : prev));
    } finally {
      setIsUpvoting(false);
    }
  }, [id, isUpvoting, upvoteCount]);

  // ─── Share handler ───────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("✦ Link copied to clipboard");
    } catch {
      // Fallback
      try {
        const input = document.createElement("input");
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        showToast("✦ Link copied to clipboard");
      } catch {
        showToast("Could not copy link");
      }
    }
  }, [showToast]);

  // ─── YouTube ─────────────────────────────────────────────────────────────
  const youtubeId = movie?.trailer_url ? getYouTubeId(movie.trailer_url) : null;

  // ─── Render: Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-cinema-black">
        <div className="relative h-[50vh] md:h-[70vh] bg-cinema-dark animate-pulse">
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-5xl mx-auto">
            <div className="h-4 w-24 bg-cinema-card rounded mb-4" />
            <div className="h-16 w-3/4 bg-cinema-card rounded mb-3" />
            <div className="h-4 w-1/3 bg-cinema-card rounded mb-6" />
            <div className="h-3 w-2/3 bg-cinema-card rounded" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
          <div className="h-32 bg-cinema-card rounded-2xl animate-pulse" />
          <div className="h-24 bg-cinema-card rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  // ─── Render: Not Found ───────────────────────────────────────────────────
  if (error === "not-found") {
    return (
      <main className="min-h-screen bg-cinema-black flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="text-7xl mb-6 opacity-30">🎬</div>
          <h1 className="font-display text-6xl text-white mb-4 tracking-tight">
            Film Not <span className="text-gradient">Found</span>
          </h1>
          <p className="font-body text-white/40 mb-8 leading-relaxed">
            This film doesn&apos;t exist in our collection — or it may have been
            removed. Explore the community&apos;s curated films instead.
          </p>
          <Link href="/discover">
            <GradientButton variant="primary" size="lg">✦ Discover Films</GradientButton>
          </Link>
        </div>
      </main>
    );
  }

  // ─── Render: Error ───────────────────────────────────────────────────────
  if (error || !movie) {
    return (
      <main className="min-h-screen bg-cinema-black flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6 opacity-30">⚠️</div>
          <h1 className="font-display text-5xl text-white mb-4 tracking-tight">
            Something Went <span className="text-gradient">Wrong</span>
          </h1>
          <p className="font-body text-white/40 mb-6">{error}</p>
          <Link href="/discover">
            <GradientButton variant="primary" size="lg">✦ Back to Discover</GradientButton>
          </Link>
        </div>
      </main>
    );
  }

  // ─── Render: Movie ───────────────────────────────────────────────────────
  const firstGenre = movie.genre.split(", ")[0];

  return (
    <main ref={mainRef} className="min-h-screen bg-cinema-black overflow-x-hidden relative">
      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />

      {/* ================================================================ */}
      {/* STICKY SCROLL-PROGRESS BAR — Burgundy to Gold */}
      {/* ================================================================ */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
        <motion.div
          style={{ width: progressWidth }}
          className="h-full bg-gradient-to-r from-burgundy via-gold to-ember"
        />
      </div>

      {/* ================================================================ */}
      {/* HERO — Editorial Blurred Poster Section */}
      {/* ================================================================ */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        {movie.poster_url ? (
          <>
            <img
              src={movie.poster_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
            />
            <div className="absolute inset-0 bg-cinema-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/40 to-cinema-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/60 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-burgundy/30 via-cinema-dark to-gold/10" />
            <FilmGrainOverlay />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/40 to-transparent" />
          </>
        )}

        <div className="absolute top-20 right-20 w-96 h-96 bg-gold/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-burgundy/8 rounded-full blur-[150px]" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/discover" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-body text-sm">
              <span>←</span> Back to Discover
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="text-white/30 hover:text-gold/70 transition-colors font-body text-xs uppercase tracking-[0.15em] flex items-center gap-1"
                title="Share this film"
              >
                <span className="text-sm">⎘</span> Share
              </button>
              <Link href="/watchlist" className="text-white/30 hover:text-gold/70 transition-colors font-body text-xs uppercase tracking-[0.15em]">
                ★ Watchlist
              </Link>
            </div>
          </div>
        </div>

        {/* Hero content (bottom-aligned) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12 lg:p-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-body font-bold bg-white/5 rounded-full text-white/70 border border-white/10 backdrop-blur-sm">
                  {firstGenre}
                </span>
                {movie.release_year && (
                  <span className="text-xs text-white/50 font-body">{movie.release_year}</span>
                )}
                {movie.is_featured && (
                  <GlowBadge variant="gradient" size="sm" pulse>✦ Featured</GlowBadge>
                )}
              </div>

              <h1 className="font-display text-5xl sm:text-7xl md:text-8xl text-white leading-none mb-4 tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm font-body text-white/40">
                {movie.submitted_by && (
                  <span>Curated by <span className="text-white/60">{movie.submitted_by}</span></span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cinema-black to-transparent" />
      </section>

      {/* ================================================================ */}
      {/* CONTENT */}
      {/* ================================================================ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        {/* ── Meta card ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6 flex-wrap">
            {/* Upvote — film reel icon, POST /api/upvote, gold burst */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleUpvote}
                disabled={isUpvoting}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/20 hover:bg-gold/15 transition-colors overflow-hidden"
              >
                <GoldBurst active={burstActive} />
                <motion.span
                  className="text-gold text-lg relative z-10"
                  animate={isUpvoting ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  🎞️
                </motion.span>
                <span className="font-display text-2xl text-gold relative z-10">{upvoteCount}</span>
              </motion.button>
              <span className="text-[10px] text-white/30 font-body uppercase tracking-[0.15em]">Upvotes</span>
            </div>

            {/* Genre */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30 font-body uppercase tracking-[0.15em]">Genre</span>
              <span className="text-sm text-white/60 font-body">{movie.genre}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Watchlist toggle */}
            <motion.button
              onClick={async () => {
                if (togglingWatchlist) return;
                setTogglingWatchlist(true);
                const userId = getUserId();
                try {
                  if (inWatchlist) {
                    await removeFromWatchlist(userId, id);
                    setInWatchlist(false);
                  } else {
                    await addToWatchlist(userId, id);
                    setInWatchlist(true);
                  }
                } catch {
                  setInWatchlist(inWatchlist);
                } finally {
                  setTogglingWatchlist(false);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-body font-bold transition-all duration-300 ${
                inWatchlist
                  ? "bg-burgundy/15 border border-burgundy/30 text-burgundy-light"
                  : "bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
              }`}
            >
              <motion.span
                animate={inWatchlist ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {inWatchlist ? "★" : "☆"}
              </motion.span>
              {inWatchlist ? "Saved" : "Save"}
            </motion.button>

            {/* Share button */}
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-body font-bold bg-white/[0.04] border border-white/10 text-white/40 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-300"
            >
              <span className="text-sm">⎘</span>
              Share
            </motion.button>

            <Link href="/submit">
              <GradientButton variant="secondary" size="sm">✦ Submit Yours</GradientButton>
            </Link>
          </div>
        </motion.div>

        {/* ── Two-column layout ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 pb-16 md:pb-24">
          {/* Main content (3/5) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Description in glass-morphism card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="glass-panel p-6 md:p-8"
            >
              <h2 className="font-display text-2xl text-white/60 mb-4 tracking-tight flex items-center gap-3">
                <span className="w-6 h-[1px] bg-gold/30" />
                Synopsis
              </h2>
              <p className="font-body text-base md:text-lg text-white/50 leading-relaxed">
                {movie.description || "No description provided for this film."}
              </p>
            </motion.div>

            {/* TED-talk Insight — cinematic pull-quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <InsightCard whatItMeans={movie.what_it_means} title={movie.title} />
            </motion.div>
          </div>

          {/* Sidebar (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trailer with gold-border cinema frame */}
            {youtubeId ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h3 className="font-body text-[10px] text-white/30 uppercase tracking-[0.25em] mb-3">Trailer</h3>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-cinema-card border border-white/[0.06]">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${movie.title} trailer`}
                  />
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                    boxShadow: "inset 0 0 0 2px rgba(255,215,0,0.25), inset 0 0 20px rgba(255,215,0,0.06)",
                  }} />
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/30 rounded-tl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/30 rounded-tr pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/30 rounded-bl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/30 rounded-br pointer-events-none" />
                </div>
              </motion.div>
            ) : movie.trailer_url ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-cinema-card border border-white/[0.06]"
              >
                <p className="text-xs text-white/30 font-body mb-2">Trailer link:</p>
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold/60 hover:text-gold font-body transition-colors break-all"
                >
                  {movie.trailer_url}
                </a>
              </motion.div>
            ) : null}

            {/* Poster */}
            {movie.poster_url && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                <h3 className="font-body text-[10px] text-white/30 uppercase tracking-[0.25em] mb-3">Poster</h3>
                <div className="rounded-2xl overflow-hidden bg-cinema-card border border-white/[0.06]">
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} poster`}
                    className="w-full object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* Film info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="p-6 rounded-2xl bg-cinema-card border border-white/[0.06] space-y-4"
            >
              <h3 className="font-body text-[10px] text-white/30 uppercase tracking-[0.25em]">Details</h3>
              <div className="space-y-3 text-sm font-body">
                {movie.release_year && (
                  <div className="flex justify-between">
                    <span className="text-white/30">Year</span>
                    <span className="text-white/60">{movie.release_year}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/30">Genre</span>
                  <span className="text-white/60">{movie.genre}</span>
                </div>
                {movie.submitted_by && (
                  <div className="flex justify-between">
                    <span className="text-white/30">Curated by</span>
                    <span className="text-white/60">{movie.submitted_by}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/30">Upvotes</span>
                  <span className="text-gold font-bold">{upvoteCount}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* RELATED FILMS — 3 Cards */}
      {/* ================================================================ */}
      {relatedMovies.length > 0 && (
        <SpotlightHover>
          <section className="px-4 md:px-8 pb-24 md:pb-32 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <GlowBadge variant="burgundy" size="sm" className="mb-4">🎬 Related Films</GlowBadge>
              <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight">
                More in <span className="text-gradient">{firstGenre}</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {relatedMovies.map((related, i) => (
                <Link key={related.id} href={`/movies/${related.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-2xl bg-cinema-card border border-white/[0.06] shadow-card transition-shadow duration-500 hover:shadow-glow"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-burgundy/20 via-cinema-dark to-gold/10 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-cinema-dark" />
                      {related.poster_url ? (
                        <img
                          src={related.poster_url}
                          alt={related.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <span className="font-display text-7xl text-white/10">{related.title.charAt(0)}</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-cinema-card/60 to-transparent" />

                      {/* Upvote badge */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-cinema-black/80 backdrop-blur-sm border border-gold/20">
                        <span className="text-gold text-xs">▲</span>
                        <span className="text-white text-[11px] font-bold font-body">{related.upvotes}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-display text-lg text-white group-hover:text-gradient transition-all duration-300 leading-tight">
                        {related.title}
                      </h3>
                      <p className="text-xs text-white/40 font-body mt-1 line-clamp-1">
                        {related.genre}
                      </p>
                    </div>

                    {/* Animated border on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        padding: "1px",
                        background: "linear-gradient(135deg, #8B0000, #FFD700, #FF6B00, #FFD700, #8B0000)",
                        backgroundSize: "300% 300%",
                        animation: "border-dance 3s linear infinite",
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                    />
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        </SpotlightHover>
      )}

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/discover" className="font-body text-sm text-white/30 hover:text-white/50 transition-colors flex items-center gap-1">
              <span>←</span> Back to Discover
            </Link>
            <p className="font-display text-2xl text-gradient">Flicknest</p>
            <p className="font-body text-xs text-white/20">Every film has a story worth telling</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
