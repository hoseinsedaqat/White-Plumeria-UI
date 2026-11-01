import { describe, expect, it } from 'vitest';
import { catalog } from './index.ts';
import { isServerHost, serverExample, serverHosts } from './servers.ts';

describe('server host examples', () => {
  it('derives a host example for every catalog component without inventing a package', () => {
    expect(isServerHost('next')).toBe(true);
    expect(isServerHost('react')).toBe(false);
    for (const component of catalog) {
      for (const host of serverHosts) {
        const code = serverExample(component.examples, host.id);
        expect(code.length).toBeGreaterThan(40);
        expect(code).toContain(`@white-plumeria/${host.package}`);
        expect(code).toContain(`There is no @white-plumeria/${host.id} package`);
        expect(code).not.toMatch(new RegExp(`from ["']@white-plumeria/${host.id}["']`));
      }
    }
  });

  it('marks Next as a client file and Nuxt as a client-only page', () => {
    const button = catalog.find((item) => item.slug === 'button');
    expect(button).toBeTruthy();
    if (!button) return;
    expect(serverExample(button.examples, 'next')).toContain("'use client'");
    expect(serverExample(button.examples, 'nuxt')).toContain('<ClientOnly>');
    expect(serverExample(button.examples, 'nuxt')).toContain('@white-plumeria/vue');
  });
});
