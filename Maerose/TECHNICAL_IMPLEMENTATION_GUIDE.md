# MAEROSE TECHNICAL IMPLEMENTATION GUIDE
**Developer & Designer Reference for Brand Consistency**  
*Complete Implementation Standards for Digital and Physical Applications*

---

## 🎯 **IMPLEMENTATION OVERVIEW**

This guide provides precise technical specifications for implementing the Maerose brand across all touchpoints. Every element has been designed to maintain the "Elegant Noir" aesthetic while ensuring scalability, accessibility, and performance across platforms.

**Key Implementation Principles:**
- **Precision**: Exact specifications with no variation tolerance
- **Consistency**: Identical experience across all touchpoints
- **Performance**: Optimized for speed without compromising luxury feel
- **Accessibility**: WCAG 2.2 AA compliance in all implementations

---

## 🎨 **DIGITAL BRAND TOKENS**

### **CSS Custom Properties Implementation**

```css
/* Maerose Brand Tokens - Complete Implementation */
:root {
  /* Brand Colors - Exact Hex Values (NEVER CHANGE) */
  --maerose-primary-noir: #1A1A1A;
  --maerose-deep-charcoal: #2B2B2B;
  --maerose-champagne-gold: #C5A880;
  --maerose-champagne-highlight: #D4B97A;
  --maerose-ivory-white: #FFFFFF;
  --maerose-soft-mist-grey: #E0E0E0;
  --maerose-estate-border-grey: #333333;

  /* RGB Values for JavaScript/Canvas Usage */
  --maerose-primary-noir-rgb: 26, 26, 26;
  --maerose-deep-charcoal-rgb: 43, 43, 43;
  --maerose-champagne-gold-rgb: 197, 168, 128;
  --maerose-champagne-highlight-rgb: 212, 185, 122;
  --maerose-ivory-white-rgb: 255, 255, 255;
  --maerose-soft-mist-grey-rgb: 224, 224, 224;
  --maerose-estate-border-grey-rgb: 51, 51, 51;

  /* Typography System */
  --maerose-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --maerose-font-weight-light: 300;
  --maerose-font-weight-regular: 400;
  --maerose-font-weight-medium: 500;
  --maerose-font-weight-semibold: 600;
  --maerose-font-weight-bold: 700;

  /* Typography Scale */
  --maerose-text-h1: 48px;
  --maerose-text-h1-mobile: 36px;
  --maerose-text-h2: 36px;
  --maerose-text-h2-mobile: 28px;
  --maerose-text-h3: 28px;
  --maerose-text-h3-mobile: 24px;
  --maerose-text-body-large: 18px;
  --maerose-text-body-large-mobile: 16px;
  --maerose-text-body-regular: 16px;
  --maerose-text-body-regular-mobile: 15px;
  --maerose-text-body-small: 14px;
  --maerose-text-body-small-mobile: 13px;

  /* Line Heights */
  --maerose-line-height-heading: 1.4;
  --maerose-line-height-body: 1.6;

  /* Letter Spacing */
  --maerose-letter-spacing-h1: -0.5px;
  --maerose-letter-spacing-h2: -0.25px;
  --maerose-letter-spacing-h3: 0px;
  --maerose-letter-spacing-body: 0px;

  /* Spacing System */
  --maerose-space-xs: 4px;
  --maerose-space-sm: 8px;
  --maerose-space-md: 16px;
  --maerose-space-lg: 24px;
  --maerose-space-xl: 32px;
  --maerose-space-2xl: 48px;
  --maerose-space-3xl: 64px;
  --maerose-space-4xl: 96px;

  /* Layout System */
  --maerose-container-max-width: 1440px;
  --maerose-gutter-desktop: 24px;
  --maerose-gutter-mobile: 16px;
  --maerose-section-padding-desktop: 96px;
  --maerose-section-padding-mobile: 48px;
  --maerose-component-gap-desktop: 64px;
  --maerose-component-gap-mobile: 32px;

  /* Border Radius */
  --maerose-radius-sm: 8px;
  --maerose-radius-md: 12px;
  --maerose-radius-lg: 24px;
  --maerose-radius-xl: 32px;

  /* Shadows */
  --maerose-shadow-soft: 0px 8px 40px rgba(0, 0, 0, 0.4);
  --maerose-shadow-card: 0px 4px 20px rgba(0, 0, 0, 0.3);
  --maerose-shadow-elevated: 0px 12px 48px rgba(0, 0, 0, 0.5);
  --maerose-shadow-button: 0px 2px 8px rgba(197, 168, 128, 0.3);
  --maerose-shadow-button-hover: 0px 4px 16px rgba(197, 168, 128, 0.4);

  /* Motion System */
  --maerose-duration-micro: 150ms;
  --maerose-duration-short: 300ms;
  --maerose-duration-medium: 400ms;
  --maerose-duration-long: 600ms;
  --maerose-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --maerose-easing-gentle: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --maerose-easing-enter: cubic-bezier(0, 0, 0.2, 1);
  --maerose-easing-exit: cubic-bezier(0.4, 0, 1, 1);

  /* Focus States */
  --maerose-focus-outline: 2px solid var(--maerose-champagne-gold);
  --maerose-focus-offset: 2px;

  /* Z-Index Scale */
  --maerose-z-dropdown: 1000;
  --maerose-z-sticky: 1020;
  --maerose-z-fixed: 1030;
  --maerose-z-modal-backdrop: 1040;
  --maerose-z-modal: 1050;
  --maerose-z-popover: 1060;
  --maerose-z-tooltip: 1070;
  --maerose-z-toast: 1080;
}
```

### **Tailwind Configuration Implementation**

```typescript
// tailwind.config.ts - Complete Maerose Configuration
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
        // Maerose Brand Colors - Primary Palette
        'primary-noir': '#1A1A1A',
        'deep-charcoal': '#2B2B2B', 
        'champagne-gold': '#C5A880',
        'champagne-highlight': '#D4B97A',
        'ivory-white': '#FFFFFF',
        'soft-mist-grey': '#E0E0E0',
        'estate-border-grey': '#333333',
        
        // Contextual Color Applications
        'maerose-bg-primary': '#1A1A1A',
        'maerose-bg-secondary': '#2B2B2B',
        'maerose-bg-elevated': '#333333',
        'maerose-text-primary': '#FFFFFF',
        'maerose-text-secondary': '#E0E0E0',
        'maerose-text-muted': '#888888',
        'maerose-accent-primary': '#C5A880',
        'maerose-accent-hover': '#D4B97A',
        'maerose-border-primary': '#333333',
        'maerose-border-subtle': '#2B2B2B',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        maerose: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        // Maerose Typography Scale with Line Heights
        'maerose-h1': ['48px', { 
          lineHeight: '1.4', 
          letterSpacing: '-0.5px', 
          fontWeight: '700' 
        }],
        'maerose-h1-mobile': ['36px', { 
          lineHeight: '1.4', 
          letterSpacing: '-0.5px', 
          fontWeight: '700' 
        }],
        'maerose-h2': ['36px', { 
          lineHeight: '1.4', 
          letterSpacing: '-0.25px', 
          fontWeight: '600' 
        }],
        'maerose-h2-mobile': ['28px', { 
          lineHeight: '1.4', 
          letterSpacing: '-0.25px', 
          fontWeight: '600' 
        }],
        'maerose-h3': ['28px', { 
          lineHeight: '1.4', 
          letterSpacing: '0px', 
          fontWeight: '500' 
        }],
        'maerose-h3-mobile': ['24px', { 
          lineHeight: '1.4', 
          letterSpacing: '0px', 
          fontWeight: '500' 
        }],
        'maerose-body-large': ['18px', { 
          lineHeight: '1.6', 
          fontWeight: '400' 
        }],
        'maerose-body-large-mobile': ['16px', { 
          lineHeight: '1.6', 
          fontWeight: '400' 
        }],
        'maerose-body-regular': ['16px', { 
          lineHeight: '1.6', 
          fontWeight: '400' 
        }],
        'maerose-body-regular-mobile': ['15px', { 
          lineHeight: '1.6', 
          fontWeight: '400' 
        }],
        'maerose-body-small': ['14px', { 
          lineHeight: '1.6', 
          fontWeight: '400' 
        }],
        'maerose-body-small-mobile': ['13px', { 
          lineHeight: '1.6', 
          fontWeight: '400' 
        }],
      },
      spacing: {
        // Maerose Spacing System
        'maerose-xs': '4px',
        'maerose-sm': '8px',
        'maerose-md': '16px',
        'maerose-lg': '24px',
        'maerose-xl': '32px',
        'maerose-2xl': '48px',
        'maerose-3xl': '64px',
        'maerose-4xl': '96px',
        'maerose-gutter-desktop': '24px',
        'maerose-gutter-mobile': '16px',
        'maerose-section-desktop': '96px',
        'maerose-section-mobile': '48px',
        'maerose-component-gap-desktop': '64px',
        'maerose-component-gap-mobile': '32px',
      },
      maxWidth: {
        'maerose-container': '1440px',
      },
      boxShadow: {
        'maerose-soft': '0px 8px 40px rgba(0, 0, 0, 0.4)',
        'maerose-card': '0px 4px 20px rgba(0, 0, 0, 0.3)',
        'maerose-elevated': '0px 12px 48px rgba(0, 0, 0, 0.5)',
        'maerose-button': '0px 2px 8px rgba(197, 168, 128, 0.3)',
        'maerose-button-hover': '0px 4px 16px rgba(197, 168, 128, 0.4)',
      },
      borderRadius: {
        'maerose-sm': '8px',
        'maerose-md': '12px',
        'maerose-lg': '24px',
        'maerose-xl': '32px',
      },
      transitionDuration: {
        'maerose-micro': '150ms',
        'maerose-short': '300ms',
        'maerose-medium': '400ms',
        'maerose-long': '600ms',
      },
      transitionTimingFunction: {
        'maerose-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'maerose-gentle': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'maerose-enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'maerose-exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      zIndex: {
        'maerose-dropdown': '1000',
        'maerose-sticky': '1020',
        'maerose-fixed': '1030',
        'maerose-modal-backdrop': '1040',
        'maerose-modal': '1050',
        'maerose-popover': '1060',
        'maerose-tooltip': '1070',
        'maerose-toast': '1080',
      },
    },
  },
  plugins: [
    // Custom plugin for Maerose utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Focus utilities
        '.maerose-focus': {
          '&:focus': {
            outline: '2px solid #C5A880',
            outlineOffset: '2px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
        // Button base styles
        '.maerose-button-base': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          border: 'none',
        },
        '.maerose-button-primary': {
          backgroundColor: '#C5A880',
          color: '#FFFFFF',
          padding: '12px 24px',
          boxShadow: '0px 2px 8px rgba(197, 168, 128, 0.3)',
          '&:hover': {
            backgroundColor: '#D4B97A',
            transform: 'scale(1.02)',
            boxShadow: '0px 4px 16px rgba(197, 168, 128, 0.4)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        '.maerose-button-secondary': {
          backgroundColor: 'transparent',
          color: '#C5A880',
          border: '2px solid #C5A880',
          padding: '10px 22px',
          '&:hover': {
            backgroundColor: '#C5A880',
            color: '#FFFFFF',
          },
        },
        // Card styles
        '.maerose-card': {
          backgroundColor: '#2B2B2B',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid #333333',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 12px 48px rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(197, 168, 128, 0.3)',
          },
        },
        // Typography utilities
        '.maerose-heading': {
          fontFamily: 'Inter, sans-serif',
          color: '#FFFFFF',
          letterSpacing: '-0.025em',
        },
        '.maerose-body': {
          fontFamily: 'Inter, sans-serif',
          color: '#E0E0E0',
          lineHeight: '1.6',
        },
        // Layout utilities
        '.maerose-container': {
          maxWidth: '1440px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '24px',
          paddingRight: '24px',
          '@media (max-width: 768px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
        '.maerose-section': {
          paddingTop: '96px',
          paddingBottom: '96px',
          '@media (max-width: 768px)': {
            paddingTop: '48px',
            paddingBottom: '48px',
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

export default config;
```

---

## ⚛️ **REACT COMPONENT IMPLEMENTATIONS**

### **Core Typography Components**

```tsx
// components/ui/Typography.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const MaeroseHeading1: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'h1' 
}) => (
  <Component 
    className={cn(
      'text-maerose-h1 md:text-maerose-h1-mobile font-bold text-ivory-white maerose-heading',
      className
    )}
  >
    {children}
  </Component>
);

export const MaeroseHeading2: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'h2' 
}) => (
  <Component 
    className={cn(
      'text-maerose-h2 md:text-maerose-h2-mobile font-semibold text-ivory-white maerose-heading',
      className
    )}
  >
    {children}
  </Component>
);

export const MaeroseHeading3: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'h3' 
}) => (
  <Component 
    className={cn(
      'text-maerose-h3 md:text-maerose-h3-mobile font-medium text-ivory-white maerose-heading',
      className
    )}
  >
    {children}
  </Component>
);

export const MaeroseBodyLarge: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'p' 
}) => (
  <Component 
    className={cn(
      'text-maerose-body-large md:text-maerose-body-large-mobile text-soft-mist-grey maerose-body',
      className
    )}
  >
    {children}
  </Component>
);

export const MaeroseBodyRegular: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'p' 
}) => (
  <Component 
    className={cn(
      'text-maerose-body-regular md:text-maerose-body-regular-mobile text-soft-mist-grey maerose-body',
      className
    )}
  >
    {children}
  </Component>
);

export const MaeroseBodySmall: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  as: Component = 'p' 
}) => (
  <Component 
    className={cn(
      'text-maerose-body-small md:text-maerose-body-small-mobile text-soft-mist-grey maerose-body',
      className
    )}
  >
    {children}
  </Component>
);
```

### **Core Button Components**

```tsx
// components/ui/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  loading?: boolean;
}

export const MaeroseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    asChild = false, 
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const baseClasses = 'maerose-button-base maerose-focus';
    
    const variantClasses = {
      primary: 'maerose-button-primary',
      secondary: 'maerose-button-secondary',
      ghost: 'bg-transparent text-champagne-gold hover:bg-champagne-gold/10',
    };
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-maerose-body-small',
      md: 'px-6 py-3 text-maerose-body-regular',
      lg: 'px-8 py-4 text-maerose-body-large',
    };
    
    return (
      <Comp
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          (disabled || loading) && 'opacity-40 cursor-not-allowed pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

MaeroseButton.displayName = 'MaeroseButton';
```

### **Core Card Components**

```tsx
// components/ui/Card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const MaeroseCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'maerose-card',
        hover && 'hover:shadow-maerose-elevated hover:border-champagne-gold/30',
        className
      )}
      {...props}
    />
  )
);

export const MaeroseCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-maerose-lg', className)}
      {...props}
    />
  )
);

export const MaeroseCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-maerose-md', className)}
      {...props}
    />
  )
);

export const MaeroseCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-maerose-lg pt-maerose-lg border-t border-estate-border-grey', className)}
      {...props}
    />
  )
);
```

---

## 🎭 **ANIMATION IMPLEMENTATIONS**

### **Framer Motion Presets**

```tsx
// lib/animations.ts
import { Variants } from 'framer-motion';

export const maeroseAnimations = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 1, 1]
      }
    }
  },

  // Stagger children animation
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  } as Variants,

  // Card hover animation
  cardHover: {
    rest: { 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: { 
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  } as Variants,

  // Button press animation
  buttonPress: {
    whileTap: { 
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  },

  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 24 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },

  // Modal animations
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 1, 1]
      }
    }
  },

  // Loading spinner
  loadingSpinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity
      }
    }
  }
};

// Usage example component
export const AnimatedCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      variants={maeroseAnimations.cardHover}
      initial="rest"
      whileHover="hover"
      className="maerose-card"
    >
      {children}
    </motion.div>
  );
};
```

---

## 📱 **RESPONSIVE IMPLEMENTATION**

### **Breakpoint System**

```typescript
// lib/breakpoints.ts
export const maeroseBreakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
  ultra: '1920px'
} as const;

export const mediaQueries = {
  mobile: `(max-width: ${maeroseBreakpoints.tablet})`,
  tablet: `(min-width: ${maeroseBreakpoints.tablet}) and (max-width: ${maeroseBreakpoints.desktop})`,
  desktop: `(min-width: ${maeroseBreakpoints.desktop})`,
  wide: `(min-width: ${maeroseBreakpoints.wide})`,
  ultra: `(min-width: ${maeroseBreakpoints.ultra})`
} as const;

// Custom hook for responsive behavior
export const useMaeroseBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('desktop');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setCurrentBreakpoint('mobile');
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet');
      } else if (width < 1440) {
        setCurrentBreakpoint('desktop');
      } else if (width < 1920) {
        setCurrentBreakpoint('wide');
      } else {
        setCurrentBreakpoint('ultra');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return currentBreakpoint;
};
```

### **Responsive Typography Implementation**

```css
/* Responsive typography with fluid scaling */
.maerose-responsive-text {
  /* Fluid typography using clamp() */
  font-size: clamp(1rem, 4vw, 1.125rem);
}

.maerose-h1-responsive {
  font-size: clamp(2.25rem, 8vw, 3rem);
  line-height: 1.4;
  letter-spacing: -0.5px;
}

.maerose-h2-responsive {
  font-size: clamp(1.75rem, 6vw, 2.25rem);
  line-height: 1.4;
  letter-spacing: -0.25px;
}

.maerose-h3-responsive {
  font-size: clamp(1.5rem, 5vw, 1.75rem);
  line-height: 1.4;
}

/* Container queries for cards */
.maerose-card-container {
  container-type: inline-size;
}

.maerose-card-responsive {
  padding: 1.5rem;
}

@container (max-width: 300px) {
  .maerose-card-responsive {
    padding: 1rem;
  }
}

@container (min-width: 500px) {
  .maerose-card-responsive {
    padding: 2rem;
  }
}
```

---

## 🌐 **WEB PLATFORM SPECIFICATIONS**

### **Performance Requirements**

```typescript
// performance.config.ts
export const maerosePerformanceStandards = {
  // Core Web Vitals targets
  LCP: 2000, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Additional metrics
  TTFB: 600, // Time to First Byte (ms)
  FCP: 1800, // First Contentful Paint (ms)
  TTI: 3500, // Time to Interactive (ms)
  
  // Bundle size limits
  maxJSBundle: 180 * 1024, // 180KB gzipped
  maxCSSBundle: 50 * 1024,  // 50KB gzipped
  maxImageSize: 1920 * 1080, // Maximum image resolution
  
  // Animation performance
  minFPS: 60, // Minimum frames per second for animations
  maxAnimationDuration: 600, // Maximum animation duration (ms)
};

// Performance monitoring implementation
export const initMaerosePerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Core Web Vitals monitoring
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(console.log);
      onFID(console.log);
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
    });
  }
};
```

### **SEO Implementation**

```tsx
// components/SEO/MaeroseSEO.tsx
import Head from 'next/head';

interface MaeroseSEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const MaeroseSEO: React.FC<MaeroseSEOProps> = ({
  title = "MAEROSE AESTHETICS - Where Heritage Meets Innovation",
  description = "The exclusive sanctuary where distinguished practitioners master the artistry of luxury medical aesthetics through heritage-inspired education and cutting-edge innovation.",
  image = "/images/maerose-og-image.jpg",
  url = "https://maerose.co.uk",
  type = "website"
}) => {
  const fullTitle = title.includes('MAEROSE') ? title : `${title} | MAEROSE AESTHETICS`;
  
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content="luxury medical aesthetics, aesthetic training, medical education, dermal fillers, botox training, luxury clinic, heritage aesthetics" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="MAEROSE AESTHETICS" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta name="twitter:creator" content="@maeroseaesthetics" />
      
      {/* Additional Meta */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Maerose Aesthetics" />
      <meta name="copyright" content="© 2025 Maerose Aesthetics. All rights reserved." />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            "name": "Maerose Aesthetics",
            "description": description,
            "url": url,
            "logo": `${url}/images/maerose-logo.svg`,
            "image": image,
            "priceRange": "£££",
            "addressCountry": "GB",
            "medicalSpecialty": "Aesthetic Medicine",
            "serviceType": "Medical Aesthetics Training and Clinical Services"
          })
        }}
      />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
};
```

---

## ♿ **ACCESSIBILITY IMPLEMENTATION**

### **WCAG 2.2 AA Compliance Standards**

```tsx
// lib/accessibility.ts
export const maeroseA11yStandards = {
  // Color contrast requirements
  colorContrast: {
    normal: 4.5,     // Normal text on background
    large: 3,        // Large text (18px+ or 14px+ bold)
    nonText: 3,      // UI components and graphics
  },
  
  // Focus management
  focus: {
    outlineWidth: '2px',
    outlineColor: '#C5A880', // Champagne gold
    outlineOffset: '2px',
    outlineStyle: 'solid',
  },
  
  // Animation preferences
  animation: {
    respectsReducedMotion: true,
    maxDuration: 600, // milliseconds
    providesControls: true,
  },
  
  // Text requirements
  text: {
    minLineHeight: 1.6,
    maxLineLength: 80, // characters
    resizableUp: '200%', // 200% zoom support
  }
};

// Accessibility utility components
export const MaeroseSkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-maerose-toast
               bg-champagne-gold text-primary-noir px-4 py-2 rounded-maerose-sm
               font-semibold transition-all duration-maerose-short"
  >
    Skip to main content
  </a>
);

export const MaeroseScreenReaderText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Focus trap for modals
export const useFocusTrap = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ];

    const modal = document.querySelector('[data-modal="true"]');
    if (!modal) return;

    const focusableNodes = modal.querySelectorAll(focusableElements.join(','));
    const firstFocusable = focusableNodes[0] as HTMLElement;
    const lastFocusable = focusableNodes[focusableNodes.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    firstFocusable?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);
};
```

### **Reduced Motion Implementation**

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .maerose-card:hover {
    transform: none !important;
  }
  
  .maerose-button-primary:hover {
    transform: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --maerose-champagne-gold: #FFD700;
    --maerose-soft-mist-grey: #FFFFFF;
    --maerose-estate-border-grey: #FFFFFF;
  }
}
```

---

## 📄 **PRINT STYLE IMPLEMENTATION**

### **Print-Specific Styles**

```css
/* print.css - Maerose print styles */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body {
    background: white !important;
    color: black !important;
    font-size: 12pt !important;
    line-height: 1.4 !important;
  }
  
  .maerose-no-print {
    display: none !important;
  }
  
  .maerose-print-only {
    display: block !important;
  }
  
  .maerose-card {
    background: transparent !important;
    border: 1pt solid #333 !important;
    box-shadow: none !important;
    break-inside: avoid !important;
    margin-bottom: 1em !important;
  }
  
  h1, h2, h3 {
    color: black !important;
    page-break-after: avoid !important;
  }
  
  p {
    orphans: 3 !important;
    widows: 3 !important;
  }
  
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 10pt;
    color: #666;
  }
  
  .maerose-logo {
    filter: grayscale(100%) !important;
  }
}
```

---

## 🔧 **DEVELOPMENT WORKFLOW**

### **Quality Assurance Checklist**

```typescript
// qa-checklist.ts
export const maeroseQAChecklist = {
  visual: [
    '✓ Brand colors match exact hex specifications',
    '✓ Typography follows established hierarchy',
    '✓ Shadows are soft and feathered (never harsh)',
    '✓ Border radius consistent (24px for cards)',
    '✓ Gold accents used sparingly and strategically',
    '✓ Whitespace follows generous spacing system',
    '✓ Mobile responsiveness tested on all breakpoints'
  ],
  
  interaction: [
    '✓ Animations smooth and deliberate (300ms standard)',
    '✓ Hover effects subtle and elegant',
    '✓ Focus states visible and accessible',
    '✓ Button press animations (0.98 scale)',
    '✓ No fast or jarring animations',
    '✓ Reduced motion preferences respected'
  ],
  
  accessibility: [
    '✓ WCAG 2.2 AA contrast ratios met',
    '✓ Focus management working correctly',
    '✓ Screen reader labels present',
    '✓ Keyboard navigation functional',
    '✓ Skip links implemented',
    '✓ Form errors announced via ARIA'
  ],
  
  performance: [
    '✓ LCP < 2.0 seconds',
    '✓ CLS < 0.1',
    '✓ JavaScript bundle < 180KB gzipped',
    '✓ Images optimized and properly sized',
    '✓ Fonts preloaded',
    '✓ Critical CSS inlined'
  ],
  
  content: [
    '✓ Voice and tone consistent with brand',
    '✓ Language sophisticated but accessible',
    '✓ All copy proofread and approved',
    '✓ Meta descriptions and titles optimized',
    '✓ Structured data implemented',
    '✓ Alt text provided for all images'
  ]
};
```

---

*This technical implementation guide ensures that every aspect of the Maerose brand is implemented with precision and consistency across all platforms. Regular reviews and updates maintain the highest standards of luxury presentation and user experience.*

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Next Review**: November 2025
