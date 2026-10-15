/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0B0B',
          surface: '#151515',
          card: '#1F1F1F',
          cardAlt: '#272727',
          border: '#2E2E2E',
          borderSubtle: '#222222',
          muted: '#8A8A8A',
          subtext: '#6A6A6A',
        },
        lime: {
          300: '#D4FF78',
          400: '#B8F55A',
          500: '#A4EA3E',
          600: '#8ACF26',
          DEFAULT: '#B8F55A',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'lime-glow': '0 0 25px -5px rgba(184, 245, 90, 0.25)',
        'dark-card': '0 8px 30px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
