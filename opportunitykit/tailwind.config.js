/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EEF2F7',
        ink: { DEFAULT: '#10233F', soft: '#44546C' },
        brand: { DEFAULT: '#2F3FD0', dark: '#2431A8', tint: '#E4E8FF' },
        mark: '#FFD84D',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
