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
        // Lea Aesthetics Brand Colors
        'deep-charcoal': '#111111',
        'elegant-silver': '#D6D6D6', 
        'light-platinum': '#EAEAEA',
        'muted-gray': '#888888',
        'silver-accent': '#B8B8B8',
        'pure-white': '#FFFFFF',

        // Semantic Mappings
        primary: {
          DEFAULT: '#111111', // Deep Charcoal
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#D6D6D6', 
          300: '#B8B8B8',
          400: '#888888',
          500: '#111111',
          600: '#0D0D0D',
          700: '#0A0A0A',
          800: '#070707',
          900: '#030303',
        },
        
        surface: {
          DEFAULT: '#D6D6D6', // Elegant Silver
          light: '#EAEAEA', // Light Platinum  
          dark: '#B8B8B8', // Silver Accent
        },

        background: {
          DEFAULT: '#EAEAEA', // Light Platinum
          paper: '#FFFFFF', // Pure White
          subtle: '#F8F8F8',
        },

        text: {
          primary: '#111111', // Deep Charcoal
          secondary: '#888888', // Muted Gray
          muted: '#B8B8B8', // Silver Accent
          inverse: '#FFFFFF', // Pure White
        },

        border: {
          DEFAULT: '#B8B8B8', // Silver Accent
          light: '#D6D6D6', // Elegant Silver
          subtle: '#EAEAEA', // Light Platinum
        },

        // Status colors (subtle versions maintaining theme)
        success: {
          DEFAULT: '#4A5D4A',
          light: '#E8F0E8',
          dark: '#3A4D3A',
        },
        warning: {
          DEFAULT: '#5D5A4A', 
          light: '#F0EEE8',
          dark: '#4D4A3A',
        },
        error: {
          DEFAULT: '#5D4A4A',
          light: '#F0E8E8', 
          dark: '#4D3A3A',
        },
        info: {
          DEFAULT: '#4A4A5D',
          light: '#E8E8F0',
          dark: '#3A3A4D', 
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
        // Professional shadows using monochrome base
        card: '0px 4px 16px rgba(17, 17, 17, 0.08)',
        elevated: '0px 8px 24px rgba(17, 17, 17, 0.12)',
        subtle: '0px 2px 8px rgba(17, 17, 17, 0.06)',
        focus: '0px 0px 0px 3px rgba(184, 184, 184, 0.3)',
        'focus-ring': '0 0 0 2px rgba(184, 184, 184, 0.3)',
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
        'silver-glow': 'silverGlow 2s ease-in-out infinite',
        'pulse-silver': 'pulseSilver 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        silverGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(184, 184, 184, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(184, 184, 184, 0.3)' },
        },
        pulseSilver: {
          '0%, 100%': { backgroundColor: 'rgba(214, 214, 214, 0.5)' },
          '50%': { backgroundColor: 'rgba(184, 184, 184, 0.8)' },
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
