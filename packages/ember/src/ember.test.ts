import { catalog, formatDate, parseIsoDate } from '@white-plumeria/core';
import { renderComponent, renderSettled } from '@ember/renderer';
import { afterEach, describe, expect, it } from 'vitest';
import {
  Button,
  Carousel,
  components,
  DataTable,
  Dialog,
  DateRangePicker,
  DropdownMenu,
  FileUpload,
  pushToast,
  Slider,
  Steps,
  WhitePlumeriaProvider,
} from './index.ts';

function mount(component: unknown, args: Record<string, unknown> = {}): HTMLElement {
  const host = document.createElement('div');
  document.body.append(host);
  renderComponent(component as never, { into: host, args });
  return host;
}

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
});

describe('Ember adapter', () => {
  it('renders every catalog component as a Glimmer class', () => {
    expect(Object.keys(components)).toHaveLength(catalog.length);
    for (const component of catalog) {
      expect(components[component.name as keyof typeof components], component.name).toBeTypeOf('function');
      expect(component.examples.ember, component.name).toContain('@white-plumeria/ember');
    }
    expect(catalog.find((item) => item.name === 'Button')?.examples.ember).toContain('Save changes');
    expect(catalog.find((item) => item.name === 'Toast')?.examples.ember).toContain('pushToast');
  });

  it('blocks a loading button and emits a click otherwise', async () => {
    const clicks: unknown[] = [];
    const loading = mount(Button, { loading: true, label: 'Save' });
    const button = loading.querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(button?.className).toContain('wpl-btn-primary');
    loading.addEventListener('wpl-click', () => clicks.push('loading'));
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toEqual([]);

    const ready = mount(Button, { variant: 'primary', label: 'Save changes' });
    ready.addEventListener('wpl-click', (event) => clicks.push((event as CustomEvent).detail));
    ready.querySelector('button')?.click();
    await renderSettled();
    expect(ready.textContent).toContain('Save changes');
    expect(clicks).toEqual([{ variant: 'primary' }]);
  });

  it('requires a provider before a toast can be pushed', () => {
    expect(() => pushToast(document.body, { title: 'Saved' })).toThrow('WhitePlumeriaProvider is required to push a toast.');
    const provider = mount(WhitePlumeriaProvider, { persist: false, theme: 'white' });
    const id = pushToast(provider, { title: 'Saved', variant: 'success' });
    expect(id).toMatch(/^toast-/);
    expect(provider.querySelector('.wpl-toast-success')?.textContent).toContain('Saved');
    provider.dispatchEvent(new CustomEvent('wpl-theme', { detail: { theme: 'ink' } }));
    expect(provider.getAttribute('data-wpl-theme')).toBe('ink');
  });

  it('orders a reversed date range and shows the earlier day', async () => {
    const events: unknown[] = [];
    const host = mount(DateRangePicker, { label: 'Stay' });
    host.addEventListener('wpl-change', (event) => events.push((event as CustomEvent).detail));
    const end = host.querySelector('[data-wpl-edge="end"]') as HTMLInputElement;
    const start = host.querySelector('[data-wpl-edge="start"]') as HTMLInputElement;
    end.value = '2026-05-02';
    end.dispatchEvent(new Event('change', { bubbles: true }));
    start.value = '2026-05-10';
    start.dispatchEvent(new Event('change', { bubbles: true }));
    await renderSettled();
    expect(start.value).toBe('2026-05-02');
    expect(end.value).toBe('2026-05-10');
    const early = parseIsoDate('2026-05-02');
    expect(early).not.toBeNull();
    expect(host.textContent).toContain(formatDate(early ?? new Date(), 'en'));
    expect(events.at(-1)).toEqual({ start: '2026-05-02', end: '2026-05-10' });
  });

  it('selects a menu item and ignores a disabled one', async () => {
    const events: unknown[] = [];
    const host = mount(DropdownMenu, {
      label: 'Account',
      items: [
        { id: 'profile', label: 'Profile' },
        { id: 'billing', label: 'Billing', disabled: true },
      ],
    });
    host.addEventListener('wpl-select', (event) => events.push((event as CustomEvent).detail));
    host.querySelector('button')?.click();
    await renderSettled();
    const items = [...host.querySelectorAll('[role="menuitem"]')];
    items.find((item) => item.textContent?.includes('Billing'))?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).toEqual([]);
    items.find((item) => item.textContent?.includes('Profile'))?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).toEqual([{ id: 'profile' }]);
  });

  it('opens a submenu from the keyboard and renders a slide image', async () => {
    const menu = mount(DropdownMenu, {
      label: 'Account',
      items: [
        { id: 'theme', label: 'Theme', items: [{ id: 'ivory', label: 'Ivory' }] },
        { id: 'profile', label: 'Profile' },
      ],
    });
    const root = menu.querySelector('.wpl-menu-root') ?? menu;
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await renderSettled();
    expect(menu.textContent).toContain('Ivory');

    const carousel = mount(Carousel, {
      label: 'Suites',
      slides: [{ id: 'villa', label: 'Villa', src: '/villa.jpg', alt: 'Lagoon villa', caption: 'West wing' }],
    });
    const image = carousel.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/villa.jpg');
    expect(image?.getAttribute('alt')).toBe('Lagoon villa');
    expect(carousel.textContent).toContain('West wing');

    const dialog = mount(Dialog, { title: 'Confirm', trigger: 'Open dialog' });
    dialog.querySelector('button')?.click();
    await renderSettled();
    expect(dialog.querySelector('dialog')).not.toBeNull();
  });

  it('sorts a data table by the amount column', async () => {
    const host = mount(DataTable, {
      caption: 'Bookings',
      columns: [
        { id: 'guest', header: 'Guest' },
        { id: 'amount', header: 'Amount', sortValue: (row: { amount: number }) => row.amount },
      ],
      rows: [
        { id: 'a', guest: 'North', amount: 30 },
        { id: 'b', guest: 'Pine', amount: 10 },
        { id: 'c', guest: 'Lagoon', amount: 20 },
      ],
    });
    const header = [...host.querySelectorAll('button')].find((button) => button.textContent?.includes('Amount'));
    header?.click();
    await renderSettled();
    const first = host.querySelector('tbody tr')?.textContent ?? '';
    expect(first).toContain('10');
    expect(first).toContain('Pine');
  });

  it('moves a carousel and a step', async () => {
    const carousel = mount(Carousel, {
      label: 'Notes',
      slides: [
        { id: 'filter', label: 'Filter', content: 'October is the default.' },
        { id: 'save', label: 'Save', content: 'Save keeps a note.' },
      ],
    });
    expect(carousel.textContent).toContain('October is the default.');
    carousel.querySelector('[aria-label="Next"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    expect(carousel.textContent).toContain('Save keeps a note.');

    const steps = mount(Steps, {
      value: 'draft',
      items: [
        { id: 'draft', title: 'Draft' },
        { id: 'send', title: 'Send' },
      ],
    });
    expect(steps.querySelector('[aria-current="step"]')?.textContent).toContain('Draft');
    [...steps.querySelectorAll('button')].find((button) => button.textContent?.includes('Send'))?.click();
    await renderSettled();
    expect(steps.querySelector('[aria-current="step"]')?.textContent).toContain('Send');
  });

  it('rejects an oversized file and reports a slider value', async () => {
    const rejected: unknown[] = [];
    const host = mount(FileUpload, { label: 'Floor plan', maxSize: 4 });
    host.addEventListener('wpl-reject', (event) => rejected.push((event as CustomEvent).detail));
    const input = host.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['12345'], 'plan.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await renderSettled();
    expect(host.textContent).toContain('plan.pdf');
    expect(rejected).toEqual([{ files: [{ name: 'plan.pdf', reason: 'File was rejected' }] }]);

    const values: unknown[] = [];
    const slider = mount(Slider, { label: 'Nights', min: 1, max: 7, value: 2 });
    slider.addEventListener('wpl-change', (event) => values.push((event as CustomEvent).detail));
    const range = slider.querySelector('input') as HTMLInputElement;
    range.value = '5';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect(values).toEqual([{ value: 5 }]);
  });
});
