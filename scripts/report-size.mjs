import {
  formatBytes,
  includedFiles,
  inspectPackage,
  listPublishablePackages,
  unpackedSize,
} from './pack-lib.mjs';

const root = process.cwd();
const { packages, errors } = listPublishablePackages(root);
let failed = errors.length > 0;

for (const error of errors) console.error(error);

const rows = [];
for (const pkg of packages) {
  const { problems } = inspectPackage(pkg);
  if (problems.length > 0) {
    failed = true;
    for (const problem of problems) console.error(`${pkg.manifest.name}: ${problem}`);
    continue;
  }
  rows.push({
    name: pkg.manifest.name,
    files: includedFiles(pkg).length,
    bytes: unpackedSize(pkg),
  });
}

const nameWidth = Math.max(6, ...rows.map((row) => row.name.length));
console.log(`${'Package'.padEnd(nameWidth)}  Files  Unpacked`);
for (const row of rows) {
  console.log(
    `${row.name.padEnd(nameWidth)}  ${String(row.files).padStart(5)}  ${formatBytes(row.bytes).padStart(8)}`,
  );
}
const total = rows.reduce((sum, row) => sum + row.bytes, 0);
console.log(
  `${'Total'.padEnd(nameWidth)}  ${String(rows.length).padStart(5)}  ${formatBytes(total).padStart(8)}`,
);
console.log('Nothing was published. This is the unpacked size of the files a pack would include.');

if (failed) process.exit(1);
