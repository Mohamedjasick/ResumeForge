/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forge: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bcfd',
          400: '#8196fa',
          500: '#6272f5',
          600: '#4c52e8',
          700: '#3d40cc',
          800: '#3337a4',
          900: '#2e3282',
          950: '#1c1e4f',
        },
        ink: {
          50:  '#f7f7f8',
          100: '#ededf0',
          200: '#d8d8de',
          300: '#b6b6c1',
          400: '#8e8e9e',
          500: '#717183',
          600: '#5c5c6c',
          700: '#4b4b59',
          800: '#40404c',
          900: '#383843',
          950: '#111118',
        },
      },
      animation: {
        'slide-in':   'slideIn 0.3s ease-out',
        'fade-up':    'fadeUp 0.4s ease-out',
        'toast-in':   'toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'score-fill': 'scoreFill 1s ease-out forwards',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        slideIn:   { '0%': { transform: 'translateX(-100%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        fadeUp:    { '0%': { transform: 'translateY(12px)',  opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        toastIn:   { '0%': { transform: 'translateX(120%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        scoreFill: { '0%': { width: '0%' }, '100%': { width: 'var(--score-width)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
