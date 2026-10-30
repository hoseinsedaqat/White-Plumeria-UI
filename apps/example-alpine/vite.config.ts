import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@white-plumeria/alpine': fileURLToPath(new URL('../../packages/alpine/src/index.ts', import.meta.url)),
      '@white-plumeria/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@white-plumeria/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  server: { host: '0.0.0.0', port: 5182, strictPort: true, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4182, strictPort: true, allowedHosts: true },
});
