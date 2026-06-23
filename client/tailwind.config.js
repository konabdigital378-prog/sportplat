/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sport: {
          green: '#009E49',
          'green-dark': '#006B32',
          'green-light': '#00CF5F',
          red: '#EF2B2D',
          gold: '#FCD116',
          black: '#080808',
          dark: '#111111',
          dark2: '#1a1a1a',
          dark3: '#222222',
        }
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
      clipPath: {
        polygon: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
      }
    }
  },
  plugins: []
};
