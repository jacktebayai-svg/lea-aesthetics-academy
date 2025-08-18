/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Aesthetics Brand Colors
        platinum: '#E5E4E2',
        silver: '#C0C0C0',
        'rose-gold': '#E8B4B8',
        charcoal: '#36454F',

        // Semantic Mappings
        primary: {
          DEFAULT: '#36454F', // Charcoal
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAEC',
          300: '#C0C0C0', // Silver
          400: '#8A9BA8',
          500: '#36454F', // Charcoal
          600: '#2D3A44',
          700: '#242F39',
          800: '#1B242D',
          900: '#121922',
        },
        
        accent: {
          DEFAULT: '#E8B4B8', // Rose Gold
          50: '#FDF8F9',
          100: '#FBF1F2',
          200: '#F7E3E5',
          300: '#F3D5D8',
          400: '#EBC4C8',
          500: '#E8B4B8', // Rose Gold
          600: '#E19DA2',
          700: '#DA868C',
          800: '#D36F76',
          900: '#CC5860',
        },

        surface: {
          DEFAULT: '#E5E4E2', // Platinum
          light: '#F2F1EF',
          dark: '#C0C0C0', // Silver
        },

        background: {
          DEFAULT: '#FAFAFA', // Clean white base
          paper: '#FFFFFF', // Pure White
          subtle: '#F8F8F8',
          platinum: '#E5E4E2',
        },

        text: {
          primary: '#36454F', // Charcoal
          secondary: '#6B7780',
          muted: '#8A9BA8',
          inverse: '#FFFFFF',
          accent: '#E8B4B8', // Rose Gold for highlights
        },

        border: {
          DEFAULT: '#C0C0C0', // Silver
          light: '#E5E4E2', // Platinum
          subtle: '#F1F3F4',
        },

        // Status colors (luxury theme consistent)
        success: {
          DEFAULT: '#4A6741', // Deep sage green
          light: '#F0F7ED',
          dark: '#3A5235',
          accent: '#E8F5E3',
        },
        warning: {
          DEFAULT: '#B8860B', // Dark goldenrod 
          light: '#FDF9E7',
          dark: '#996F09',
          accent: '#F9F1D1',
        },
        error: {
          DEFAULT: '#A0424D', // Muted burgundy
          light: '#F8ECED', 
          dark: '#7A323B',
          accent: '#F2E1E4',
        },
        info: {
          DEFAULT: '#4A5B6B', // Steel blue
          light: '#EDF1F4',
          dark: '#394954',
          accent: '#E3EAEF', 
        },
      },

      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      fontSize: {
        // Heading Scale
        'heading-1': ['48px', { lineHeight: '1.3', letterSpacing: '-0.5px' }],
        'heading-2': ['36px', { lineHeight: '1.3', letterSpacing: '-0.25px' }], 
        'heading-3': ['28px', { lineHeight: '1.4', letterSpacing: '-0.1px' }],
        'heading-4': ['24px', { lineHeight: '1.4' }],
        
        // Body Text Scale
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body-md': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.6' }],
        'body-xs': ['12px', { lineHeight: '1.5' }],
        
        // UI Text Scale  
        'ui-lg': ['16px', { lineHeight: '1.5' }],
        'ui-md': ['14px', { lineHeight: '1.5' }],
        'ui-sm': ['12px', { lineHeight: '1.4' }],
      },

      boxShadow: {
        // Luxury shadows using charcoal base
        card: '0px 4px 16px rgba(54, 69, 79, 0.10)',
        elevated: '0px 8px 24px rgba(54, 69, 79, 0.15)',
        subtle: '0px 2px 8px rgba(54, 69, 79, 0.08)',
        luxury: '0px 12px 40px rgba(54, 69, 79, 0.20)',
        focus: '0px 0px 0px 3px rgba(232, 180, 184, 0.4)', // Rose gold focus
        'focus-ring': '0 0 0 2px rgba(232, 180, 184, 0.3)',
        'rose-glow': '0px 4px 20px rgba(232, 180, 184, 0.25)',
      },

      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem', // 352px
        '112': '28rem', // 448px
        '128': '32rem', // 512px
      },

      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '6px',
      },

      animation: {
        'fade-in': 'fadeIn 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slideUp 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'luxury-glow': 'luxuryGlow 2s ease-in-out infinite',
        'pulse-rose': 'pulseRose 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'elegant-slide': 'elegantSlide 400ms cubic-bezier(0.23, 1, 0.32, 1)',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        luxuryGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(232, 180, 184, 0)' },
          '50%': { boxShadow: '0 0 25px rgba(232, 180, 184, 0.4)' },
        },
        pulseRose: {
          '0%, 100%': { backgroundColor: 'rgba(232, 180, 184, 0.1)' },
          '50%': { backgroundColor: 'rgba(232, 180, 184, 0.2)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        elegantSlide: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionTimingFunction: {
        'lea': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
