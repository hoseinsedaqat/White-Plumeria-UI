import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { Button, Switch, WhitePlumeriaProvider } from './index.ts';

describe('vue adapter', () => {
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
});
