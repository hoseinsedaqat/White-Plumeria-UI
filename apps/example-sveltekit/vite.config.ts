import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

function deskBase() {
  if (process.env.WPL_DESK !== '1') return '';
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site.slice(0, -1) : site;
  return `${prefix}/desks/sveltekit`;
}

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter(),
      paths: { base: deskBase() },
      prerender: { entries: ['*'] },
    }),
  ],
  resolve: {
    alias: {
      '@white-plumeria/svelte': fileURLToPath(new URL('../../packages/svelte/src/lib/index.ts', import.meta.url)),
      '@white-plumeria/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@white-plumeria/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  server: { host: '0.0.0.0', port: 5187, strictPort: true },
});
