import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = 'packages/styles/src';
const sheets = Object.fromEntries(
  readdirSync(dir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => [name, readFileSync(join(dir, name), 'utf8')]),
);

interface Block {
  name: string;
  selectors: string[];
}

function bodyAt(css: string, open: number): { body: string; end: number } {
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) return { body: css.slice(open + 1, index), end: index };
    }
  }
  return { body: css.slice(open + 1), end: css.length };
}

/** Selectors written directly inside each `@container` block, with the queried container name. */
function containerBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  const pattern = /@container([^{]*)\{/g;
  let match = pattern.exec(css);
  while (match) {
    const open = match.index + match[0].length - 1;
    const { body, end } = bodyAt(css, open);
    const prelude = match[1].trim();
    const name = prelude.startsWith('(') ? '' : (prelude.split(/[\s(]/)[0] ?? '');
    const selectors: string[] = [];
    let cursor = 0;
    while (cursor < body.length) {
      const brace = body.indexOf('{', cursor);
      if (brace === -1) break;
      const inner = bodyAt(body, brace);
      selectors.push(
        ...body
          .slice(cursor, brace)
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean),
      );
      cursor = inner.end + 1;
    }
    blocks.push({ name, selectors });
    pattern.lastIndex = end;
    match = pattern.exec(css);
  }
  return blocks;
}

/** Class selectors that declare themselves a query container, with the name they answer to. */
function containers(css: string): Map<string, string> {
  const found = new Map<string, string>();
  const pattern = /([^{}@]+)\{([^{}]*)\}/g;
  let match = pattern.exec(css);
  while (match) {
    const [, prelude, declarations] = match;
    if (/container-type:|container:\s*[a-z-]+\s*\//.test(declarations)) {
      const named =
        /container-name:\s*([a-z-]+)/.exec(declarations) ??
        /container:\s*([a-z-]+)\s*\//.exec(declarations);
      for (const selector of prelude.split(',').map((part) => part.trim())) {
        found.set(selector, named ? named[1] : '');
      }
    }
    match = pattern.exec(css);
  }
  return found;
}

/** The element a selector styles is its last compound, not the ancestors in front of it. */
function subject(selector: string): string {
  const last =
    selector
      .split(/[\s>+~]+/)
      .filter(Boolean)
      .pop() ?? selector;
  return (/^\.[a-z0-9-]+/.exec(last) ?? [last])[0];
}

describe('component css on a narrow screen', () => {
  /**
   * A container query styles the descendants of its container. A rule inside
   * the block that points back at the container itself never applies, so a
   * layout written that way keeps its wide tracks at every size.
   */
  it('never asks a container query to restyle its own container', () => {
    const offenders: string[] = [];
    for (const [file, css] of Object.entries(sheets)) {
      const declared = containers(css);
      for (const block of containerBlocks(css)) {
        for (const selector of block.selectors) {
          const owner = declared.get(subject(selector));
          if (owner !== undefined && (block.name === '' || owner === block.name)) {
            offenders.push(`${file}: @container ${block.name || '(unnamed)'} { ${selector} }`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('collapses the responsive layout when its sidebar steps out', () => {
    expect(sheets['layout.css']).toContain(
      'grid-template-columns: fit-content(16rem) minmax(0, 1fr);',
    );
    expect(sheets['layout.css']).toMatch(
      /\.wpl-layout > \.wpl-sidebar \{\s*min-inline-size: min\(9rem, 100%\);/,
    );
  });

  it('stacks the open sidebar above the main region on a narrow container', () => {
    expect(sheets['layout.css']).toMatch(
      /@container wpl-layout \(max-width: 40rem\) \{[\s\S]*?\.wpl-layout\[data-open="true"\] > :first-child \{\s*grid-column: 1 \/ -1;\s*grid-row: 1;/,
    );
    expect(sheets['layout.css']).toMatch(
      /\.wpl-layout\[data-open="true"\] > \.wpl-layout-main \{\s*grid-column: 1 \/ -1;\s*grid-row: 2;/,
    );
  });
});
