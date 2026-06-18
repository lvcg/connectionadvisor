import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: "#080b0f",
        graphite: "#111827",
        emeraldLuxury: "#10b981",
      },
      boxShadow: {
        glass: "0 24px 80px rgba(2, 6, 23, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
