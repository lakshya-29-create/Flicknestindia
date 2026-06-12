"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import GlowBadge from "@/components/GlowBadge";
import GradientButton from "@/components/GradientButton";
import SpotlightHover from "@/components/SpotlightHover";
import { getMovies, getGenres } from "@/lib/api";
import type { MovieRow, GenreRow } from "@/lib/supabase";

// ============================================================================
// Fallback Data
// ============================================================================

const FALLBACK_MOVIES: MovieRow[] = [
  {
    id: "1", title: "Midnight in Paradise", genre: "Drama, Thriller",
    description: "A retired detective is pulled back into the underbelly of a neon-lit metropolis.",
    what_it_means: "A story about how we can never truly escape our past — the neon-lit city reflects the duality of human nature.",
    submitted_by: "Elena Vasquez", poster_url: "/movie-thumbnails/midnight-in-paradise.png", trailer_url: "",
    release_year: 2024, upvotes: 89, is_featured: true, created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "2", title: "Velvet Thunder", genre: "Action, Heist",
    description: "An elite squad of international thieves plots the most audacious heist in history.",
    what_it_means: "Beyond the thrill of the heist, this film explores the chemistry of trust between people who have every reason to betray each other.",
    submitted_by: "Marcus Chen", poster_url: "/movie-thumbnails/velvet-thunder.png", trailer_url: "",
    release_year: 2024, upvotes: 76, is_featured: true, created_at: "2024-03-20T00:00:00Z",
  },
  {
    id: "3", title: "Echoes of Tomorrow", genre: "Sci-Fi, Mystery",
    description: "When a quantum physicist discovers she can receive messages from her future self.",
    what_it_means: "This film asks whether knowing your future robs you of the freedom to choose your own path.",
    submitted_by: "Sarah Kim", poster_url: "/movie-thumbnails/echoes-of-tomorrow.png", trailer_url: "",
    release_year: 2023, upvotes: 64, is_featured: true, created_at: "2023-11-10T00:00:00Z",
  },
  {
    id: "4", title: "The Parallax Effect", genre: "Sci-Fi",
    description: "A quantum physicist discovers that every choice she makes spawns a parallel universe.",
    what_it_means: "If infinite versions of you exist, are any of your choices truly meaningful?",
    submitted_by: "Alice Chen", poster_url: "/movie-thumbnails/the-parallax-effect.png", trailer_url: "",
    release_year: 2024, upvotes: 42, is_featured: true, created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "5", title: "Embers of Empire", genre: "Drama",
    description: "In the crumbling final days of a dynasty, a young scribe must decide between truth and loyalty.",
    what_it_means: "Power is temporary but stories endure — the most dangerous act in any regime is bearing witness.",
    submitted_by: "Marcus Webb", poster_url: "/movie-thumbnails/embers-of-empire.png", trailer_url: "",
    release_year: 2023, upvotes: 37, is_featured: true, created_at: "2023-08-15T00:00:00Z",
  },
  {
    id: "6", title: "Where the Lotus Blooms", genre: "Romance",
    description: "Two strangers meet at a meditation retreat in rural Japan.",
    what_it_means: "Not about finding the right person, but about being the right version of yourself when they arrive.",
    submitted_by: "Yuki Tanaka", poster_url: "/movie-thumbnails/where-the-lotus-blooms.png", trailer_url: "",
    release_year: 2025, upvotes: 53, is_featured: true, created_at: "2025-01-10T00:00:00Z",
  },
];

const FALLBACK_GENRES: GenreRow[] = [
  { id: 1, name: "Drama", emoji: "🎭", color_hex: "#8B4513" },
  { id: 2, name: "Thriller", emoji: "🔪", color_hex: "#2F4F4F" },
  { id: 3, name: "Sci-Fi", emoji: "🚀", color_hex: "#4682B4" },
  { id: 4, name: "Romance", emoji: "💕", color_hex: "#DC143C" },
  { id: 5, name: "Action", emoji: "💥", color_hex: "#FF4500" },
  { id: 6, name: "Horror", emoji: "👻", color_hex: "#2E0854" },
  { id: 8, name: "Animation", emoji: "🐭", color_hex: "#FF69B4" },
  { id: 9, name: "Comedy", emoji: "😂", color_hex: "#FFD700" },
];

// ============================================================================
// Animation Variants
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ============================================================================
// Film Grain Overlay
// ============================================================================

function FilmGrainOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay opacity-[0.035]">
      {/* CSS-only animated noise using SVG filter */}
      <svg className="w-full h-full animate-film-grain" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.8" />
      </svg>
    </div>
  );
}

// ============================================================================
// Featured Spotlight Card (for horizontal scroll strip)
// ============================================================================

function FeaturedSpotlightCard({ movie, index }: { movie: MovieRow; index: number }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!movie.poster_url && !imgError;
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative flex-shrink-0 w-[320px] md:w-[380px] lg:w-[420px] overflow-hidden rounded-2xl bg-cinema-card border border-white/[0.06] shadow-card cursor-pointer transition-shadow duration-500 hover:shadow-glow-strong"
    >
      {/* Spotlight gradient on hover */}
      <div className="absolute inset-0 bg-cinema-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

      {/* Shimmer */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }}
      />

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
            <span className="font-display text-8xl text-white/10">{movie.title.charAt(0)}</span>
          </div>
        )}

        {/* Gradient fade to bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/30 to-transparent" />

        {/* Genre badge */}
        <div className="absolute bottom-3 left-3 z-30">
          <span className="px-3 py-1 text-xs font-body font-bold bg-white/5 rounded-full text-white/70 border border-white/10 backdrop-blur-sm">
            {movie.genre.split(", ")[0]}
          </span>
        </div>

        {/* Featured badge */}
        <div className="absolute top-3 right-3 z-30">
          <GlowBadge variant="gradient" size="sm" pulse>✦ Featured</GlowBadge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        {/* Title + year */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl text-white group-hover:text-gradient transition-all duration-300 leading-tight">
            {movie.title}
          </h3>
          {movie.release_year && (
            <span className="flex-shrink-0 text-xs text-white/40 font-body bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
              {movie.release_year}
            </span>
          )}
        </div>

        {/* Description teaser */}
        <p className="text-sm text-white/40 font-body leading-relaxed line-clamp-2">
          {movie.description}
        </p>

        {/* "What It Means" teaser */}
        <div className="pt-1">
          <div className="flex items-center gap-2 text-xs font-body font-bold text-gold/60">
            <span className="w-4 h-[1px] bg-gold/30" />
            <span>What It Really Means</span>
          </div>
          <p className="mt-1.5 text-sm text-white/50 font-body leading-relaxed italic line-clamp-2 border-l-2 border-gold/20 pl-3">
            &ldquo;{movie.what_it_means}&rdquo;
          </p>
        </div>

        {/* Submitted by */}
        {movie.submitted_by && (
          <p className="text-xs text-white/20 font-body pt-1">
            Curated by <span className="text-white/40">{movie.submitted_by}</span>
          </p>
        )}
      </div>

      {/* Animated gradient border on hover */}
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
  );
}

// ============================================================================
// All-Films Grid Card
// ============================================================================

function AllFilmsCard({ movie }: { movie: MovieRow }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!movie.poster_url && !imgError;
  return (
    <motion.div
      variants={cardReveal}
      className="group relative overflow-hidden rounded-2xl bg-cinema-card border border-white/[0.06] shadow-card transition-shadow duration-500 hover:shadow-glow cursor-pointer"
    >
      {/* Spotlight gradient overlay on hover */}
      <div className="absolute inset-0 bg-cinema-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

      {/* Shimmer */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }}
      />

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

        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/30 to-transparent" />

        {/* Upvote count */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cinema-black/80 backdrop-blur-sm border border-gold/20">
          <span className="text-gold text-sm leading-none">▲</span>
          <span className="text-white text-xs font-bold font-body">{movie.upvotes}</span>
        </div>

        {/* Genre badge */}
        <div className="absolute bottom-3 left-3 z-30">
          <span className="px-3 py-1 text-xs font-body font-bold bg-white/5 rounded-full text-white/70 border border-white/10 backdrop-blur-sm">
            {movie.genre.split(", ")[0]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Title + year */}
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

        {/* Description */}
        <p className="text-sm text-white/40 font-body leading-relaxed line-clamp-2">
          {movie.description}
        </p>

        {/* What It Means teaser */}
        <p className="text-xs text-gold/50 font-body italic line-clamp-1">
          &ldquo;{movie.what_it_means}&rdquo;
        </p>
      </div>

      {/* Animated gradient border on hover */}
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
  );
}

// ============================================================================
// Homepage
// ============================================================================

export default function Home() {
  // ─── Data State ────────────────────────────────────────────────────────────
  const [featuredMovies, setFeaturedMovies] = useState<MovieRow[]>([]);
  const [allMovies, setAllMovies] = useState<MovieRow[]>([]);
  const [genres, setGenres] = useState<GenreRow[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ─── Scroll Parallax ──────────────────────────────────────────────────────
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // ─── Data Fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [featuredResult, allResult, genresResult] = await Promise.all([
          getMovies({ featured: true, sortBy: "upvotes", limit: 10 }),
          getMovies({ limit: 12 }),
          getGenres(),
        ]);
        if (cancelled) return;
        setFeaturedMovies(featuredResult.data);
        setAllMovies(allResult.data);
        setGenres(genresResult);
      } catch {
        if (!cancelled) {
          const featured = FALLBACK_MOVIES.filter((m) => m.is_featured);
          setFeaturedMovies(featured);
          setAllMovies(FALLBACK_MOVIES);
          setGenres(FALLBACK_GENRES);
        }
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // ─── Filtering ────────────────────────────────────────────────────────────
  const filteredMovies = selectedGenre
    ? allMovies.filter((m) =>
        m.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      )
    : allMovies;

  const handleGenreClick = useCallback((genre: string | null) => {
    setSelectedGenre(genre);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-cinema-black overflow-x-hidden">
      {/* ================================================================ */}
      {/* HERO — Cinematic Fullscreen with Film Grain */}
      {/* ================================================================ */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background layer with slow zoom-out */}
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 will-change-transform"
        >
          {/* Dark cinematic gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0808] to-cinema-black" />

          {/* Film grain overlay */}
          <FilmGrainOverlay />

          {/* Ambient light orbs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-burgundy/15 rounded-full blur-[200px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 right-1/4 w-[50rem] h-[50rem] bg-ember/10 rounded-full blur-[250px]"
          />
          <motion.div
            animate={{ scale: [1, 0.8, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gold/[0.03] rounded-full blur-[300px]"
          />

          {/* Scanline overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
            }}
          />

          {/* Cinematic vignette */}
          <div className="absolute inset-0" style={{
            boxShadow: "inset 0 0 200px rgba(0,0,0,0.6), inset 0 0 100px rgba(0,0,0,0.3)",
          }} />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <GlowBadge variant="gradient" size="lg" pulse>
              ✦ Cinema Redefined
            </GlowBadge>
          </motion.div>

          {/* Main headline — Bebas Neue */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-6xl sm:text-8xl md:text-[9rem] text-white leading-none mb-6 tracking-tight"
          >
            Every Film Has a{" "}
            <span className="text-gradient block mt-[-0.1em]">
              Story Worth Telling
            </span>
          </motion.h1>

          {/* Subtitle — Lato */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-body text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Where cinematic artistry meets deep conversation. Discover films that
            challenge, inspire, and transform — each with the hidden meaning
            behind the story laid bare.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link href="/submit">
              <GradientButton variant="primary" size="lg">
                ✦ Submit Your Film
              </GradientButton>
            </Link>
            <Link href="/discover" className="relative group inline-block">
              {/* Animated gradient border */}
              <div
                className="absolute inset-0 rounded-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  padding: "1.5px",
                  background: "linear-gradient(135deg, #8B0000, #FFD700, #FF6B00, #FFD700, #8B0000)",
                  backgroundSize: "300% 300%",
                  animation: "border-dance 3s linear infinite",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              <GradientButton variant="ghost" size="lg">
                Explore Films
              </GradientButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-body text-[10px] text-white/20 uppercase tracking-[0.3em]">
              Scroll
            </span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-gold/40 to-transparent" />
          </motion.div>
        </motion.div>

        {/* Bottom gradient edge */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cinema-black to-transparent z-10 pointer-events-none" />
      </section>

      {/* ================================================================ */}
      {/* STICKY GENRE FILTER BAR — Horizontal Pills */}
      {/* ================================================================ */}
      {dataLoaded && genres.length > 0 && (
        <div className="sticky top-0 z-50 bg-cinema-black/90 backdrop-blur-xl border-b border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => handleGenreClick(null)}
                className={`px-5 py-2.5 rounded-full text-xs font-body font-bold uppercase tracking-wider
                  transition-all duration-300 border shrink-0
                  ${!selectedGenre
                    ? "bg-cinema-gradient text-white border-transparent animate-molten-glow"
                    : "bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                  }`}
              >
                All
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre.name)}
                  className={`px-5 py-2.5 rounded-full text-xs font-body font-bold uppercase tracking-wider
                    transition-all duration-300 border shrink-0 flex items-center gap-1.5
                    ${selectedGenre === genre.name
                      ? "bg-cinema-gradient text-white border-transparent animate-molten-glow"
                      : "bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                    }`}
                >
                  <span className="text-sm">{genre.emoji}</span>
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURED FILMS — Horizontal Spotlight Strip */}
      {/* ================================================================ */}
      {dataLoaded && featuredMovies.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="px-4 md:px-8 max-w-7xl mx-auto mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <GlowBadge variant="gold" size="sm" pulse className="mb-4">
                ★ Spotlight
              </GlowBadge>
              <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight">
                Featured <span className="text-gradient">Films</span>
              </h2>
              <p className="font-body text-white/30 max-w-xl mt-2 text-sm md:text-base">
                Curated selections that showcase the best of cinematic storytelling
                and the profound ideas behind them.
              </p>
            </motion.div>
          </div>

          {/* Horizontal scroll strip */}
          <div className="relative">
            {/* Gradient fades on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-cinema-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-cinema-black to-transparent z-10 pointer-events-none" />

            <div className="flex gap-6 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {featuredMovies.map((movie, i) => (
                <FeaturedSpotlightCard key={movie.id} movie={movie} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* ALL FILMS GRID — 3-Column Responsive Masonry */}
      {/* ================================================================ */}
      {dataLoaded && (
        <SpotlightHover>
          <section className="px-4 md:px-8 pb-24 md:pb-32 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <GlowBadge variant="burgundy" size="sm" className="mb-4">
                🎬 Browse All
              </GlowBadge>
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight">
                    All <span className="text-gradient">Films</span>
                  </h2>
                  <p className="font-body text-white/30 mt-2 text-sm md:text-base">
                    {selectedGenre
                      ? `${filteredMovies.length} film${filteredMovies.length !== 1 ? "s" : ""} in ${selectedGenre}`
                      : `${allMovies.length} films in the collection`}
                  </p>
                </div>
                <Link href="/discover">
                  <GradientButton variant="ghost" size="sm">
                    View Full Library →
                  </GradientButton>
                </Link>
              </div>
            </motion.div>

            {/* Grid */}
            {filteredMovies.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredMovies.map((movie, i) => (
                    <AllFilmsCard key={movie.id} movie={movie} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-5xl mb-4 opacity-20">🎬</div>
                <h3 className="font-display text-3xl text-white/40 mb-2">
                  No films in this genre
                </h3>
                <p className="font-body text-white/20 text-sm mb-6 max-w-md mx-auto">
                  Try selecting a different genre or check back later when more
                  films are submitted.
                </p>
                <button
                  onClick={() => handleGenreClick(null)}
                  className="px-6 py-2.5 rounded-xl bg-cinema-gradient text-white text-sm font-body font-bold"
                >
                  Show All Films
                </button>
              </motion.div>
            )}
          </section>
        </SpotlightHover>
      )}

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <p className="font-display text-4xl text-gradient mb-3 tracking-tight">Flicknest</p>
              <p className="font-body text-sm text-white/20 max-w-sm leading-relaxed">
                A community-powered film discovery platform. Every film comes with
                the deeper meaning behind the story — because great cinema deserves
                great conversation.
              </p>
            </div>

            {/* Explore */}
            <div>
              <p className="font-body text-[10px] text-white/30 uppercase tracking-[0.25em] mb-5">Explore</p>
              <div className="flex flex-col gap-3">
                <Link href="/discover" className="font-body text-sm text-white/40 hover:text-gold transition-colors duration-300">
                  Discover Films
                </Link>
                <Link href="/watchlist" className="font-body text-sm text-white/40 hover:text-gold transition-colors duration-300">
                  Watchlist
                </Link>
                <Link href="/submit" className="font-body text-sm text-white/40 hover:text-gold transition-colors duration-300">
                  Submit a Film
                </Link>
                <Link href="/discover?sortBy=upvotes" className="font-body text-sm text-white/40 hover:text-gold transition-colors duration-300">
                  Trending
                </Link>
              </div>
            </div>

            {/* Stack */}
            <div>
              <p className="font-body text-[10px] text-white/30 uppercase tracking-[0.25em] mb-5">Built With</p>
              <div className="flex flex-wrap gap-2">
                {["Next.js 14", "Supabase", "Framer Motion", "Tailwind CSS", "TypeScript"].map((tech) => (
                  <span key={tech}
                    className="px-3 py-1.5 text-[11px] font-body bg-white/[0.03] rounded-full text-white/25 border border-white/[0.06]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.03] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-[11px] text-white/15">
              &copy; {new Date().getFullYear()} Flicknest. Every Film Has a Story Worth Telling.
            </p>
            <p className="font-body text-[11px] text-white/10">
              Curated with ❤️ by the community
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
