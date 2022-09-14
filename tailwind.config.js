/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");

module.exports = {
  //mode: "jit",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // or 'media' or 'class', also darkMode increases bundle size noticeably
  theme: {
    textIndent: {
      none: "0rem",
      xs: "1rem",
      sm: "2rem",
      md: "3rem",
      lg: "4rem",
    },
    textShadow: {
      default: "0 2px 5px rgba(0, 0, 0, 0.5)",
      lg: "0 2px 10px rgba(0, 0, 0, 0.5)",
    },
    fontFamily: {
      work: ["Work Sans", "sans-serif"],
    },
    extend: {
      screens: {
        xs: "360px",
        xsh: { raw: `(min-height: 360px)` },
        smh: { raw: `(min-height: 600px)` },
        mdh: { raw: `(min-height: 960px)` },
        lgh: { raw: `(min-height: 1280px)` },
        xlh: { raw: `(min-height: 1920px)` },
      },
      colors: {
        primary: {
          100: "rgba(42, 171, 238, 0.03)",
          200: "rgba(42, 171, 238, 0.05)",
          300: "rgba(42, 171, 238, 0.08)",
          400: "rgba(42, 171, 238, 0.13)",
          500: "rgba(42, 171, 238, 0.19)",
          600: "rgba(42, 171, 238, 0.32)",
          700: "rgba(42, 171, 238, 0.48)",
          800: "rgba(42, 171, 238, 0.72)",
          900: "rgba(42, 171, 238, 1)",
        },
        secondary: {
          100: "rgba(12, 207, 207, 0.03)",
          200: "rgba(12, 207, 207, 0.05)",
          300: "rgba(12, 207, 207, 0.08)",
          400: "rgba(12, 207, 207, 0.13)",
          500: "rgba(12, 207, 207, 0.19)",
          600: "rgba(12, 207, 207, 0.32)",
          700: "rgba(12, 207, 207, 0.48)",
          800: "rgba(12, 207, 207, 0.72)",
          900: "rgba(12, 207, 207, 1)",
        },
        success: {
          100: "rgba(116, 222, 159, 0.03)",
          200: "rgba(116, 222, 159, 0.05)",
          300: "rgba(116, 222, 159, 0.08)",
          400: "rgba(116, 222, 159, 0.13)",
          500: "rgba(116, 222, 159, 0.19)",
          600: "rgba(116, 222, 159, 0.32)",
          700: "rgba(116, 222, 159, 0.48)",
          800: "rgba(116, 222, 159, 0.72)",
          900: "rgba(116, 222, 159, 1)",
        },
        warning: {
          100: "rgba(252, 201, 88, 0.03)",
          200: "rgba(252, 201, 88, 0.05)",
          300: "rgba(252, 201, 88, 0.08)",
          400: "rgba(252, 201, 88, 0.13)",
          500: "rgba(252, 201, 88, 0.19)",
          600: "rgba(252, 201, 88, 0.32)",
          700: "rgba(252, 201, 88, 0.48)",
          800: "rgba(252, 201, 88, 0.72)",
          900: "rgba(252, 201, 88, 1)",
        },
        danger: {
          100: "rgba(232, 54, 129, 0.03)",
          200: "rgba(232, 54, 129, 0.05)",
          300: "rgba(232, 54, 129, 0.08)",
          400: "rgba(232, 54, 129, 0.13)",
          500: "rgba(232, 54, 129, 0.19)",
          600: "rgba(232, 54, 129, 0.32)",
          700: "rgba(232, 54, 129, 0.48)",
          800: "rgba(232, 54, 129, 0.72)",
          900: "rgba(232, 54, 129, 1)",
        },
        foreground: {
          100: "rgba(255, 255, 255, 0.03)",
          200: "rgba(255, 255, 255, 0.05)",
          300: "rgba(255, 255, 255, 0.08)",
          400: "rgba(255, 255, 255, 0.13)",
          500: "rgba(255, 255, 255, 0.19)",
          600: "rgba(255, 255, 255, 0.32)",
          700: "rgba(255, 255, 255, 0.48)",
          800: "rgba(255, 255, 255, 0.72)",
          900: "rgba(255, 255, 255, 1)",
        },
        background: {
          50: "#181b32",
          100: "rgba(41, 45, 63, 0.03)",
          200: "rgba(41, 45, 63, 0.05)",
          300: "rgba(41, 45, 63, 0.08)",
          400: "rgba(41, 45, 63, 0.13)",
          500: "rgba(41, 45, 63, 0.19)",
          600: "rgba(41, 45, 63, 0.32)",
          700: "rgba(41, 45, 63, 0.48)",
          800: "rgba(41, 45, 63, 0.72)",
          900: "rgba(41, 45, 63, 1)",
        },
      },
      fontFamily: {
        work: ["Work Sans", "sans-serif"],
      },
    },
  },
  variants: {
    animation: ["responsive", "motion-safe", "motion-reduce"],
    textIndent: ["responsive"],
    extend: {},
  },
  plugins: [
    require("tailwindcss-typography")({
      // https://www.npmjs.com/package/tailwindcss-typography
      // all these options default to the values specified here
      ellipsis: true, // whether to generate ellipsis utilities
      hyphens: true, // whether to generate hyphenation utilities
      kerning: true, // whether to generate kerning utilities
      textUnset: true, // whether to generate utilities to unset text properties
      //componentPrefix: "c-", // the prefix to use for text style classes
    }),
    require("tailwindcss-rtl"),
    // Add custom plugins as such:
    plugin(({ addUtilities }) => {
      const extendTextTransform = {
        ".uppercase-first": {
          "&::first-letter": {
            textTransform: "uppercase",
          },
        },
        ".uppercase-firstOnly": {
          textTransform: "lowercase",
          "&::first-letter": {
            textTransform: "uppercase",
          },
        },
      };
      addUtilities(extendTextTransform, ["responsive"]);
    }),
  ],
};
