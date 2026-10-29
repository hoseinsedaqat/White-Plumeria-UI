import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  resolve: {
    conditions: ['browser'],
    alias: [
      { find: '@white-plumeria/tokens', replacement: `${root}packages/tokens/src/index.ts` },
      { find: '@white-plumeria/core', replacement: `${root}packages/core/src/index.ts` },
      { find: '@white-plumeria/ai', replacement: `${root}packages/ai/src/index.ts` },
      { find: '@white-plumeria/react', replacement: `${root}packages/react/src/index.ts` },
      { find: '@white-plumeria/vue', replacement: `${root}packages/vue/src/index.ts` },
      { find: '@white-plumeria/elements', replacement: `${root}packages/elements/src/index.ts` },
      { find: '@angular/core/testing', replacement: `${root}packages/angular/node_modules/@angular/core/fesm2022/testing.mjs` },
      { find: '@angular/core', replacement: `${root}packages/angular/node_modules/@angular/core/fesm2022/core.mjs` },
      {
        find: '@angular/platform-browser/testing',
        replacement: `${root}packages/angular/node_modules/@angular/platform-browser/fesm2022/testing.mjs`,
      },
      {
        find: '@angular/platform-browser',
        replacement: `${root}packages/angular/node_modules/@angular/platform-browser/fesm2022/platform-browser.mjs`,
      },

    ],
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
