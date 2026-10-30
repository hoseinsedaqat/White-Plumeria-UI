import { describe, expect, it } from 'vitest';
import { planFromPrompt } from './provider.ts';

describe('ember planner', () => {
  it('emits a Glimmer template that validates', () => {
    const plan = planFromPrompt({ prompt: 'A button to save changes and a badge' });
    const code = plan.code.ember.files[0]?.contents ?? '';
    expect(code).toContain('@white-plumeria/ember');
    expect(code).toContain('<Button @variant="primary">');
    expect(code).toContain('Save changes');
    expect(plan.validation.ember.ok).toBe(true);
  });
});
