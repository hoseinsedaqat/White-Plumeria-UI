import type { PackageName } from '../brand.ts';
import type { FrameworkExamples } from './types.ts';

export const libraryExamples = [
  { id: 'html', label: 'HTML' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'angular', label: 'Angular' },
  { id: 'solid', label: 'Solid' },
  { id: 'preact', label: 'Preact' },
  { id: 'qwik', label: 'Qwik' },
  { id: 'lit', label: 'Lit' },
  { id: 'alpine', label: 'Alpine' },
  { id: 'marko', label: 'Marko' },
  { id: 'ember', label: 'Ember' },
] as const satisfies readonly { id: keyof FrameworkExamples; label: string }[];

export const serverHosts = [
  { id: 'next', label: 'Next', adapter: 'react', package: 'react' },
  { id: 'nuxt', label: 'Nuxt', adapter: 'vue', package: 'vue' },
  { id: 'sveltekit', label: 'SvelteKit', adapter: 'svelte', package: 'svelte' },
  { id: 'solidstart', label: 'SolidStart', adapter: 'solid', package: 'solid' },
  { id: 'analog', label: 'Analog', adapter: 'angular', package: 'angular' },
  { id: 'qwikcity', label: 'Qwik City', adapter: 'qwik', package: 'qwik' },
] as const satisfies readonly {
  id: string;
  label: string;
  adapter: keyof FrameworkExamples;
  package: PackageName;
}[];

export type ServerHostId = (typeof serverHosts)[number]['id'];

export function isServerHost(value: string): value is ServerHostId {
  return serverHosts.some((host) => host.id === value);
}

export function serverHost(id: ServerHostId) {
  const found = serverHosts.find((host) => host.id === id);
  if (!found) throw new Error(`Unknown server host: ${id}`);
  return found;
}

export function serverExample(examples: FrameworkExamples, host: ServerHostId): string {
  const found = serverHost(host);
  const source = examples[found.adapter];
  if (host === 'next') {
    return `// Next.js App Router client file. There is no @white-plumeria/next package.\n'use client';\n\n${source}`;
  }
  if (host === 'nuxt') return nuxtExample(source);
  if (host === 'sveltekit') {
    return `<!-- SvelteKit route component. There is no @white-plumeria/sveltekit package. -->\n${source}`;
  }
  if (host === 'solidstart') {
    return `// SolidStart route. There is no @white-plumeria/solidstart package.\n${source}`;
  }
  if (host === 'analog') {
    return `// Analog page. There is no @white-plumeria/analog package.\n${source}`;
  }
  return `// Qwik City route. There is no @white-plumeria/qwikcity package.\n${source}`;
}

function nuxtExample(vue: string): string {
  const note =
    '<!-- Nuxt page. There is no @white-plumeria/nuxt package. ClientOnly keeps the control on the client. -->\n';
  const wrapped = vue.replace(/<template>\n([\s\S]*?)\n<\/template>/, (_match, body: string) => {
    const indented = body
      .split('\n')
      .map((line) => (line.trim().length === 0 ? line : `  ${line}`))
      .join('\n');
    return `<template>\n  <ClientOnly>\n${indented}\n  </ClientOnly>\n</template>`;
  });
  return note + wrapped;
}
