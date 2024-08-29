/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // content: ["./pages/**/*.{html,js}", "./components/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
