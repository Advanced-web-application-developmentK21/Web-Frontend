/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        highlight: "#00aab0",
        lightBg: "#e6f4f1",
        accent: "#e2ffff",
      },
    },
  },
  plugins: [],
};
