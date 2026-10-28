import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mod = await import(pathToFileURL(resolve(root, 'packages/tokens/src/css.ts')).href);
const css = mod.renderTokensCss();
const out = resolve(root, 'packages/styles/src/generated/tokens.css');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, css);
console.log(`wrote ${out} (${css.length} bytes)`);

const themesMod = await import(pathToFileURL(resolve(root, 'packages/tokens/src/themes.ts')).href);
const englishThemes = themesMod.themes.map((theme) => ({
  name: theme.name,
  label: theme.label,
  description: theme.description,
  light: theme.light,
  dark: theme.dark,
}));
const themesOut = resolve(root, 'apps/docs/public/themes.json');
writeFileSync(themesOut, `${JSON.stringify(englishThemes, null, 2)}\n`);
console.log(`wrote ${themesOut} (${englishThemes.length} themes)`);
