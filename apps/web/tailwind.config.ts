import type { Config } from "tailwindcss";

// Master Aesthetics Suite - Luxury Platinum & Silver Design System
// Enterprise-grade design system with platinum/silver luxury branding
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MASTER AESTHETICS SUITE - PLATINUM & SILVER LUXURY PALETTE
        // Sophisticated luxury metals with premium finishes
        
        // Core Luxury Metals
        'platinum': '#E5E4E2',           // Primary platinum - luxury background
        'silver': '#C0C0C0',             // Primary silver - metallic accent
        'charcoal': '#2C2C2C',           // Professional charcoal - text & contrast
        
        // Extended Platinum Range
        'platinum-light': '#F0EFED',     // Lightest platinum for backgrounds
        'platinum-medium': '#E5E4E2',    // Standard platinum
        'platinum-dark': '#D5D4D2',      // Darker platinum for borders
        
        // Extended Silver Range
        'silver-light': '#D8D8D8',       // Light silver for highlights
        'silver-medium': '#C0C0C0',      // Standard silver
        'silver-dark': '#A8A8A8',        // Dark silver for depth
        
        // Extended Charcoal Range
        'charcoal-light': '#4A4A4A',     // Light charcoal for secondary text
        'charcoal-medium': '#2C2C2C',    // Standard charcoal
        'charcoal-dark': '#1A1A1A',      // Dark charcoal for headers
        
        // Luxury Metallic Gradients (for CSS gradients)
        'gradient-platinum': 'linear-gradient(135deg, #F0EFED 0%, #E5E4E2 50%, #D5D4D2 100%)',
        'gradient-silver': 'linear-gradient(135deg, #D8D8D8 0%, #C0C0C0 50%, #A8A8A8 100%)',
        'gradient-executive': 'linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 50%, #A8A8A8 100%)',
        
        // Semantic Luxury Mappings
        primary: '#2C2C2C',              // Charcoal for primary actions
        secondary: '#C0C0C0',            // Silver for secondary elements
        background: '#FAFAFA',           // Ultra-light background
        surface: '#FFFFFF',              // Pure white surfaces
        'surface-elevated': '#F8F8F8',   // Slightly elevated surfaces
        muted: '#6B6B6B',                // Muted text color
        accent: '#E5E4E2',               // Platinum accent
        border: '#E8E8E8',               // Subtle borders
        
        // Text Color System
        text: {
          primary: '#2C2C2C',            // Primary charcoal text
          secondary: '#4A4A4A',          // Secondary text
          muted: '#6B6B6B',              // Muted text
          inverse: '#FFFFFF',            // White text on dark backgrounds
          luxury: '#1A1A1A',             // Luxury dark text for emphasis
        },
        
        // Business Context Colors
        success: '#4CAF50',              // Success states
        warning: '#FF9800',              // Warning states
        error: '#F44336',                // Error states
        info: '#2196F3',                 // Information states
        
        // Legacy Compatibility (gradual migration)
        'midnight-black': '#1A1A1A',
        'charcoal-black': '#2C2C2C', 
        'steel-gray': '#4A4A4A',
        'silver-mist': '#6B6B6B',
        'pure-silver': '#C0C0C0',
        'bright-silver': '#D8D8D8',
        'pearl-silver': '#E5E4E2',
        'snow-white': '#FAFAFA',
        'pure-white': '#FFFFFF',
      },
      fontFamily: {
        // MASTER AESTHETICS SUITE - LUXURY TYPOGRAPHY SYSTEM
        // Premium fonts that reflect luxury aesthetics and medical professionalism
        
        // Primary Luxury Fonts
        'display': ['"Inter"', '"SF Pro Display"', '"Helvetica Neue"', 'system-ui', 'sans-serif'], // Clean luxury display
        'heading': ['"Inter"', '"SF Pro Display"', 'system-ui', 'sans-serif'], // Professional headings
        'body': ['"Inter"', '"SF Pro Text"', 'system-ui', 'sans-serif'], // Readable body text
        'ui': ['"Inter"', 'system-ui', 'sans-serif'], // Interface elements
        
        // Luxury Accent Fonts (for special occasions)
        'luxury-serif': ['"Playfair Display"', '"Georgia Pro"', 'Georgia', 'serif'], // Elegant serif for luxury touch
        'luxury-script': ['"Allura"', '"Great Vibes"', 'cursive'], // Script for premium branding
        
        // Technical & Professional
        'mono': ['"SF Mono"', '"Monaco"', '"Inconsolata"', '"Roboto Mono"', 'monospace'], // Code and technical content
        
        // Legacy Compatibility
        'cursive-elegant': ['"Allura"', '"Great Vibes"', 'cursive'],
        'serif-display': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans-clean': ['"Inter"', 'system-ui', 'sans-serif'],
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
        // MASTER AESTHETICS SUITE - LUXURY SHADOW SYSTEM
        // Sophisticated shadows with platinum/silver metallic effects
        
        // Core Shadow System
        'subtle': '0 4px 12px rgba(0, 0, 0, 0.1)',                 // Ultra-subtle elevation
        'soft': '0 4px 16px rgba(44, 44, 44, 0.08)',               // Soft charcoal shadow
        'card': '0 8px 24px rgba(44, 44, 44, 0.12)',               // Standard card elevation
        'elevated': '0 12px 32px rgba(44, 44, 44, 0.15)',          // Elevated surfaces
        'luxury': '0 20px 60px rgba(0, 0, 0, 0.12)',               // Luxury elevation
        
        // Interactive Shadows
        'hover': '0 16px 40px rgba(44, 44, 44, 0.18)',             // Hover state elevation
        'focus': '0 0 0 3px rgba(192, 192, 192, 0.25)',            // Silver focus ring
        'active': '0 2px 8px rgba(44, 44, 44, 0.2)',               // Active/pressed state
        
        // Metallic Effects
        'platinum': '0 4px 16px rgba(229, 228, 226, 0.4)',         // Platinum metallic shadow
        'silver': '0 4px 16px rgba(192, 192, 192, 0.3)',           // Silver metallic shadow
        'metallic-glow': '0 0 20px rgba(192, 192, 192, 0.15)',     // Subtle metallic glow
        'executive': '0 8px 32px rgba(44, 44, 44, 0.1)',           // Executive/premium shadow
        
        // Business Context Shadows
        'success': '0 4px 16px rgba(76, 175, 80, 0.2)',            // Success state shadow
        'warning': '0 4px 16px rgba(255, 152, 0, 0.2)',            // Warning state shadow
        'error': '0 4px 16px rgba(244, 67, 54, 0.2)',              // Error state shadow
        'info': '0 4px 16px rgba(33, 150, 243, 0.2)',              // Info state shadow
        
        // Legacy Shadows (maintain compatibility)
        'maerose-soft': '0px 4px 16px rgba(17, 17, 17, 0.08)',
        'maerose-card': '0px 4px 16px rgba(17, 17, 17, 0.08)',
        'maerose-elevated': '0px 8px 24px rgba(17, 17, 17, 0.12)',
        'glow': '0px 0px 20px rgba(156, 156, 156, 0.15)',
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
