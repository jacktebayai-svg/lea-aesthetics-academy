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
        // Lea Aesthetics Brand Colors - Monochrome Silver Palette
        'deep-charcoal': '#111111',      // Primary text, button backgrounds, strong accents
        'elegant-silver': '#D6D6D6',     // Primary background for cards and key interface elements
        'light-platinum': '#EAEAEA',     // Main application background color
        'muted-gray': '#888888',         // Subheadings, icons, muted text
        'silver-accent': '#B8B8B8',      // Hover states, active selections, borders
        'pure-white': '#FFFFFF',         // Pure white for contrast and highlights
        
        // Semantic color mappings for consistency
        primary: '#111111',              // Deep charcoal for primary actions
        secondary: '#D6D6D6',            // Elegant silver for secondary elements
        background: '#EAEAEA',           // Light platinum application background
        surface: '#D6D6D6',              // Elegant silver for card surfaces
        muted: '#888888',                // Muted gray for secondary text
        accent: '#B8B8B8',               // Silver accent for interactions
        border: '#B8B8B8',               // Silver accent for borders
        text: {
          primary: '#111111',            // Deep charcoal for primary text
          secondary: '#888888',          // Muted gray for secondary text
          muted: '#B8B8B8',              // Silver accent for muted text
        },
        
        // Legacy colors (maintain compatibility during transition)
        charcoal: "#111111",
        slate: "#888888",
        mist: "#B8B8B8",
        smoke: "#D6D6D6",
        platinum: "#EAEAEA",
        ivory: "#FFFFFF",
      },
      fontFamily: {
        // Lea Aesthetics Typography System
        'serif-elegant': ["var(--font-playfair-display)", "Georgia", "serif"], // Elegant serif for headings and accents
        'sans-clean': ["var(--font-inter)", "system-ui", "sans-serif"],     // Clean sans-serif for body and UI
        // Semantic font mappings
        heading: ["var(--font-playfair-display)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        ui: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Legacy (maintain compatibility)
        inter: ["var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair-display)", "serif"],
      },
      fontSize: {
        // Lea Aesthetics Typography Scale
        'heading-1': ['48px', { lineHeight: '1.3', letterSpacing: '-0.5px', fontWeight: '600' }], // Elegant serif
        'heading-2': ['36px', { lineHeight: '1.3', letterSpacing: '-0.25px', fontWeight: '500' }], // Elegant serif
        'heading-3': ['28px', { lineHeight: '1.4', letterSpacing: '-0.1px', fontWeight: '500' }],  // Elegant serif
        'heading-4': ['24px', { lineHeight: '1.4', fontWeight: '500' }],                          // Elegant serif
        'body-large': ['18px', { lineHeight: '1.6', fontWeight: '400' }],                        // Clean sans-serif
        'body-regular': ['16px', { lineHeight: '1.6', fontWeight: '400' }],                      // Clean sans-serif
        'body-small': ['14px', { lineHeight: '1.6', fontWeight: '400' }],                        // Clean sans-serif
        'body-xs': ['12px', { lineHeight: '1.5', fontWeight: '400' }],                           // Clean sans-serif
        'ui-large': ['16px', { lineHeight: '1.5', fontWeight: '500' }],                          // Clean sans-serif for UI
        'ui-regular': ['14px', { lineHeight: '1.5', fontWeight: '400' }],                        // Clean sans-serif for UI
        'ui-small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],                          // Clean sans-serif for UI
      },
      boxShadow: {
        // Lea Aesthetics Shadow System - Subtle and Professional
        'subtle': '0px 2px 8px rgba(17, 17, 17, 0.06)',          // Very light shadow for subtle elevation
        'card': '0px 4px 16px rgba(17, 17, 17, 0.08)',            // Card shadow with monochrome base
        'elevated': '0px 8px 24px rgba(17, 17, 17, 0.12)',        // Elevated elements
        'focus': '0px 0px 0px 3px rgba(184, 184, 184, 0.3)',      // Silver accent focus ring
        'glow': '0px 0px 16px rgba(184, 184, 184, 0.2)',          // Subtle silver glow for interactions
        
        // Legacy shadows (maintain compatibility)
        'maerose-soft': '0px 4px 16px rgba(17, 17, 17, 0.08)',
        'maerose-card': '0px 4px 16px rgba(17, 17, 17, 0.08)',
        'maerose-elevated': '0px 8px 24px rgba(17, 17, 17, 0.12)',
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
