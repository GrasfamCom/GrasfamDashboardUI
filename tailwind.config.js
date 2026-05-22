/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /drop|hover|text-(red|green|blue)-500|bg-blue-600/,
      variants: ['sm', 'md', 'lg', 'hover', 'focus'],
    },
  ],
  plugins: [],
}
