"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Navigation Links
// ============================================================================

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "✦" },
  { href: "/discover", label: "Discover", icon: "🔍" },
  { href: "/watchlist", label: "Watchlist", icon: "★" },
  { href: "/submit", label: "Submit Film", icon: "🎬" },
];

// ============================================================================
// Floating Toggle Button (mobile)
// ============================================================================

function FloatingToggle({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 left-4 z-50 w-10 h-10 flex items-center justify-center
        rounded-xl bg-cinema-card/90 backdrop-blur-xl border border-white/10
        text-white/50 hover:text-gold hover:border-gold/30
        shadow-card transition-colors duration-300 md:hidden"
      title="Open navigation"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </motion.button>
  );
}

// ============================================================================
// Sidebar Component
// ============================================================================

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  // Auto-collapse on route change (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [pathname]);

  // Determine if sidebar is expanded
  const isExpanded = !collapsed || hovered;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Floating toggle button — visible on mobile when sidebar is collapsed */}
      <AnimatePresence>
        {collapsed && (
          <FloatingToggle onClick={() => setCollapsed(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{
          width: isExpanded ? 220 : 64,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="fixed left-0 top-0 bottom-0
          flex flex-col
          bg-cinema-card/90 backdrop-blur-xl
          border-r border-white/[0.06]
          overflow-hidden
          md:relative md:z-auto
          hidden md:flex"
      >
        {/* Toggle button */}
        <div className="flex items-center justify-end p-3">
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              bg-white/[0.04] border border-white/10
              text-white/40 hover:text-gold hover:border-gold/30
              transition-colors duration-300 shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.svg
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  collapsed
                    ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                    : "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                }
              />
            </motion.svg>
          </motion.button>
        </div>

        {/* Brand logo area */}
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded-brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 pb-4 border-b border-white/[0.04]"
            >
              <Link href="/" className="block">
                <p className="font-display text-2xl text-gradient tracking-tight leading-none">
                  Flicknest
                </p>
                <p className="font-body text-[9px] text-white/20 uppercase tracking-[0.2em] mt-0.5">
                  Cinema Redefined
                </p>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex justify-center pb-4 border-b border-white/[0.04]"
            >
              <Link href="/" className="block px-2">
                <span className="font-display text-xl text-gradient">F</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation links */}
        <div className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-300 group
                    ${isActive
                      ? "bg-cinema-gradient text-white"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gold" />
                  )}

                  {/* Icon */}
                  <span className="flex-shrink-0 w-6 text-center text-base">
                    {link.icon}
                  </span>

                  {/* Label */}
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className="font-body text-sm font-bold whitespace-nowrap"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Collapsed hint dot */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 pb-3"
            >
              <div className="flex justify-center">
                <div className="w-1 h-1 rounded-full bg-white/10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom gradient edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-cinema-card to-transparent pointer-events-none" />
      </motion.nav>

      {/* Mobile sidebar (off-screen when collapsed) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.nav
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[220px]
              flex flex-col
              bg-cinema-card/95 backdrop-blur-xl
              border-r border-white/[0.06]
              overflow-hidden md:hidden"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
              <Link href="/" className="block">
                <p className="font-display text-2xl text-gradient tracking-tight leading-none">
                  Flicknest
                </p>
              </Link>
              <motion.button
                onClick={() => setCollapsed(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                  bg-white/[0.04] border border-white/10
                  text-white/40 hover:text-gold hover:border-gold/30
                  transition-colors duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Mobile nav links */}
            <div className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link key={link.href} href={link.href} onClick={() => setCollapsed(true)}>
                    <div
                      className={`
                        relative flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-300
                        ${isActive
                          ? "bg-cinema-gradient text-white"
                          : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
                        }
                      `}
                    >
                      <span className="text-lg w-6 text-center">{link.icon}</span>
                      <span className="font-body text-sm font-bold">{link.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile footer */}
            <div className="px-4 py-3 border-t border-white/[0.04]">
              <p className="font-body text-[10px] text-white/20 text-center uppercase tracking-[0.15em]">
                Cinema Redefined
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
