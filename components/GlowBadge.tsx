"use client";

import { motion } from "framer-motion";
import { type GlowBadgeProps } from "@/types";

const variantStyles: Record<
  NonNullable<GlowBadgeProps["variant"]>,
  { bg: string; border: string; text: string; shadow: string }
> = {
  gold: {
    bg: "bg-gradient-to-r from-gold/20 to-amber-500/10",
    border: "border-gold/30",
    text: "text-gold",
    shadow: "shadow-glow",
  },
  burgundy: {
    bg: "bg-gradient-to-r from-burgundy/20 to-rose-900/10",
    border: "border-burgundy/30",
    text: "text-burgundy-light",
    shadow: "shadow-[0_0_15px_rgba(139,0,0,0.2)]",
  },
  ember: {
    bg: "bg-gradient-to-r from-ember/20 to-orange-600/10",
    border: "border-ember/30",
    text: "text-ember",
    shadow: "shadow-[0_0_15px_rgba(255,107,0,0.2)]",
  },
  gradient: {
    bg: "bg-cinema-gradient-subtle",
    border: "border-gold/20",
    text: "text-gradient-gold",
    shadow: "shadow-glow",
  },
};

const sizeStyles: Record<
  NonNullable<GlowBadgeProps["size"]>,
  string
> = {
  sm: "px-2.5 py-0.5 text-[10px] tracking-widest",
  md: "px-3.5 py-1 text-xs tracking-widest",
  lg: "px-5 py-1.5 text-sm tracking-wider",
};

export default function GlowBadge({
  children,
  variant = "gradient",
  size = "md",
  className = "",
  pulse = false,
}: GlowBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center justify-center font-body font-bold uppercase
        rounded-full border backdrop-blur-sm
        ${styles.bg} ${styles.border} ${styles.text}
        ${sizeStyles[size]}
        ${pulse ? "animate-glow-pulse" : ""}
        ${className}
      `}
      style={pulse ? { boxShadow: "0 0 20px rgba(255,215,0,0.15)" } : undefined}
    >
      {children}
    </motion.span>
  );
}
