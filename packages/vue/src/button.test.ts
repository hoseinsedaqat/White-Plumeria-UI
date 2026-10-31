import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { Button, Notification, Steps, Switch, WhitePlumeriaProvider } from './index.ts';

describe('vue adapter', () => {
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
});
