"use client";

import { motion } from "framer-motion";
import { type AnimatedBorderProps } from "@/types";

const speedMap = {
  slow: 6,
  normal: 3,
  fast: 1.5,
};

export default function AnimatedBorder({
  children,
  className = "",
  speed = "normal",
  borderRadius = "1rem",
}: AnimatedBorderProps) {
  const duration = speedMap[speed];

  return (
    <div
      className={`relative group ${className}`}
      style={{ borderRadius }}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          borderRadius,
          padding: "1.5px",
          background:
            "linear-gradient(135deg, #8B0000, #FFD700, #FF6B00, #FFD700, #8B0000)",
          backgroundSize: "300% 300%",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 -z-20 opacity-50 blur-xl"
        style={{
          borderRadius,
          background:
            "linear-gradient(135deg, rgba(139,0,0,0.3), rgba(255,215,0,0.2), rgba(255,107,0,0.3))",
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner content */}
      <div
        className="relative bg-cinema-card rounded-[calc(1rem-1.5px)] overflow-hidden"
        style={{ borderRadius: `calc(${borderRadius} - 1.5px)` }}
      >
        {children}
      </div>
    </div>
  );
}
