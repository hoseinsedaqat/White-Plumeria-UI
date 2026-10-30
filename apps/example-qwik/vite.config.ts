import { qwikVite } from '@qwik.dev/core/optimizer';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [qwikVite({ csr: true })],
  resolve: {
    alias: {
      '@white-plumeria/qwik': fileURLToPath(new URL('../../packages/qwik/src/index.ts', import.meta.url)),
      '@white-plumeria/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@white-plumeria/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  server: { host: '0.0.0.0', port: 5180, strictPort: true, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4180, strictPort: true, allowedHosts: true },
});
