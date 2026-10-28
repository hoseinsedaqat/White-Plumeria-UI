import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const files = readdirSync('packages/core/src/catalog').filter((name) => name.endsWith('.ts') && !['types.ts', 'examples.ts', 'index.ts'].includes(name));
const components = [];
for (const file of files) {
  const source = readFileSync(`packages/core/src/catalog/${file}`, 'utf8');
  const blocks = source.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const name = /name: '([^']+)'/.exec(block)?.[1];
    const slug = /slug: '([^']+)'/.exec(block)?.[1];
    const summary = /summary: '([^']+)'/.exec(block)?.[1];
    const summaryFa = /summaryFa: '([^']+)'/.exec(block)?.[1];
    if (!name || !slug || !summary) continue;
    const limitations = [...block.matchAll(/limitations: \[([^\]]*)\]/g)].flatMap((match) =>
      [...(match[1] ?? '').matchAll(/'([^']+)'/g)].map((item) => item[1]),
    );
    components.push({ name, slug, summary, summaryFa, limitations });
  }
}
components.sort((left, right) => left.name.localeCompare(right.name));
if (components.length < 50) {
  throw new Error(`Expected the catalog parser to find the component set, found ${components.length}.`);
}
const lines = [
  '# White Plumeria',
  '',
  'Framework-agnostic design system. No Tailwind requirement. No model key in the static site.',
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
