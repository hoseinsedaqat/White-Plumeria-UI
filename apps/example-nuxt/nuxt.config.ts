import { fileURLToPath } from 'node:url';
import { defineNuxtConfig } from 'nuxt/config';

function deskBase() {
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site : `${site}/`;
  return `${prefix}desks/nuxt/`;
}

const embedded = process.env.WPL_DESK === '1';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },
  typescript: { typeCheck: false, shim: false },
  app: {
    baseURL: embedded ? deskBase() : '/',
    head: { title: 'Nuxt desk · White Plumeria' },
  },
  alias: {
    '@white-plumeria/vue': fileURLToPath(
      new URL('../../packages/vue/src/index.ts', import.meta.url),
    ),
    '@white-plumeria/core': fileURLToPath(
      new URL('../../packages/core/src/index.ts', import.meta.url),
    ),
    '@white-plumeria/tokens': fileURLToPath(
      new URL('../../packages/tokens/src/index.ts', import.meta.url),
    ),
    '@white-plumeria/styles': fileURLToPath(
      new URL('../../packages/styles/src/index.css', import.meta.url),
    ),
  },
});
