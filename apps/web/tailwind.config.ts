import type { Config } from "tailwindcss";

// Enterprise-grade design system for billion-dollar platform
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LEA AESTHETICS PREMIUM SILVER PALETTE
        // Sophisticated monochrome with metallic silver accents
        'midnight-black': '#0A0A0A',     // Deepest black for premium headers
        'charcoal-black': '#1A1A1A',     // Rich black for elegant headers
        'graphite': '#2D2D2D',            // Dark graphite for strong emphasis
        'steel-gray': '#4A4A4A',          // Steel gray for subtle headers
        'silver-mist': '#6B6B6B',         // Silver mist for secondary elements
        'pure-silver': '#9C9C9C',         // Pure metallic silver accent
        'bright-silver': '#B8B8B8',       // Bright silver for highlights
        'pearl-silver': '#D0D0D0',        // Pearl silver for surfaces
        'platinum': '#E5E5E5',            // Light platinum backgrounds
        'frost': '#F0F0F0',               // Frost white for light backgrounds
        'snow-white': '#F8F8F8',          // Snow white for pristine surfaces
        'pure-white': '#FFFFFF',          // Pure white for maximum contrast
        
        // Metallic accent tones
        'silver-shimmer': '#C7C7C7',      // Shimmering silver for special elements
        'chrome': '#ADADAD',              // Chrome metallic for interactive elements
        'gunmetal': '#525252',
        
        // Semantic color mappings for consistency
        primary: '#1A1A1A',              // Charcoal black for primary actions
        secondary: '#B8B8B8',            // Bright silver for secondary elements
        background: '#F8F8F8',           // Snow white application background
        surface: '#FFFFFF',              // Pure white for card surfaces
        muted: '#6B6B6B',                // Silver mist for secondary text
        accent: '#9C9C9C',               // Pure silver accent for interactions
        border: '#E5E5E5',               // Platinum for subtle borders
        text: {
          primary: '#1A1A1A',            // Charcoal black for primary text
          secondary: '#4A4A4A',          // Steel gray for secondary text
          muted: '#6B6B6B',              // Silver mist for muted text
          inverse: '#FFFFFF',            // White text on dark backgrounds
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
        // LEA AESTHETICS PREMIUM TYPOGRAPHY
        'cursive-elegant': ['"Pinyon Script"', '"Allura"', '"Great Vibes"', 'cursive'], // Elegant cursive for luxury headers
        'serif-display': ['"Playfair Display"', '"Didot"', '"Bodoni MT"', 'Georgia', 'serif'], // Sophisticated serif display
        'serif-elegant': ['"Cormorant Garamond"', '"EB Garamond"', 'Georgia', 'serif'], // Refined serif for subheadings
        'sans-clean': ['"Inter"', '"Helvetica Neue"', 'Arial', 'system-ui', 'sans-serif'], // Clean modern sans-serif
        'sans-light': ['"Inter Light"', '"Helvetica Neue Light"', 'sans-serif'], // Light weight for elegant body
        // Semantic font mappings
        heading: ['"Pinyon Script"', '"Allura"', 'cursive'],
        subheading: ['"Playfair Display"', '"Didot"', 'serif'],
        body: ['"Inter"', '"Helvetica Neue"', 'sans-serif'],
        ui: ['"Inter"', 'system-ui', 'sans-serif'],
        // Legacy (maintain compatibility)
        inter: ["var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair-display)", "serif"],
      },
      fontSize: {
        // LEA AESTHETICS PREMIUM TYPOGRAPHY SCALE
        'display-xlarge': ['72px', { lineHeight: '1.1', letterSpacing: '0.02em', fontWeight: '400' }], // Luxury cursive display
        'display-large': ['60px', { lineHeight: '1.15', letterSpacing: '0.01em', fontWeight: '400' }], // Elegant cursive display
        'heading-1': ['48px', { lineHeight: '1.2', letterSpacing: '0.01em', fontWeight: '400' }],      // Cursive main headers
        'heading-2': ['36px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '500' }],    // Serif subheadings
        'heading-3': ['28px', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '500' }],    // Serif sections
        'heading-4': ['24px', { lineHeight: '1.35', fontWeight: '500' }],                              // Serif smaller sections
        'heading-5': ['20px', { lineHeight: '1.4', fontWeight: '500' }],                               // Serif minor headers
        'body-xlarge': ['20px', { lineHeight: '1.7', fontWeight: '300' }],                            // Light elegant body
        'body-large': ['18px', { lineHeight: '1.7', fontWeight: '400' }],                             // Clean body text
        'body-regular': ['16px', { lineHeight: '1.75', fontWeight: '400' }],                          // Standard body
        'body-small': ['14px', { lineHeight: '1.7', fontWeight: '400' }],                             // Small body text
        'body-xs': ['12px', { lineHeight: '1.6', fontWeight: '400' }],                                // Extra small text
        'ui-large': ['16px', { lineHeight: '1.5', fontWeight: '500' }],                               // UI elements
        'ui-regular': ['14px', { lineHeight: '1.5', fontWeight: '500' }],                             // Standard UI
        'ui-small': ['12px', { lineHeight: '1.4', fontWeight: '500' }],                               // Small UI
        'caption': ['11px', { lineHeight: '1.4', fontWeight: '400', letterSpacing: '0.03em' }],       // Captions
      },
      boxShadow: {
        // LEA AESTHETICS PREMIUM SHADOW SYSTEM
        'subtle': '0px 2px 8px rgba(0, 0, 0, 0.04)',               // Ultra-subtle elevation
        'soft': '0px 4px 12px rgba(0, 0, 0, 0.06)',                // Soft shadow for cards
        'card': '0px 8px 24px rgba(0, 0, 0, 0.08)',                // Standard card elevation
        'elevated': '0px 12px 32px rgba(0, 0, 0, 0.10)',           // Elevated modal shadow
        'hover': '0px 16px 40px rgba(0, 0, 0, 0.12)',              // Hover state elevation
        'focus': '0px 0px 0px 3px rgba(156, 156, 156, 0.25)',      // Silver focus ring
        'glow': '0px 0px 20px rgba(156, 156, 156, 0.15)',          // Subtle silver glow
        'metallic': '0px 4px 16px rgba(192, 192, 192, 0.2)',       // Metallic silver shadow
        
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
        // LEA Border Radius System
        'none': '0',
        'subtle': '4px',
        'soft': '8px',
        'medium': '12px',
        'large': '16px',
        'xlarge': '20px',
        'luxury': '24px',
        'pill': '9999px',
        // Legacy
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
