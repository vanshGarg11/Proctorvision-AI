export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 14px 45px rgba(15, 23, 42, 0.10)",
        glow: "0 18px 60px rgba(16, 185, 129, 0.22)",
      },
      animation: {
        floatIn: "floatIn 420ms ease-out both",
        fadeUp: "fadeUp 620ms ease-out both",
        pulseSoft: "pulseSoft 2.6s ease-in-out infinite",
        scan: "scan 2.4s ease-in-out infinite",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(18px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.7, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.04)" },
        },
        scan: {
          "0%": { transform: "translateY(-80%)", opacity: 0 },
          "18%": { opacity: 1 },
          "82%": { opacity: 1 },
          "100%": { transform: "translateY(260%)", opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
