"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MovieRow } from "@/lib/supabase";
import GlowBadge from "./GlowBadge";

interface DiscoverCardProps {
  movie: MovieRow;
  onUpvote: (id: string) => void;
  isUpvoting?: boolean;
}

export default function DiscoverCard({
  movie,
  onUpvote,
  isUpvoting = false,
}: DiscoverCardProps) {
  const [showInsight, setShowInsight] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showImage = !!movie.poster_url && !imgError;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-cinema-card 
        border border-white/[0.06] shadow-card cursor-pointer
        transition-shadow duration-500 hover:shadow-glow"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-cinema-gradient-subtle opacity-0 
        group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
          transition-transform duration-1000 ease-in-out z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
        }}
      />

      <div className="relative z-0">
        {/* Poster section */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <div className="absolute inset-0 bg-cinema-dark animate-pulse" />
          {showImage ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 
                group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center 
              bg-gradient-to-br from-burgundy/20 to-gold/10">
              <span className="font-display text-7xl text-white/10">
                {movie.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Gradient fade to bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/40 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
            {movie.is_featured && (
              <GlowBadge variant="gradient" size="sm" pulse>
                ✦ Featured
              </GlowBadge>
            )}
            {movie.release_year && (
              <span className="px-2.5 py-0.5 rounded-lg bg-cinema-black/80 
                backdrop-blur-sm border border-white/10 text-white/60 text-xs font-body">
                {movie.release_year}
              </span>
            )}
          </div>

          {/* Genre badge */}
          <div className="absolute bottom-3 left-3 z-30">
            <span className="px-3 py-1 text-xs font-body font-bold 
              bg-white/5 rounded-full text-white/70 border border-white/10 
              backdrop-blur-sm">
              {movie.genre}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4 space-y-3">
          {/* Title + upvote row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl text-white leading-tight
              group-hover:text-gradient transition-all duration-300">
              {movie.title}
            </h3>

            {/* Upvote button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onUpvote(movie.id);
              }}
              disabled={isUpvoting}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2
                rounded-xl bg-white/5 border border-white/10 
                hover:bg-gold/10 hover:border-gold/30
                transition-all duration-300 group/upvote"
            >
              <motion.span
                className="text-lg leading-none"
                animate={isUpvoting ? { y: -4, opacity: 0.5 } : { y: 0, opacity: 1 }}
              >
                ▲
              </motion.span>
              <span className="text-xs font-body font-bold text-white/60 
                group-hover/upvote:text-gold transition-colors">
                {movie.upvotes}
              </span>
            </motion.button>
          </div>

          {/* Description */}
          <p className="text-sm text-white/40 font-body leading-relaxed line-clamp-2">
            {movie.description}
          </p>

          {/* Submitted by */}
          {movie.submitted_by && (
            <p className="text-xs text-white/20 font-body">
              Submitted by <span className="text-white/40">{movie.submitted_by}</span>
            </p>
          )}

          {/* What It Means — ted-talk insight */}
          <div className="pt-1">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setShowInsight(!showInsight);
              }}
              className="flex items-center gap-2 text-xs font-body font-bold 
                text-gold/70 hover:text-gold transition-colors"
            >
              <span className="w-4 h-[1px] bg-gold/30" />
              {showInsight ? "Hide Insight" : "What It Really Means"}
              <motion.span
                animate={{ rotate: showInsight ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▾
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showInsight && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 rounded-xl bg-gradient-to-br 
                    from-gold/5 via-burgundy/[0.02] to-ember/5 
                    border border-gold/10 relative">
                    {/* Decorative quote mark */}
                    <span className="absolute -top-1 left-2 text-4xl text-gold/10 
                      font-display leading-none">
                      &ldquo;
                    </span>
                    <p className="text-sm text-white/60 font-body leading-relaxed italic relative z-10">
                      {movie.what_it_means}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Animated gradient border on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
            transition-opacity duration-500 pointer-events-none"
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
      </div>
    </motion.div>
  );
}
