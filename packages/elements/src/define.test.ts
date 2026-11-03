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
    spinner.setAttribute('size', 'lg');
    expect(spinner.className).toContain('wpl-spinner-lg');
    expect(dialog.querySelector('.wpl-dialog-header button')?.getAttribute('aria-label')).toBe('بستن');
    spinner.remove();
    dialog.remove();
    document.documentElement.lang = '';
  });

  it('moves tabs with the arrow keys and names an accordion panel', () => {
    defineWhitePlumeriaElements();
    const tabs = document.createElement('wpl-tabs');
    tabs.innerHTML = '<div data-tab="one" data-label="One">First</div><div data-tab="two" data-label="Two">Second</div>';
    const accordion = document.createElement('wpl-accordion');
    accordion.innerHTML = '<div data-title="Fees">No monthly fee.</div>';
    document.body.append(tabs, accordion);
    const buttons = tabs.querySelectorAll('[role="tab"]');
    expect(buttons[0]?.getAttribute('aria-selected')).toBe('true');
    expect(buttons[0]?.getAttribute('aria-controls')).toBe(tabs.querySelector('[role="tabpanel"]')?.id);
    buttons[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(buttons[1]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs.querySelector('[data-tab="two"]')?.hasAttribute('hidden')).toBe(false);
    const trigger = accordion.querySelector('button');
    const region = accordion.querySelector('[role="region"]');
    expect(trigger?.getAttribute('aria-controls')).toBe(region?.id);
    expect(region?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    tabs.remove();
    accordion.remove();
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
    host.setAttribute('name', 'motion');
    const box = host.querySelector('input');
    expect(box?.getAttribute('name')).toBe('motion');
    expect(box?.hidden).toBe(true);
    expect((box as HTMLInputElement).checked).toBe(true);
    host.removeAttribute('name');
    expect(host.querySelector('input')).toBeNull();
    host.remove();
  });
});
