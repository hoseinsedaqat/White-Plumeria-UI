// Next and Nuxt desks are real host exports. They are not @white-plumeria/next or
// @white-plumeria/nuxt, and the docs React app must not draw them.
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

function copyExport(source, id) {
  if (!existsSync(source)) {
    process.stderr.write(`missing ${id} export at ${source}\n`);
    process.exit(1);
  }
  const nested = join(source, 'desks', id);
  const from = existsSync(join(nested, 'index.html')) ? nested : source;
  if (!existsSync(join(from, 'index.html'))) {
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
  'build',
]);
run(['--filter', '@white-plumeria/example-next', 'build']);
run(['--filter', '@white-plumeria/example-nuxt', 'build']);

const nextDir = copyExport(join(repo, 'apps/example-next/out'), 'next');
const nuxtDir = copyExport(join(repo, 'apps/example-nuxt/.output/public'), 'nuxt');
const nextSource = readFileSync(join(repo, 'apps/example-next/app/page.tsx'), 'utf8');
const nuxtSource = readFileSync(join(repo, 'apps/example-nuxt/pages/index.vue'), 'utf8');
if (!nextSource.includes("'use client'") || !nextSource.includes('@white-plumeria/react')) {
  process.stderr.write('Next desk source is not a React client file\n');
  process.exit(1);
}
if (!nuxtSource.includes('ClientOnly') || !nuxtSource.includes('@white-plumeria/vue')) {
  process.stderr.write('Nuxt desk source is not a Vue client page\n');
  process.exit(1);
}
assertDesk(nextDir, 'next', ['_next/static', 'Save changes', 'wpl-btn', 'Next.js exported']);
assertDesk(nuxtDir, 'nuxt', ['_nuxt/', 'Save changes', 'wpl-btn', 'Nuxt generated']);
process.stdout.write('desks built\n');
