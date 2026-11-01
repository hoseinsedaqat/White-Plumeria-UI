// SolidStart 2.1 writes client and server bundles, not a static document.
// The server handler still renders the Solid tree, so the desk is that HTML.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else if (/\.(js|css|html)$/.test(name)) found.push(path);
  }
  return found;
}

const serverDir = join(root, 'dist/server');
if (!existsSync(serverDir)) {
  process.stderr.write('SolidStart did not write dist/server\n');
  process.exit(1);
}
const entry = walk(serverDir).find((file) => file.endsWith('entry-server.js'));
if (!entry) {
  process.stderr.write('SolidStart server entry was not built\n');
  process.exit(1);
}

const loaded = await import(pathToFileURL(entry).href);
const app = loaded.default;
const site = process.env.WPL_BASE ?? '/';
const prefix = site.endsWith('/') ? site : `${site}/`;
const path = process.env.WPL_DESK === '1' ? `${prefix}desks/solidstart/` : '/';
const request = new Request(new URL(path, 'http://127.0.0.1'));
const response =
  app && typeof app.fetch === 'function'
    ? await app.fetch(request)
    : typeof app === 'function'
      ? await app(request)
      : null;
if (!response || typeof response.text !== 'function') {
  process.stderr.write(`SolidStart server export cannot render HTML\n`);
  process.exit(1);
}
const html = await response.text();
if (!html.includes('type="module"') || !html.includes('_build/')) {
  process.stderr.write('SolidStart HTML is missing the client entry\n');
  process.stderr.write(`${html.slice(0, 800)}\n`);
  process.exit(1);
}
const clientDir = join(root, 'dist/client');
const assets = walk(clientDir)
  .filter((file) => /\.(js|css|html)$/.test(file))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
if (!assets.includes('Save changes') || !assets.includes('wpl-btn') || !assets.includes('SolidStart built')) {
  process.stderr.write('SolidStart client bundle is missing the Solid button\n');
  process.exit(1);
}
const dest = join(clientDir, 'index.html');
writeFileSync(dest, html);
process.stdout.write(`wrote ${dest}\n`);
