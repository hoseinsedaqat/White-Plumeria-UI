import { describe, expect, it } from 'vitest';
import { checkComponentAvailabilityTool, generateComponentExampleTool, getFrameworkInstallationTool, searchComponentsTool } from './tools.ts';

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
  });
});
