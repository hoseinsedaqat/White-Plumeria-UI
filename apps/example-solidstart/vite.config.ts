import { solidStart } from '@solidjs/start/config';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

function deskBase() {
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site : `${site}/`;
  return `${prefix}desks/solidstart/`;
}

const embedded = process.env.WPL_DESK === '1';

export default defineConfig({
  plugins: [solidStart()],
  base: embedded ? deskBase() : '/',
  resolve: {
    alias: {
      '@white-plumeria/solid': fileURLToPath(new URL('../../packages/solid/src/index.tsx', import.meta.url)),
      '@white-plumeria/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@white-plumeria/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  server: { host: '0.0.0.0', port: 5189, strictPort: true },
});
