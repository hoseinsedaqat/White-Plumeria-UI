import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { brand, getComponent, installCommand, packageName, type PackageName } from '@white-plumeria/core';
import { themeNames, themes } from '@white-plumeria/tokens';

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface CliIo {
  cwd: string;
  exists: (path: string) => boolean;
  write: (path: string, contents: string) => void;
  nodeVersion: string;
}

const help = `wpl — ${brand.productName} CLI

Usage:
  wpl init
  wpl add <component> [--framework react|vue|svelte|angular|solid|preact|qwik|html] [--copy]
  wpl doctor
  wpl theme [name]
  wpl --help

init writes wpl.config.json and prints the install command. It does not copy component source.
add prints the package install for a catalog component. --copy writes a thin re-export, not a fork.
doctor checks the Node version and the catalog. It does not claim packages are published.
theme prints named theme tokens. Unknown commands exit 2.
`;

export function run(argv: string[], io?: Partial<CliIo>): CliResult {
  const runtime: CliIo = {
    cwd: io?.cwd ?? process.cwd(),
    exists: io?.exists ?? existsSync,
    write:
      io?.write ??
      ((path, contents) => {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, contents);
      }),
    nodeVersion: io?.nodeVersion ?? process.versions.node,
  };
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: {
        help: { type: 'boolean', short: 'h', default: false },
        framework: { type: 'string', default: 'react' },
        copy: { type: 'boolean', default: false },
      },
    });
  } catch (error) {
    return fail(2, error instanceof Error ? error.message : 'Could not parse arguments.');
  }
  if (parsed.values.help || parsed.positionals.length === 0) return ok(help);
  const [command, ...rest] = parsed.positionals;
  if (command === 'init') return init(runtime);
  if (command === 'add') return add(rest[0], String(parsed.values.framework), Boolean(parsed.values.copy), runtime);
  if (command === 'doctor') return doctor(runtime);
  if (command === 'theme') return theme(rest[0]);
  return fail(2, `Unknown command: ${command ?? ''}\n\n${help}`);
}

function init(io: CliIo): CliResult {
  const path = `${io.cwd}/wpl.config.json`;
  if (!io.exists(path)) {
    io.write(
      path,
      `${JSON.stringify({ product: brand.productName, version: brand.version, cssPrefix: brand.cssPrefix, theme: 'white' }, null, 2)}\n`,
    );
  }
  return ok(
    [
      `Wrote ${io.exists(path) ? path : 'wpl.config.json'} if it was missing.`,
      'Packages are not published to npm yet. Intended install:',
      installCommand(['styles', 'react'], 'npm'),
      'Component source stays in the package. Do not copy it into the app.',
      '',
    ].join('\n'),
  );
}

function add(name: string | undefined, framework: string, copy: boolean, io: CliIo): CliResult {
  if (!name) return fail(1, 'add needs a component name. Example: wpl add button');
  const component = getComponent(name);
  if (!component) return fail(1, `Unknown component: ${name}. Run wpl theme or search the docs catalog.`);
  const target = framework === 'vue' || framework === 'svelte' || framework === 'angular' || framework === 'solid' || framework === 'preact' || framework === 'qwik' || framework === 'html' || framework === 'react' ? framework : '';
  if (!target) return fail(1, `Unknown framework: ${framework}. Use react, vue, svelte, angular, solid, preact, qwik, or html.`);
  const packages: PackageName[] = target === 'html' ? ['styles'] : ['styles', target];
  const lines = [
    installCommand(packages, 'npm'),
    '',
    component.examples[target],
    '',
    'This command does not copy the component implementation.',
  ];
  if (copy) {
    const file = `${io.cwd}/wpl/${component.slug}.ts`;
    io.write(
      file,
      `export { ${component.name} } from "${packageName(target === 'html' ? 'styles' : target)}";\n`,
    );
    lines.push(`Wrote a re-export at ${file}. The behavior still comes from the package.`);
  }
  return ok(`${lines.join('\n')}\n`);
}

function doctor(io: CliIo): CliResult {
  const major = Number(io.nodeVersion.split('.')[0]);
  const problems: string[] = [];
  if (!Number.isFinite(major) || major < 22) problems.push(`Node ${io.nodeVersion} is below 22.`);
  if (themeNames.length < 1) problems.push('No themes are registered.');
  const lines = [
    `${brand.productName} ${brand.version}`,
    `Node ${io.nodeVersion}`,
    `Themes: ${themeNames.join(', ')}`,
    'npm packages: not published',
  ];
  if (problems.length) return { code: 1, stdout: `${lines.join('\n')}\n`, stderr: `${problems.join('\n')}\n` };
  return ok(`${lines.join('\n')}\nDoctor found no local problems.\n`);
}

function theme(name: string | undefined): CliResult {
  if (!name) return ok(`${themes.map((item) => `${item.name}\t${item.label}`).join('\n')}\n`);
  const found = themes.find((item) => item.name === name);
  if (!found) return fail(1, `Unknown theme: ${name}. Known: ${themeNames.join(', ')}`);
  const css = Object.entries(found.light)
    .map(([key, value]) => `  --wpl-color-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${value};`)
    .join('\n');
  return ok(`[data-wpl-theme="${found.name}"] {\n${css}\n}\n`);
}

function ok(stdout: string): CliResult {
  return { code: 0, stdout, stderr: '' };
}

function fail(code: number, stderr: string): CliResult {
  return { code, stdout: '', stderr: stderr.endsWith('\n') ? stderr : `${stderr}\n` };
}
