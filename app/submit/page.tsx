"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import confetti from "canvas-confetti";
import GlowBadge from "@/components/GlowBadge";
import GradientButton from "@/components/GradientButton";
import { getGenres } from "@/lib/api";
import type { GenreRow } from "@/lib/supabase";

// ============================================================================
// Zod Schema
// ============================================================================

const submitSchema = z.object({
  title: z
    .string()
    .min(1, "Film title is required")
    .max(120, "Title must be 120 characters or less"),
  genre: z
    .string()
    .min(1, "Genre is required"),
  description: z
    .string()
    .max(300, "Description must be 300 characters or less")
    .optional()
    .or(z.literal("")),
  what_it_means: z
    .string()
    .max(600, "Insight must be 600 characters or less")
    .optional()
    .or(z.literal("")),
  submitted_by: z
    .string()
    .optional()
    .or(z.literal("")),
  release_year: z
    .union([z.number().int().min(1888).max(2030), z.literal("")])
    .optional(),
  poster_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  trailer_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type SubmitFormData = z.infer<typeof submitSchema>;

// ============================================================================
// Ember Particles
// ============================================================================

function EmberParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full"
        style={{ background: "radial-gradient(circle at 30% 40%, rgba(139,0,0,0.25) 0%, rgba(139,0,0,0.1) 40%, transparent 70%)" }}
        animate={{ x: [0, 60, -30, 80, 0], y: [0, -50, 40, -20, 0], scale: [1, 1.15, 0.95, 1.1, 1], opacity: [0.15, 0.25, 0.18, 0.22, 0.15] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-20 w-[45rem] h-[45rem] rounded-full"
        style={{ background: "radial-gradient(circle at 70% 60%, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.08) 35%, transparent 65%)" }}
        animate={{ x: [0, -40, 50, -20, 0], y: [0, 30, -60, 20, 0], scale: [1, 0.9, 1.1, 1.05, 1], opacity: [0.12, 0.2, 0.15, 0.18, 0.12] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-[25rem] h-[25rem] rounded-full"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,107,0,0.15) 0%, rgba(255,107,0,0.05) 30%, transparent 60%)" }}
        animate={{ x: [0, 30, -20, 40, 0], y: [0, -30, 20, -40, 0], scale: [1, 1.1, 0.95, 1.05, 1], opacity: [0.1, 0.18, 0.12, 0.15, 0.1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 left-3/4 w-[15rem] h-[15rem] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 60%, rgba(139,0,0,0.12) 0%, rgba(255,215,0,0.06) 25%, transparent 50%)" }}
        animate={{ x: [0, -20, 15, -10, 0], y: [0, 15, -10, 5, 0], scale: [1, 1.08, 0.97, 1.03, 1], opacity: [0.08, 0.14, 0.1, 0.12, 0.08] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ============================================================================
// Focus Glow Input — burgundy→gold animated gradient border on focus
// ============================================================================

function FocusGlowInput({
  label,
  register,
  error,
  placeholder,
  type = "text",
  maxLength,
  large = false,
  watchValue = "",
}: {
  label: string;
  register: any;
  error?: string;
  placeholder: string;
  type?: string;
  maxLength?: number;
  large?: boolean;
  watchValue?: string;
}) {
  return (
    <div className="relative group">
      <motion.label
        initial={false}
        animate={{
          y: watchValue ? (large ? -24 : -20) : 0,
          scale: watchValue ? 0.8 : 1,
          color: watchValue ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.3)",
        }}
        className={`absolute left-4 pointer-events-none origin-left z-10
          ${large ? "top-5 text-xl" : "top-3.5 text-sm"} font-body`}
      >
        {label}{error && <span className="text-ember ml-1">*</span>}
      </motion.label>
      <input
        {...register}
        type={type}
        placeholder={watchValue ? "" : placeholder}
        className={`w-full bg-cinema-card rounded-xl text-white font-body
          placeholder:text-transparent outline-none
          transition-all duration-500
          ${large ? "px-5 pt-7 pb-4 text-2xl font-display tracking-tight" : "px-4 pt-5 pb-2.5 text-sm"}
          ${error
            ? "border border-ember/50 focus:border-ember"
            : "border border-white/10 focus:border-transparent"
          }
          focus:ring-0`}
        style={{
          // Animated gradient border on focus via box-shadow
          boxShadow: error
            ? "0 0 0 1px rgba(255,107,0,0.5)"
            : "0 0 0 1px rgba(255,255,255,0.1)",
          transition: "box-shadow 0.3s ease",
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.boxShadow =
              "0 0 0 1.5px #8B0000, 0 0 12px rgba(139,0,0,0.2), 0 0 24px rgba(255,215,0,0.08)";
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.1)";
          }
        }}
      />
      <div className="flex items-center justify-between mt-1">
        {error && <p className="text-[11px] text-ember/80 font-body">{error}</p>}
        {maxLength && (
          <p className={`text-[10px] font-body ml-auto ${watchValue.length > maxLength * 0.9 ? "text-ember/60" : "text-white/20"}`}>
            {watchValue.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

function FocusGlowTextarea({
  label,
  register,
  error,
  placeholder,
  maxLength,
  rows = 4,
  gold = false,
  watchValue = "",
}: {
  label: string;
  register: any;
  error?: string;
  placeholder: string;
  maxLength?: number;
  rows?: number;
  gold?: boolean;
  watchValue?: string;
}) {
  return (
    <div className="relative group">
      <motion.label
        initial={false}
        animate={{
          y: watchValue ? -18 : 0,
          scale: watchValue ? 0.8 : 1,
          color: watchValue ? (gold ? "rgba(255,215,0,0.7)" : "rgba(255,255,255,0.3)") : "rgba(255,255,255,0.3)",
        }}
        className="absolute left-4 top-3 font-body text-sm pointer-events-none origin-left z-10"
      >
        {label} {gold && <span className="text-gold/60">✦</span>}
      </motion.label>
      <textarea
        {...register}
        placeholder={watchValue ? "" : placeholder}
        rows={rows}
        className={`w-full px-4 pt-6 pb-2.5 bg-cinema-card rounded-xl text-white font-body text-sm
          placeholder:text-transparent outline-none resize-none transition-all duration-500
          ${error ? "border border-ember/50" : gold ? "border border-gold/20" : "border border-white/10"}
          focus:ring-0`}
        style={{
          boxShadow: error
            ? "0 0 0 1px rgba(255,107,0,0.5)"
            : gold
              ? "0 0 0 1px rgba(255,215,0,0.2)"
              : "0 0 0 1px rgba(255,255,255,0.1)",
          transition: "box-shadow 0.3s ease",
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.boxShadow =
              "0 0 0 1.5px #8B0000, 0 0 12px rgba(139,0,0,0.2), 0 0 24px rgba(255,215,0,0.08)";
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.boxShadow = gold
              ? "0 0 0 1px rgba(255,215,0,0.2)"
              : "0 0 0 1px rgba(255,255,255,0.1)";
          }
        }}
      />
      <div className="flex items-center justify-between mt-1">
        {error && <p className="text-[11px] text-ember/80 font-body">{error}</p>}
        {maxLength && (
          <p className={`text-[10px] font-body ml-auto ${watchValue.length > maxLength * 0.9 ? "text-ember/60" : "text-white/20"}`}>
            {watchValue.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Genre Dropdown
// ============================================================================

function GenreDropdown({
  genres,
  value,
  onChange,
  error,
}: {
  genres: GenreRow[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = genres.find((g) => g.name === value);

  return (
    <div className="relative">
      <p className="font-body text-xs text-white/30 uppercase tracking-[0.15em] mb-2">
        Genre <span className="text-burgundy-light">*</span>
      </p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-cinema-card rounded-xl text-white font-body text-sm
          transition-all duration-300 outline-none hover:border-white/20
          ${error ? "border border-ember/50" : "border border-white/10"}`}
        style={{
          boxShadow: error ? "0 0 0 1px rgba(255,107,0,0.5)" : "0 0 0 1px rgba(255,255,255,0.1)",
          transition: "box-shadow 0.3s ease",
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.boxShadow =
              "0 0 0 1.5px #8B0000, 0 0 12px rgba(139,0,0,0.2), 0 0 24px rgba(255,215,0,0.08)";
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.1)";
          }
        }}
      >
        {selected ? (
          <>
            <span className="text-lg">{selected.emoji}</span>
            <span className="flex-1 text-left">{selected.name}</span>
          </>
        ) : (
          <span className="text-white/30 flex-1 text-left">Select a genre...</span>
        )}
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-white/30"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      {error && <p className="text-[11px] text-ember/80 font-body mt-1">{error}</p>}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-20 mt-2 w-full rounded-xl bg-cinema-surface border border-white/10 shadow-2xl overflow-hidden"
            style={{ transformOrigin: "top" }}
          >
            <div className="max-h-56 overflow-y-auto py-2">
              {genres.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { onChange(g.name); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body transition-colors
                    ${value === g.name ? "bg-gold/10 text-gold" : "text-white/60 hover:bg-white/[0.04] hover:text-white"}`}
                >
                  <span className="text-lg">{g.emoji}</span>
                  <span>{g.name}</span>
                  {value === g.name && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-gold">✓</motion.span>
                  )}
                </button>
              ))}
              <div className="border-t border-white/5 mt-2 pt-2 px-4">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Or type a custom genre..."
                  className="w-full bg-transparent text-sm text-white/70 placeholder:text-white/20 focus:outline-none py-2"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Live Preview
// ============================================================================

function LivePreview({
  title,
  genre,
  description,
  whatItMeans,
  submittedBy,
  releaseYear,
  posterUrl,
  trailerUrl,
  genres,
}: {
  title: string;
  genre: string;
  description: string;
  whatItMeans: string;
  submittedBy: string;
  releaseYear: number | "";
  posterUrl: string;
  trailerUrl: string;
  genres: GenreRow[];
}) {
  const hasContent = title || genre || description || whatItMeans || posterUrl || trailerUrl;
  const genreObj = genres.find((g) => g.name === genre);
  const emoji = genreObj?.emoji || "🎬";

  // Extract YouTube embed ID
  const youtubeId = trailerUrl
    ? trailerUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )?.[1]
    : null;

  return (
    <div className="sticky top-24 space-y-6">
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="font-body text-[10px] text-white/30 uppercase tracking-[0.25em] mb-4">Live Preview</p>

        <AnimatePresence mode="wait">
          {hasContent ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group relative overflow-hidden rounded-2xl bg-cinema-card border border-white/[0.06] shadow-card"
            >
              {/* Poster area */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-burgundy/20 via-cinema-dark to-gold/10 flex items-center justify-center overflow-hidden">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={title || "Poster preview"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span className="font-display text-8xl text-white/10 select-none">
                    {title ? title.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-card/60 to-transparent" />
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="px-3 py-1 text-xs font-body font-bold bg-white/5 rounded-full text-white/70 border border-white/10 backdrop-blur-sm">
                    {emoji} {genre || "Genre"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-xl text-white leading-tight line-clamp-1">{title || "Your Film Title"}</h3>
                  {releaseYear && (
                    <span className="flex-shrink-0 text-[11px] text-white/40 font-body bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">{releaseYear}</span>
                  )}
                </div>
                <p className="text-sm text-white/40 font-body leading-relaxed line-clamp-2">{description || "A brief synopsis will appear here..."}</p>
                <div className="pt-1">
                  <p className="text-xs text-gold/50 font-body italic line-clamp-2 border-l-2 border-gold/20 pl-3">
                    {whatItMeans ? `"${whatItMeans}"` : '"The deeper meaning behind the story..."'}
                  </p>
                </div>
                {submittedBy && <p className="text-[11px] text-white/20 font-body pt-1">Curated by <span className="text-white/40">{submittedBy}</span></p>}
              </div>

              {/* Trailer embed preview */}
              {youtubeId && (
                <div className="border-t border-white/[0.04]">
                  <div className="relative aspect-video bg-cinema-dark">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Trailer preview"
                    />
                  </div>
                </div>
              )}

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
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 px-6 rounded-2xl bg-cinema-card border border-white/[0.06] border-dashed"
            >
              <div className="text-4xl mb-3 opacity-20">🎬</div>
              <p className="font-body text-sm text-white/20">Start filling out the form to preview your submission</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Cinematic Success Overlay
// ============================================================================

function CinematicSuccessOverlay({ onReset }: { onReset: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fire confetti on mount
  useEffect(() => {
    const burst = () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FF6B00", "#8B0000", "#FFE44D"],
        startVelocity: 30,
        gravity: 0.6,
        ticks: 200,
      });
      confetti({
        particleCount: 60,
        spread: 120,
        origin: { y: 0.4, x: 0.3 },
        colors: ["#FFD700", "#FFE44D"],
        startVelocity: 20,
        gravity: 0.4,
        ticks: 300,
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5, x: 0.7 },
          colors: ["#FFD700", "#8B0000"],
          startVelocity: 25,
          gravity: 0.5,
          ticks: 250,
        });
      }, 300);
    };
    burst();
  }, []);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      {/* Dark curtain */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 bg-cinema-black origin-top"
      />

      {/* Spotlight effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem]"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.08) 0%, rgba(139,0,0,0.03) 30%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 text-center max-w-xl mx-auto px-4"
      >
        {/* Animated film reel checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.8, type: "spring", stiffness: 80, damping: 10 }}
          className="text-7xl mb-6 inline-block"
        >
          <motion.span
            className="inline-block"
            animate={{
              filter: [
                "drop-shadow(0 0 10px rgba(255,215,0,0.3))",
                "drop-shadow(0 0 30px rgba(255,215,0,0.6))",
                "drop-shadow(0 0 10px rgba(255,215,0,0.3))",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🎬✓
          </motion.span>
        </motion.div>

        <GlowBadge variant="gradient" size="lg" pulse className="mb-4">
          ✦ Submitted
        </GlowBadge>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="font-display text-5xl md:text-7xl text-white mb-4 tracking-tight"
        >
          Your film has{" "}
          <span className="text-gradient">found its nest.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="font-body text-white/40 max-w-md mx-auto leading-relaxed mb-8"
        >
          The community can now discover, upvote, and reflect on the deeper
          meaning you&apos;ve shared. Every film has a story worth telling.
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="h-[1px] bg-gold/30 mx-auto mb-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/discover">
            <GradientButton variant="primary" size="lg">✦ Browse the Collection</GradientButton>
          </Link>
          <button onClick={onReset}>
            <GradientButton variant="ghost" size="lg">Submit Another</GradientButton>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// whileInView staggered wrapper
// ============================================================================

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

function AnimatedSection({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Main Submit Page
// ============================================================================

export default function SubmitPage() {
  // ─── Genres ───────────────────────────────────────────────────────────────
  const [genres, setGenres] = useState<GenreRow[]>([]);
  useEffect(() => {
    let cancelled = false;
    getGenres().then((data) => { if (!cancelled) setGenres(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // ─── Success state ───────────────────────────────────────────────────────
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ─── react-hook-form + Zod ───────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      title: "",
      genre: "",
      description: "",
      what_it_means: "",
      submitted_by: "",
      release_year: "",
      poster_url: "",
      trailer_url: "",
    },
  });

  const watchAll = watch();
  const watchTitle = watch("title") || "";
  const watchGenre = watch("genre") || "";
  const watchDescription = watch("description") || "";
  const watchWhatItMeans = watch("what_it_means") || "";
  const watchSubmittedBy = watch("submitted_by") || "";
  const watchPosterUrl = watch("poster_url") || "";
  const watchTrailerUrl = watch("trailer_url") || "";
  const watchReleaseYear = watch("release_year");

  // ─── Submit handler — POST to /api/movies ────────────────────────────────
  const onSubmit = useCallback(async (data: SubmitFormData) => {
    setSubmitError(null);
    try {
      const payload = {
        title: data.title.trim(),
        genre: data.genre.trim(),
        description: data.description?.trim() || "",
        what_it_means: data.what_it_means?.trim() || "",
        submitted_by: data.submitted_by?.trim() || "Anonymous",
        poster_url: data.poster_url?.trim() || "",
        trailer_url: data.trailer_url?.trim() || "",
        release_year: data.release_year || null,
      };

      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit film");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, []);

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setSubmitError(null);
    reset();
  }, [reset]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-cinema-black">
        <CinematicSuccessOverlay onReset={resetForm} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-black overflow-x-hidden">
      <EmberParticles />

      <div className="relative z-10">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/" className="inline-block mb-6">
              <GlowBadge variant="gradient" size="sm" pulse>✦ Flicknest</GlowBadge>
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl md:text-8xl text-white leading-none mb-4 tracking-tight"
          >
            Submit a Film{" "}
            <span className="text-gradient block mt-[-0.05em]">Worth Talking About</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Share a film that moved you — and tell the world what it <em>really</em> means.
          </motion.p>
        </section>

        {/* ── Form + Preview ──────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form column (3/5) */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Essential Info */}
                <AnimatedSection index={0} className="p-6 md:p-8 rounded-2xl bg-cinema-card/80 backdrop-blur-sm border border-white/[0.06] space-y-5">
                  <p className="font-body text-[10px] text-gold/50 uppercase tracking-[0.25em]">Essential Info</p>

                  <FocusGlowInput
                    label="Film Title"
                    register={register("title")}
                    error={errors.title?.message}
                    placeholder="e.g. Midnight in Paradise"
                    required
                    maxLength={120}
                    large
                    watchValue={watchTitle}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GenreDropdown
                      genres={genres}
                      value={watchGenre}
                      onChange={(v) => setValue("genre", v, { shouldValidate: true })}
                      error={errors.genre?.message}
                    />
                    <FocusGlowInput
                      label="Release Year"
                      register={register("release_year", { setValueAs: (v) => (v === "" ? "" : parseInt(v) || "") })}
                      error={errors.release_year?.message}
                      placeholder="e.g. 2024"
                      type="number"
                      watchValue={watchReleaseYear?.toString() || ""}
                    />
                  </div>
                </AnimatedSection>

                {/* Poster URL */}
                <AnimatedSection index={1} className="p-6 md:p-8 rounded-2xl bg-cinema-card/80 backdrop-blur-sm border border-white/[0.06] space-y-5">
                  <p className="font-body text-[10px] text-gold/50 uppercase tracking-[0.25em]">Media</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FocusGlowInput
                      label="Poster Image URL"
                      register={register("poster_url")}
                      error={errors.poster_url?.message}
                      placeholder="https://example.com/poster.jpg"
                      type="url"
                      watchValue={watchPosterUrl}
                    />
                    <FocusGlowInput
                      label="Trailer URL (YouTube)"
                      register={register("trailer_url")}
                      error={errors.trailer_url?.message}
                      placeholder="https://youtube.com/watch?v=..."
                      type="url"
                      watchValue={watchTrailerUrl}
                    />
                  </div>

                  {/* Poster live preview thumbnail */}
                  <AnimatePresence>
                    {watchPosterUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-xl"
                      >
                        <div className="relative aspect-[16/9] bg-cinema-dark rounded-xl overflow-hidden">
                          <img
                            src={watchPosterUrl}
                            alt="Poster preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23111' width='400' height='225'/%3E%3Ctext x='200' y='112' text-anchor='middle' fill='%23666' font-size='14' font-family='sans-serif'%3EInvalid image URL%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-white/20 font-body mt-1 text-center">Poster preview</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AnimatedSection>

                {/* The Story */}
                <AnimatedSection index={2} className="p-6 md:p-8 rounded-2xl bg-cinema-card/80 backdrop-blur-sm border border-white/[0.06] space-y-5">
                  <p className="font-body text-[10px] text-gold/50 uppercase tracking-[0.25em]">The Story</p>
                  <FocusGlowTextarea
                    label="Description"
                    register={register("description")}
                    error={errors.description?.message}
                    placeholder="What is the film about? (max 300 characters)"
                    maxLength={300}
                    rows={3}
                    watchValue={watchDescription}
                  />
                </AnimatedSection>

                {/* The Deeper Meaning — TED-talk Insight */}
                <AnimatedSection index={3} className="relative p-6 md:p-8 rounded-2xl bg-cinema-card/80 backdrop-blur-sm border border-gold/15 space-y-5 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                  <span className="absolute -top-4 left-6 text-9xl text-gold/[0.04] font-display leading-none select-none pointer-events-none">&ldquo;</span>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-[1px] bg-gold/40" />
                      <span className="font-body text-[10px] text-gold/60 uppercase tracking-[0.25em]">The Deeper Meaning</span>
                      <GlowBadge variant="gold" size="sm" pulse className="ml-1">✦ TED Talk Style</GlowBadge>
                    </div>
                    <p className="font-body text-sm text-white/40 leading-relaxed mb-4">
                      What is the <em>deeper theme</em> or <em>hidden message</em>? What does it reveal about life, humanity, or the world?
                    </p>
                    <FocusGlowTextarea
                      label="What It Really Means"
                      register={register("what_it_means")}
                      error={errors.what_it_means?.message}
                      placeholder="Beneath the surface, this film reveals that..."
                      maxLength={600}
                      rows={5}
                      gold
                      watchValue={watchWhatItMeans}
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Questions a societal norm", "Explores human nature", "Hidden philosophical theme", "Personal transformation"].map((hint) => (
                        <button
                          key={hint}
                          type="button"
                          onClick={() => {
                            const current = watchWhatItMeans;
                            const next = current
                              ? current + (current.endsWith(".") ? " " : ". ") + hint
                              : hint;
                            setValue("what_it_means", next, { shouldValidate: true });
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-body bg-gold/[0.04] border border-gold/10 text-gold/50 hover:bg-gold/10 hover:text-gold/70 transition-all duration-300"
                        >
                          + {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>

                {/* Extras */}
                <AnimatedSection index={4} className="p-6 md:p-8 rounded-2xl bg-cinema-card/80 backdrop-blur-sm border border-white/[0.06] space-y-5">
                  <p className="font-body text-[10px] text-gold/50 uppercase tracking-[0.25em]">Extras</p>
                  <FocusGlowInput
                    label="Your Name"
                    register={register("submitted_by")}
                    error={errors.submitted_by?.message}
                    placeholder="e.g. Elena Vasquez"
                    watchValue={watchSubmittedBy}
                  />
                </AnimatedSection>

                {/* Submit */}
                <AnimatedSection index={5}>
                  <AnimatePresence>
                    {submitError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="text-ember text-sm font-body bg-ember/10 border border-ember/20 rounded-xl px-4 py-3 mb-4"
                      >
                        {submitError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center justify-between">
                    <Link href="/" className="font-body text-xs text-white/30 hover:text-white/50 transition-colors flex items-center gap-1">
                      <span>←</span> Back
                    </Link>
                    <GradientButton type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">✦ Publish to Flicknest</span>
                      )}
                    </GradientButton>
                  </div>
                </AnimatedSection>
              </form>
            </div>

            {/* Preview column (2/5) */}
            <div className="hidden lg:block lg:col-span-2">
              <LivePreview
                title={watchTitle}
                genre={watchGenre}
                description={watchDescription}
                whatItMeans={watchWhatItMeans}
                submittedBy={watchSubmittedBy}
                releaseYear={watchReleaseYear as number | ""}
                posterUrl={watchPosterUrl}
                trailerUrl={watchTrailerUrl}
                genres={genres}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="font-display text-2xl text-gradient mb-1">Flicknest</p>
            <p className="font-body text-sm text-white/20">Every film has a story worth telling</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
