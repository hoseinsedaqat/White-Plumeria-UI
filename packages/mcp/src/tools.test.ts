import { describe, expect, it } from 'vitest';
import { checkComponentAvailabilityTool, generateComponentExampleTool, getComponentDocsTool, getFrameworkInstallationTool, searchComponentsTool } from './tools.ts';

describe('mcp catalog tools', () => {
  it('searches real components and refuses an invented name', () => {
    const found = JSON.parse(searchComponentsTool('dialog').text) as { matches: Array<{ slug: string }> };
    expect(found.matches.some((item) => item.slug === 'dialog')).toBe(true);
    const missing = generateComponentExampleTool('MysteryWidget');
    expect(missing.isError).toBe(true);
    expect(missing.text).toContain('Refusing');
    expect(JSON.parse(checkComponentAvailabilityTool('button').text).available).toBe(true);
    expect(getFrameworkInstallationTool('alpine').text).toContain('@white-plumeria/alpine');
    expect(generateComponentExampleTool('button', 'alpine').text).toContain('whitePlumeria');
    expect(getFrameworkInstallationTool('marko').text).toContain('@white-plumeria/marko');
    expect(generateComponentExampleTool('button', 'marko').text).toContain('wpl-button.marko');
    expect(getFrameworkInstallationTool('ember').text).toContain('@white-plumeria/ember');
    expect(generateComponentExampleTool('button', 'ember').text).toContain('<template>');
    expect(generateComponentExampleTool('button', 'next').text).toContain("'use client'");
    expect(generateComponentExampleTool('button', 'next').text).toContain('There is no @white-plumeria/next package');
    expect(generateComponentExampleTool('button', 'next').text).not.toContain('from "@white-plumeria/next"');
    expect(getFrameworkInstallationTool('nuxt').text).toContain('@white-plumeria/vue');
    expect(getFrameworkInstallationTool('nuxt').text).toContain('"published": false');
    const docs = JSON.parse(getComponentDocsTool('button').text) as { classes: string[]; html: string; contract: string };
    expect(docs.classes).toContain('wpl-btn');
    expect(docs.html).toContain('<button class="wpl-btn wpl-btn-primary"');
    expect(docs.contract).toContain('Do not invent a class');
    expect(docs.contract).toContain('not on npm');
    expect(generateComponentExampleTool('navbar').text).toContain('wpl-navbar');
    expect(generateComponentExampleTool('navbar').text).toContain('Do not invent a class');
  });
});
