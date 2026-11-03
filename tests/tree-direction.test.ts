import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const files = [
  ['packages/react/src/data.tsx'],
  ['packages/preact/src/data.tsx'],
  ['packages/solid/src/data.tsx'],
  ['packages/qwik/src/data.tsx'],
  ['packages/vue/src/data.ts'],
  ['packages/svelte/src/lib/TreeView.svelte'],
  ['packages/angular/src/data.ts'],
  ['packages/lit/src/data.ts'],
  ['packages/alpine/src/data.ts'],
  ['packages/marko/src/tags/wpl-tree-view.marko', 'packages/marko/src/tags/tree-branch.marko'],
  ['packages/ember/src/data.ts'],
];

describe('tree direction contract', () => {
  it('uses the shared expand action in every adapter', () => {
    for (const group of files) {
      const text = group.map((file) => readFileSync(file, 'utf8')).join('\n');
      expect(text, group[0]).toContain('treeExpandAction');
      expect(text, group[0]).toContain('wpl-tree-row');
    }
  });
});
