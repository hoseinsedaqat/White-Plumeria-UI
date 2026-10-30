import { describe, expect, it } from 'vitest';
import { planFromPrompt } from './provider.ts';

describe('alpine planner', () => {
  it('emits a native Alpine snippet that validates', () => {
    const plan = planFromPrompt({ prompt: 'A button to save changes and a badge' });
    const code = plan.code.alpine.files[0]?.contents ?? '';
    expect(code).toContain('@white-plumeria/alpine');
    expect(code).toContain('whitePlumeria');
    expect(code).toContain("x-data='Button(");
    expect(plan.validation.alpine.ok).toBe(true);
  });
});
