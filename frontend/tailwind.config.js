/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noc: {
          dark: "#0b0f19",
          card: "#111827",
          sidebar: "#090d16",
          border: "#1f2937",
          hover: "#1f293d",
          accent: "#06b6d4"
        }
      }
    },
  },
  plugins: [],
}
