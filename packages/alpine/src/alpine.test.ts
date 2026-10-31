import { formatDate, parseIsoDate, catalog } from '@white-plumeria/core';
import Alpine from 'alpinejs';
import { afterEach, describe, expect, it } from 'vitest';
import { DataTable, DateRangePicker, DropdownMenu, FileUpload, Notification, Slider, whitePlumeria, pushToast, Button, WhitePlumeriaProvider, Carousel, Steps } from './index.ts';
import type { Magic } from './runtime.ts';

function magicFor(el: HTMLElement): Magic {
  return {
    $el: el,
    $dispatch(name, detail) {
      el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    },
    $watch() {
      return undefined;
    },
    $nextTick(callback) {
      queueMicrotask(callback);
    },
  };
}

function mount<T extends { init?(this: Magic): void }>(factory: (config?: never) => T, config?: object): HTMLElement {
  const el = document.createElement('div');
  document.body.append(el);
  const data = factory(config as never);
  data.init?.call({ ...data, ...magicFor(el) });
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
});

describe('Alpine adapter', () => {
  it('registers every catalog component once', () => {
    whitePlumeria(Alpine);
    whitePlumeria(Alpine);
    const host = document.createElement('div');
    host.setAttribute('x-data', "Button({ variant: 'primary', label: 'Save changes' })");
    document.body.append(host);
    Alpine.initTree(document.body);
    const button = host.querySelector('button');
    expect(button?.className).toContain('wpl-btn-primary');
    expect(button?.textContent).toContain('Save changes');
    button?.click();
  });

  it('blocks a loading button and emits a click otherwise', () => {
    const clicks: unknown[] = [];
    const loading = mount(Button, { loading: true, label: 'Save' });
    const button = loading.querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    loading.addEventListener('wpl-click', () => clicks.push('loading'));
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toEqual([]);

    const ready = mount(Button, { variant: 'primary', label: 'Save changes' });
    ready.addEventListener('wpl-click', (event) => clicks.push((event as CustomEvent).detail));
    ready.querySelector('button')?.click();
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

  it('orders a reversed date range and shows the earlier day', () => {
    const events: unknown[] = [];
    const host = mount(DateRangePicker, { label: 'Stay' });
    host.addEventListener('wpl-change', (event) => events.push((event as CustomEvent).detail));
    const end = host.querySelector('[data-wpl-edge="end"]') as HTMLInputElement;
    const start = host.querySelector('[data-wpl-edge="start"]') as HTMLInputElement;
    end.value = '2026-05-02';
    end.dispatchEvent(new Event('change', { bubbles: true }));
    start.value = '2026-05-10';
    start.dispatchEvent(new Event('change', { bubbles: true }));
    expect(start.value).toBe('2026-05-02');
    expect(end.value).toBe('2026-05-10');
    const early = parseIsoDate('2026-05-02');
    expect(early).not.toBeNull();
    expect(host.textContent).toContain(formatDate(early ?? new Date(), 'en'));
    expect(events.at(-1)).toEqual({ start: '2026-05-02', end: '2026-05-10' });
  });

  it('selects a menu item and ignores a disabled one', () => {
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
    const items = [...host.querySelectorAll('[role="menuitem"]')];
    items.find((item) => item.textContent?.includes('Billing'))?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).toEqual([]);
    items.find((item) => item.textContent?.includes('Profile'))?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events).toEqual([{ id: 'profile' }]);
  });

  it('sorts a data table by the amount column', () => {
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
    const first = host.querySelector('tbody tr')?.textContent ?? '';
    expect(first).toContain('10');
    expect(first).toContain('Pine');
  });

  it('moves a carousel and a step', () => {
    const carousel = mount(Carousel, {
      label: 'Notes',
      slides: [
        { id: 'filter', label: 'Filter', content: 'October is the default.' },
        { id: 'save', label: 'Save', content: 'Save keeps a note.' },
      ],
    });
    expect(carousel.textContent).toContain('October is the default.');
    carousel.querySelector('[aria-label="Next"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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
    expect(steps.querySelector('[aria-current="step"]')?.textContent).toContain('Send');
  });

  it('rejects an oversized file and reports a slider value', () => {
    const rejected: unknown[] = [];
    const host = mount(FileUpload, { label: 'Floor plan', maxSize: 4 });
    host.addEventListener('wpl-reject', (event) => rejected.push((event as CustomEvent).detail));
    const input = host.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['12345'], 'plan.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
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

  it('renders a notification as an inline notice, not a toast', () => {
    const quiet = mount(Notification, { title: 'Saved', variant: 'success', description: 'Local only' });
    const notice = quiet.querySelector('.wpl-notification');
    expect(notice?.className).toContain('wpl-notification-success');
    expect(notice?.getAttribute('role')).toBe('status');
    expect(quiet.querySelector('.wpl-toast')).toBeNull();
    expect(quiet.querySelector('button')).toBeNull();

    const dismissed: unknown[] = [];
    const loud = mount(Notification, { title: 'Blocked', variant: 'danger', onDismiss: () => dismissed.push('closed') });
    expect(loud.querySelector('[role="alert"]')?.className).toContain('wpl-notification-danger');
    loud.addEventListener('wpl-dismiss', () => dismissed.push('event'));
    loud.querySelector('button')?.click();
    expect(dismissed).toEqual(['event', 'closed']);
    expect(loud.querySelector('.wpl-notification')).toBeTruthy();
  });

  it('publishes an Alpine example for every catalog component', () => {
    for (const component of catalog) {
      expect(component.examples.alpine, component.name).toContain('whitePlumeria');
      expect(component.examples.alpine, component.name).toContain('@white-plumeria/alpine');
      if (component.name === 'Toast') expect(component.examples.alpine).toContain('pushToast');
      else expect(component.examples.alpine, component.name).toContain(`x-data="${component.name}`);
    }
    expect(catalog.find((item) => item.name === 'Button')?.examples.alpine).toContain("label: 'Save changes'");
  });
});
