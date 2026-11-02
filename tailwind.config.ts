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
        charcoal: {
          950: "#0b0d11",
          900: "#11141a",
          850: "#161a22",
          800: "#1b202a",
          750: "#222834",
          700: "#2d3444",
          600: "#3d465c",
        },
        parklyGreen: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
          faint: "rgba(16, 185, 129, 0.12)",
        },
        parklyPurple: {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          dark: "#7c3aed",
          faint: "rgba(139, 92, 246, 0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "card-hover": "0 8px 30px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.3)",
        glowGreen: "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        glowPurple: "0 0 25px -5px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;

