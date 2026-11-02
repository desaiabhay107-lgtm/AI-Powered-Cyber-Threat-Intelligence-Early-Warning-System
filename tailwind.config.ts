import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFAF4",
          100: "#F6EEDF",
          200: "#EBDDC6",
        },
        tan: {
          300: "#D9C3A5",
        },
        brown: {
          500: "#7A5C48",
          700: "#4E3324",
        },
        chocolate: {
          800: "#3B2418",
          900: "#2A1810",
        },
        ember: {
          100: "#F8E1CC",
          500: "#CC5500",
          600: "#B04A00",
        },
        severity: {
          critical: "#A8321C",
          high: "#CC5500",
          medium: "#D99A2B",
          low: "#6B8F5E",
          info: "#8A7B6E",
        },
      },
      fontFamily: {
        display: ["var(--font-instrument-serif)", "var(--font-fraunces)", "serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      boxShadow: {
        warm: "0 8px 24px rgba(59, 36, 24, 0.08)",
        "warm-sm": "0 2px 8px rgba(59, 36, 24, 0.04)",
        "warm-lg": "0 16px 36px rgba(59, 36, 24, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
