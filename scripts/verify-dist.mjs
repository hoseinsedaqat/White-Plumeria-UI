import { inspectPackage, listPublishablePackages } from './pack-lib.mjs';

const root = process.cwd();
const { packages, errors } = listPublishablePackages(root);
let failed = errors.length > 0;

for (const error of errors) console.error(error);

for (const pkg of packages) {
  const { problems } = inspectPackage(pkg);
  if (problems.length === 0) {
    console.log(`${pkg.manifest.name}  ok`);
    continue;
  }
  failed = true;
  for (const problem of problems) console.error(`${pkg.manifest.name}: ${problem}`);
}

console.log(
  'Nothing was published. Dependencies still use workspace:*, so this is not an npm install.',
);

if (failed) process.exit(1);
console.log(`${packages.length} packages. Entry files are present.`);
