/**
 * Lea Aesthetics Clinical Academy Design Tokens
 * Monochrome Silver Sophistication Theme
 */

export const colors = {
  // Primary Colors from Brand Identity
  deepCharcoal: '#111111',
  elegantSilver: '#D6D6D6', 
  lightPlatinum: '#EAEAEA',
  mutedGray: '#888888',
  silverAccent: '#B8B8B8',
  pureWhite: '#FFFFFF',

  // Semantic Color Mappings
  primary: '#111111', // Deep Charcoal
  surface: '#D6D6D6', // Elegant Silver  
  background: '#EAEAEA', // Light Platinum
  textPrimary: '#111111', // Deep Charcoal
  textSecondary: '#888888', // Muted Gray
  border: '#B8B8B8', // Silver Accent
  
  // Interactive States
  hover: '#B8B8B8', // Silver Accent
  focus: 'rgba(184, 184, 184, 0.3)', // Silver with transparency
  active: '#D6D6D6', // Elegant Silver

  // Status Colors (subtle versions maintaining silver theme)
  success: '#4A5D4A', // Subtle dark green
  warning: '#5D5A4A', // Subtle dark amber  
  error: '#5D4A4A', // Subtle dark red
  info: '#4A4A5D', // Subtle dark blue
} as const;

export const typography = {
  fonts: {
    serif: 'Playfair Display, Georgia, serif', // Headings & Brand
    sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', // Body & UI
  },
  
  // Heading Scale (Serif)
  headings: {
    h1: {
      fontSize: '48px',
      lineHeight: '1.3',
      letterSpacing: '-0.5px', 
      fontWeight: '600',
    },
    h2: {
      fontSize: '36px',
      lineHeight: '1.3',
      letterSpacing: '-0.25px',
      fontWeight: '500',
    },
    h3: {
      fontSize: '28px', 
      lineHeight: '1.4',
      letterSpacing: '-0.1px',
      fontWeight: '500',
    },
    h4: {
      fontSize: '24px',
      lineHeight: '1.4', 
      fontWeight: '500',
    },
  },

  // Body Text Scale (Sans-serif)
  body: {
    large: {
      fontSize: '18px',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    regular: {
      fontSize: '16px',
      lineHeight: '1.6', 
      fontWeight: '400',
    },
    small: {
      fontSize: '14px',
      lineHeight: '1.6',
      fontWeight: '400', 
    },
    xs: {
      fontSize: '12px',
      lineHeight: '1.5',
      fontWeight: '400',
    },
  },

  // UI Text Scale (Sans-serif)
  ui: {
    large: {
      fontSize: '16px',
      lineHeight: '1.5',
      fontWeight: '500',
    },
    regular: {
      fontSize: '14px', 
      lineHeight: '1.5',
      fontWeight: '400',
    },
    small: {
      fontSize: '12px',
      lineHeight: '1.4',
      fontWeight: '400',
    },
  },
} as const;

export const shadows = {
  // Professional shadows using monochrome base
  card: '0px 4px 16px rgba(17, 17, 17, 0.08)',
  elevated: '0px 8px 24px rgba(17, 17, 17, 0.12)', 
  subtle: '0px 2px 8px rgba(17, 17, 17, 0.06)',
  focus: '0px 0px 0px 3px rgba(184, 184, 184, 0.3)',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px', 
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px', 
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms', 
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Export complete theme object
export const theme = {
  colors,
  typography,
  shadows,
  spacing,
  borderRadius,
  animation,
} as const;

export type Theme = typeof theme;
