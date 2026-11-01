import analog from '@analogjs/platform';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

function deskBase() {
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site : `${site}/`;
  return `${prefix}desks/analog/`;
}

const embedded = process.env.WPL_DESK === '1';

export default defineConfig({
  base: embedded ? deskBase() : '/',
  resolve: {
    alias: {
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  plugins: [
    analog({
      static: true,
      prerender: { routes: async () => ['/'] },
    }),
  ],
  server: { host: '0.0.0.0', port: 5188, strictPort: true },
});
