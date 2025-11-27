/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal SmartKnee (verde/mostaza/rojo)
        brand: {
          50:  "#f7f7f5",
          100: "#f2f2f2", // fondo claro
          200: "#dfe6ba",
          300: "#cbd781",
          400: "#bfa521", // mostaza
          500: "#738C18", // verde principal
          600: "#5f7013",
          700: "#4a540e",
          800: "#373b09",
          900: "#242405",
        },
        accent: {
          500: "#BFA521", // mostaza
        },
        warning: {
          500: "#8C6B07", // dorado oscuro
        },
        danger: {
          500: "#8C2C23", // rojo
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
