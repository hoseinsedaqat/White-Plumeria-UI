import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DatePicker, DateRangePicker } from './calendar.tsx';
import { Carousel } from './carousel.tsx';
import { DataTable } from './data.tsx';
import { OtpField, PasswordField, Rating } from './fields.tsx';
import { Kbd } from './kbd.tsx';
import { Navbar } from './layout.tsx';
import { Steps } from './steps.tsx';

const steps = [
  { id: 'account', title: 'Account' },
  { id: 'billing', title: 'Billing' },
  { id: 'review', title: 'Review' },
];

describe('new controls', () => {
  it('orders a date range and rejects a non-ISO day in English', async () => {
    const user = userEvent.setup();
    let range = { start: '', end: '' };
    const view = render(<DateRangePicker label="Stay" start={range.start} end={range.end} onValueChange={(next) => (range = next)} />);
    await user.click(screen.getByRole('button', { name: 'Choose date' }));
    await user.click(screen.getByRole('gridcell', { name: /October 20, 2026/ }));
    await user.click(screen.getByRole('gridcell', { name: /October 12, 2026/ }));
    expect(range).toEqual({ start: '2026-10-12', end: '2026-10-20' });
    view.rerender(<DateRangePicker label="Stay" start={range.start} end={range.end} onValueChange={(next) => (range = next)} />);
    await user.clear(screen.getByLabelText('Start'));
    await user.type(screen.getByLabelText('Start'), '2026-13-01');
    expect(screen.getByRole('alert').textContent).toContain('Use an ISO date: YYYY-MM-DD.');
  });

  it('rejects an invalid single date in English', async () => {
    const user = userEvent.setup();
    render(<DatePicker label="From" />);
    await user.type(screen.getByLabelText('From'), 'nope');
    expect(screen.getByRole('alert').textContent).toContain('Use an ISO date: YYYY-MM-DD.');
  });

  it('opens the navbar menu and names the toggle', async () => {
    const user = userEvent.setup();
    render(<Navbar brand="White Plumeria" items={[{ href: '#docs', label: 'Docs', current: true }]} />);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('labels data table cells and sorts from the header', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        caption="Sample transactions"
        rows={[{ id: 'b', merchant: 'Beta' }, { id: 'a', merchant: 'Alpha' }]}
        columns={[
          { id: 'id', header: 'ID', accessor: (row) => row.id, text: (row) => row.id },
          { id: 'merchant', header: 'Merchant', accessor: (row) => row.merchant, text: (row) => row.merchant },
        ]}
      />,
    );
    expect(screen.getAllByRole('cell')[1]?.getAttribute('data-label')).toBe('Merchant');
    await user.click(screen.getByRole('button', { name: /Merchant/ }));
    expect(screen.getAllByRole('cell')[1]?.textContent).toContain('Alpha');
  });

  it('blocks a future step until the current value moves', async () => {
    const user = userEvent.setup();
    let value = 'account';
    const view = render(<Steps label="Checkout" items={steps} value={value} onValueChange={(next) => (value = next)} />);
    expect(screen.getByRole('button', { name: /Review/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Billing/ }));
    expect(value).toBe('account');
    view.rerender(<Steps label="Checkout" items={steps} value="billing" onValueChange={(next) => (value = next)} />);
    expect(screen.getByRole('button', { name: /Billing/ })).toHaveAttribute('aria-current', 'step');
    await user.click(screen.getByRole('button', { name: /Account/ }));
    expect(value).toBe('account');
  });

  it('moves a content slider and keeps inactive slides out of the accessibility tree', async () => {
    const user = userEvent.setup();
    render(
      <Carousel
        label="Product tour"
        slides={[
          { id: 'one', label: 'Themes', content: 'Six themes' },
          { id: 'two', label: 'Frameworks', content: 'Three adapters' },
        ]}
      />,
    );
    expect(screen.getByText('Six themes').closest('[role="tabpanel"]')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('Three adapters').closest('[role="tabpanel"]')).toHaveAttribute('aria-hidden', 'true');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Three adapters').closest('[role="tabpanel"]')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByRole('tab', { name: 'Frameworks' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows a picture, its alt text, and a caption', async () => {
    const user = userEvent.setup();
    render(
      <Carousel
        label="Theme stills"
        slides={[
          {
            id: 'white',
            label: 'White',
            src: '/carousel/white.jpg',
            alt: 'White plumeria on pale stone',
            caption: 'The default palette.',
          },
          {
            id: 'ink',
            label: 'Ink',
            src: '/carousel/ink.jpg',
            alt: 'A brass lamp on deep blue linen',
            caption: 'Dark contrast.',
          },
        ]}
      />,
    );
    expect(document.querySelector('.wpl-carousel-thumb')).toBeNull();
    const picture = screen.getByRole('img', { name: 'White plumeria on pale stone' });
    expect(picture).toHaveAttribute('src', '/carousel/white.jpg');
    expect(screen.getByText('The default palette.')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Ink' }));
    expect(screen.getByRole('img', { name: 'A brass lamp on deep blue linen' })).toHaveAttribute('src', '/carousel/ink.jpg');
    expect(screen.getByRole('tab', { name: 'Ink' })).toHaveAttribute('aria-selected', 'true');
  });

  it('reveals a password, accepts a pasted code, and selects a rating', async () => {
    const user = userEvent.setup();
    render(
      <>
        <PasswordField label="Password" />
        <OtpField label="Verification code" length={4} />
        <Rating label="Workspace quality" />
        <Kbd keys={['Ctrl', 'K']} />
      </>,
    );
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    await user.click(screen.getByLabelText('Character 1 of 4'));
    await user.paste('12ab');
    expect(screen.getByLabelText('Character 1 of 4')).toHaveValue('1');
    expect(screen.getByLabelText('Character 2 of 4')).toHaveValue('2');
    await user.click(screen.getByRole('radio', { name: /3 of 5/ }));
    expect(screen.getByRole('radio', { name: /3 of 5/ })).toBeChecked();
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });
});
