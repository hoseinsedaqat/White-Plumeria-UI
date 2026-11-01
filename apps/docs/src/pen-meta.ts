import { libraryExamples, serverHosts } from '@white-plumeria/core';

const details = {
  html: {
    mount: 'Browser classes',
    file: 'src/main.ts',
    runtime: 'The browser paints wpl-btn. There is no component runtime in this document.',
  },
  react: {
    mount: 'React root',
    file: 'src/main.tsx',
    runtime: 'React createRoot owns this document. JSX here is compiled for React.',
  },
  vue: {
    mount: 'Vue render function',
    file: 'src/main.ts',
    runtime: 'Vue createApp owns this document. The button is a Vue render function, not JSX compiled as React.',
  },
  svelte: {
    mount: 'Svelte mount',
    file: 'src/App.svelte',
    runtime: 'The Svelte compiler mounts App.svelte in this document.',
  },
  angular: {
    mount: 'Angular bootstrap',
    file: 'src/main.ts',
    runtime: 'bootstrapApplication owns this document. The button is an Angular directive.',
  },
  solid: {
    mount: 'Solid render',
    file: 'src/main.tsx',
    runtime: 'solid-js/web render owns this document. JSX here is compiled for Solid.',
  },
  preact: {
    mount: 'Preact render',
    file: 'src/main.tsx',
    runtime: 'Preact render owns this document. JSX here is compiled for Preact.',
  },
  qwik: {
    mount: 'Qwik resume',
    file: 'src/main.tsx',
    runtime: 'Qwik render owns this document. The click handler is a QRL, not a React listener.',
  },
  lit: {
    mount: 'Custom element',
    file: 'src/main.ts',
    runtime: 'defineWhitePlumeria registers wpl-button in this document. The stage is a custom element.',
  },
  alpine: {
    mount: 'Alpine data',
    file: 'src/main.ts',
    runtime: 'Alpine.start owns this document. The button is an Alpine data factory.',
  },
  marko: {
    mount: 'Marko mount',
    file: 'src/pen.marko',
    runtime: 'App.mount renders the Marko tag in this document.',
  },
  ember: {
    mount: 'Glimmer render',
    file: 'src/main.ts',
    runtime: 'renderComponent from @ember/renderer paints the Glimmer button in this document.',
  },
} as const satisfies Record<(typeof libraryExamples)[number]['id'], { mount: string; file: string; runtime: string }>;

const packages = {
  html: '@white-plumeria/styles',
  react: '@white-plumeria/react',
  vue: '@white-plumeria/vue',
  svelte: '@white-plumeria/svelte',
  angular: '@white-plumeria/angular',
  solid: '@white-plumeria/solid',
  preact: '@white-plumeria/preact',
  qwik: '@white-plumeria/qwik',
  lit: '@white-plumeria/lit',
  alpine: '@white-plumeria/alpine',
  marko: '@white-plumeria/marko',
  ember: '@white-plumeria/ember',
} as const satisfies Record<(typeof libraryExamples)[number]['id'], string>;

export const libraryPens = libraryExamples.map((item) => ({
  ...item,
  ...details[item.id],
  packageName: packages[item.id],
}));

export type PenId = (typeof libraryPens)[number]['id'];

const boundaries = {
  next: 'An App Router file would add use client around that same client render. There is no @white-plumeria/next package.',
  nuxt: 'A Nuxt page would wrap the Vue template in ClientOnly. There is no @white-plumeria/nuxt package.',
  sveltekit: 'A SvelteKit route uses this Svelte component. There is no @white-plumeria/sveltekit package.',
  solidstart: 'A SolidStart route uses this Solid render. There is no @white-plumeria/solidstart package.',
  analog: 'An Analog page uses this Angular bootstrap. There is no @white-plumeria/analog package.',
  qwikcity: 'A Qwik City route uses this Qwik component. There is no @white-plumeria/qwikcity package.',
} as const satisfies Record<(typeof serverHosts)[number]['id'], string>;

export const hostPens = serverHosts.map((host) => {
  const pen = libraryPens.find((item) => item.id === host.adapter);
  if (!pen) throw new Error(`Missing pen for ${host.id}`);
  return {
    ...host,
    pen,
    note: `There is no ${host.label} renderer on this page. The stage is the ${pen.label} document. ${boundaries[host.id]}`,
  };
});

export type ExampleId = PenId | (typeof hostPens)[number]['id'];

export function penById(id: string) {
  return libraryPens.find((item) => item.id === id);
}

export function hostById(id: string) {
  return hostPens.find((item) => item.id === id);
}

export function isExampleId(id: string): id is ExampleId {
  return Boolean(penById(id) || hostById(id));
}

export function penDocument(id: PenId): string {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}pens/${id}/index.html`;
}
