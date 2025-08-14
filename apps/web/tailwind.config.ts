import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#1C1C1C",
        slate: "#333333",
        mist: "#888888",
        smoke: "#DEDEDE",
        platinum: "#F5F5F5",
        ivory: "#FAFAFA",
        gold: "#B89B6E",
      },
      fontFamily: {
        playfair: ["var(--font-playfair-display)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 15px 40px rgba(0, 0, 0, 0.1)",
        elevated: "0 8px 24px rgba(0, 0, 0, 0.08)",
      },
      transitionTimingFunction: {
        "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
