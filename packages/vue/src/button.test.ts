import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { Accordion, Button, Card, Combobox, Divider, Link, Notification, PageHeader, Pagination, SearchInput, SplitPane, Steps, Switch, Tooltip, TreeView, WhitePlumeriaProvider } from './index.ts';

describe('vue adapter', () => {
  it('uses the catalog page description class', () => {
    const view = render(PageHeader, { props: { title: 'Invoices', description: 'Sample workspace' } });
    expect(view.container.querySelector('h1.wpl-page-title')?.textContent).toBe('Invoices');
    expect(view.container.querySelector('.wpl-page-description')?.textContent).toBe('Sample workspace');
    expect(view.container.querySelector('.wpl-muted')).toBeNull();
    const plain = render(PageHeader, { props: { title: 'Invoices' } });
    expect(plain.container.querySelector('.wpl-page-description')).toBeNull();
  });

  it('shows a search label unless it is hidden', async () => {
    const view = render(SearchInput, { props: { label: 'Search docs', modelValue: 'Button' } });
    const label = view.container.querySelector('label');
    expect(label?.textContent).toBe('Search docs');
    expect(label?.classList.contains('wpl-sr-only')).toBe(false);
    view.container.querySelector('input')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(view.emitted().search).toEqual([['Button']]);
    const hidden = render(SearchInput, { props: { label: 'Search docs', visuallyHiddenLabel: true } });
    expect(hidden.container.querySelector('label')?.classList.contains('wpl-sr-only')).toBe(true);
  });

  it('renders a labeled divider as a separator and an unlabeled divider as a rule', () => {
    const labeled = render(Divider, { props: { label: 'Or' } });
    expect(labeled.container.querySelector('[role="separator"]')?.textContent).toBe('Or');
    expect(labeled.container.querySelector('.wpl-divider-labeled')).toBeTruthy();
    const plain = render(Divider, { props: {} });
    expect(plain.container.querySelector('hr.wpl-divider')).toBeTruthy();
    expect(plain.container.querySelector('[role="separator"]')).toBeNull();
  });

  it('waits to show a tooltip and dismisses it with escape', async () => {
    vi.useFakeTimers();
    try {
      const view = render(Tooltip, { props: { content: 'Copy token' } });
      const host = view.container.querySelector('span');
      host?.dispatchEvent(new MouseEvent('mouseenter'));
      await vi.advanceTimersByTimeAsync(400);
      expect(view.container.querySelector('[role="tooltip"]')?.textContent).toBe('Copy token');
      host?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await nextTick();
      expect(view.container.querySelector('[role="tooltip"]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('announces that an external link opens in a new tab', () => {
    const view = render(
      defineComponent({
        setup() {
          return () => h(WhitePlumeriaProvider, () => h(Link, { href: 'https://example.com/docs', external: true }, () => 'Docs'));
        },
      }),
    );
    const link = view.container.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noreferrer noopener');
    expect(link?.querySelector('.wpl-sr-only')?.textContent).toContain('opens in a new tab');
    expect(link?.querySelector('.wpl-icon-dir')).toBeTruthy();
  });

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

  it('names the active combobox option', async () => {
    const view = render(
      defineComponent({
        setup() {
          return () =>
            h(WhitePlumeriaProvider, () =>
              h(Combobox, {
                label: 'Theme',
                options: [
                  { value: 'ivory', label: 'Ivory' },
                  { value: 'ink', label: 'Ink' },
                ],
              }),
            );
        },
      }),
    );
    const input = view.container.querySelector<HTMLInputElement>('[role="combobox"]');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await view.rerender({});
    const active = view.container.querySelector('[data-active="true"]');
    expect(input?.getAttribute('aria-activedescendant')).toBe(active?.id);
    expect(active?.textContent).toBe('Ink');
  });

  it('uses the requested card heading', () => {
    const view = render(Card, { props: { title: 'Analytics', titleAs: 'h3' } });
    expect(view.container.querySelector('h3.wpl-card-title')?.textContent).toBe('Analytics');
    expect(view.container.querySelector('h2')).toBeNull();
    view.unmount();
    const fallback = render(Card, { props: { title: 'Overview' } });
    expect(fallback.container.querySelector('h2.wpl-card-title')?.textContent).toBe('Overview');
  });
});
