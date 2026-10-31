import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';

describe('docs app', () => {
  it('renders the home page and opens a real component page', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /faster, cleaner, easier/i })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /^Button\b/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('opens the component gallery without dropping a catalog entry', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('link', { name: 'Components' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Components' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^DatePicker/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^Dialog/ }).length).toBeGreaterThan(0);
  });

  it('shows a grid that can stack inside a narrow frame', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('link', { name: 'Components' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Components' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('link', { name: /^Grid\b/ })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Grid' })).toBeInTheDocument();
    expect(screen.getByText('Narrow frame')).toBeInTheDocument();
    expect(screen.getAllByText('Ledger').length).toBe(2);
  });

  it('searches the catalog without inventing a component', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Search docs'), 'datepicker');
    expect(screen.getByRole('listbox', { name: 'Search results' }).querySelector('a')).toHaveTextContent('DatePicker');
    expect(screen.queryByText(/MysteryWidget/)).not.toBeInTheDocument();
  });
});
