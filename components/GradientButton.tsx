"use client";

import { motion } from "framer-motion";
import { type GradientButtonProps } from "@/types";

const variantStyles = {
  primary: {
    base: "bg-cinema-gradient text-white shadow-glow",
    hover: {
      background:
        "linear-gradient(135deg, #a52a2a 0%, #FFD700 50%, #ff8c38 100%)",
    },
  },
  secondary: {
    base: "bg-white/5 text-white border border-white/10 backdrop-blur-sm hover:shadow-glow",
    hover: {
      background:
        "linear-gradient(135deg, rgba(139,0,0,0.4) 0%, rgba(255,215,0,0.2) 50%, rgba(255,107,0,0.3) 100%)",
    },
  },
  ghost: {
    base: "text-white/70 hover:text-white",
    hover: {
      background: "rgba(255,255,255,0.05)",
    },
  },
};

const sizeStyles = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-8 py-3.5 text-base gap-2.5",
};

export default function GradientButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
}: GradientButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03, y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={`
        relative inline-flex items-center justify-center font-body font-bold
        rounded-xl overflow-hidden transition-all duration-300
        ${styles.base}
        ${sizeStyles[size]}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Gradient border glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 
        transition-opacity duration-500"
        style={{
          padding: "1px",
          background:
            "linear-gradient(135deg, #8B0000, #FFD700, #FF6B00)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
