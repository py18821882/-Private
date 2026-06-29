import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'media',
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // 品牌主色系 — 深蓝商务
        navy: {
          50: '#f0f4f9',
          100: '#dce5f0',
          200: '#b8cce4',
          300: '#8aabd3',
          400: '#5a85bd',
          500: '#3a679f',
          600: '#2b5283',
          700: '#1f3f66',
          800: '#152c4a',
          900: '#0e1d33',
          950: '#081225',
        },
        // 金色点缀
        gold: {
          DEFAULT: '#B88936',
          light: '#D4A94E',
          dark: '#94702A',
          50: '#fbf6ec',
          100: '#f5e9cc',
          200: '#ecd29a',
          300: '#dcb560',
          400: '#c89a3f',
          500: '#B88936',
          600: '#94702A',
          700: '#735620',
        },
        // 酒红 — 风险/警示
        wine: {
          DEFAULT: '#8F1D24',
          light: '#B23B42',
          50: '#fdf2f3',
          100: '#fadfe1',
          500: '#8F1D24',
          600: '#75171d',
        },
        ink: "#101114",
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(15 29 51 / 0.06), 0 1px 2px -1px rgb(15 29 51 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(15 29 51 / 0.1), 0 2px 6px -2px rgb(15 29 51 / 0.06)',
        'hero': '0 8px 32px -8px rgb(15 29 51 / 0.25)',
      },
    }
  },
  plugins: []
};

export default config;
