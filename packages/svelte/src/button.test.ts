import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Accordion from './lib/Accordion.svelte';
import Button from './lib/Button.svelte';
import SplitPane from './lib/SplitPane.svelte';
import Steps from './lib/Steps.svelte';
import TreeView from './lib/TreeView.svelte';
import Switch from './lib/Switch.svelte';

describe('svelte adapter', () => {
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
});
