// Qwik City can only prerender a base whose segments are already lowercase.
// This puts the public site prefix back into the export so GitHub Pages
// requests the same path the docs site uses.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function deskBase() {
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site : `${site}/`;
  return `${prefix}desks/qwikcity/`;
}

const wanted = deskBase();
const used = wanted.toLowerCase();
if (process.env.WPL_DESK !== '1' || wanted === used) process.exit(0);

const dist = fileURLToPath(new URL('./dist', import.meta.url));
const textFile = /\.(html|js|mjs|css|json|txt|map)$/;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!textFile.test(name)) continue;
    const text = readFileSync(path, 'utf8');
    if (!text.includes(used)) continue;
    writeFileSync(path, text.replaceAll(used, wanted));
  }
}

walk(dist);
