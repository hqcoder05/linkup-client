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
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.08)',
        lift: '0 8px 24px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
};
