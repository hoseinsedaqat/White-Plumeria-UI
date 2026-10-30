import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const ember = fileURLToPath(new URL('./node_modules/ember-source/dist/prod/packages', import.meta.url));
const root = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: '@white-plumeria/core', replacement: `${root}core/src/index.ts` },
      { find: '@white-plumeria/tokens', replacement: `${root}tokens/src/index.ts` },
      { find: /^@ember\/(.*)/, replacement: `${ember}/@ember/$1` },
    ],
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    server: {
      deps: {
        inline: [/@glimmer\//, /ember-source/],
      },
    },
  },
});
