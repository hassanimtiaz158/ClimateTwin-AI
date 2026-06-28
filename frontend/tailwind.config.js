/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand primary — green (replaces the old sky-blue primary)
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Climate indicator colors
        climate: {
          green:  '#22c55e',
          yellow: '#eab308',
          blue:   '#3b82f6',
          orange: '#f97316',
          red:    '#ef4444',
          cyan:   '#06b6d4',
        },
        // Landing page dark palette (renamed from "dark" to avoid dark: conflict)
        forest: {
          50:  '#b7e4c7',
          100: '#95d5b2',
          200: '#74c69d',
          300: '#52b788',
          400: '#40916c',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#081c15',
          800: '#0b1f18',
          900: '#050d09',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'glow':       '0 0 60px rgba(34, 197, 94, 0.12)',
        'glow-strong':'0 0 80px rgba(34, 197, 94, 0.2)',
        'btn':        '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'btn-hover':  '0 4px 12px 0 rgb(34 197 94 / 0.3)',
        'sidebar':    '2px 0 8px -2px rgb(0 0 0 / 0.06)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float':          'float 6s ease-in-out infinite',
        'pulse-glow':     'pulse-glow 3s ease-in-out infinite',
        'slide-up':       'slide-up 0.5s ease-out',
        'slide-up-delay': 'slide-up 0.5s ease-out 0.1s both',
        'fade-in':        'fade-in 0.6s ease-out',
        'fade-in-delay':  'fade-in 0.6s ease-out 0.15s both',
        'scale-in':       'scale-in 0.3s ease-out',
        'spin-slow':      'spin 1.5s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)' },
          '50%':      { boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
