import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Hosts and frameworks that are not White Plumeria packages. */
export const FORBIDDEN_HOSTS = [
  'analog',
  'astro',
  'aurelia',
  'lwc',
  'next',
  'nuxt',
  'qwikcity',
  'ripple',
  'solidstart',
  'stencil',
  'stimulus',
  'sveltekit',
  'vanjs',
];

const SKIP_DIRS = new Set(['node_modules', '.git', '.turbo', 'coverage']);

export function forbiddenPackageName(name) {
  const match = /^@white-plumeria\/([a-z0-9-]+)$/.exec(name ?? '');
  return match ? FORBIDDEN_HOSTS.includes(match[1]) : false;
}

export function listPublishablePackages(root) {
  const packagesDir = join(root, 'packages');
  const errors = [];
  const packages = [];
  const dirNames = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const dirName of dirNames) {
    if (FORBIDDEN_HOSTS.includes(dirName)) {
      errors.push(`packages/${dirName} is not a package. Do not pack a host or a stub.`);
      continue;
    }
    const dir = join(packagesDir, dirName);
    const manifestPath = join(dir, 'package.json');
    if (!existsSync(manifestPath)) {
      errors.push(`packages/${dirName} has no package.json.`);
      continue;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.private === true) continue;
    if (typeof manifest.name !== 'string' || !manifest.name.startsWith('@white-plumeria/')) {
      errors.push(`packages/${dirName} is not named @white-plumeria/*.`);
      continue;
    }
    if (forbiddenPackageName(manifest.name)) {
      errors.push(`${manifest.name} is not a package. Do not pack a host or a stub.`);
      continue;
    }
    packages.push({ dir, dirName, manifest, manifestPath });
  }

  return { packages, errors };
}

function walkExport(value, visit) {
  if (typeof value === 'string') {
    visit(value);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) walkExport(item, visit);
  }
}

export function entryFiles(manifest) {
  const files = new Set();
  const add = (value) => {
    if (typeof value === 'string' && value.startsWith('./') && !value.includes('*')) {
      files.add(value.slice(2));
    }
  };
  walkExport(manifest.exports, (value) => {
    if (value !== './package.json') add(value);
  });
  for (const key of ['main', 'types', 'style', 'svelte', 'qwik']) add(manifest[key]);
  const bins =
    typeof manifest.bin === 'string' ? [manifest.bin] : Object.values(manifest.bin ?? {});
  for (const bin of bins) add(bin);
  files.delete('package.json');
  return [...files].sort();
}

export function patternRoots(manifest) {
  const roots = new Set();
  walkExport(manifest.exports, (value) => {
    if (value.startsWith('./') && value.includes('*')) {
      roots.add(value.slice(2, value.indexOf('*')));
    }
  });
  return [...roots];
}

export function workspaceDependencies(manifest) {
  const found = [];
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, version] of Object.entries(manifest[field] ?? {})) {
      found.push({
        field,
        name,
        version,
        workspace: typeof version === 'string' && version.startsWith('workspace:'),
        forbidden: forbiddenPackageName(name),
      });
    }
  }
  return found;
}

function addTree(pkg, files, relativePath) {
  const absolute = join(pkg.dir, relativePath);
  if (!existsSync(absolute)) return;
  const stat = statSync(absolute);
  if (stat.isFile()) {
    files.add(relativePath.split('\\').join('/'));
    return;
  }
  if (!stat.isDirectory()) return;
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    addTree(pkg, files, join(relativePath, entry.name));
  }
}

/** Files a pack would include. Does not rewrite package.json. */
export function includedFiles(pkg) {
  const files = new Set(['package.json']);
  if (existsSync(join(pkg.dir, 'README.md'))) files.add('README.md');
  for (const entry of pkg.manifest.files ?? []) addTree(pkg, files, entry);
  return [...files].sort();
}

export function unpackedSize(pkg) {
  return includedFiles(pkg).reduce((sum, file) => sum + statSync(join(pkg.dir, file)).size, 0);
}

export function inspectPackage(pkg) {
  const problems = [];
  if (!existsSync(join(pkg.dir, 'README.md'))) problems.push('README.md is missing.');
  for (const entry of pkg.manifest.files ?? []) {
    if (!existsSync(join(pkg.dir, entry))) problems.push(`files entry "${entry}" is missing.`);
  }
  for (const file of entryFiles(pkg.manifest)) {
    if (!existsSync(join(pkg.dir, file))) {
      problems.push(`export "${file}" is missing. Build the package first.`);
    }
  }
  for (const root of patternRoots(pkg.manifest)) {
    const absolute = join(pkg.dir, root);
    if (!existsSync(absolute)) problems.push(`export pattern "${root}*" is missing.`);
  }
  for (const dep of workspaceDependencies(pkg.manifest)) {
    if (dep.forbidden) problems.push(`depends on ${dep.name}, which is not a package.`);
  }
  return {
    problems,
    workspace: workspaceDependencies(pkg.manifest).filter((dep) => dep.workspace),
  };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
