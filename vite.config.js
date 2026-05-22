/* eslint-env node */
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dependencies } from './package.json';
import federation from "@originjs/vite-plugin-federation";
import livePreview from 'vite-live-preview';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), "");
  const isOnResearch = env.VITE_HOST_ENV === 'Local' || mode === 'development';

  return {
    base: "/dashboard/",
    plugins: [
      react(),
      isOnResearch &&
      livePreview({
        config: {
          build: {
            mode: 'development',
            sourcemap: true,
            outDir: 'dist',
          },
        },
      }),
      federation({
        name: "dashboard",
        filename: "dashboard.js",
        exposes: {
          './App': './src/App.jsx',
          './styles': './src/App.css',
        },
        shared: {
          react: {
            requiredVersion: dependencies.react,
            singleton: true,
          },
          'react-dom': {
            requiredVersion: dependencies['react-dom'],
            singleton: true,
          },
        },
      }),
    ],
    server: {
      port: 5178,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5178,
      },
      watch: {
        usePolling: true,
      },
    },
    preview: {
      port: 5178,
    },
    build: {
      base: "./",
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name].[ext]",
          format: 'es',
          compact: true,
          dynamicImportInCjs: true,
        },
        cache: false,
        watch: false,
      },
      write: true,
      modulePreload: {
        polyfill: false,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/Components'),
        '@utils': path.resolve(__dirname, './src/Components/Utils'),
        '@pages': path.resolve(__dirname, './src/Components/Pages'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.jpg', '.png', '.svg'],
    },
    esbuild: {
      jsxFactory: '_jsx',
      jsxFragment: '_jsxFragment',
      jsxInject: `import { createElement as _jsx, Fragment as _jsxFragment } from 'react'`,
    },
  };
});
