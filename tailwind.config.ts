import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef3f9",
          100: "#d6e1ef",
          200: "#aec3de",
          300: "#7f9fc6",
          400: "#4f78a8",
          500: "#2f5a8b",
          600: "#1d4370",
          700: "#133458",
          800: "#0d2a47",
          900: "#0a2240",
        },
        sand: {
          50: "#fbf6f0",
          100: "#f6ebdd",
          200: "#f0dcc7",
          300: "#e6c8a8",
        },
        gold: { 400: "#f7c04a", 500: "#f5b301", 600: "#d79a00" },
        khqr: "#D80027",
        aba: "#004F71",
        wing: "#78BE20",
        acleda: "#1B365D",
        bakong: "#CE1126",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,34,64,0.04), 0 8px 24px -8px rgba(10,34,64,0.10)",
        lift: "0 18px 40px -12px rgba(10,34,64,0.25)",
        khqr: "0 10px 25px -5px rgba(216, 0, 39, 0.25)",
      },
      keyframes: {
        scanLine: {
          "0%": { top: "0%", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { top: "95%", opacity: "0" },
        },
      },
      animation: {
        scan: "scanLine 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
