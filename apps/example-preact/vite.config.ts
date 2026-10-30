import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@white-plumeria/preact': fileURLToPath(
        new URL('../../packages/preact/src/index.ts', import.meta.url),
      ),
      '@white-plumeria/core': fileURLToPath(
        new URL('../../packages/core/src/index.ts', import.meta.url),
      ),
      '@white-plumeria/tokens': fileURLToPath(
        new URL('../../packages/tokens/src/index.ts', import.meta.url),
      ),
      '@white-plumeria/styles': fileURLToPath(
        new URL('../../packages/styles/src/index.css', import.meta.url),
      ),
    },
  },
  server: { host: '0.0.0.0', port: 5179, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4179, allowedHosts: true },
});
