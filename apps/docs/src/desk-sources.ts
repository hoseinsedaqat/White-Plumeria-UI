import nextSource from '../../example-next/app/page.tsx?raw';
import nuxtSource from '../../example-nuxt/pages/index.vue?raw';
import type { DeskId } from './pen-meta.ts';

export const deskSources: Record<DeskId, string> = {
  next: nextSource,
  nuxt: nuxtSource,
};
