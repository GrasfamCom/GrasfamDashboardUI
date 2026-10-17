/** @type {import('tailwindcss').Config} */
module.exports = {
  // Option A (per-remote scoping): every utility is emitted as `.r-dashboard .x`, so another remote's plain `.x` (same
  // specificity, loaded later) cannot override this remote's sm:/lg:/xl: variants. App.jsx renders the root class.
  important: ".r-dashboard",
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
