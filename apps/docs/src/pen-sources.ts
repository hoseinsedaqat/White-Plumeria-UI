import alpineSource from '../pen-src/alpine/src/main.ts?raw';
import angularSource from '../pen-src/angular/src/main.ts?raw';
import emberSource from '../pen-src/ember/src/main.ts?raw';
import htmlSource from '../pen-src/html/src/main.ts?raw';
import litSource from '../pen-src/lit/src/main.ts?raw';
import markoSource from '../pen-src/marko/src/pen.marko?raw';
import preactSource from '../pen-src/preact/src/main.tsx?raw';
import qwikSource from '../pen-src/qwik/src/main.tsx?raw';
import reactSource from '../pen-src/react/src/main.tsx?raw';
import solidSource from '../pen-src/solid/src/main.tsx?raw';
import svelteSource from '../pen-src/svelte/src/App.svelte?raw';
import vueSource from '../pen-src/vue/src/main.ts?raw';
import type { PenId } from './pen-meta.ts';

export const penSources: Record<PenId, string> = {
  html: htmlSource,
  react: reactSource,
  vue: vueSource,
  svelte: svelteSource,
  angular: angularSource,
  solid: solidSource,
  preact: preactSource,
  qwik: qwikSource,
  lit: litSource,
  alpine: alpineSource,
  marko: markoSource,
  ember: emberSource,
};
