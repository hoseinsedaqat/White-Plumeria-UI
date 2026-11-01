// SolidStart's handler returns an empty shell. The desk is a static document
// of the same Solid route, not a server renderer and not a new package.
import { createComponent, renderToStringAsync } from 'solid-js/web';
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else found.push(path);
  }
  return found;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function deskBase() {
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site : `${site}/`;
  return process.env.WPL_DESK === '1' ? `${prefix}desks/solidstart/` : '/';
}

const serverDir = join(root, 'dist/server');
const clientDir = join(root, 'dist/client');
if (!existsSync(serverDir) || !existsSync(clientDir)) fail('SolidStart did not write dist');

const pageFile = walk(serverDir).find((file) =>
  /[/\\]_build[/\\]assets[/\\]index-.*\.js$/.test(file),
);
const css = walk(clientDir).find((file) => file.endsWith('.css') && file.includes('_build'));
const entry = walk(clientDir).find((file) => file.includes('entry-client') && file.endsWith('.js'));
if (!pageFile || !css || !entry) fail('SolidStart export is missing the route or client assets');

const page = await import(pathToFileURL(pageFile).href);
const body = await renderToStringAsync(() => createComponent(page.default, {}));
if (
  !body.includes('Save changes') ||
  !body.includes('wpl-btn') ||
  !body.includes('SolidStart built')
) {
  fail('SolidStart route did not render the Solid button');
}

const base = deskBase();
const href = (file) => `${base}${relative(clientDir, file).split(sep).join('/')}`;
const html = `<!DOCTYPE html>
<html lang="en" data-wpl-theme="white" data-wpl-scheme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SolidStart desk · White Plumeria</title>
    <link rel="stylesheet" href="${href(css)}" />
    <script type="module" src="${href(entry)}"></script>
  </head>
  <body>
    <div id="app">${body}</div>
  </body>
</html>
`;
if (html.includes('_$HY')) fail('SolidStart document still contains the handler shell');
const dest = join(clientDir, 'index.html');
writeFileSync(dest, html);
process.stdout.write(`wrote ${dest}\n`);
