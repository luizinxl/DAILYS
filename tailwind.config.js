/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0E27',
          secondary: '#12172F',
          card: '#161D3A',
          tertiary: '#1A2244',
        },
        brand: {
          DEFAULT: '#1C64EF',
          light: '#7080FE',
          dark: '#1450C1',
        },
        academic: '#1C64EF',
        financial: '#2ECC71',
        household: '#9B59B6',
        income: '#2ECC71',
        expense: '#E74C3C',
      },
    },
  },
  plugins: [],
};
