// Host desks are real Next, Nuxt, SvelteKit, SolidStart, Analog, and Qwik City
// exports. They are not @white-plumeria/<host> packages, and the docs React app
// must not draw them.
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = fileURLToPath(new URL('..', import.meta.url));
const repo = fileURLToPath(new URL('../../..', import.meta.url));

function run(args) {
  const result = spawnSync('corepack', ['pnpm', ...args], {
    cwd: repo,
    stdio: 'inherit',
    env: { ...process.env, WPL_DESK: '1' },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else found.push(path);
  }
  return found;
}

function findDocument(dir, depth = 0) {
  if (existsSync(join(dir, 'index.html'))) return dir;
  if (depth > 3 || !existsSync(dir)) return undefined;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    const found = findDocument(path, depth + 1);
    if (found) return found;
  }
  return undefined;
}

function copyExport(source, id) {
  if (!existsSync(source)) {
    process.stderr.write(`missing ${id} export at ${source}\n`);
    process.exit(1);
  }
  const nested = join(source, 'desks', id);
  const from = existsSync(join(nested, 'index.html')) ? nested : findDocument(source);
  if (!from) {
    process.stderr.write(`${id} export has no index.html\n`);
    process.exit(1);
  }
  const dest = join(docs, 'public', 'desks', id);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(from, dest, { recursive: true });
  return dest;
}

function assertDesk(dir, id, markers) {
  const files = walk(dir);
  const text = files
    .filter((file) => /\.(html|js|mjs|css)$/.test(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  for (const marker of markers) {
    if (!text.includes(marker)) {
      process.stderr.write(`${id} export is missing ${marker}\n`);
      process.exit(1);
    }
  }
  if (text.includes(`@white-plumeria/${id}`)) {
    process.stderr.write(`${id} export invented @white-plumeria/${id}\n`);
    process.exit(1);
  }
}

run([
  '--filter',
  '@white-plumeria/styles',
  '--filter',
  '@white-plumeria/react...',
  '--filter',
  '@white-plumeria/vue...',
  '--filter',
  '@white-plumeria/angular...',
  '--filter',
  '@white-plumeria/qwik...',
  'build',
]);
const desks = [
  ['@white-plumeria/example-next', 'apps/example-next/out', 'next'],
  ['@white-plumeria/example-nuxt', 'apps/example-nuxt/.output/public', 'nuxt'],
  ['@white-plumeria/example-sveltekit', 'apps/example-sveltekit/build', 'sveltekit'],
  ['@white-plumeria/example-solidstart', 'apps/example-solidstart/dist/client', 'solidstart'],
  ['@white-plumeria/example-analog', 'apps/example-analog/dist/analog/public', 'analog'],
  ['@white-plumeria/example-qwikcity', 'apps/example-qwikcity/dist', 'qwikcity'],
];
for (const [filter] of desks) run(['--filter', filter, 'build']);

const nextSource = readFileSync(join(repo, 'apps/example-next/app/page.tsx'), 'utf8');
const nuxtSource = readFileSync(join(repo, 'apps/example-nuxt/pages/index.vue'), 'utf8');
const svelteSource = readFileSync(
  join(repo, 'apps/example-sveltekit/src/routes/+page.svelte'),
  'utf8',
);
const solidSource = readFileSync(
  join(repo, 'apps/example-solidstart/src/routes/index.tsx'),
  'utf8',
);
const analogSource = readFileSync(
  join(repo, 'apps/example-analog/src/app/pages/index.page.ts'),
  'utf8',
);
const qwikSource = readFileSync(join(repo, 'apps/example-qwikcity/src/routes/index.tsx'), 'utf8');
if (!nextSource.includes("'use client'") || !nextSource.includes('@white-plumeria/react')) {
  process.stderr.write('Next desk source is not a React client file\n');
  process.exit(1);
}
if (!nuxtSource.includes('ClientOnly') || !nuxtSource.includes('@white-plumeria/vue')) {
  process.stderr.write('Nuxt desk source is not a Vue client page\n');
  process.exit(1);
}
if (!svelteSource.includes('@white-plumeria/svelte')) {
  process.stderr.write('SvelteKit desk source is not the Svelte adapter\n');
  process.exit(1);
}
if (!solidSource.includes('@white-plumeria/solid')) {
  process.stderr.write('SolidStart desk source is not the Solid adapter\n');
  process.exit(1);
}
if (!analogSource.includes('@white-plumeria/angular') || !analogSource.includes('wplButton')) {
  process.stderr.write('Analog desk source is not the Angular adapter\n');
  process.exit(1);
}
if (!qwikSource.includes('@white-plumeria/qwik')) {
  process.stderr.write('Qwik City desk source is not the Qwik adapter\n');
  process.exit(1);
}

const markers = {
  next: ['_next/static', 'Save changes', 'wpl-btn', 'Next.js exported'],
  nuxt: ['_nuxt/', 'Save changes', 'wpl-btn', 'Nuxt generated'],
  sveltekit: ['_app/', 'Save changes', 'wpl-btn', 'SvelteKit exported'],
  solidstart: ['_build/', 'Save changes', 'wpl-btn', 'SolidStart built'],
  analog: ['Save changes', 'wpl-btn', 'Analog exported'],
  qwikcity: ['/build/', 'Save changes', 'wpl-btn', 'Qwik City exported'],
};
for (const [, relative, id] of desks) {
  const dir = copyExport(join(repo, relative), id);
  assertDesk(dir, id, markers[id]);
  if (id === 'nuxt') assertNuxtIndex(dir);
  if (id === 'analog' || id === 'solidstart') assertVisibleButton(dir, id);
}

function assertVisibleButton(dir, id) {
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  if (!html.includes('Save changes') || !html.includes('wpl-btn')) {
    process.stderr.write(`${id} index.html does not show the button\n`);
    process.exit(1);
  }
  if (html.includes('_$HY') || html.includes('Internal Server Error')) {
    process.stderr.write(`${id} index.html is an error shell\n`);
    process.exit(1);
  }
  if (id === 'analog') {
    const js = walk(dir)
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    if (!js.includes('index.html')) {
      process.stderr.write('Analog client route does not accept index.html\n');
      process.exit(1);
    }
  }
}

function assertNuxtIndex(dir) {
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  if (html.includes('Page not found')) {
    process.stderr.write('Nuxt index.html is the 404 page\n');
    process.exit(1);
  }
  const js = walk(dir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  if (!js.includes('/index.html')) {
    process.stderr.write('Nuxt client route does not accept /index.html\n');
    process.exit(1);
  }
}
process.stdout.write('desks built\n');
