/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(79, 70, 229, 0.12), 0 2px 8px -2px rgba(15, 23, 42, 0.06)',
        glow: '0 0 0 1px rgba(99, 102, 241, 0.08), 0 8px 32px -8px rgba(99, 102, 241, 0.35)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px -12px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 45%, #14b8a6 100%)',
        'gradient-soft': 'linear-gradient(180deg, #eef2ff 0%, #ffffff 60%)',
        'gradient-hero': 'radial-gradient(ellipse 80% 60% at 70% -10%, rgba(99,102,241,0.18), transparent), radial-gradient(ellipse 60% 50% at 10% 20%, rgba(20,184,166,0.12), transparent)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 14s linear infinite',
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
