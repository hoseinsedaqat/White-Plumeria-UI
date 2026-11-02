import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const files = [
  'packages/react/src/layout.tsx',
  'packages/preact/src/layout.tsx',
  'packages/solid/src/layout.tsx',
  'packages/qwik/src/layout.tsx',
  'packages/vue/src/layout.ts',
  'packages/svelte/src/lib/SplitPane.svelte',
  'packages/angular/src/layout.ts',
  'packages/lit/src/layout.ts',
  'packages/alpine/src/layout.ts',
  'packages/marko/src/tags/wpl-split-pane.marko',
  'packages/ember/src/layout.ts',
];

describe('split direction contract', () => {
  it('uses the shared step in every adapter', () => {
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).toContain('splitSizeStep');
    }
    expect(readFileSync('packages/ember/src/layout.ts', 'utf8')).toContain('role="separator"');
    expect(readFileSync('packages/ember/src/layout.ts', 'utf8')).toContain(
      'aria-orientation="vertical"',
    );
  });
});
