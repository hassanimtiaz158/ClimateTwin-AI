/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        climate: {
          green: '#22c55e',
          blue: '#3b82f6',
          orange: '#f97316',
          red: '#ef4444',
        },
        dark: {
          50: '#b7e4c7',
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(82, 183, 136, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(82, 183, 136, 0.4)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
