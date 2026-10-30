import { qwikVite } from '@qwik.dev/core/optimizer';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [qwikVite()],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.qwik.mjs',
    },
    rolldownOptions: {
      external: [/^@qwik\.dev\//, /^@white-plumeria\//],
    },
  },
});
