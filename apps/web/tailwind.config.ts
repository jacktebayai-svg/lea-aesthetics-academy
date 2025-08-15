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
        // Maerose Brand Colors (Elegant Noir Edition)
        'primary-noir': '#1A1A1A',
        'deep-charcoal': '#2B2B2B', 
        'champagne-gold': '#C5A880',
        'champagne-highlight': '#D4B97A',
        'ivory-white': '#FFFFFF',
        'soft-mist-grey': '#E0E0E0',
        'estate-border-grey': '#333333',
        // Legacy colors (for gradual migration)
        charcoal: "#1C1C1C",
        slate: "#333333",
        mist: "#888888",
        smoke: "#DEDEDE",
        platinum: "#F5F5F5",
        ivory: "#FAFAFA",
        gold: "#B89B6E",
      },
      fontFamily: {
        // Maerose Typography - Inter Variable Font Only
        inter: ["var(--font-inter)", "sans-serif"],
        // Legacy (for gradual migration)
        playfair: ["var(--font-playfair-display)", "serif"],
      },
      fontSize: {
        // Maerose Typography Scale
        'heading-1': ['48px', { lineHeight: '1.4', letterSpacing: '-0.5px', fontWeight: '700' }],
        'heading-2': ['36px', { lineHeight: '1.4', letterSpacing: '-0.25px', fontWeight: '600' }],
        'heading-3': ['28px', { lineHeight: '1.4', fontWeight: '500' }],
        'body-large': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-regular': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      boxShadow: {
        // Maerose Shadow System - Soft and Feathered
        'maerose-soft': '0px 8px 40px rgba(0, 0, 0, 0.4)',
        'maerose-card': '0px 4px 20px rgba(0, 0, 0, 0.3)',
        'maerose-elevated': '0px 12px 48px rgba(0, 0, 0, 0.5)',
        // Legacy shadows
        card: "0 15px 40px rgba(0, 0, 0, 0.1)",
        elevated: "0 8px 24px rgba(0, 0, 0, 0.08)",
      },
      spacing: {
        // Maerose Spacing System
        'maerose-section-desktop': '96px',
        'maerose-section-mobile': '48px',
        'maerose-component-gap-desktop': '64px', 
        'maerose-component-gap-mobile': '32px',
        'maerose-gutter-desktop': '24px',
        'maerose-gutter-mobile': '16px',
      },
      transitionTimingFunction: {
        // Maerose Motion System - Calm and Deliberate
        "maerose-ease": "ease-in-out",
        "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        // Maerose Animation Durations
        'micro': '150ms',
        'interaction': '300ms', 
        'modal': '400ms',
        'page': '600ms',
      },
      borderRadius: {
        // Maerose Border Radius (24px for cards)
        'maerose': '24px',
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      maxWidth: {
        // Maerose Layout System
        'maerose-container': '1440px',
      },
    },
  },
  plugins: [],
};
export default config;
