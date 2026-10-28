import { describe, expect, it } from 'vitest';
import { checkComponentAvailabilityTool, generateComponentExampleTool, searchComponentsTool } from './tools.ts';

describe('mcp catalog tools', () => {
  it('searches real components and refuses an invented name', () => {
    const found = JSON.parse(searchComponentsTool('dialog').text) as { matches: Array<{ slug: string }> };
    expect(found.matches.some((item) => item.slug === 'dialog')).toBe(true);
    const missing = generateComponentExampleTool('MysteryWidget');
    expect(missing.isError).toBe(true);
    expect(missing.text).toContain('Refusing');
    expect(JSON.parse(checkComponentAvailabilityTool('button').text).available).toBe(true);
  });
});
