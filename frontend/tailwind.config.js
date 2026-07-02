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
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        dark: {
          50:  '#1a1a2e',
          100: '#16213e',
          200: '#0f172a',
          300: '#0d0d1a',
          400: '#050510',
          500: '#020208',
        },
        accent: {
          blue:   '#3b82f6',
          indigo: '#6366f1',
          teal:   '#14b8a6',
          green:  '#10b981',
        }
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':    'linear-gradient(135deg, #050510 0%, #0d0d1a 50%, #16213e 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.1))',
        'gradient-button':  'linear-gradient(135deg, #7c3aed, #3b82f6)',
        'gradient-purple':  'linear-gradient(135deg, #7c3aed, #a855f7)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-glow':   'pulse-glow 2s ease-in-out infinite',
        'spin-slow':    'spin-slow 20s linear infinite',
        'gradient':     'gradient-shift 4s ease infinite',
        'fade-in-up':   'fade-in-up 0.6s ease-out forwards',
        'fade-in':      'fade-in 0.4s ease-out forwards',
        'slide-in':     'slide-in-right 0.3s ease-out forwards',
        'bounce-slow':  'bounce 3s ease-in-out infinite',
      },
      keyframes: {
        float:            { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        'pulse-glow':     { '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(59,130,246,0.2)' } },
        'spin-slow':      { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'gradient-shift': { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
        'fade-in-up':     { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-right': { from: { transform: 'translateX(-100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
      boxShadow: {
        'glow-purple': '0 0 40px rgba(124, 58, 237, 0.4)',
        'glow-blue':   '0 0 40px rgba(59, 130, 246, 0.4)',
        'glow-sm':     '0 0 20px rgba(124, 58, 237, 0.2)',
        'card':        '0 4px 40px rgba(0, 0, 0, 0.4)',
        'card-hover':  '0 8px 60px rgba(124, 58, 237, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
