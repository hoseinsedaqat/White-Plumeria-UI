export const brand = {
  productName: 'White Plumeria',
  productNameFa: 'وایت پلومریا',
  shortName: 'WPL',
  slug: 'white-plumeria',
  scope: '@white-plumeria',
  cssPrefix: 'wpl',
  tokenPrefix: '--wpl-',
  cliBin: 'wpl',
  version: '0.1.0',
  license: 'MIT',
  repository: 'https://github.com/hoseinsedaqat/White-Plumeria-UI',
  homepage: 'https://hoseinsedaqat.github.io/White-Plumeria-UI/',
  bugs: 'https://github.com/hoseinsedaqat/White-Plumeria-UI/issues',
  author: 'hoseinsedaqat',
  defaultBranch: 'test',
  pagesBase: '/White-Plumeria-UI/',
  storageKey: 'wpl.preferences',
} as const;

export type PackageName =
  | 'tokens'
  | 'core'
  | 'styles'
  | 'react'
  | 'vue'
  | 'svelte'
  | 'angular'
  | 'elements'
  | 'ai'
  | 'mcp'
  | 'cli';

export function packageName(name: PackageName): string {
  return `${brand.scope}/${name}`;
}

export function installCommand(
  names: readonly PackageName[],
  manager: 'npm' | 'pnpm' | 'yarn' = 'npm',
): string {
  const specs = names.map((name) => packageName(name)).join(' ');
  if (manager === 'pnpm') return `pnpm add ${specs}`;
  if (manager === 'yarn') return `yarn add ${specs}`;
  return `npm install ${specs}`;
}
