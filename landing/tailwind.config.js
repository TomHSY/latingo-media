/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F14',
        surface: '#1C1C24',
        coral: '#FF4E3A',
        gold: '#FFB830',
        'primary-text': '#F5F0EA',
        'secondary-text': '#9B97A3',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
