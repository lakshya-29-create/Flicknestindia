"use client";

import { motion } from "framer-motion";
import { type CinemaCardProps } from "@/types";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function CinemaCard({
  movie,
  variant = "poster",
}: CinemaCardProps) {
  const isLandscape = variant === "landscape";
  const isCompact = variant === "compact";

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className={`
        group relative overflow-hidden rounded-2xl bg-cinema-card
        border border-white/[0.06] shadow-card cursor-pointer
        transition-shadow duration-500 hover:shadow-glow
        ${isLandscape ? "flex" : ""}
        ${isCompact ? "w-48" : "w-full"}
      `}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-cinema-gradient-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
          transition-transform duration-1000 ease-in-out z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
        }}
      />

      {/* Poster image container */}
      <div
        className={`
          relative overflow-hidden
          ${isLandscape ? "w-2/5 flex-shrink-0" : "w-full"}
          ${isCompact ? "h-64" : "aspect-[2/3]"}
        `}
      >
        <div className="absolute inset-0 bg-cinema-dark animate-pulse" />
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 
              group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-burgundy/20 to-gold/10">
            <span className="font-display text-6xl text-white/10">
              {movie.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Upvote badge */}
        <div
          className="absolute top-3 left-3 z-30 flex items-center gap-1 px-2.5 py-1 
          rounded-lg bg-cinema-black/80 backdrop-blur-sm border border-gold/20"
        >
          <span className="text-gold text-sm leading-none">▲</span>
          <span className="text-white text-xs font-bold font-body">
            {movie.upvotes}
          </span>
        </div>

        {/* Year badge */}
        {movie.release_year && (
          <div
            className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-lg 
            bg-cinema-black/80 backdrop-blur-sm border border-white/10"
          >
            <span className="text-white/70 text-xs font-body">
              {movie.release_year}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`
          p-4 flex flex-col
          ${isLandscape ? "w-3/5 justify-center" : ""}
          ${isCompact ? "p-3" : ""}
        `}
      >
        <h3
          className={`
            font-display text-white leading-tight
            ${isCompact ? "text-lg" : "text-2xl"}
            ${isLandscape ? "text-3xl" : ""}
            group-hover:text-gradient transition-all duration-300
          `}
        >
          {movie.title}
        </h3>

        {!isCompact && (
          <>
            <div className="flex flex-wrap gap-2 mt-2">
              {movie.genre.split(', ').slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 text-xs font-body font-bold 
                    bg-white/5 rounded-full text-white/60 border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>

            <p className="mt-2 text-sm text-white/40 font-body line-clamp-2 leading-relaxed">
              {movie.description}
            </p>

            <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-white/30 font-body">
              {movie.submitted_by && <span>By {movie.submitted_by}</span>}
              {movie.is_featured && <span className="text-gold/60">✦ Featured</span>}
            </div>
          </>
        )}
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
    </motion.div>
  );
}
