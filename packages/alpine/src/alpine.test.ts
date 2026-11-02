import { formatDate, parseIsoDate, catalog } from '@white-plumeria/core';
import Alpine from 'alpinejs';
import { afterEach, describe, expect, it } from 'vitest';
import { Accordion, Breadcrumb, DataTable, DateRangePicker, DropdownMenu, FileUpload, FormField, Link, Notification, Pagination, Slider, SplitPane, Tabs, TreeView, whitePlumeria, pushToast, Button, WhitePlumeriaProvider, Carousel, Steps } from './index.ts';
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
  it('announces that an external link opens in a new tab', () => {
    const host = mount(Link, { href: 'https://example.com/docs', label: 'Docs', external: true });
    const link = host.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noreferrer noopener');
    expect(link?.querySelector('.wpl-sr-only')?.textContent).toContain('opens in a new tab');
    expect(link?.querySelector('.wpl-icon-dir')).toBeTruthy();
  });

  it('separates breadcrumbs toward the inline end', () => {
    const host = mount(Breadcrumb, {
      items: [
        { href: '/home', label: 'Home' },
        { href: '/docs', label: 'Docs' },
        { label: 'Button' },
      ],
    });
    expect(host.querySelectorAll('.wpl-icon-dir')).toHaveLength(2);
    expect(host.querySelector('[aria-current="page"]')?.textContent).toBe('Button');
    expect(host.querySelector('a')?.getAttribute('href')).toBe('/home');
  });

  it('marks the current pagination page', () => {
    const host = mount(Pagination, { page: 5, pageCount: 10 });
    expect(host.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('5');
    expect(host.querySelector('.wpl-icon-dir')).toBeTruthy();
    expect(host.textContent).toContain('…');
    const six = [...host.querySelectorAll('button')].find((button) => button.textContent?.trim() === '6');
    six?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(host.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('6');
  });

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
    start.value = '2026-13-01';
    start.dispatchEvent(new Event('change', { bubbles: true }));
    const alert = host.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Use an ISO date: YYYY-MM-DD.');
    expect(start.getAttribute('aria-describedby')).toBe(alert?.id);
    expect(end.getAttribute('aria-describedby')).toBe(alert?.id);
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
    expect(carousel.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('Save');

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

  it('names an accordion panel from its trigger', () => {
    const host = mount(Accordion, { items: [{ id: 'fees', title: 'Fees', content: 'No monthly fee.' }] });
    const trigger = host.querySelector('.wpl-accordion-trigger');
    const panel = host.querySelector('.wpl-accordion-panel');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('role')).toBe('region');
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(panel?.hasAttribute('hidden')).toBe(true);
    expect(trigger?.querySelector('.wpl-icon-dir')).toBeTruthy();
    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(host.querySelector('.wpl-accordion-panel')?.hasAttribute('hidden')).toBe(false);
    expect(host.textContent).toContain('No monthly fee.');
  });

  it('moves a carousel toward the inline end', () => {
    const slides = [
      { id: 'filter', label: 'Filter', content: 'October is the default.' },
      { id: 'activity', label: 'Activity', content: 'Recent notes.' },
      { id: 'save', label: 'Save', content: 'Save keeps a note.' },
    ];
    const host = mount(Carousel, { label: 'Notes', index: 1, slides });
    host.style.direction = 'rtl';
    const selected = () => host.querySelector('[role="tab"][aria-selected="true"]');
    expect(selected()?.textContent).toContain('Activity');
    expect(host.querySelector('[role="tabpanel"][aria-hidden="true"]')).toBeTruthy();
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(selected()?.textContent).toContain('Filter');
    expect(host.dataset.index).toBe('0');
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(selected()?.textContent).toContain('Filter');

    const dragged = mount(Carousel, { label: 'Notes', slides });
    const viewport = dragged.querySelector('.wpl-carousel-viewport');
    viewport?.dispatchEvent(new PointerEvent('pointerdown', { clientX: 180, bubbles: true }));
    viewport?.dispatchEvent(new PointerEvent('pointerup', { clientX: 20, bubbles: true }));
    expect(dragged.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('Activity');
  });

  it('shrinks the start pane when ArrowRight is pressed in RTL', () => {
    const host = document.createElement('div');
    host.setAttribute('dir', 'rtl');
    host.style.direction = 'rtl';
    document.body.append(host);
    SplitPane({ label: 'Resize editor' }).init?.call(magicFor(host));
    const separator = host.querySelector('.wpl-split-separator');
    expect(separator?.getAttribute('role')).toBe('separator');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(separator?.getAttribute('aria-valuenow')).toBe('45');
    expect(host.style.getPropertyValue('--wpl-split-size')).toBe('45%');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(separator?.getAttribute('aria-valuenow')).toBe('45');
  });

  it('expands a tree toward the inline end', () => {
    const host = document.createElement('div');
    host.style.direction = 'rtl';
    document.body.append(host);
    TreeView({
      label: 'Files',
      nodes: [{ id: 'src', label: 'src', children: [{ id: 'btn', label: 'button.tsx' }] }],
    }).init?.call(magicFor(host));
    const row = host.querySelector('[role="treeitem"]') as HTMLElement;
    expect(row.getAttribute('aria-expanded')).toBe('false');
    expect(row.className).toContain('wpl-tree-row');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    const open = host.querySelector('[aria-expanded="true"]');
    expect(open?.textContent).toContain('src');
    expect(host.textContent).toContain('button.tsx');
  });

  it('moves a tab toward the inline end', () => {
    const tabs = [
      { id: 'overview', label: 'Overview', panel: 'Balances' },
      { id: 'activity', label: 'Activity', panel: 'Recent' },
      { id: 'settings', label: 'Settings', panel: 'Prefs' },
    ];
    const host = mount(Tabs, { value: 'activity', tabs });
    const panel = host.querySelector('[role="tabpanel"]');
    const selected = () => host.querySelector('[aria-selected="true"]');
    expect(selected()?.textContent).toBe('Activity');
    expect(selected()?.getAttribute('aria-controls')).toBe(panel?.id);
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(selected()?.textContent).toBe('Settings');
    expect(panel?.textContent).toBe('Prefs');
    host.style.direction = 'rtl';
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(selected()?.textContent).toBe('Activity');
    expect(panel?.textContent).toBe('Recent');
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(selected()?.textContent).toBe('Activity');

    const vertical = mount(Tabs, { value: 'activity', orientation: 'vertical', tabs });
    expect(vertical.className).toContain('wpl-tabs-vertical');
    vertical.querySelector('[aria-selected="true"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(vertical.querySelector('[aria-selected="true"]')?.textContent).toBe('Activity');
    vertical.querySelector('[aria-selected="true"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(vertical.querySelector('[aria-selected="true"]')?.textContent).toBe('Settings');
  });

  it('names a form-field error from the nested control', async () => {
    const host = document.createElement('div');
    host.append(document.createElement('input'));
    document.body.append(host);
    FormField({ label: 'Email', error: 'Enter a valid email' }).init?.call(magicFor(host));
    await Promise.resolve();
    const input = host.querySelector('input');
    const alert = host.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Enter a valid email');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe(alert?.id);
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
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(host.querySelector('[role="alert"]')?.id);

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
