import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from './button.tsx';
import { WhitePlumeriaProvider } from './provider.tsx';

describe('react button', () => {
  it('blocks activation while loading and exposes the busy state', async () => {
    const user = userEvent.setup();
    let clicks = 0;
    render(
      <WhitePlumeriaProvider>
        <Button loading onClick={() => (clicks += 1)}>
          Save changes
        </Button>
      </WhitePlumeriaProvider>,
    );
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(clicks).toBe(0);
  });
});
