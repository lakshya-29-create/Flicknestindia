"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { type SpotlightHoverProps } from "@/types";

export default function SpotlightHover({
  children,
  className = "",
  spotlightSize = 250,
  spotlightOpacity = 0.15,
}: SpotlightHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Spotlight overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        animate={
          isHovered
            ? {
                background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, 
                  rgba(255, 215, 0, ${spotlightOpacity}), 
                  rgba(139, 0, 0, ${spotlightOpacity * 0.5}), 
                  transparent 70%)`,
              }
            : {
                background: "transparent",
              }
        }
        transition={{ duration: 0.15, ease: "linear" }}
      />

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
