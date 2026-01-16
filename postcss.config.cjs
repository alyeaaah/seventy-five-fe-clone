module.exports = {
  plugins: {
    "postcss-import": {
      from: "src/assets/css/app.css",
    },
    "postcss-advanced-variables": {},
    // "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
