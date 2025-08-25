// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "2rem",
        lg: "2rem",
        xl: "2rem",
        "2xl": "2.5rem",
      },
      screens: { "2xl": "1280px" }, // keeps layouts comfortably narrow
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        /* Lighter blue brand scale */
        brand: {
          50:  "#f2f8ff",
          100: "#e6f0ff",
          200: "#cfe3ff",
          300: "#a9cdff",
          400: "#7fb5ff",
          500: "#5aa3ff", // default button bg
          600: "#388bff",
          700: "#2f74d8",
          800: "#295fae",
          900: "#244f8f",
        },
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,0.06)",
        card: "0 8px 30px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
      keyframes: {
        "pulse-soft": {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        shimmer:
          "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "shimmer":
          "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(160,174,192,0.15) 50%, rgba(0,0,0,0) 100%)",
      },
      ringColor: {
        brand: "#7fb5ff",
      },
    },
  },
  plugins: [],
};

export default config;
