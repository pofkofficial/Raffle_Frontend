/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust if using TypeScript
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B6B", // Vibrant Red
        secondary: "#FFD93D", // Bright Yellow
        success: "#6BCB77", // Green
        accent: "#4D96FF", // Blue
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};