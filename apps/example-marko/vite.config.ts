import marko from '@marko/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [marko({ linked: false })],
  resolve: {
    alias: [
      {
        find: '@white-plumeria/marko/tags',
        replacement: fileURLToPath(new URL('../../packages/marko/src/tags', import.meta.url)),
      },
      {
        find: '@white-plumeria/marko',
        replacement: fileURLToPath(new URL('../../packages/marko/src/index.ts', import.meta.url)),
      },
      {
        find: '@white-plumeria/core',
        replacement: fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      },
      {
        find: '@white-plumeria/tokens',
        replacement: fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
      },
      {
        find: '@white-plumeria/styles',
        replacement: fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
      },
    ],
  },
  server: { host: '0.0.0.0', port: 5183, strictPort: true, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4183, strictPort: true, allowedHosts: true },
});
