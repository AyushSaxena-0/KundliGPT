/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090F",
        card: "#181825",
        primary: {
          DEFAULT: "#6C3EFF",
          hover: "#572FD6",
        },
        secondary: {
          DEFAULT: "#1F1B3A",
          hover: "#2A254F",
        },
        accent: {
          DEFAULT: "#FFD369",
          hover: "#E6BE5E",
        },
        mutedText: "#9CA3AF",
        border: "#2A2A38",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
}
