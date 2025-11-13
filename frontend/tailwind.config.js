/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#06325a',
        'accent': '#3498db',
        'light-bg': '#f1f5f9',
      },
    },
  },
  plugins: [],
}