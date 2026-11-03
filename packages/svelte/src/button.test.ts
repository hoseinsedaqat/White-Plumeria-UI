import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Accordion from './lib/Accordion.svelte';
import Card from './lib/Card.svelte';
import Combobox from './lib/Combobox.svelte';
import Link from './lib/Link.svelte';
import Pagination from './lib/Pagination.svelte';
import Popover from './lib/Popover.svelte';
import Button from './lib/Button.svelte';
import Provider from './lib/Provider.svelte';
import Spinner from './lib/Spinner.svelte';
import Divider from './lib/Divider.svelte';
import SplitPane from './lib/SplitPane.svelte';
import Steps from './lib/Steps.svelte';
import TreeView from './lib/TreeView.svelte';
import SearchInput from './lib/SearchInput.svelte';
import Switch from './lib/Switch.svelte';
import Tooltip from './lib/Tooltip.svelte';

describe('svelte adapter', () => {
  it('shows a search label and reports Enter', () => {
    const searches: string[] = [];
    const view = render(SearchInput, { label: 'Search docs', value: 'Button', onsearch: (value: string) => searches.push(value) });
    const label = view.container.querySelector('label');
    expect(label?.textContent).toBe('Search docs');
    expect(label?.classList.contains('wpl-sr-only')).toBe(false);
    view.container.querySelector('input')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(searches).toEqual(['Button']);
    const hidden = render(SearchInput, { label: 'Search docs', visuallyHiddenLabel: true });
    expect(hidden.container.querySelector('label')?.classList.contains('wpl-sr-only')).toBe(true);
  });

  it('names the toast region in the page language', () => {
    const view = render(Provider, {});
    const region = view.container.querySelector('.wpl-toast-region');
    expect(region?.getAttribute('aria-label')).toBe('Notifications');
    expect(region?.getAttribute('aria-live')).toBe('polite');
  });

  it('sizes a spinner without dropping its name', () => {
    const view = render(Spinner, { size: 'sm', label: 'Saving' });
    const spinner = view.container.querySelector('[role="status"]');
    expect(spinner?.className).toContain('wpl-spinner-sm');
    expect(spinner?.querySelector('.wpl-sr-only')?.textContent).toBe('Saving');
  });

  it('renders a labeled divider as a separator and an unlabeled divider as a rule', () => {
    const labeled = render(Divider, { label: 'Or' });
    expect(labeled.container.querySelector('[role="separator"]')?.textContent).toBe('Or');
    expect(labeled.container.querySelector('.wpl-divider-labeled')).toBeTruthy();
    const plain = render(Divider, {});
    expect(plain.container.querySelector('hr.wpl-divider')).toBeTruthy();
    expect(plain.container.querySelector('[role="separator"]')).toBeNull();
  });

  it('announces that an external link opens in a new tab', () => {
    const view = render(Link, { href: 'https://example.com/docs', external: true });
    const link = view.container.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noreferrer noopener');
    expect(link?.querySelector('.wpl-sr-only')?.textContent).toContain('opens in a new tab');
    expect(link?.querySelector('.wpl-icon-dir')).toBeTruthy();
  });

  it('marks the current pagination page', async () => {
    const user = userEvent.setup();
    const view = render(Pagination, { page: 5, pageCount: 10 });
    expect(view.container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('5');
    expect(view.container.querySelector('.wpl-icon-dir')).toBeTruthy();
    expect(view.container.textContent).toContain('…');
    const six = [...view.container.querySelectorAll('button')].find((button) => button.textContent?.trim() === '6');
    await user.click(six!);
    expect(view.container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('6');
  });

  it('names an accordion panel from its trigger', () => {
    const view = render(Accordion, { items: [{ id: 'fees', title: 'Fees', content: 'No monthly fee.' }] });
    const trigger = view.container.querySelector('.wpl-accordion-trigger');
    const panel = view.container.querySelector('[role="region"]');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(panel?.textContent).toContain('No monthly fee.');
  });

  it('does not activate a loading button', async () => {
    const user = userEvent.setup();
    let clicks = 0;
    render(Button, { loading: true, 'aria-label': 'Save changes', onclick: () => (clicks += 1) });
    const button = screen.getByRole('button', { name: 'Save changes' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(clicks).toBe(0);
  });

  it('toggles a switch', async () => {
    const user = userEvent.setup();
    render(Switch, { label: 'Reduced motion' });
    const control = screen.getByRole('switch', { name: 'Reduced motion' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    await user.click(control);
    expect(control).toHaveAttribute('aria-checked', 'true');
  });

  it('renders steps and disables a future step', () => {
    render(Steps, {
      label: 'Checkout',
      items: [
        { id: 'account', title: 'Account' },
        { id: 'billing', title: 'Billing' },
      ],
      value: 'account',
    });
    expect(screen.getByRole('button', { name: /Billing/ }).hasAttribute('disabled')).toBe(true);
  });

  it('shrinks the start pane when ArrowRight is pressed in RTL', async () => {
    const user = userEvent.setup();
    render(SplitPane, { label: 'Resize editor' });
    const separator = screen.getByRole('separator', { name: 'Resize editor' });
    const split = separator.closest('.wpl-split');
    if (split instanceof HTMLElement) split.style.direction = 'rtl';
    separator.focus();
    await user.keyboard('{ArrowRight}');
    expect(separator.getAttribute('aria-valuenow')).toBe('45');
  });

  it('expands a tree toward the inline end', async () => {
    const user = userEvent.setup();
    const view = render(TreeView, {
      label: 'Files',
      nodes: [{ id: 'src', label: 'src', children: [{ id: 'btn', label: 'button.tsx' }] }],
    });
    view.container.style.direction = 'rtl';
    const row = screen.getByRole('treeitem', { name: 'src' });
    row.focus();
    await user.keyboard('{ArrowLeft}');
    expect(row.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('treeitem', { name: 'button.tsx' })).toBeTruthy();
  });

  it('waits to show a tooltip and dismisses it with escape', async () => {
    vi.useFakeTimers();
    try {
      const view = render(Tooltip, { content: 'Copy token' });
      const host = view.container.querySelector('span');
      host?.dispatchEvent(new MouseEvent('mouseenter'));
      await vi.advanceTimersByTimeAsync(400);
      expect(view.container.querySelector('[role="tooltip"]')?.textContent).toBe('Copy token');
      host?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await tick();
      expect(view.container.querySelector('[role="tooltip"]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes a popover from escape and an outside pointer', async () => {
    const view = render(Popover, { label: 'Details' });
    const trigger = view.getByRole('button', { name: 'Details' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(view.container.querySelector('.wpl-popover')?.id);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await Promise.resolve();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await Promise.resolve();
    expect(view.container.querySelector('.wpl-popover')).toBeNull();
  });

  it('names the active combobox option', async () => {
    const view = render(Combobox, {
      label: 'Theme',
      options: [
        { value: 'ivory', label: 'Ivory' },
        { value: 'ink', label: 'Ink' },
      ],
    });
    const input = view.container.querySelector<HTMLInputElement>('[role="combobox"]');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await Promise.resolve();
    const active = view.container.querySelector('[data-active="true"]');
    expect(input?.getAttribute('aria-activedescendant')).toBe(active?.id);
    expect(active?.textContent).toBe('Ink');
  });

  it('uses the requested card heading', () => {
    const view = render(Card, { title: 'Analytics', titleAs: 'h3' });
    expect(view.container.querySelector('h3.wpl-card-title')?.textContent).toBe('Analytics');
    expect(view.container.querySelector('h2')).toBeNull();
    view.unmount();
    const fallback = render(Card, { title: 'Overview' });
    expect(fallback.container.querySelector('h2.wpl-card-title')?.textContent).toBe('Overview');
  });
});
