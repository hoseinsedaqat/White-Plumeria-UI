import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { Accordion, Button, Notification, Pagination, SplitPane, Steps, Switch, TreeView, WhitePlumeriaProvider } from './index.ts';

describe('vue adapter', () => {
  it('marks the current pagination page', async () => {
    const user = userEvent.setup();
    const page = ref(5);
    const view = render(
      defineComponent({
        setup() {
          return () =>
            h(WhitePlumeriaProvider, () =>
              h(Pagination, {
                page: page.value,
                pageCount: 10,
                onPage: (next: number) => {
                  page.value = next;
                },
              }),
            );
        },
      }),
    );
    expect(view.container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('5');
    expect(view.container.querySelector('.wpl-icon-dir')).toBeTruthy();
    expect(view.container.textContent).toContain('…');
    const six = [...view.container.querySelectorAll('button')].find((button) => button.textContent?.trim() === '6');
    await user.click(six!);
    expect(page.value).toBe(6);
  });

  it('names an accordion panel from its trigger', () => {
    const view = render(
      defineComponent({
        setup() {
          return () =>
            h(Accordion, { items: [{ id: 'fees', title: 'Fees', content: 'No monthly fee.' }] });
        },
      }),
    );
    const trigger = view.container.querySelector('.wpl-accordion-trigger');
    const panel = view.container.querySelector('[role="region"]');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(panel?.textContent).toContain('No monthly fee.');
  });

  it('colors a notification and shows dismiss only when requested', async () => {
    const user = userEvent.setup();
    const dismissed: string[] = [];
    render(
      defineComponent({
        setup() {
          return () =>
            h(WhitePlumeriaProvider, () =>
              h('div', [
                h(Notification, { title: 'Saved', variant: 'success', description: 'Local only' }),
                h(Notification, {
                  title: 'Blocked',
                  variant: 'danger',
                  onDismiss: () => dismissed.push('closed'),
                }),
              ]),
            );
        },
      }),
    );
    const saved = screen.getByRole('status');
    expect(saved.className).toContain('wpl-notification-success');
    expect(saved.querySelector('button')).toBeNull();
    const blocked = screen.getByRole('alert');
    expect(blocked.className).toContain('wpl-notification-danger');
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismissed).toEqual(['closed']);
    expect(blocked.isConnected).toBe(true);
  });

  it('does not activate a loading button', async () => {
    const user = userEvent.setup();
    let clicks = 0;
    render(
      defineComponent({
        setup() {
          return () =>
            h(WhitePlumeriaProvider, () =>
              h(Button, { loading: true, onClick: () => (clicks += 1) }, () => 'Save changes'),
            );
        },
      }),
    );
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(clicks).toBe(0);
  });

  it('toggles a switch and exposes the checked state', async () => {
    const user = userEvent.setup();
    const checked = ref(false);
    render(
      defineComponent({
        setup() {
          return () =>
            h(WhitePlumeriaProvider, () =>
              h(Switch, {
                label: 'Reduced motion',
                modelValue: checked.value,
                'onUpdate:modelValue': (value: boolean) => {
                  checked.value = value;
                },
              }),
            );
        },
      }),
    );
    const control = screen.getByRole('switch', { name: 'Reduced motion' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    await user.click(control);
    expect(checked.value).toBe(true);
    expect(control).toHaveAttribute('aria-checked', 'true');
  });

  it('renders steps and disables a future step', () => {
    render(
      defineComponent({
        setup() {
          return () =>
            h(WhitePlumeriaProvider, () =>
              h(Steps, {
                label: 'Checkout',
                items: [
                  { id: 'account', title: 'Account' },
                  { id: 'billing', title: 'Billing' },
                ],
                modelValue: 'account',
              }),
            );
        },
      }),
    );
    expect(screen.getByRole('button', { name: /Billing/ }).hasAttribute('disabled')).toBe(true);
  });

  it('shrinks the start pane when ArrowRight is pressed in RTL', async () => {
    const user = userEvent.setup();
    render(
      defineComponent({
        setup() {
          return () =>
            h('div', { dir: 'rtl', style: { direction: 'rtl' } }, [
              h(SplitPane, { label: 'Resize editor' }),
            ]);
        },
      }),
    );
    const separator = screen.getByRole('separator', { name: 'Resize editor' });
    separator.focus();
    await user.keyboard('{ArrowRight}');
    expect(separator.getAttribute('aria-valuenow')).toBe('45');
    expect(separator.getAttribute('aria-valuemin')).toBe('20');
  });

  it('expands a tree toward the inline end', async () => {
    const user = userEvent.setup();
    render(
      defineComponent({
        setup() {
          return () =>
            h('div', { dir: 'rtl', style: { direction: 'rtl' } }, [
              h(TreeView, { label: 'Files', nodes: [{ id: 'src', label: 'src', children: [{ id: 'btn', label: 'button.tsx' }] }] }),
            ]);
        },
      }),
    );
    const row = screen.getByRole('treeitem', { name: 'src' });
    row.focus();
    await user.keyboard('{ArrowRight}');
    expect(row.getAttribute('aria-expanded')).toBe('false');
    await user.keyboard('{ArrowLeft}');
    expect(row.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('treeitem', { name: 'button.tsx' })).toBeTruthy();
  });
});
