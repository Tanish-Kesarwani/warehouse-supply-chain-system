/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1720",
        steel: "#1c2733",
        mist: "#ced8e4",
        ember: "#ff9d2e",
        signal: "#12b981",
        danger: "#ef4444"
      },
      fontFamily: {
        display: ["'Segoe UI Semibold'", "sans-serif"],
        body: ["'Segoe UI'", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 40px rgba(5, 11, 20, 0.28)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(255,157,46,0.18), transparent 28%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
      },
      backgroundSize: {
        "hero-grid": "auto, 32px 32px, 32px 32px"
      }
    }
  },
  plugins: []
};
