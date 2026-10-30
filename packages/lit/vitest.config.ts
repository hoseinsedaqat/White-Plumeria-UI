import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@white-plumeria/core': `${root}core/src/index.ts`,
      '@white-plumeria/tokens': `${root}tokens/src/index.ts`,
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  },
});
