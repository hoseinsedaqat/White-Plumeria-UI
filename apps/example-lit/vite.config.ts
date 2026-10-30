import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@white-plumeria/lit': fileURLToPath(new URL('../../packages/lit/src/index.ts', import.meta.url)),
      '@white-plumeria/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@white-plumeria/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  server: { host: '0.0.0.0', port: 5181, strictPort: true, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4181, strictPort: true, allowedHosts: true },
});
