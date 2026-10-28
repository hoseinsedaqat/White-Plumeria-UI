import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Button from './lib/Button.svelte';
import Switch from './lib/Switch.svelte';

describe('svelte adapter', () => {
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
});
