import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102542",
        moss: "#1f5c4b",
        sand: "#f4efe6",
        ember: "#d96c3d",
        mist: "#dce6e9"
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 20px 45px rgba(16, 37, 66, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
