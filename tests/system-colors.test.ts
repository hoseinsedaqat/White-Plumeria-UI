import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const index = readFileSync('packages/styles/src/index.css', 'utf8');
const system = readFileSync('packages/styles/src/system.css', 'utf8');

describe('system color contract', () => {
  it('loads the host color rules after component CSS', () => {
    const imports = [...index.matchAll(/@import\s+"([^"]+)"/g)].map((match) => match[1]);
    expect(imports.at(-1)).toBe('./system.css');
    expect(imports).toContain('./base.css');
  });

  it('follows the scheme attribute and keeps a nested light scheme light', () => {
    expect(system).toContain("color-scheme: light");
    expect(system).toContain("color-scheme: dark");
    expect(system).toContain("@media (prefers-color-scheme: dark)");
    expect(system).toContain(":root:not([data-wpl-scheme='light'])");
    expect(system).toContain("[data-wpl-scheme='light']");
    expect(system).toContain("[data-wpl-scheme='dark']");
    const media = system.slice(system.indexOf('@media (prefers-color-scheme: dark)'));
    expect(media.indexOf("[data-wpl-scheme='light']")).toBeGreaterThan(
      media.indexOf(":root:not([data-wpl-scheme='light'])"),
    );
  });

  it('keeps control state visible in forced colors without opting out', () => {
    const forced = system.slice(system.indexOf('@media (forced-colors: active)'));
    expect(forced).toContain('ButtonText');
    expect(forced).toContain('Highlight');
    expect(forced).toContain('HighlightText');
    expect(forced).toContain('GrayText');
    expect(forced).toContain('LinkText');
    expect(forced).toContain('Canvas');
    expect(forced).toContain(".wpl-switch[aria-checked='true']");
    expect(forced).toContain(".wpl-day[aria-selected='true']");
    expect(forced).toContain('.wpl-btn-link');
    expect(system).not.toMatch(/forced-color-adjust\s*:/);
    expect(system).toContain('@media (prefers-contrast: more)');
  });
});
