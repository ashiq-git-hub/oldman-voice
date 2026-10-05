import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: "#FAF7F0",
          DEFAULT: "#F4F0E7",
          dark: "#EAE3D2",
          deep: "#DFD7C2",
        },
        ink: {
          light: "#3A3935",
          DEFAULT: "#1E1D1A",
          muted: "#636058",
          faint: "#8C887E",
        },
        olive: {
          light: "#717360",
          DEFAULT: "#565847",
          dark: "#3F4133",
        },
        brass: {
          light: "#B29B6C",
          DEFAULT: "#9A8358",
          dark: "#7E6941",
        },
        charcoal: {
          DEFAULT: "#20221D",
          deep: "#191A16",
        },
        rule: {
          light: "#E5DEC9",
          DEFAULT: "#DCD3BC",
          dark: "#BCB195",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "EB Garamond", "Baskerville", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      letterSpacing: {
        widest: ".2em",
        archive: ".16em",
      },
    },
  },
  plugins: [],
};
export default config;
