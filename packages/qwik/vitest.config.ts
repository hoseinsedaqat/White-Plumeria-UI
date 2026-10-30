import { qwikVite } from '@qwik.dev/core/optimizer';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  plugins: [qwikVite()],
  resolve: {
    alias: {
      '@white-plumeria/core': `${root}core/src/index.ts`,
      '@white-plumeria/tokens': `${root}tokens/src/index.ts`,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.tsx'],
  },
});
