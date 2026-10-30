import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const ember = fileURLToPath(new URL('./node_modules/ember-source/dist/prod/packages', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: '@white-plumeria/ember', replacement: fileURLToPath(new URL('../../packages/ember/src/index.ts', import.meta.url)) },
      { find: '@white-plumeria/core', replacement: fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)) },
      { find: '@white-plumeria/tokens', replacement: fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)) },
      { find: '@white-plumeria/styles', replacement: fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)) },
      { find: /^@ember\/(.*)/, replacement: `${ember}/@ember/$1` },
    ],
  },
  optimizeDeps: {
    exclude: ['ember-source', '@glimmer/component', '@glimmer/tracking'],
  },
  server: { host: '0.0.0.0', port: 5184, strictPort: true, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4184, strictPort: true, allowedHosts: true },
});
