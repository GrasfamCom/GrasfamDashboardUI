# GrasfamQuizUI — Changes Log

This document lists all changes made to align **GrasfamQuizUI** with **GrasfamHostUI** standards.

---

## Files Modified

### `vite.config.js`
- Added `path`, `fileURLToPath` imports for `__dirname` resolution
- Added `loadEnv` to `defineConfig` import
- Added `resolve.alias` with path mappings: `@/`, `@components`, `@utils`, `@pages`, `@assets`
- Added `resolve.extensions` to support `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, image formats
- Added `esbuild.jsxFactory`, `jsxFragment`, `jsxInject` block (matches HostUI)
- Added `/* eslint-env node */` header comment
- Added `server.watch.usePolling: true` (Windows/WSL compatibility)
- Changed `minify: true` → `minify: 'esbuild'` (explicit, matches HostUI)
- Replaced deprecated `polyfillModulePreload: false` → `modulePreload: { polyfill: false }`
- Removed `livePreview` plugin (HostUI has it commented out; replaced with lightweight dev log plugin)
- Changed dev env check from `process.env.MODE === 'development'` → `env.VITE_HOST_ENV === 'Local'`
- Set `build.rollupOptions.watch: false` (matches HostUI; no persistent watching in build)

### `eslint.config.js`
- Added `path` and `fileURLToPath` imports for alias resolution
- Added `eslint-plugin-import` plugin
- Added `import/resolver` settings: `node` + `alias` mapping for QuizUI paths
- Changed `react.version: '18.3'` → `react.version: 'detect'` (auto-detects installed version)
- Added `import` rules: `import/no-unresolved`, `import/named`, `import/default`, `import/no-duplicates`
- Added `react/prop-types: 'off'` (matches HostUI)

### `tailwind.config.js`
- Added `safelist` block with pattern for dynamic Tailwind classes (matches HostUI)
- Added `// eslint-disable-next-line no-undef` comment above `module.exports`

### `package.json`
- Added to `devDependencies`:
  - `eslint-plugin-import: ^2.31.0`
  - `eslint-import-resolver-alias: ^1.1.2`
  - `eslint-import-resolver-node: ^0.3.9`

### `src/App.jsx`
- Refactored from `function App()` declaration → `const App = () =>` arrow function (matches HostUI)
- Removed hardcoded `className` layout wrapper div (layout is handled per-page)

### `src/App.css`
- Removed unused `.middle` class (not referenced in any component)
- Added `#root { overflow: hidden; }` (matches HostUI)

---

## Files Created

### `jsconfig.json` *(new)*
- Enables `@/*` → `src/*` path alias in editors/IDEs
- Matches HostUI `jsconfig.json` exactly

### `src/web/WebSocketSetup.jsx` *(new)*
- Moved WebSocket logic out of `Components/Utils/` into a dedicated `web/` layer (matches HostUI structure)
- Fixed env check: `'Development'` → `'Local'` to match HostUI's `VITE_HOST_ENV` values
- Added `[QuizUI]` prefix to console messages for easier identification in multi-app setups
- Changed `window.location.reload(true)` → `window.location.reload()` (removes deprecated arg)

> **Note:** The old `src/Components/Utils/WebSocketSetup.jsx` is kept as-is since it is not currently imported anywhere. It can be safely deleted in a future cleanup pass.

---

## Summary

| File | Action |
|---|---|
| `vite.config.js` | Modified |
| `eslint.config.js` | Modified |
| `tailwind.config.js` | Modified |
| `package.json` | Modified |
| `src/App.jsx` | Modified |
| `src/App.css` | Modified |
| `jsconfig.json` | Created |
| `src/web/WebSocketSetup.jsx` | Created |
