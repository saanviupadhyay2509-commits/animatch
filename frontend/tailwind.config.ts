import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body:    ["var(--font-body)", "sans-serif"],
      },
      colors: {
        void:     "#080810",
        surface:  "#0f0f1a",
        surface2: "#16162a",
        accent:   "#7c6af7",
        accent2:  "#c084fc",
        sakura:   "#f472b6",
      },
      animation: {
        shimmer: "shimmer 1.6s infinite linear",
        drift:   "drift 18s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
