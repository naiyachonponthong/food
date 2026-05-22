import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#FFF5F1",
          100: "#FFE6DC",
          200: "#FFC9B6",
          300: "#FFA688",
          400: "#FF7E54",
          500: "#F2542D",
          600: "#D63E1B",
          700: "#B22F12",
          800: "#892611",
          900: "#5E1A0C",
        },
        herb: {
          50: "#EFFBF3",
          100: "#D6F5DF",
          200: "#A8EAB9",
          300: "#73D78D",
          400: "#3FBC65",
          500: "#0FA968",
          600: "#0A8C55",
          700: "#076E42",
          800: "#055132",
          900: "#033620",
        },
        cream: {
          50: "#FDFCF8",
          100: "#FBF7F0",
          200: "#F5EEDF",
          300: "#EBE0C8",
          400: "#D9C6A4",
        },
        ink: {
          50: "#F7F5F2",
          100: "#E7E2DA",
          200: "#C9C1B3",
          300: "#A39884",
          400: "#7A7060",
          500: "#5A5142",
          600: "#3F3829",
          700: "#2A2418",
          800: "#1C170E",
          900: "#0E0B06",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(28, 23, 14, 0.08)",
        pop: "0 16px 40px -12px rgba(242, 84, 45, 0.35)",
        lift: "0 24px 60px -20px rgba(28, 23, 14, 0.18)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
