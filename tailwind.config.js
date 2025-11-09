/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        content: "rgb(var(--color-content) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)"
      }
    }
  },
  plugins: []
};
