import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { entryFiles, formatBytes, inspectPackage, listPublishablePackages } from './pack-lib.mjs';

const root = process.cwd();
const { packages, errors } = listPublishablePackages(root);
let failed = errors.length > 0;

for (const error of errors) console.error(error);

const ready = [];
for (const pkg of packages) {
  const { problems } = inspectPackage(pkg);
  if (problems.length > 0) {
    failed = true;
    for (const problem of problems) console.error(`${pkg.manifest.name}: ${problem}`);
    continue;
  }
  ready.push(pkg);
}

const destination = mkdtempSync(join(tmpdir(), 'wpl-pack-'));
const rows = [];

try {
  for (const pkg of ready) {
    const before = readFileSync(pkg.manifestPath, 'utf8');
    const result = spawnSync(
      'npm',
      [
        'pack',
        '--dry-run',
        '--json',
        '--ignore-scripts',
        '--offline',
        '--pack-destination',
        destination,
      ],
      { cwd: pkg.dir, encoding: 'utf8' },
    );
    const after = readFileSync(pkg.manifestPath, 'utf8');
    if (after !== before) {
      writeFileSync(pkg.manifestPath, before);
      console.error(
        `${pkg.manifest.name}: pack rewrote package.json. Restored. workspace:* was not changed, and nothing was published.`,
      );
      failed = true;
      continue;
    }
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout);
      console.error(`${pkg.manifest.name}: npm pack --dry-run failed. Nothing was published.`);
      failed = true;
      continue;
    }
    const packed = parsePack(result.stdout);
    if (!packed) {
      console.error(`${pkg.manifest.name}: npm pack did not return JSON. Nothing was published.`);
      failed = true;
      continue;
    }
    const packedPaths = packed.files.map((file) => file.path.replace(/^package\//, ''));
    for (const file of entryFiles(pkg.manifest)) {
      if (!packedPaths.includes(file)) {
        console.error(`${pkg.manifest.name}: dry-run tarball is missing ${file}.`);
        failed = true;
      }
    }
    rows.push({
      name: pkg.manifest.name,
      filename: packed.filename,
      bytes: packed.size,
    });
    console.log(`${pkg.manifest.name}  ${packed.filename}  ${formatBytes(packed.size)}`);
  }
} finally {
  rmSync(destination, { recursive: true, force: true });
}

console.log(
  'Nothing was published. The dry-run left workspace:* unchanged, so this is not an npm install.',
);
if (rows.length > 0) {
  const total = rows.reduce((sum, row) => sum + row.bytes, 0);
  console.log(`${rows.length} tarballs, ${formatBytes(total)} packed. Deleted after the check.`);
}
if (failed) process.exit(1);

function parsePack(stdout) {
  const start = stdout.indexOf('[');
  const end = stdout.lastIndexOf(']');
  if (start === -1 || end < start) return null;
  const parsed = JSON.parse(stdout.slice(start, end + 1));
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!entry || !Array.isArray(entry.files) || typeof entry.filename !== 'string') return null;
  return {
    filename: entry.filename,
    size: typeof entry.size === 'number' ? entry.size : 0,
    files: entry.files,
  };
}
