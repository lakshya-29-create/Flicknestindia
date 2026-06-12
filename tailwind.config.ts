import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          black: "#070707",
          dark: "#0a0a0a",
          card: "#111111",
          surface: "#1a1a1a",
          border: "#2a2a2a",
        },
        burgundy: {
          DEFAULT: "#8B0000",
          light: "#a52a2a",
          dark: "#5c0000",
        },
        gold: {
          DEFAULT: "#FFD700",
          light: "#ffe44d",
          dark: "#b8960c",
        },
        ember: {
          DEFAULT: "#FF6B00",
          light: "#ff8c38",
          dark: "#cc5500",
        },
        accent: {
          gradient: {
            start: "#8B0000",
            mid: "#FFD700",
            end: "#FF6B00",
          },
        },
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["Lato", "sans-serif"],
      },
      backgroundImage: {
        "cinema-gradient":
          "linear-gradient(135deg, #8B0000 0%, #FFD700 50%, #FF6B00 100%)",
        "cinema-gradient-subtle":
          "linear-gradient(135deg, rgba(139,0,0,0.3) 0%, rgba(255,215,0,0.15) 50%, rgba(255,107,0,0.2) 100%)",
        "card-gradient":
          "linear-gradient(180deg, rgba(26,26,26,0.8) 0%, rgba(17,17,17,0.95) 100%)",
        "glow-gradient":
          "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.15) 0%, transparent 70%)",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
        "border-dance": "border-dance 3s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "film-grain": "film-grain 0.8s steps(4) infinite",
        "molten-glow": "molten-glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "film-grain": {
          "0%, 100%": { transform: "translate(0, 0) scale(1.5)" },
          "25%": { transform: "translate(-5%, -8%) scale(1.5)" },
          "50%": { transform: "translate(-12%, 4%) scale(1.5)" },
          "75%": { transform: "translate(6%, -12%) scale(1.5)" },
        },
        "molten-glow": {
          "0%": { boxShadow: "0 0 6px rgba(255,215,0,0.3), 0 0 12px rgba(255,215,0,0.1), inset 0 0 6px rgba(255,215,0,0.05)" },
          "100%": { boxShadow: "0 0 12px rgba(255,215,0,0.6), 0 0 24px rgba(255,215,0,0.25), 0 0 48px rgba(255,107,0,0.2), inset 0 0 12px rgba(255,215,0,0.1)" },
        },
        "glow-pulse": {
          "0%": { opacity: "0.6", filter: "brightness(1)" },
          "100%": { opacity: "1", filter: "brightness(1.2)" },
        },
        "border-dance": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 215, 0, 0.15), 0 0 40px rgba(255, 215, 0, 0.1)",
        "glow-strong":
          "0 0 30px rgba(255, 215, 0, 0.25), 0 0 60px rgba(255, 107, 0, 0.15)",
        card: "0 4px 30px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
