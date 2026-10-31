import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker, DateRangePicker } from './calendar.tsx';
import { Notification } from './toast.tsx';
import { Combobox } from './combobox.tsx';
import { RangeSlider, SearchInput, ToggleGroup } from './form.tsx';
import { ContextMenu, DropdownMenu } from './menu.tsx';
import { Carousel } from './carousel.tsx';
import { DataTable } from './data.tsx';
import { NumberField, OtpField, PasswordField, Rating } from './fields.tsx';
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
    const view = render(
      <DateRangePicker
        label="Stay"
        start={range.start}
        end={range.end}
        onValueChange={(next) => (range = next)}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Choose date' }));
    await user.click(screen.getByRole('gridcell', { name: /October 20, 2026/ }));
    await user.click(screen.getByRole('gridcell', { name: /October 12, 2026/ }));
    expect(range).toEqual({ start: '2026-10-12', end: '2026-10-20' });
    view.rerender(
      <DateRangePicker
        label="Stay"
        start={range.start}
        end={range.end}
        onValueChange={(next) => (range = next)}
      />,
    );
    await user.clear(screen.getByLabelText('Start'));
    await user.type(screen.getByLabelText('Start'), '2026-13-01');
    expect(screen.getByRole('alert').textContent).toContain('Use an ISO date: YYYY-MM-DD.');
  });

  it('orders a same-day time range and rejects an impossible time', async () => {
    const user = userEvent.setup();
    let range = { start: '2026-10-12', end: '2026-10-12', startTime: '', endTime: '' };
    render(
      <DateRangePicker
        label="Stay"
        showTime
        start={range.start}
        end={range.end}
        startTime={range.startTime}
        endTime={range.endTime}
        onValueChange={(next) => {
          range = {
            start: next.start,
            end: next.end,
            startTime: next.startTime ?? '',
            endTime: next.endTime ?? '',
          };
        }}
      />,
    );
    await user.type(screen.getByLabelText('Start time'), '18:00');
    await user.type(screen.getByLabelText('End time'), '09:30');
    expect(range).toEqual({
      start: '2026-10-12',
      end: '2026-10-12',
      startTime: '09:30',
      endTime: '18:00',
    });
    await user.clear(screen.getByLabelText('End time'));
    await user.type(screen.getByLabelText('End time'), '25:00');
    expect(screen.getByRole('alert').textContent).toContain('Use a 24-hour time: HH:mm.');
  });

  it('draws date controls with icons instead of placeholder glyphs', async () => {
    const user = userEvent.setup();
    render(<DatePicker label="From" value="2026-10-27" />);
    const choose = screen.getByRole('button', { name: 'Choose date' });
    expect(choose.querySelector('svg')).toBeTruthy();
    expect(choose.textContent).not.toMatch(/[▦‹›]/);
    await user.click(choose);
    expect(screen.getByRole('button', { name: 'Previous' }).querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' }).querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('grid')).toBeTruthy();
  });

  it('rejects an invalid single date in English', async () => {
    const user = userEvent.setup();
    render(<DatePicker label="From" />);
    await user.type(screen.getByLabelText('From'), 'nope');
    expect(screen.getByRole('alert').textContent).toContain('Use an ISO date: YYYY-MM-DD.');
  });

  it('stops a range thumb at the other thumb and names both edges', () => {
    let range = { start: 20, end: 80 };
    render(
      <RangeSlider
        label="Price"
        defaultStart={20}
        defaultEnd={80}
        name="price"
        onValueChange={(next) => (range = next)}
      />,
    );
    expect(screen.getByRole('group', { name: 'Price' })).toBeTruthy();
    const start = screen.getByRole('slider', { name: 'Price start' });
    const end = screen.getByRole('slider', { name: 'Price end' });
    expect(start.getAttribute('name')).toBe('price-start');
    expect(end.getAttribute('name')).toBe('price-end');
    fireEvent.change(start, { target: { value: '90' } });
    expect(range).toEqual({ start: 80, end: 80 });
    const lower = render(
      <RangeSlider
        label="Budget"
        defaultStart={20}
        defaultEnd={80}
        onValueChange={(next) => (range = next)}
      />,
    );
    fireEvent.change(lower.getByRole('slider', { name: 'Budget end' }), {
      target: { value: '10' },
    });
    expect(range).toEqual({ start: 20, end: 20 });
  });

  it('opens a submenu toward the inline end and selects the leaf', async () => {
    const user = userEvent.setup();
    let selected = '';
    render(
      <DropdownMenu
        label="Account"
        items={[
          { id: 'profile', label: 'Profile' },
          {
            id: 'theme',
            label: 'Theme',
            items: [
              { id: 'ivory', label: 'Ivory' },
              { id: 'ink', label: 'Ink', disabled: true },
            ],
          },
          { id: 'out', label: 'Sign out' },
        ]}
        onSelect={(id) => (selected = id)}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByRole('menu', { name: 'Theme' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Ivory' }).getAttribute('data-active')).toBe(
      'true',
    );
    await user.keyboard('{ArrowDown}{Enter}');
    expect(selected).toBe('ivory');
    expect(screen.queryByRole('menu', { name: 'Account' })).toBeNull();
  });

  it('typeahead jumps to a matching label and cycles the same letter', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu
        label="Account"
        items={[
          { id: 'profile', label: 'Profile' },
          { id: 'prefs', label: 'Preferences' },
          { id: 'theme', label: 'Theme' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.keyboard('t');
    expect(screen.getByRole('menuitem', { name: 'Theme' }).getAttribute('data-active')).toBe(
      'true',
    );
    vi.advanceTimersByTime(600);
    await user.keyboard('p');
    expect(screen.getByRole('menuitem', { name: 'Profile' }).getAttribute('data-active')).toBe(
      'true',
    );
    await user.keyboard('p');
    expect(screen.getByRole('menuitem', { name: 'Preferences' }).getAttribute('data-active')).toBe(
      'true',
    );
    vi.useRealTimers();
  });

  it('closes the submenu before the root menu', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        label="Account"
        items={[{ id: 'theme', label: 'Theme', items: [{ id: 'ivory', label: 'Ivory' }] }]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.keyboard('{ArrowRight}{Escape}');
    expect(screen.queryByRole('menu', { name: 'Theme' })).toBeNull();
    expect(screen.getByRole('menu', { name: 'Account' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: 'Account' })).toBeNull();
  });

  it('opens a context submenu and closes that level first', async () => {
    const user = userEvent.setup();
    let selected = '';
    render(
      <ContextMenu
        items={[{ id: 'export', label: 'Export', items: [{ id: 'csv', label: 'CSV' }] }]}
        onSelect={(id) => (selected = id)}
      >
        Invoice row
      </ContextMenu>,
    );
    await user.pointer({ target: screen.getByText('Invoice row'), keys: '[MouseRight]' });
    expect(screen.getByRole('menu', { name: 'Context menu' })).toBeTruthy();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');
    expect(selected).toBe('csv');
    expect(screen.queryByRole('menu', { name: 'Context menu' })).toBeNull();
  });

  it('closes a context submenu before the root menu', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu
        items={[{ id: 'export', label: 'Export', items: [{ id: 'csv', label: 'CSV' }] }]}
      >
        Invoice row
      </ContextMenu>,
    );
    await user.pointer({ target: screen.getByText('Invoice row'), keys: '[MouseRight]' });
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('menu', { name: 'Export' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: 'Export' })).toBeNull();
    expect(screen.getByRole('menu', { name: 'Context menu' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: 'Context menu' })).toBeNull();
  });

  it('opens the navbar menu and names the toggle', async () => {
    const user = userEvent.setup();
    render(
      <Navbar brand="White Plumeria" items={[{ href: '#docs', label: 'Docs', current: true }]} />,
    );
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' }).getAttribute('aria-expanded')).toBe(
      'true',
    );
  });

  it('labels data table cells and sorts from the header', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        caption="Sample transactions"
        rows={[
          { id: 'b', merchant: 'Beta' },
          { id: 'a', merchant: 'Alpha' },
        ]}
        columns={[
          { id: 'id', header: 'ID', accessor: (row) => row.id, text: (row) => row.id },
          {
            id: 'merchant',
            header: 'Merchant',
            accessor: (row) => row.merchant,
            text: (row) => row.merchant,
          },
        ]}
      />,
    );
    expect(screen.getAllByRole('cell')[1]?.getAttribute('data-label')).toBe('Merchant');
    await user.click(screen.getByRole('button', { name: /Merchant/ }));
    expect(screen.getAllByRole('cell')[1]?.textContent).toContain('Alpha');
    const header = screen.getByRole('columnheader', { name: /Merchant/ });
    expect(header.querySelector('.wpl-sort-mark svg')).toBeTruthy();
    expect(header.textContent).not.toMatch(/[↑↓×]/);
  });

  it('blocks a future step until the current value moves', async () => {
    const user = userEvent.setup();
    let value = 'account';
    const view = render(
      <Steps
        label="Checkout"
        items={steps}
        value={value}
        onValueChange={(next) => (value = next)}
      />,
    );
    expect(screen.getByRole('button', { name: /Review/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Billing/ }));
    expect(value).toBe('account');
    view.rerender(
      <Steps
        label="Checkout"
        items={steps}
        value="billing"
        onValueChange={(next) => (value = next)}
      />,
    );
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
    expect(screen.getByText('Six themes').closest('[role="tabpanel"]')).not.toHaveAttribute(
      'aria-hidden',
    );
    expect(screen.getByText('Three adapters').closest('[role="tabpanel"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Three adapters').closest('[role="tabpanel"]')).not.toHaveAttribute(
      'aria-hidden',
    );
    expect(screen.getByRole('tab', { name: 'Frameworks' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
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
    expect(screen.getByRole('img', { name: 'A brass lamp on deep blue linen' })).toHaveAttribute(
      'src',
      '/carousel/ink.jpg',
    );
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

  it('selects a toggle with the pointer and the arrow keys', async () => {
    const user = userEvent.setup();
    const values: string[] = [];
    render(
      <ToggleGroup
        label="Appearance"
        defaultValue="light"
        onValueChange={(value) => values.push(value)}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark', disabled: true },
          { value: 'system', label: 'System' },
        ]}
      />,
    );
    const light = screen.getByRole('radio', { name: 'Light' });
    expect(light).toBeChecked();
    light.focus();
    await user.keyboard('{ArrowRight}');
    const system = screen.getByRole('radio', { name: 'System' });
    expect(system).toBeChecked();
    expect(system).toHaveFocus();
    await user.click(light);
    expect(light).toBeChecked();
    expect(values).toEqual(['system', 'light']);
  });

  it('steps a number field and stops at the bounds', async () => {
    const user = userEvent.setup();
    const values: number[] = [];
    render(
      <NumberField
        label="Guests"
        min={1}
        max={3}
        defaultValue={2}
        onValueChange={(value) => values.push(value)}
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'Guests' });
    expect(input).toHaveValue(2);
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(input).toHaveValue(3);
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(input).toHaveValue(1);
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    expect(values).toEqual([3, 2, 1]);
  });

  it('draws search and combobox with the shared icon set', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchInput label="Search docs" defaultValue="Button" />
        <Combobox label="City" options={[{ value: 'fra', label: 'Frankfurt' }]} />
      </>,
    );
    const search = screen.getByRole('searchbox', { name: 'Search docs' });
    const searchRoot = search.closest('.wpl-search');
    expect(searchRoot?.querySelector('.wpl-search-icon svg')).toBeTruthy();
    expect(searchRoot?.textContent).not.toContain('⌕');
    const clear = screen.getByRole('button', { name: 'Clear' });
    expect(clear.querySelector('svg')).toBeTruthy();
    expect(clear.textContent).not.toContain('×');
    await user.click(clear);
    expect(search).toHaveValue('');
    const combo = screen.getByRole('combobox', { name: 'City' });
    expect(combo.closest('.wpl-combo')?.querySelector('.wpl-combo-icon svg')).toBeTruthy();
    expect(combo.closest('.wpl-combo')?.textContent).not.toMatch(/⌕|×/);
  });

  it('colors a notification and keeps dismiss optional', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <>
        <Notification title="Saved" description="Local only" variant="success" />
        <Notification title="Blocked" variant="danger" onDismiss={onDismiss} />
      </>,
    );
    const saved = screen.getByRole('status');
    expect(saved.className).toContain('wpl-notification-success');
    expect(saved.querySelector('button')).toBeNull();
    const blocked = screen.getByRole('alert');
    expect(blocked.className).toContain('wpl-notification-danger');
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(blocked.isConnected).toBe(true);
  });
});
