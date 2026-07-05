/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Design system — dark slate palette with indigo/violet accent
        surface: {
          DEFAULT: '#0f1117',   // page bg
          card: '#161b27',      // card bg
          elevated: '#1e2535',  // hovered / elevated cards
          border: '#2a3347',    // borders
        },
        accent: {
          DEFAULT: '#7c6ff7',   // primary indigo-violet
          soft: '#4f46e5',
          glow: 'rgba(124, 111, 247, 0.25)',
        },
        text: {
          primary: '#e8eaf0',
          muted: '#8891a4',
          faint: '#4a5468',
        },
        positive: '#22c55e',
        negative: '#f43f5e',
        warning: '#f59e0b',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(124,111,247,0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.35s cubic-bezier(0.32,0.72,0,1)',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
