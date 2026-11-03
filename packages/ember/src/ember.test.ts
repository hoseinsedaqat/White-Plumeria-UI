import { catalog, formatDate, parseIsoDate, toIsoDate } from '@white-plumeria/core';
import { renderComponent, renderSettled } from '@ember/renderer';
import { afterEach, describe, expect, it } from 'vitest';
import {
  Accordion,
  Breadcrumb,
  Button,
  Avatar,
  Calendar,
  Card,
  DatePicker,
  Label,
  Link,
  Pagination,
  Carousel,
  Chart,
  components,
  DataTable,
  Dialog,
  Drawer,
  Modal,
  DateRangePicker,
  Combobox,
  CommandPalette,
  DropdownMenu,
  Input,
  FileUpload,
  Notification,
  Popover,
  pushToast,
  Slider,
  Spinner,
  SplitPane,
  Steps,
  Tabs,
  Timeline,
  TreeView,
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
  it('names each date-range day with the full date', async () => {
    const host = mount(DateRangePicker, { label: 'Stay' });
    await renderSettled();
    const days = () => [...host.querySelectorAll('.wpl-day:not(.wpl-day-outside)')].filter((day) => !day.hasAttribute('disabled'));
    const first = days()[0];
    expect(first?.getAttribute('aria-label')).toBe(first?.textContent);
    expect(first?.getAttribute('aria-label')?.length ?? 0).toBeGreaterThan(8);
    first?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    days()[3]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    const start = host.querySelector('[data-wpl-edge="start"]');
    const end = host.querySelector('[data-wpl-edge="end"]');
    expect(start).toBeInstanceOf(HTMLInputElement);
    expect(end).toBeInstanceOf(HTMLInputElement);
    expect((start as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect((end as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect((start as HTMLInputElement).value <= (end as HTMLInputElement).value).toBe(true);
    expect(host.querySelectorAll('[aria-selected="true"]').length).toBeGreaterThan(0);
  });

  it('names the date picker calendar button', async () => {
    const host = mount(DatePicker, { label: 'Start' });
    await renderSettled();
    const button = host.querySelector('button[aria-label="Choose date"]');
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('.wpl-calendar')).toBeNull();
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    const day = host.querySelector('.wpl-day:not([disabled])');
    day?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    expect(host.querySelector('input')?.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(host.querySelector('.wpl-calendar')).toBeNull();
  });

  it('marks the selected calendar day and today', async () => {
    const host = mount(Calendar, { value: toIsoDate(new Date()) });
    await renderSettled();
    const selected = host.querySelector('[aria-selected="true"]');
    expect(selected?.getAttribute('aria-current')).toBe('date');
    expect(selected?.getAttribute('role')).toBe('gridcell');
    expect(host.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
  });

  it('announces that an external link opens in a new tab', async () => {
    const host = mount(Link, { href: 'https://example.com/docs', label: 'Docs', external: true });
    await renderSettled();
    const link = host.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noreferrer noopener');
    expect(link?.querySelector('.wpl-sr-only')?.textContent).toContain('opens in a new tab');
    expect(link?.querySelector('.wpl-icon-dir')).toBeTruthy();
  });

  it('separates breadcrumbs toward the inline end', async () => {
    const host = mount(Breadcrumb, {
      items: [
        { href: '/home', label: 'Home' },
        { href: '/docs', label: 'Docs' },
        { label: 'Button' },
      ],
    });
    await renderSettled();
    expect(host.querySelectorAll('.wpl-icon-dir')).toHaveLength(2);
    expect(host.querySelector('[aria-current="page"]')?.textContent).toBe('Button');
    expect(host.querySelector('a')?.getAttribute('href')).toBe('/home');
  });

  it('marks the current pagination page', async () => {
    const host = mount(Pagination, { page: 5, pageCount: 10 });
    await renderSettled();
    expect(host.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('5');
    expect(host.querySelector('.wpl-icon-dir')).toBeTruthy();
    expect(host.textContent).toContain('…');
    const six = [...host.querySelectorAll('button')].find((button) => button.textContent?.trim() === '6');
    six?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    expect(host.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('6');
  });

  it('renders every catalog component as a Glimmer class', () => {
    expect(Object.keys(components)).toHaveLength(catalog.length);
    for (const component of catalog) {
      expect(components[component.name as keyof typeof components], component.name).toBeTypeOf('function');
      expect(component.examples.ember, component.name).toContain('@white-plumeria/ember');
    }
    expect(catalog.find((item) => item.name === 'Button')?.examples.ember).toContain('Save changes');
    expect(catalog.find((item) => item.name === 'Toast')?.examples.ember).toContain('pushToast');
  });

  it('draws a chart as SVG and keeps the values in a table', async () => {
    const host = mount(Chart, {
      title: 'Sample volume',
      type: 'area',
      data: [
        { label: 'Mon', value: 12 },
        { label: 'Tue', value: 18 },
      ],
    });
    await renderSettled();
    expect(host.querySelector('.wpl-graph-line')).toBeTruthy();
    expect(host.querySelector('.wpl-graph-area')).toBeTruthy();
    expect(host.querySelector('table')?.textContent).toContain('Mon');
    expect(host.querySelector('.wpl-chart')).toBeNull();
  });

  it('renders a notification in the status color and does not hide it on dismiss', async () => {
    const quiet = mount(Notification, { title: 'Saved', variant: 'success', description: 'Local only' });
    await renderSettled();
    const notice = quiet.querySelector('.wpl-notification');
    expect(notice?.className).toContain('wpl-notification-success');
    expect(notice?.getAttribute('role')).toBe('status');
    expect(quiet.querySelector('button')).toBeNull();

    const dismissed: unknown[] = [];
    const loud = mount(Notification, {
      title: 'Blocked',
      variant: 'danger',
      onDismiss: () => dismissed.push('closed'),
    });
    loud.addEventListener('wpl-dismiss', () => dismissed.push('event'));
    await renderSettled();
    loud.querySelector('button')?.click();
    await renderSettled();
    expect(loud.querySelector('[role="alert"]')?.className).toContain('wpl-notification-danger');
    expect(dismissed).toEqual(['event', 'closed']);
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
    start.value = '2026-13-01';
    start.dispatchEvent(new Event('change', { bubbles: true }));
    await renderSettled();
    const alert = host.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Use an ISO date: YYYY-MM-DD.');
    expect(start.getAttribute('aria-describedby')).toBe(alert?.id);
    expect(end.getAttribute('aria-describedby')).toBe(alert?.id);
  });

  it('names the active command and filters by keyword', async () => {
    const chosen: unknown[] = [];
    const host = mount(CommandPalette, {
      commands: [
        { id: 'docs', label: 'Open docs', group: 'Navigate' },
        { id: 'theme', label: 'Switch theme', keywords: ['dark'] },
      ],
    });
    host.addEventListener('wpl-select', (event) => chosen.push((event as CustomEvent).detail));
    await renderSettled();
    const input = host.querySelector<HTMLInputElement>('[role="combobox"]');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    const active = host.querySelector('[data-active="true"]');
    expect(active?.textContent).toContain('Switch theme');
    expect(input?.getAttribute('aria-activedescendant')).toBe(active?.id);
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await renderSettled();
    expect(chosen).toEqual([{ id: 'theme' }]);
    if (input) input.value = 'dark';
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    await renderSettled();
    expect(host.querySelectorAll('[role="option"]').length).toBe(1);
    expect(host.querySelector('[role="option"]')?.textContent).toContain('Switch theme');
    if (input) input.value = 'missing';
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    await renderSettled();
    expect(host.textContent).toContain('No matching results');
  });

  it('names the active menu item and opens its submenu from the keyboard', async () => {
    const events: unknown[] = [];
    const host = mount(DropdownMenu, {
      label: 'Account',
      items: [
        { id: 'profile', label: 'Profile' },
        { id: 'theme', label: 'Theme', items: [{ id: 'ivory', label: 'Ivory' }] },
      ],
    });
    host.addEventListener('wpl-select', (event) => events.push((event as CustomEvent).detail));
    await renderSettled();
    const trigger = host.querySelector('button');
    const root = host.querySelector('.wpl-menu-root') ?? host;
    expect(trigger?.hasAttribute('aria-activedescendant')).toBe(false);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    const active = host.querySelector('[data-active="true"]');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger?.getAttribute('aria-activedescendant')).toBe(active?.id);
    expect(active?.textContent).toContain('Profile');
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await renderSettled();
    const nested = host.querySelector('[data-active="true"]');
    expect(nested?.textContent).toContain('Ivory');
    expect(trigger?.getAttribute('aria-activedescendant')).toBe(nested?.id);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await renderSettled();
    expect(events).toEqual([{ id: 'ivory' }]);
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
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

  it('names an accordion panel from its trigger', async () => {
    const host = mount(Accordion, { items: [{ id: 'fees', title: 'Fees', content: 'No monthly fee.' }] });
    await renderSettled();
    const trigger = host.querySelector('.wpl-accordion-trigger');
    const panel = host.querySelector('.wpl-accordion-panel');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('role')).toBe('region');
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(panel?.hasAttribute('hidden')).toBe(true);
    expect(trigger?.querySelector('.wpl-icon-dir')).toBeTruthy();
    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    expect(host.querySelector('.wpl-accordion-panel')?.hasAttribute('hidden')).toBe(false);
    expect(host.textContent).toContain('No monthly fee.');
  });

  it('moves a carousel toward the inline end', async () => {
    const slides = [
      { id: 'filter', label: 'Filter', content: 'October is the default.' },
      { id: 'activity', label: 'Activity', content: 'Recent notes.' },
      { id: 'save', label: 'Save', content: 'Save keeps a note.' },
    ];
    const host = mount(Carousel, { label: 'Notes', index: 1, slides });
    host.style.direction = 'rtl';
    await renderSettled();
    const selected = () => host.querySelector('[role="tab"][aria-selected="true"]');
    expect(selected()?.textContent).toContain('Activity');
    expect(host.querySelector('[role="tabpanel"][aria-hidden="true"]')).toBeTruthy();
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await renderSettled();
    expect(selected()?.textContent).toContain('Filter');
    expect(host.querySelector('.wpl-carousel')?.getAttribute('data-index')).toBe('0');
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    expect(selected()?.textContent).toContain('Filter');

    const dragged = mount(Carousel, { label: 'Notes', slides });
    await renderSettled();
    const viewport = dragged.querySelector('.wpl-carousel-viewport');
    viewport?.dispatchEvent(new PointerEvent('pointerdown', { clientX: 180, bubbles: true }));
    viewport?.dispatchEvent(new PointerEvent('pointerup', { clientX: 20, bubbles: true }));
    await renderSettled();
    expect(dragged.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('Activity');
  });

  it('shrinks the start pane when ArrowRight is pressed in RTL', async () => {
    const host = mount(SplitPane, { label: 'Resize editor' });
    host.setAttribute('dir', 'rtl');
    host.style.direction = 'rtl';
    const separator = host.querySelector('.wpl-split-separator');
    expect(separator?.getAttribute('role')).toBe('separator');
    expect(separator?.getAttribute('aria-orientation')).toBe('vertical');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await renderSettled();
    expect(separator?.getAttribute('aria-valuenow')).toBe('45');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    expect(separator?.getAttribute('aria-valuenow')).toBe('45');
  });

  it('expands a tree toward the inline end', async () => {
    const host = mount(TreeView, {
      label: 'Files',
      nodes: [{ id: 'src', label: 'src', children: [{ id: 'btn', label: 'button.tsx' }] }],
    });
    host.style.direction = 'rtl';
    const row = host.querySelector('[role="treeitem"]');
    expect(row?.className).toContain('wpl-tree-row');
    expect(row?.getAttribute('aria-expanded')).toBe('false');
    row?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await renderSettled();
    expect(host.querySelector('[aria-expanded="true"]')?.textContent).toContain('src');
    expect(host.textContent).toContain('button.tsx');
  });

  it('moves a tab toward the inline end', async () => {
    const tabs = [
      { id: 'overview', label: 'Overview', panel: 'Balances' },
      { id: 'activity', label: 'Activity', panel: 'Recent' },
      { id: 'settings', label: 'Settings', panel: 'Prefs' },
    ];
    const host = mount(Tabs, { value: 'activity', tabs });
    await renderSettled();
    const panel = host.querySelector('[role="tabpanel"]');
    const selected = () => host.querySelector('[aria-selected="true"]');
    expect(selected()?.textContent).toBe('Activity');
    expect(selected()?.getAttribute('aria-controls')).toBe(panel?.id);
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await renderSettled();
    expect(selected()?.textContent).toBe('Settings');
    expect(panel?.textContent).toBe('Prefs');
    host.style.direction = 'rtl';
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await renderSettled();
    expect(selected()?.textContent).toBe('Activity');
    expect(panel?.textContent).toBe('Recent');
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    expect(selected()?.textContent).toBe('Activity');

    const vertical = mount(Tabs, { value: 'activity', orientation: 'vertical', items: tabs });
    await renderSettled();
    expect(vertical.querySelector('.wpl-tabs')?.className).toContain('wpl-tabs-vertical');
    vertical.querySelector('[aria-selected="true"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await renderSettled();
    expect(vertical.querySelector('[aria-selected="true"]')?.textContent).toBe('Activity');
    vertical.querySelector('[aria-selected="true"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    expect(vertical.querySelector('[aria-selected="true"]')?.textContent).toBe('Settings');
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
    await renderSettled();
    expect(steps.querySelector('[aria-current="step"]')?.textContent).toContain('Send');
  });

  it('names an input error from the control', async () => {
    const host = mount(Input, { label: 'Email', error: 'Enter a valid email' });
    await renderSettled();
    const input = host.querySelector('input');
    const alert = host.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Enter a valid email');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe(alert?.id);
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

  it('closes a popover from escape and an outside pointer', async () => {
    const host = mount(Popover, { label: 'Details', text: 'Settles tomorrow' });
    await renderSettled();
    const trigger = host.querySelector('button');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    trigger?.click();
    await renderSettled();
    const panel = host.querySelector('.wpl-popover');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.textContent).toContain('Settles tomorrow');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await renderSettled();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    trigger?.click();
    await renderSettled();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await renderSettled();
    expect(host.querySelector('.wpl-popover')).toBeNull();
  });

  it('names a spinner in the page language', async () => {
    document.documentElement.lang = 'fa';
    try {
      const host = mount(Spinner);
      await renderSettled();
      expect(host.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('در حال بارگذاری');
    } finally {
      document.documentElement.lang = '';
    }
    const named = mount(Spinner, { label: 'Saving' });
    await renderSettled();
    expect(named.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Saving');
  });

  it('returns focus to the dialog and modal opener', async () => {
    const dialog = mount(Dialog, { title: 'Confirm', trigger: 'Open dialog' });
    const modal = mount(Modal, { title: 'Window', trigger: 'Open modal' });
    await renderSettled();
    const dialogTrigger = dialog.querySelector('button');
    const modalTrigger = modal.querySelector('button');
    dialogTrigger?.focus();
    dialogTrigger?.click();
    await renderSettled();
    dialog.querySelector('dialog')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await renderSettled();
    await Promise.resolve();
    expect(dialog.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(dialogTrigger);
    modalTrigger?.focus();
    modalTrigger?.click();
    await renderSettled();
    modal.querySelector('.wpl-dialog-header button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await renderSettled();
    await Promise.resolve();
    expect(modal.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(modalTrigger);
  });

  it('returns focus to the drawer opener', async () => {
    const host = mount(Drawer, { title: 'Filters', trigger: 'Open drawer', side: 'start' });
    await renderSettled();
    const trigger = host.querySelector('button');
    trigger?.focus();
    trigger?.click();
    await renderSettled();
    const dialog = host.querySelector('dialog');
    expect(dialog?.className).toContain('wpl-drawer-start');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(dialog?.querySelector('h2')?.id);
    dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await renderSettled();
    await Promise.resolve();
    expect(host.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('translates the dialog, modal, and drawer close buttons', async () => {
    document.documentElement.lang = 'fa';
    try {
      const dialog = mount(Dialog, { title: 'تأیید', trigger: 'باز کردن' });
      const modal = mount(Modal, { title: 'پنجره', trigger: 'باز کردن' });
      const drawer = mount(Drawer, { title: 'کشو', trigger: 'باز کردن' });
      dialog.querySelector('button')?.click();
      modal.querySelector('button')?.click();
      drawer.querySelector('button')?.click();
      await renderSettled();
      expect(dialog.querySelector('.wpl-dialog-header button')?.textContent).toBe('بستن');
      expect(modal.querySelector('.wpl-dialog-header button')?.textContent).toBe('بستن');
      expect(drawer.querySelector('.wpl-dialog-header button')?.textContent).toBe('بستن');
    } finally {
      document.documentElement.lang = '';
    }
  });

  it('hides the required word on a label', async () => {
    const host = mount(Label, { text: 'Email', required: true });
    await renderSettled();
    expect(host.querySelector('.wpl-required')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('.wpl-required')?.textContent).toBe('*');
    expect(host.querySelector('.wpl-sr-only')?.textContent).toBe('required');
    document.documentElement.lang = 'fa';
    const persian = mount(Label, { text: 'ایمیل', required: true });
    await renderSettled();
    expect(persian.querySelector('.wpl-sr-only')?.textContent).toBe('الزامی');
    document.documentElement.lang = '';
    const optional = mount(Label, { text: 'Name' });
    await renderSettled();
    expect(optional.querySelector('.wpl-required')).toBeNull();
    expect(optional.querySelector('.wpl-sr-only')).toBeNull();
  });

  it('uses a time element only when a timeline date is set', async () => {
    const host = mount(Timeline, {
      items: [
        { id: '1', title: 'Draft saved', time: '09:40', dateTime: '2026-10-27T09:40', meta: 'Notes' },
        { id: '2', title: 'Sent', time: '10:05' },
      ],
    });
    await renderSettled();
    const dated = host.querySelector('time');
    expect(dated?.getAttribute('datetime')).toBe('2026-10-27T09:40');
    expect(dated?.textContent).toBe('09:40');
    expect(host.querySelectorAll('time')).toHaveLength(1);
    expect(host.textContent).toContain('Sent');
    expect(host.textContent).toContain('10:05');
    expect(host.textContent).toContain('Notes');
  });

  it('names an avatar status with hidden text', async () => {
    const host = mount(Avatar, { name: 'Laleh Karimi', status: 'busy', statusLabel: 'Busy' });
    await renderSettled();
    expect(host.querySelector('.wpl-avatar-status')?.getAttribute('style')).toContain('--wpl-color-warning');
    expect(host.querySelector('.wpl-sr-only')?.textContent).toBe('Busy');
    expect(host.querySelector('.wpl-avatar-status')?.getAttribute('aria-label')).toBeNull();
    const image = mount(Avatar, { name: 'Laleh Karimi', src: '/laleh.png' });
    await renderSettled();
    expect(image.querySelector('img')?.getAttribute('alt')).toBe('Laleh Karimi');
    expect(image.querySelector('.wpl-avatar-status')).toBeNull();
  });

  it('names the active combobox option and chooses it from the keyboard', async () => {
    const chosen: unknown[] = [];
    const host = mount(Combobox, {
      label: 'Theme',
      options: [
        { value: 'ivory', label: 'Ivory' },
        { value: 'ink', label: 'Ink' },
        { value: 'saffron', label: 'Saffron', disabled: true },
      ],
    });
    host.addEventListener('wpl-change', (event) => chosen.push((event as CustomEvent<{ value: string }>).detail.value));
    await renderSettled();
    const input = host.querySelector<HTMLInputElement>('[role="combobox"]');
    expect(input?.getAttribute('aria-expanded')).toBe('false');
    expect(input?.hasAttribute('aria-activedescendant')).toBe(false);
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await renderSettled();
    const active = host.querySelector('[data-active="true"]');
    expect(input?.getAttribute('aria-expanded')).toBe('true');
    expect(input?.getAttribute('aria-activedescendant')).toBe(active?.id);
    expect(active?.textContent).toBe('Ink');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await renderSettled();
    expect(chosen).toEqual(['ink']);
    expect(input?.value).toBe('Ink');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await renderSettled();
    expect(input?.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses the requested card heading', async () => {
    const card = mount(Card, { title: 'Analytics', titleAs: 'h3' });
    await renderSettled();
    expect(card.querySelector('h3.wpl-card-title')?.textContent).toBe('Analytics');
    expect(card.querySelector('h2')).toBeNull();
    const fallback = mount(Card, { title: 'Overview' });
    await renderSettled();
    expect(fallback.querySelector('h2.wpl-card-title')?.textContent).toBe('Overview');
  });
});
