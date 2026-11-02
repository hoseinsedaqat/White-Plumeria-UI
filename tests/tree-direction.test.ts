import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const files = [
  'packages/react/src/data.tsx',
  'packages/preact/src/data.tsx',
  'packages/solid/src/data.tsx',
  'packages/qwik/src/data.tsx',
  'packages/vue/src/data.ts',
  'packages/svelte/src/lib/TreeView.svelte',
  'packages/angular/src/data.ts',
  'packages/lit/src/data.ts',
  'packages/alpine/src/data.ts',
  'packages/marko/src/tags/wpl-tree-view.marko',
  'packages/ember/src/data.ts',
];

describe('tree direction contract', () => {
  it('uses the shared expand action in every adapter', () => {
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).toContain('treeExpandAction');
      expect(text, file).toContain('wpl-tree-row');
    }
  });
});
