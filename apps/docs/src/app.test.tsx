import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';

describe('docs app', () => {
  it('renders the home page and opens a real component page', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /white plumeria/i })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Button' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('searches the catalog without inventing a component', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Search docs'), 'datepicker');
    expect(screen.getByRole('link', { name: /DatePicker/ })).toBeInTheDocument();
    expect(screen.queryByText(/MysteryWidget/)).not.toBeInTheDocument();
  });
});
