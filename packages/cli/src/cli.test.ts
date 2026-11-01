import { describe, expect, it } from 'vitest';
import { run } from './cli.ts';

describe('wpl cli', () => {
  it('prints help and rejects an unknown command', () => {
    expect(run(['--help']).code).toBe(0);
    expect(run(['--help']).stdout).toContain('wpl add');
    const unknown = run(['explode']);
    expect(unknown.code).toBe(2);
    expect(unknown.stderr).toContain('Unknown command');
  });

  it('refuses an unknown component and does not copy source by default', () => {
    const writes: string[] = [];
    const missing = run(['add', 'MysteryWidget'], { write: (path) => writes.push(path) });
    expect(missing.code).toBe(1);
    expect(writes).toEqual([]);
    const added = run(['add', 'button', '--framework', 'vue']);
    expect(added.code).toBe(0);
    expect(added.stdout).toContain('@white-plumeria/vue');
    expect(added.stdout).toContain('does not copy');
    expect(added.stdout).toContain('wpl-btn');
    expect(added.stdout).toContain('not a working install');
    const alpine = run(['add', 'button', '--framework', 'alpine']);
    expect(alpine.code).toBe(0);
    expect(alpine.stdout).toContain('@white-plumeria/alpine');
    expect(alpine.stdout).toContain('whitePlumeria');
    const marko = run(['add', 'button', '--framework', 'marko']);
    expect(marko.code).toBe(0);
    expect(marko.stdout).toContain('@white-plumeria/marko');
    expect(marko.stdout).toContain('wpl-button.marko');
    const ember = run(['add', 'button', '--framework', 'ember']);
    expect(ember.code).toBe(0);
    expect(ember.stdout).toContain('@white-plumeria/ember');
    expect(ember.stdout).toContain('<template>');
    const next = run(['add', 'button', '--framework', 'next', '--copy']);
    expect(next.code).toBe(0);
    expect(next.stdout).toContain('@white-plumeria/react');
    expect(next.stdout).toContain("'use client'");
    expect(next.stdout).toContain('not a separate package');
    expect(next.stdout).toContain('There is no @white-plumeria/next package');
    expect(next.stdout).not.toContain('from "@white-plumeria/next"');
    expect(next.stdout).toContain('Copy is skipped');
  });

  it('doctor fails on an old Node and theme rejects an unknown name', () => {
    expect(run(['doctor'], { nodeVersion: '18.0.0' }).code).toBe(1);
    expect(run(['doctor'], { nodeVersion: '22.22.3' }).code).toBe(0);
    expect(run(['theme', 'nope']).code).toBe(1);
    expect(run(['theme', 'ivory']).stdout).toContain('--wpl-color-bg');
  });
});
