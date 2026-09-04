import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#0A0D14",
          900: "#0F1420",
          800: "#151C2C",
          700: "#1E2740",
          600: "#2A3554",
        },
        porch: {
          400: "#F0B85C",
          500: "#E8A33D",
          600: "#C7822A",
        },
        mist: {
          300: "#C4CADA",
          400: "#8B93A7",
          500: "#636D85",
        },
        ok: "#5FC98D",
        warn: "#E8735A",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "porch-glow":
          "radial-gradient(circle at 50% 0%, rgba(232,163,61,0.16), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(232,163,61,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
