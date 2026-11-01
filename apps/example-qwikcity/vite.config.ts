import { qwikVite } from '@qwik.dev/core/optimizer';
import { ssgAdapter } from '@qwik.dev/router/adapters/static/vite';
import { qwikCity } from '@qwik.dev/router/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

function deskBase() {
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site : `${site}/`;
  return `${prefix}desks/qwikcity/`;
}

const embedded = process.env.WPL_DESK === '1';

export default defineConfig({
  plugins: [
    qwikCity(),
    qwikVite(),
    {
      name: 'qwikcity-build-client',
      buildApp: {
        order: 'pre',
        async handler(builder: { environments: { client?: { isBuilt: boolean } }; build: (environment: unknown) => Promise<unknown> }) {
          const client = builder.environments.client;
          if (client && !client.isBuilt) await builder.build(client);
        },
      },
    },
    ssgAdapter({ origin: 'https://white-plumeria.local', sitemapOutFile: null }),
  ],
  base: embedded ? deskBase() : '/',
  build: { emptyOutDir: false },
  environments: {
    ssr: { build: { emptyOutDir: false } },
    ssg: { build: { emptyOutDir: false } },
  },
  resolve: {
    alias: {
      '@white-plumeria/styles': fileURLToPath(new URL('../../packages/styles/src/index.css', import.meta.url)),
    },
  },
  ssr: {
    noExternal: ['@white-plumeria/qwik', '@white-plumeria/core', '@white-plumeria/tokens'],
  },
  server: { host: '0.0.0.0', port: 5190, strictPort: true },
});
