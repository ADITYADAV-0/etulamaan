import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: "#1F3864",
        blue: "#0070C0",
        gold: "#C69214",
        green: "#1E7A46",
        red: "#B23A2E",
        dark: "#263238",
        gray: "#5B6B73",
        light: "#F4F7FB",
      },
    },
  },
  plugins: [],
};
export default config;
