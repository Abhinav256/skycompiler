/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sky: {
          DEFAULT: "#38BDF8",
          azure: "#0EA5E9",
          deep: "#0369A1",
        },
        ink: "var(--text-primary)",
        mist: "var(--text-secondary)",
        "mist-light": "var(--text-muted)",
        surface: {
          base: "var(--surface-base)",
          elevated: "var(--surface-elevated)",
          overlay: "var(--surface-overlay)",
          solid: "var(--surface-solid)",
          border: "var(--surface-border)",
        },
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        panel: "var(--radius-xl)",
        control: "var(--radius-md)",
      },
      boxShadow: {
        cloud: "var(--shadow-lg)",
        glow: "var(--shadow-glow)",
        glass: "var(--shadow-md)",
        sm: "var(--shadow-sm)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(35px) translateY(-15px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        driftSlow: {
          "0%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(-45px) translateY(12px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        driftMed: {
          "0%": { transform: "translateX(0) translateY(0)" },
          "33%": { transform: "translateX(20px) translateY(-8px)" },
          "66%": { transform: "translateX(-15px) translateY(6px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
      },
      animation: {
        drift: "drift 20s ease-in-out infinite",
        driftSlow: "driftSlow 28s ease-in-out infinite",
        driftMed: "driftMed 22s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
