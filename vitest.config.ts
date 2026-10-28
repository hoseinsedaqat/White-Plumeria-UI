import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  resolve: {
    conditions: ['browser'],
    alias: {
      '@white-plumeria/tokens': `${root}packages/tokens/src/index.ts`,
      '@white-plumeria/core': `${root}packages/core/src/index.ts`,
      '@white-plumeria/ai': `${root}packages/ai/src/index.ts`,
      '@white-plumeria/react': `${root}packages/react/src/index.ts`,
      '@white-plumeria/vue': `${root}packages/vue/src/index.ts`,
      '@white-plumeria/elements': `${root}packages/elements/src/index.ts`,
    },
  },
  test: {
    environment: 'happy-dom',
    include: [
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
      'tests/**/*.test.ts',
      'apps/docs/src/**/*.test.ts',
      'apps/docs/src/**/*.test.tsx',
    ],
    exclude: ['**/dist/**', '**/node_modules/**'],
    setupFiles: ['./tests/setup.ts'],
  },
});
