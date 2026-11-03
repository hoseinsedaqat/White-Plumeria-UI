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

  it('names the spinner and dialog close button in the page language', () => {
    defineWhitePlumeriaElements();
    document.documentElement.lang = 'fa';
    const spinner = document.createElement('wpl-spinner');
    const dialog = document.createElement('wpl-dialog');
    dialog.setAttribute('title', 'تأیید');
    document.body.append(spinner, dialog);
    expect(spinner.querySelector('.wpl-sr-only')?.textContent).toBe('در حال بارگذاری');
    expect(dialog.querySelector('.wpl-dialog-header button')?.getAttribute('aria-label')).toBe('بستن');
    spinner.remove();
    dialog.remove();
    document.documentElement.lang = '';
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
