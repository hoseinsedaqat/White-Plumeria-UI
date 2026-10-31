import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const files = readdirSync('packages/core/src/catalog').filter(
  (name) =>
    name.endsWith('.ts') &&
    !['types.ts', 'examples.ts', 'alpine.ts', 'marko.ts', 'ember.ts', 'index.ts'].includes(name),
);
const components = [];
for (const file of files) {
  const source = readFileSync(`packages/core/src/catalog/${file}`, 'utf8');
  const blocks = source.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const field = (key) => new RegExp(`${key}:\\s*'([^']*)'`).exec(block)?.[1];
    const name = field('name');
    const slug = field('slug');
    const summary = field('summary');
    const summaryFa = field('summaryFa');
    if (!name || !slug || !summary) continue;
    const limitations = [...block.matchAll(/limitations: \[([^\]]*)\]/g)].flatMap((match) =>
      [...(match[1] ?? '').matchAll(/'([^']+)'/g)].map((item) => item[1]),
    );
    components.push({ name, slug, summary, summaryFa, limitations });
  }
}
components.sort((left, right) => left.name.localeCompare(right.name));
if (components.length < 50) {
  throw new Error(
    `Expected the catalog parser to find the component set, found ${components.length}.`,
  );
}
const themeSource = readFileSync('packages/tokens/src/themes.ts', 'utf8');
const themeNames = [...themeSource.matchAll(/name: '([a-z]+)'/g)].map((match) => match[1]);
if (!themeNames.includes('white')) {
  throw new Error('Expected the white theme to be registered.');
}
const lines = [
  '# White Plumeria',
  '',
  'Framework-agnostic design system. No Tailwind requirement. No model key in the static site.',
  '',
  'Colors come from the active theme. Set data-wpl-theme and data-wpl-scheme on an ancestor. Themes: ' +
    themeNames.join(', ') +
    '. white is the default. Each theme has light and dark color tokens named --wpl-color-*.',
  '',
  '## Components',
  ...components.map((item) => `- ${item.name} (${item.slug}): ${item.summary}`),
  '',
  'AI tools may only name components from this list.',
];
const full = [
  ...lines,
  '',
  '## Limits',
  ...components.flatMap((item) => item.limitations.map((limit) => `- ${item.name}: ${limit}`)),
];
writeFileSync('apps/docs/public/llms.txt', `${lines.join('\n')}\n`);
writeFileSync('apps/docs/public/llms-full.txt', `${full.join('\n')}\n`);
writeFileSync('apps/docs/public/catalog.json', `${JSON.stringify(components, null, 2)}\n`);
console.log(`wrote catalog for ${components.length} components`);
