/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0D12',
          secondary: '#12141C',
          card: '#171A24',
          tertiary: '#1D2029',
        },
        brand: {
          DEFAULT: '#7C5CFC',
          light: '#9B82FF',
          dark: '#5E3ED9',
        },
        academic: '#6366F1',
        financial: '#10B981',
        household: '#A855F7',
        personal: '#818CF8',
        income: '#10B981',
        expense: '#F43F5E',
        border: '#232735',
      },
    },
  },
  plugins: [],
};
