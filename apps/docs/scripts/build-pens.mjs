// Each pen is its own Vite build so that library's compiler owns the document.
// The docs app stays React and iframes the built page. Do not render these in React.
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import solid from 'vite-plugin-solid';
import preact from '@preact/preset-vite';
import angular from '@analogjs/vite-plugin-angular';
import { qwikVite } from '@qwik.dev/core/optimizer';
import marko from '@marko/vite';

const repo = fileURLToPath(new URL('../../..', import.meta.url));

function source(path) {
  return fileURLToPath(new URL(`../../../packages/${path}`, import.meta.url));
}

function runtime(name) {
  return realpathSync(fileURLToPath(new URL(`../node_modules/${name}`, import.meta.url)));
}

const shared = [
  { find: '@white-plumeria/core', replacement: source('core/src/index.ts') },
  { find: '@white-plumeria/tokens', replacement: source('tokens/src/index.ts') },
  { find: '@white-plumeria/styles', replacement: source('styles/src/index.css') },
];

const angularDist = source('angular/dist/fesm2022/white-plumeria-angular.mjs');
if (!existsSync(angularDist)) {
  process.stdout.write('building @white-plumeria/angular\n');
  const built = spawnSync('corepack', ['pnpm', '--filter', '@white-plumeria/angular...', 'build'], {
    cwd: repo,
    stdio: 'inherit',
  });
  if (built.status !== 0) process.exit(built.status ?? 1);
}

const pens = [
  {
    id: 'html',
    plugins: [],
    alias: shared,
  },
  {
    id: 'react',
    plugins: [react()],
    alias: [...shared, { find: '@white-plumeria/react', replacement: source('react/src/index.ts') }],
  },
  {
    id: 'vue',
    plugins: [],
    alias: [...shared, { find: '@white-plumeria/vue', replacement: source('vue/src/index.ts') }],
  },
  {
    id: 'svelte',
    plugins: [svelte()],
    alias: [...shared, { find: '@white-plumeria/svelte', replacement: source('svelte/src/lib/index.ts') }],
  },
  {
    id: 'angular',
    plugins: [angular()],
    alias: [...shared, { find: '@white-plumeria/angular', replacement: angularDist }],
  },
  {
    id: 'solid',
    plugins: [solid()],
    alias: [...shared, { find: '@white-plumeria/solid', replacement: source('solid/src/index.tsx') }],
  },
  {
    id: 'preact',
    plugins: [preact()],
    alias: [...shared, { find: '@white-plumeria/preact', replacement: source('preact/src/index.ts') }],
  },
  {
    id: 'qwik',
    plugins: [qwikVite({ csr: true })],
    alias: [...shared, { find: '@white-plumeria/qwik', replacement: source('qwik/src/index.ts') }],
  },
  {
    id: 'lit',
    plugins: [],
    alias: [...shared, { find: '@white-plumeria/lit', replacement: source('lit/src/index.ts') }],
  },
  {
    id: 'alpine',
    plugins: [],
    alias: [...shared, { find: '@white-plumeria/alpine', replacement: source('alpine/src/index.ts') }],
  },
  {
    id: 'marko',
    plugins: [marko({ linked: false })],
    alias: [
      { find: '@white-plumeria/marko/tags', replacement: source('marko/src/tags') },
      { find: '@white-plumeria/marko', replacement: source('marko/src/index.ts') },
      ...shared,
    ],
  },
  {
    id: 'ember',
    plugins: [],
    alias: [
      ...shared,
      { find: '@white-plumeria/ember', replacement: source('ember/src/index.ts') },
      {
        find: /^@ember\/(.*)/,
        replacement: `${runtime('ember-source')}/dist/prod/packages/@ember/$1`,
      },
    ],
  },
];

function penBase(id) {
  if (id !== 'qwik') return './';
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site : `${site}/`;
  return `${prefix}pens/qwik/`;
}

for (const pen of pens) {
  const root = fileURLToPath(new URL(`../pen-src/${pen.id}`, import.meta.url));
  const outDir = fileURLToPath(new URL(`../public/pens/${pen.id}`, import.meta.url));
  process.stdout.write(`pen ${pen.id}\n`);
  await build({
    root,
    base: penBase(pen.id),
    plugins: pen.plugins,
    publicDir: false,
    resolve: { alias: pen.alias },
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: false,
    },
    server: { fs: { allow: [repo] } },
    logLevel: 'warn',
  });
}
