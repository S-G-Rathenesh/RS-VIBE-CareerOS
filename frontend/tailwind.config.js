/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        foreground: '#f3f4f6',
        card: {
          DEFAULT: 'rgba(18, 20, 29, 0.7)',
          hover: 'rgba(28, 31, 46, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          DEFAULT: '#6366f1',
          gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        },
        accent: {
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          pink: '#ec4899',
          emerald: '#10b981',
        },
        surface: {
          50: '#161922',
          100: '#1f2430',
          200: '#2a3042',
          300: '#384158',
          400: '#475069',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'sidebar': '16rem',
        'sidebar-collapsed': '4.5rem',
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-accent': '0 0 25px -5px rgba(168, 85, 247, 0.4)',
        'glow-sm': '0 0 12px -3px rgba(99, 102, 241, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-hover': '0 20px 40px -12px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'sidebar': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'glow-pulse': 'glowPulse 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px -3px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 25px -3px rgba(99, 102, 241, 0.5)' },
        },
      }
    },
  },
  plugins: [],
}
