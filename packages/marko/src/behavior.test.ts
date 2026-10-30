import { formatDate, parseIsoDate, catalog } from '@white-plumeria/core';
import { render } from '@marko/testing-library';
import { afterEach, describe, expect, it } from 'vitest';
import { pushToast } from './provider.ts';
import { tagNames } from './index.ts';
import Button from './tags/wpl-button.marko';
import Carousel from './tags/wpl-carousel.marko';
import DataTable from './tags/wpl-data-table.marko';
import DateRange from './tags/wpl-date-range-picker.marko';
import Dropdown from './tags/wpl-dropdown-menu.marko';
import FileUpload from './tags/wpl-file-upload.marko';
import Provider from './tags/wpl-provider.marko';
import Slider from './tags/wpl-slider.marko';
import Steps from './tags/wpl-steps.marko';

const templates = import.meta.glob('./tags/wpl-*.marko', { eager: true });

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function')
      requestAnimationFrame(() => resolve(undefined));
    else resolve(undefined);
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
}

afterEach(async () => {
  await flush();
  document.body.replaceChildren();
  localStorage.clear();
});

describe('Marko adapter', () => {
  it('renders every catalog tag', async () => {
    expect(Object.keys(templates)).toHaveLength(tagNames.length);
    for (const name of tagNames) {
      const key = `./tags/${name}.marko`;
      const template = (templates[key] as { default: Marko.Template }).default;
      const view = await render(template, {});
      expect(view.container.querySelector('*'), name).toBeTruthy();
    }
  });

  it('blocks a loading button and emits a click otherwise', async () => {
    const clicks: unknown[] = [];
    const loading = await render(Button, { loading: true, label: 'Save' });
    const busy = loading.container.querySelector('button');
    expect(busy?.disabled).toBe(true);
    expect(busy?.getAttribute('aria-busy')).toBe('true');
    loading.container.addEventListener('wpl-click', () => clicks.push('loading'));
    busy?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toEqual([]);

    const ready = await render(Button, { variant: 'primary', label: 'Save changes' });
    ready.container.addEventListener('wpl-click', (event) =>
      clicks.push((event as CustomEvent).detail),
    );
    ready.container.querySelector('button')?.click();
    expect(clicks).toEqual([{ variant: 'primary' }]);
  });

  it('requires a provider before a toast can be pushed', async () => {
    expect(() => pushToast(document.body, { title: 'Saved' })).toThrow(
      'WhitePlumeriaProvider is required to push a toast.',
    );
    const view = await render(Provider, { persist: false, theme: 'white' });
    const provider = view.container.querySelector('[data-wpl-provider]') as HTMLElement;
    const id = pushToast(provider, { title: 'Saved', variant: 'success' });
    expect(id).toMatch(/^toast-/);
    expect(provider.querySelector('.wpl-toast-success')?.textContent).toContain('Saved');
    provider.dispatchEvent(new CustomEvent('wpl-theme', { detail: { theme: 'ink' } }));
    expect(provider.getAttribute('data-wpl-theme')).toBe('ink');
  });

  it('orders a reversed date range and shows the earlier day', async () => {
    const events: unknown[] = [];
    const view = await render(DateRange, { label: 'Stay' });
    view.container.addEventListener('wpl-change', (event) =>
      events.push((event as CustomEvent).detail),
    );
    const end = view.container.querySelector('[data-wpl-edge="end"]') as HTMLInputElement;
    const start = view.container.querySelector('[data-wpl-edge="start"]') as HTMLInputElement;
    end.value = '2026-05-02';
    end.dispatchEvent(new Event('change', { bubbles: true }));
    start.value = '2026-05-10';
    start.dispatchEvent(new Event('change', { bubbles: true }));
    expect(start.value).toBe('2026-05-02');
    expect(end.value).toBe('2026-05-10');
    const early = parseIsoDate('2026-05-02');
    expect(early).not.toBeNull();
    expect(view.container.textContent).toContain(formatDate(early ?? new Date(), 'en'));
    expect(events.at(-1)).toEqual({ start: '2026-05-02', end: '2026-05-10' });
  });

  it('selects a menu item and ignores a disabled one', async () => {
    const events: unknown[] = [];
    const view = await render(Dropdown, {
      label: 'Account',
      items: [
        { id: 'profile', label: 'Profile' },
        { id: 'billing', label: 'Billing', disabled: true },
      ],
    });
    view.container.addEventListener('wpl-select', (event) =>
      events.push((event as CustomEvent).detail),
    );
    view.container.querySelector('button')?.click();
    const items = [...view.container.querySelectorAll('[role="menuitem"]')];
    items
      .find((item) => item.textContent?.includes('Billing'))
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).toEqual([]);
    items
      .find((item) => item.textContent?.includes('Profile'))
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).toEqual([{ id: 'profile' }]);
  });

  it('sorts a data table by the amount column', async () => {
    const view = await render(DataTable, {
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
    const header = [...view.container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Amount'),
    );
    const sorts: unknown[] = [];
    view.container.addEventListener('wpl-sort', (event) =>
      sorts.push((event as CustomEvent).detail),
    );
    header?.click();
    await flush();
    expect(sorts).toEqual([{ sortId: 'amount', sortDirection: 'asc' }]);
    const first = view.container.querySelector('tbody tr')?.textContent ?? '';
    expect(first).toContain('10');
    expect(first).toContain('Pine');
  });

  it('moves a carousel and a step', async () => {
    const carousel = await render(Carousel, {
      label: 'Notes',
      slides: [
        { id: 'filter', label: 'Filter', content: 'October is the default.' },
        { id: 'save', label: 'Save', content: 'Save keeps a note.' },
      ],
    });
    expect(carousel.container.textContent).toContain('October is the default.');
    const moves: unknown[] = [];
    carousel.container.addEventListener('wpl-change', (event) =>
      moves.push((event as CustomEvent).detail),
    );
    const next = carousel.container.querySelector('[aria-label="Next"]');
    next?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();
    expect(moves).toEqual([{ index: 1 }]);
    expect(carousel.container.querySelector('.wpl-carousel')?.getAttribute('data-index')).toBe('1');
    expect(carousel.container.textContent).toContain('Save keeps a note.');

    const steps = await render(Steps, {
      value: 'draft',
      linear: false,
      items: [
        { id: 'draft', title: 'Draft' },
        { id: 'send', title: 'Send' },
      ],
    });
    expect(steps.container.querySelector('[aria-current="step"]')?.textContent).toContain('Draft');
    [...steps.container.querySelectorAll('button')]
      .find((button) => button.textContent?.includes('Send'))
      ?.click();
    await flush();
    expect(steps.container.querySelector('[aria-current="step"]')?.textContent).toContain('Send');
  });

  it('rejects an oversized file and reports a slider value', async () => {
    const rejected: unknown[] = [];
    const view = await render(FileUpload, { label: 'Floor plan', maxSize: 4 });
    view.container.addEventListener('wpl-reject', (event) =>
      rejected.push((event as CustomEvent).detail),
    );
    const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['12345'], 'plan.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
    expect(rejected).toEqual([{ files: [{ name: 'plan.pdf', reason: 'File was rejected' }] }]);
    expect(view.container.textContent).toContain('plan.pdf');
    expect(rejected).toEqual([{ files: [{ name: 'plan.pdf', reason: 'File was rejected' }] }]);

    const values: unknown[] = [];
    const slider = await render(Slider, { label: 'Nights', min: 1, max: 7, value: 2 });
    slider.container.addEventListener('wpl-change', (event) =>
      values.push((event as CustomEvent).detail),
    );
    const range = slider.container.querySelector('input') as HTMLInputElement;
    range.value = '5';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect(values).toEqual([{ value: 5 }]);
  });

  it('publishes a Marko example for every catalog component', () => {
    for (const component of catalog) {
      expect(component.examples.marko, component.name).toContain('@white-plumeria/marko');
      expect(component.examples.marko, component.name).toContain('wpl-');
      expect(component.examples.marko, component.name).not.toContain('={');
    }
    expect(catalog.find((item) => item.name === 'Button')?.examples.marko).toContain(
      'Save changes',
    );
    expect(catalog.find((item) => item.name === 'Toast')?.examples.marko).toContain('pushToast');
  });
});
