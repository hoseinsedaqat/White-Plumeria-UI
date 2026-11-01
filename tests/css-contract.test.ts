import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('css contract', () => {
  it('tells a model which classes exist and that packages are not on npm', () => {
    const llms = readFileSync('apps/docs/public/llms.txt', 'utf8');
    const full = readFileSync('apps/docs/public/llms-full.txt', 'utf8');
    expect(llms).toContain('Do not invent a class');
    expect(llms).toContain('Packages are not on npm');
    expect(llms).toContain('Tailwind is not required');
    expect(llms).toContain('<button class="wpl-btn wpl-btn-primary" type="button">Save changes</button>');
    expect(full).toContain('wpl-btn wpl-btn-primary');
    expect(llms).not.toContain('npm install @white-plumeria');
  });
});
