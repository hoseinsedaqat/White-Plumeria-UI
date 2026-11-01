import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.WPL_BASE ?? '/',
  plugins: [
    react({ exclude: [/pen-src\//] }),
    {
      name: 'github-pages-spa-fallback',
      apply: 'build',
      closeBundle() {
        const root = fileURLToPath(new URL('.', import.meta.url));
        copyFileSync(resolve(root, 'dist/index.html'), resolve(root, 'dist/404.html'));
      },
    },
  ],
  resolve: {
    alias: {
      '@white-plumeria/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url)),
      '@white-plumeria/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@white-plumeria/ai': fileURLToPath(new URL('../../packages/ai/src/index.ts', import.meta.url)),
      '@white-plumeria/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
    // The live preview is an HTTPS proxy. Without this, the dev client
    // tries the sandbox port and the error overlay covers the page.
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      overlay: false,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});
