import analogSource from '../../example-analog/src/app/pages/index.page.ts?raw';
import nextSource from '../../example-next/app/page.tsx?raw';
import nuxtSource from '../../example-nuxt/pages/index.vue?raw';
import qwikSource from '../../example-qwikcity/src/routes/index.tsx?raw';
import solidSource from '../../example-solidstart/src/routes/index.tsx?raw';
import svelteSource from '../../example-sveltekit/src/routes/+page.svelte?raw';
import type { DeskId } from './pen-meta.ts';

export const deskSources: Record<DeskId, string> = {
  next: nextSource,
  nuxt: nuxtSource,
  sveltekit: svelteSource,
  solidstart: solidSource,
  analog: analogSource,
  qwikcity: qwikSource,
};
