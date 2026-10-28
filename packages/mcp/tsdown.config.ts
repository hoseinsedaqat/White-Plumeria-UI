import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'node',
  sourcemap: true,
  treeshake: true,
  external: [/^@white-plumeria\//, /^@modelcontextprotocol\//, 'zod', 'zod/v4'],
});
