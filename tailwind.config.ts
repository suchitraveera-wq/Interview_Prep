import type { Config } from "tailwindcss";

// Design tokens — see Project Memory/product-spec.md for rationale.
// Concept: "drill card" — a focused practice tool for AI PM interview prep.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",       // page background
        inkline: "#262B36",   // borders / dividers on ink
        paper: "#F6F4EE",     // card surface
        slate: "#8A8F98",     // secondary text
        signal: "#F5B301",    // primary accent (amber) — CTAs, active states
        signalDark: "#C98E00",
        practiced: "#3DDC84", // success / practiced indicator
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
