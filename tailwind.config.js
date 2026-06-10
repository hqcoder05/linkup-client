/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d8ebff',
          500: '#0a66c2',
          600: '#0859aa',
          700: '#074b90',
        },
        ink: '#1f2937',
        surface: {
          light: '#ffffff',
          dark: '#000000', // Pure black
          muted: '#16181c', // Deep neutral gray
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05)',
        lift: '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
