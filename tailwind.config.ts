import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#F9F9F9",
        terracotta: "#D97757"
      },
      fontFamily: {
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "var(--font-plex)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
