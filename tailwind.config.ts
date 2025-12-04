import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand (from logo background)
        primary: {
          50: "#e5f0ff",
          100: "#cfe2ff",
          200: "#9ec4ff",
          300: "#6ea7ff",
          400: "#3d89ff",
          500: "#1f78ff", // main
          600: "#1760d4",
          700: "#1148a3",
          800: "#0a306f",
          900: "#061b3d",
        },

        // Accent for success / “check” UX
        accent: {
          50: "#e6fff4",
          100: "#c1ffe2",
          200: "#8bffd0",
          300: "#52f2b0",
          400: "#20d48b",
          500: "#00b86e",
          600: "#00925a",
          700: "#007047",
          800: "#004d33",
          850: "#151515",
          900: "#101010",
          950: "#080808"
        },

        // Neutral surfaces (dark UI like you started)
        surface: {
          50: "#f5f5f5",
          100: "#e5e5e5",
          200: "#d4d4d4",
          300: "#a3a3a3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#1C1C1C",
          800: "#171717",
          900: "#0a0a0a",
        },

        // Semantic
        success: "#20d48b",
        info: "#1f78ff",
        warn: "#fbbf24",
        danger: "#ef4444",
      },

      backgroundImage: {
        "gradient-bottom":
          "linear-gradient(to bottom, #1f78ff 0%, #1760d4 40%, #0a306f 100%)",
        "gradient-right":
          "linear-gradient(to right, #1f78ff 0%, #1760d4 40%, #0a306f 100%)",
      },

      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
