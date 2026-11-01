import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';

describe('docs app', () => {
  it('renders the home page and opens a real component page', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /faster, cleaner, easier/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all components' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /from xs to xl/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /highly customizable/i })).toBeInTheDocument();
    expect(screen.getByText('Written natively')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'github.com/hoseinsedaqat', exact: true })).toHaveAttribute(
      'href',
      'https://github.com/hoseinsedaqat',
    );
    expect(screen.getByRole('link', { name: 'github.com/hoseinsedaqat/White-Plumeria-UI' })).toHaveAttribute(
      'href',
      'https://github.com/hoseinsedaqat/White-Plumeria-UI',
    );
    await user.click(screen.getAllByRole('link', { name: /^Button\b/ })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('opens the component gallery without dropping a catalog entry', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('link', { name: 'Components' })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Components' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^DatePicker/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^Dialog/ }).length).toBeGreaterThan(0);
  });

  it('shows a grid that can stack inside a narrow frame', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('link', { name: 'Components' })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Components' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('link', { name: /^Grid\b/ })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Grid' })).toBeInTheDocument();
    expect(screen.getByText('Narrow frame')).toBeInTheDocument();
    expect(screen.getAllByText('Ledger').length).toBe(2);
  });

  it('sets preview direction without flipping the docs chrome', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Theme:/ }));
    await user.click(screen.getByRole('button', { name: 'RTL' }));
    expect(screen.getByRole('heading', { level: 1, name: /faster, cleaner, easier/i })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(document.querySelector('.docs-app')).not.toHaveAttribute('dir', 'rtl');
    expect(document.querySelector('.home-window')).toHaveAttribute('dir', 'rtl');
    await user.click(screen.getByRole('button', { name: 'Reduce' }));
    expect(document.documentElement).toHaveAttribute('data-wpl-motion', 'reduce');
    expect(document.querySelector('.home-window')).toHaveAttribute('data-wpl-motion', 'reduce');
  });

  it('keeps a theme change on the component stage, not the page chrome', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Theme:/ }));
    await user.click(screen.getByRole('option', { name: 'Saffron' }));
    expect(document.querySelector('.docs-app')).toHaveAttribute('data-wpl-theme', 'saffron');
    expect(document.querySelector('.home-window')).toHaveAttribute('data-wpl-theme', 'saffron');
    await user.click(screen.getAllByRole('link', { name: 'Components' })[0]);
    expect(await screen.findByRole('heading', { level: 1, name: 'Components' })).toBeInTheDocument();
    expect(document.querySelector('.docs-app')).toHaveAttribute('data-wpl-theme', 'white');
    expect(document.querySelector('.docs-tile-preview')).toHaveAttribute('data-wpl-theme', 'saffron');
    await user.click(screen.getByRole('button', { name: /Theme:/ }));
    await user.click(screen.getByRole('button', { name: 'dark' }));
    expect(document.querySelector('.docs-app')).toHaveAttribute('data-wpl-scheme', 'dark');
    expect(document.querySelector('.docs-app')).toHaveAttribute('data-wpl-theme', 'white');
    expect(document.querySelector('.docs-tile-preview')).toHaveAttribute('data-wpl-scheme', 'dark');
    expect(document.querySelector('.docs-tile-preview')).toHaveAttribute('data-wpl-theme', 'saffron');
  });

  it('searches the catalog without inventing a component', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Search docs'), 'datepicker');
    expect(screen.getByRole('listbox', { name: 'Search results' }).querySelector('a')).toHaveTextContent('DatePicker');
    expect(screen.queryByText(/MysteryWidget/)).not.toBeInTheDocument();
  });
});
