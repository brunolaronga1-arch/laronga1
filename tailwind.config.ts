import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EF", // fundo principal
        sand: "#EFEAE1", // seção alternada
        ink: "#1C1916", // texto principal / faixa escura
        stone: "#6B6259", // texto secundário
        line: "#DED6C9", // filetes (sempre 1px)
        amber: {
          DEFAULT: "#B8862B", // acento: filetes, hover e detalhes gráficos
          text: "#8A6118", // mesmo âmbar escurecido para texto pequeno (contraste AA sobre o fundo claro)
        },
        whatsapp: "#25D366",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        prose: "62ch",
        page: "1320px",
      },
      letterSpacing: {
        eyebrow: "0.24em",
      },
    },
  },
  plugins: [],
} satisfies Config;
