import { describe, expect, it } from 'vitest';
import { defineWhitePlumeriaElements, elementTags } from './index.ts';

describe('custom elements', () => {
  it('defines each tag once and upgrades a button without shadow DOM', () => {
    defineWhitePlumeriaElements();
    defineWhitePlumeriaElements();
    expect(elementTags.every((tag) => customElements.get(tag))).toBe(true);
    const host = document.createElement('wpl-button');
    host.setAttribute('variant', 'primary');
    host.textContent = 'Save changes';
    document.body.append(host);
    const button = host.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Save changes');
    expect(button?.className).toContain('wpl-btn-primary');
    expect(host.shadowRoot).toBeNull();
    host.remove();
  });

  it('toggles a switch and announces the state', () => {
    defineWhitePlumeriaElements();
    const host = document.createElement('wpl-switch');
    host.setAttribute('label', 'Reduced motion');
    document.body.append(host);
    const control = host.querySelector('button');
    expect(control?.getAttribute('aria-checked')).toBe('false');
    control?.click();
    expect(control?.getAttribute('aria-checked')).toBe('true');
    host.remove();
  });
});
