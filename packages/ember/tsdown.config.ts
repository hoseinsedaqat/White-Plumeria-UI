import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
  external: [/^@white-plumeria\//, /^@ember\//, /^@glimmer\//, 'ember-source'],
});
