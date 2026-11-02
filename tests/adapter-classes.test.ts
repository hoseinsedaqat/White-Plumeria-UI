import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const banned = [
  'wpl-dropzone',
  'wpl-tab-panel',
  'wpl-split-handle',
  'wpl-sidebar-link',
  'wpl-menu-item-active',
  'wpl-step-index',
  'wpl-step-label',
  'wpl-step-description',
  'wpl-password-toggle',
  'wpl-number-control',
  'wpl-rating-star',
  'wpl-accordion-heading',
  'wpl-chart-frame',
  'wpl-responsive-main',
  'wpl-responsive',
];

function usesClass(text: string, name: string): boolean {
  const edge = '(^|[^A-Za-z0-9_-])';
  const end = '($|[^A-Za-z0-9_-])';
  return new RegExp(`${edge}${name}${end}`).test(text);
}

function sources(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name === 'dist' || name === 'node_modules' || name === 'scripts') continue;
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...sources(path));
    else if (/\.(ts|tsx|svelte|marko|mjs)$/.test(name)) files.push(path);
  }
  return files;
}

describe('adapter class contract', () => {
  it('does not invent classes the stylesheet does not define', () => {
    const hits: string[] = [];
    for (const file of sources('packages')) {
      const text = readFileSync(file, 'utf8');
      for (const name of banned) {
        if (usesClass(text, name)) hits.push(`${file} uses ${name}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('uses the shared file, tab, list, and step classes', () => {
    expect(readFileSync('packages/vue/src/file-upload.ts', 'utf8')).toContain('wpl-file-drop');
    expect(readFileSync('packages/svelte/src/lib/FileUpload.svelte', 'utf8')).toContain('wpl-file-input');
    expect(readFileSync('packages/vue/src/disclosure.ts', 'utf8')).toContain('wpl-tablist');
    expect(readFileSync('packages/svelte/src/lib/Tabs.svelte', 'utf8')).toContain('wpl-tabpanel');
    expect(readFileSync('packages/ember/src/widgets.ts', 'utf8')).toContain('wpl-tabpanel');
    expect(readFileSync('packages/marko/src/tags/wpl-tabs.marko', 'utf8')).toContain('wpl-tabs-vertical');
    expect(readFileSync('packages/vue/src/combobox.ts', 'utf8')).toContain("class: 'wpl-listbox'");
    expect(readFileSync('packages/svelte/src/lib/Combobox.svelte', 'utf8')).toContain('data-active');
    expect(readFileSync('packages/vue/src/command.ts', 'utf8')).toContain('wpl-command-list');
    expect(readFileSync('packages/solid/src/steps.tsx', 'utf8')).toContain('data-state={state}');
    expect(readFileSync('packages/solid/src/steps.tsx', 'utf8')).toContain('wpl-step-marker');
    expect(readFileSync('packages/marko/src/tags/wpl-responsive-layout.marko', 'utf8')).toContain('wpl-layout-main');
    expect(readFileSync('packages/marko/src/tags/wpl-rating.marko', 'utf8')).toContain('wpl-rating-option');
    expect(readFileSync('packages/marko/src/tags/wpl-accordion.marko', 'utf8')).toContain('wpl-accordion-item');
    expect(readFileSync('packages/ember/src/data.ts', 'utf8')).toContain('wpl-chart-fill');
    expect(readFileSync('packages/alpine/src/layout.ts', 'utf8')).toContain("classList.add('wpl-layout')");
  });
});
