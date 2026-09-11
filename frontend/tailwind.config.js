/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: "#B3122A", dark: "#5C0511" },
        orange: { DEFAULT: "#EE7203" },
        cream: "#FBECE6",
        ink: "#241A16",
        mute: "#8A7A72",
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};
