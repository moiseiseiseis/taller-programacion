import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          beige: "#F5F1E7",      // Fondo general
          dark: "#1E1E1E",       // Texto principal
          highlight: "#C2D3E4",  // Resalte de texto ("para no")
          salmon: "#D5615B",     // Suéter y línea decorativa
          steel: "#9DB6D3",      // Pantalones (personajes sentados)
          mint: "#9BCCB1",       // Zapatos
          brown: "#5A453A",      // Trazos de iconos inferiores
          ieee: "#00629B",       // Logo IEEE
        }
      },
      fontFamily: {
        // Asignaremos las variables que crearemos en el layout
        serif: ['var(--font-lora)', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['var(--font-montserrat)', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config;