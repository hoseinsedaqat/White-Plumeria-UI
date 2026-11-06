import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FORBIDDEN_HOSTS,
  entryFiles,
  forbiddenPackageName,
  includedFiles,
  inspectPackage,
  listPublishablePackages,
  patternRoots,
} from '../scripts/pack-lib.mjs';

const EXPECTED = [
  '@white-plumeria/ai',
  '@white-plumeria/alpine',
  '@white-plumeria/angular',
  '@white-plumeria/cli',
  '@white-plumeria/core',
  '@white-plumeria/elements',
  '@white-plumeria/ember',
  '@white-plumeria/lit',
  '@white-plumeria/marko',
  '@white-plumeria/mcp',
  '@white-plumeria/preact',
  '@white-plumeria/qwik',
  '@white-plumeria/react',
  '@white-plumeria/solid',
  '@white-plumeria/styles',
  '@white-plumeria/svelte',
  '@white-plumeria/tokens',
  '@white-plumeria/vue',
];

describe('package pack gate', () => {
  it('packs the current library set and no host package', () => {
    const { packages, errors } = listPublishablePackages(process.cwd());
    expect(errors).toEqual([]);
    expect(packages.map((pkg) => pkg.manifest.name)).toEqual(EXPECTED);
    for (const host of FORBIDDEN_HOSTS) {
      expect(forbiddenPackageName(`@white-plumeria/${host}`)).toBe(true);
    }
  });

  it('reads export files without treating a pattern as a literal file', () => {
    expect(
      entryFiles({
        exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
        bin: { wpl: './dist/bin.js' },
      }),
    ).toEqual(['dist/bin.js', 'dist/index.d.ts', 'dist/index.js']);
    expect(patternRoots({ exports: { './tags/*': './src/tags/*' } })).toEqual(['src/tags/']);
  });

  it('fails a missing entry and does not rewrite workspace protocol', () => {
    const root = mkdtempSync(join(tmpdir(), 'wpl-pack-fixture-'));
    const dir = join(root, 'packages', 'react');
    mkdirSync(dir, { recursive: true });
    const manifest = {
      name: '@white-plumeria/react',
      files: ['dist', 'README.md'],
      exports: { '.': { import: './dist/index.js' } },
      dependencies: { '@white-plumeria/core': 'workspace:*' },
    };
    const manifestPath = join(dir, 'package.json');
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(join(dir, 'README.md'), '# React\n');
    const pkg = { dir, dirName: 'react', manifest, manifestPath };
    expect(inspectPackage(pkg).problems.join('\n')).toContain('export "dist/index.js" is missing');
    mkdirSync(join(dir, 'dist'));
    writeFileSync(join(dir, 'dist', 'index.js'), 'export {};\n');
    expect(inspectPackage(pkg).problems).toEqual([]);
    expect(includedFiles(pkg)).toEqual(['README.md', 'dist/index.js', 'package.json']);
    expect(readFileSync(manifestPath, 'utf8')).toContain('"workspace:*"');
    rmSync(root, { recursive: true, force: true });
  });

  it('keeps the CLI and MCP bins on the .js files those packages export', () => {
    const cli = JSON.parse(readFileSync('packages/cli/package.json', 'utf8')) as {
      bin: { wpl: string };
      exports: { '.': { import: string } };
    };
    const mcp = JSON.parse(readFileSync('packages/mcp/package.json', 'utf8')) as {
      bin: { 'white-plumeria-mcp': string };
    };
    expect(cli.bin.wpl).toBe('./dist/bin.js');
    expect(cli.exports['.'].import).toBe('./dist/index.js');
    expect(mcp.bin['white-plumeria-mcp']).toBe('./dist/bin.js');
    expect(readFileSync('packages/cli/tsdown.config.ts', 'utf8')).toContain('fixedExtension: false');
    expect(readFileSync('packages/mcp/tsdown.config.ts', 'utf8')).toContain('fixedExtension: false');
  });

  /**
   * npm shows a package page from the tarball, not from the repository, so the
   * license text, the readme, and the links have to travel with the package.
   */
  it('ships the license and the links npm shows on a package page', () => {
    const { packages } = listPublishablePackages(process.cwd());
    const missing: string[] = [];
    for (const pkg of packages) {
      const manifest = pkg.manifest as {
        name: string;
        license?: string;
        homepage?: string;
        bugs?: { url?: string };
        repository?: { directory?: string };
        files?: string[];
      };
      const files = manifest.files ?? [];
      if (manifest.license !== 'MIT') missing.push(`${manifest.name}: license`);
      if (!manifest.homepage) missing.push(`${manifest.name}: homepage`);
      if (!manifest.bugs?.url) missing.push(`${manifest.name}: bugs`);
      if (!manifest.repository?.directory) missing.push(`${manifest.name}: repository directory`);
      if (!files.includes('LICENSE')) missing.push(`${manifest.name}: LICENSE in files`);
      if (!files.includes('README.md')) missing.push(`${manifest.name}: README.md in files`);
      if (!existsSync(join(pkg.dir, 'LICENSE'))) missing.push(`${manifest.name}: LICENSE file`);
      else if (!readFileSync(join(pkg.dir, 'LICENSE'), 'utf8').includes('MIT License')) {
        missing.push(`${manifest.name}: LICENSE text`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('does not publish or rewrite the workspace protocol', () => {
    for (const file of ['pack-dry-run.mjs', 'verify-dist.mjs', 'report-size.mjs', 'pack-lib.mjs']) {
      const source = readFileSync(join('scripts', file), 'utf8');
      expect(source).not.toMatch(/npm publish|pnpm publish/);
      expect(source).not.toMatch(/\.replace\([^)]*workspace/);
    }
  });
});
