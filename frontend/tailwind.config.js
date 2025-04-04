/** @type {import('tailwindcss').Config} */
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        clashDisplay: [
          'ClashDisplay-Variable',
          'ClashDisplay-Extralight',
          'ClashDisplay-Light',
          'ClashDisplay-Regular',
          'ClashDisplay-Medium',
          'ClashDisplay-Semibold',
          'ClashDisplay-Bold',
          'sans-serif',
        ],
        sora: ['Sora', 'sans-serif'],
        code: ['Source Code Pro', 'monospace'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],

};
