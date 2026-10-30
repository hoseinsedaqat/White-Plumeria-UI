import marko from '@marko/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('../', import.meta.url));
const alias = {
  '@white-plumeria/core': `${root}core/src/index.ts`,
  '@white-plumeria/tokens': `${root}tokens/src/index.ts`,
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [marko({ linked: false })],
        resolve: { conditions: ['browser'], alias },
        test: {
          name: 'browser',
          environment: 'happy-dom',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.server.test.ts'],
        },
      },
      {
        plugins: [marko({ linked: false })],
        resolve: { conditions: ['node', 'import'], alias },
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.server.test.ts'],
        },
      },
    ],
  },
});
