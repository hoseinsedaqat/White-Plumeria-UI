import { describe, expect, it } from 'vitest';
import { planFromPrompt } from './provider.ts';

describe('marko planner', () => {
  it('emits a native Marko tag snippet that validates', () => {
    const plan = planFromPrompt({ prompt: 'A button to save changes and a badge' });
    const code = plan.code.marko.files[0]?.contents ?? '';
    expect(code).toContain('@white-plumeria/marko/tags/wpl-button.marko');
    expect(code).toContain('<Button variant="primary">');
    expect(code).toContain('Save changes');
    expect(code).not.toContain('={');
    expect(plan.validation.marko.ok).toBe(true);
  });
});
