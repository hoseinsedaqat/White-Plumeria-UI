import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('apps/docs/index.html', 'utf8');
const shell = readFileSync('apps/docs/src/shell.tsx', 'utf8');
const sheets = {
  'docs.css': readFileSync('apps/docs/src/docs.css', 'utf8'),
  'home.css': readFileSync('apps/docs/src/home.css', 'utf8'),
  'examples.css': readFileSync('apps/docs/src/examples.css', 'utf8'),
};

/**
 * `1fr` means `minmax(auto, 1fr)`. An auto minimum never shrinks under the
 * widest child, so one long code line, a select with long options, or a
 * five column strip kept the whole column wider than a phone screen. Tracks
 * in this site state their own minimum instead.
 */
function bareFractions(css: string) {
  return [...css.matchAll(/grid-template-columns:\s*([^;}]+)/g)]
    .map((match) => match[1].trim())
    .filter((value) => {
      const normalized = value
        .replace(/\b(?:min|max|calc|clamp)\([^()]*\)/g, 'SIZE')
        .replace(/minmax\([^()]*\)/g, 'TRACK');
      return normalized.includes('fr') || /minmax\(\s*auto/.test(value);
    });
}

describe('docs site on a phone', () => {
  it('renders at the device width', () => {
    expect(page).toContain('name="viewport" content="width=device-width, initial-scale=1"');
  });

  it('states a minimum on every grid track', () => {
    for (const [name, css] of Object.entries(sheets)) {
      expect(`${name}: ${bareFractions(css).join(' | ')}`).toBe(`${name}: `);
    }
  });

  it('gives the hero stage a single track under the two column breakpoint', () => {
    expect(sheets['home.css']).toMatch(
      /@media \(max-width: 1099px\) \{\s*\.home-stage \{\s*grid-template-columns: minmax\(0, 1fr\);/,
    );
  });

  it('measures a viewport that a phone toolbar can shrink', () => {
    expect(sheets['home.css']).toContain('min-height: calc(100dvh - var(--docs-bar) - 2.2rem);');
    expect(sheets['docs.css']).toContain(
      'height: calc(100dvh - var(--docs-nav-top, var(--docs-bar)));',
    );
  });

  it('hangs the drawer under the bar it opens from', () => {
    expect(shell).toContain("root.style.setProperty('--docs-nav-top'");
    expect(sheets['docs.css']).toContain('top: var(--docs-nav-top, var(--docs-bar));');
    expect(sheets['docs.css']).toContain('inset: var(--docs-nav-top, var(--docs-bar)) 0 0 0;');
  });

  it('keeps the site name whole on the narrowest phones', () => {
    expect(sheets['docs.css']).toMatch(
      /@media \(max-width: 380px\) \{\s*\.docs-brand \.wpl-mark \{\s*display: none;/,
    );
  });

  /**
   * A demo stage is narrower than the window, so the stage holds the layout
   * sidebar open for the example. On a phone there is no room for two
   * columns, and the component already collapses itself.
   */
  it('only holds the layout demo open where two columns fit', () => {
    expect(sheets['docs.css']).toMatch(
      /@media \(min-width: 721px\) \{\s*\.docs-canvas > \.wpl-layout > \.wpl-sidebar,[\s\S]*?\{\s*display: flex;/,
    );
    expect(sheets['docs.css']).toContain('grid-template-columns: fit-content(14rem) minmax(0, 1fr);');
    expect(sheets['docs.css']).toContain('grid-template-columns: fit-content(6.75rem) minmax(0, 1fr);');
  });

  it('lets a control shrink instead of widening the page', () => {
    expect(sheets['docs.css']).toMatch(
      /\.docs-controls \.wpl-select,[\s\S]*?\{\s*width: 100%;\s*min-width: 0;/,
    );
  });
});
