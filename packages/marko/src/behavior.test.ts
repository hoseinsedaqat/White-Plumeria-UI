import { formatDate, parseIsoDate, catalog, toIsoDate } from '@white-plumeria/core';
import { render } from '@marko/testing-library';
import { afterEach, describe, expect, it } from 'vitest';
import { pushToast } from './provider.ts';
import { tagNames } from './index.ts';
import Chart from './tags/wpl-chart.marko';
import Button from './tags/wpl-button.marko';
import Carousel from './tags/wpl-carousel.marko';
import DataTable from './tags/wpl-data-table.marko';
import DateRange from './tags/wpl-date-range-picker.marko';
import Dropdown from './tags/wpl-dropdown-menu.marko';
import FileUpload from './tags/wpl-file-upload.marko';
import Notification from './tags/wpl-notification.marko';
import Provider from './tags/wpl-provider.marko';
import Slider from './tags/wpl-slider.marko';
import SplitPane from './tags/wpl-split-pane.marko';
import Steps from './tags/wpl-steps.marko';
import TreeView from './tags/wpl-tree-view.marko';
import Accordion from './tags/wpl-accordion.marko';
import Breadcrumb from './tags/wpl-breadcrumb.marko';
import Avatar from './tags/wpl-avatar.marko';
import Calendar from './tags/wpl-calendar.marko';
import Card from './tags/wpl-card.marko';
import DatePicker from './tags/wpl-date-picker.marko';
import Label from './tags/wpl-label.marko';
import Link from './tags/wpl-link.marko';
import Pagination from './tags/wpl-pagination.marko';
import Tabs from './tags/wpl-tabs.marko';
import Timeline from './tags/wpl-timeline.marko';
import ToggleGroup from './tags/wpl-toggle-group.marko';

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
  it('names the date picker calendar button', async () => {
    const view = await render(DatePicker, { label: 'Start' });
    const button = view.container.querySelector('button[aria-label="Choose date"]');
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(view.container.querySelector('.wpl-calendar')).toBeNull();
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    const day = view.container.querySelector('.wpl-day:not([disabled])');
    day?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();
    expect(view.container.querySelector('input')?.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(view.container.querySelector('.wpl-calendar')).toBeNull();
  });

  it('marks the selected calendar day and today', async () => {
    const today = toIsoDate(new Date());
    const view = await render(Calendar, { value: today });
    const selected = view.container.querySelector('[aria-selected="true"]');
    expect(selected?.getAttribute('aria-current')).toBe('date');
    expect(selected?.getAttribute('role')).toBe('gridcell');
    expect(view.container.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
    const range = await render(DateRange, { start: today, end: today });
    expect(range.container.querySelector('[aria-current="date"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('announces that an external link opens in a new tab', async () => {
    const view = await render(Link, { href: 'https://example.com/docs', label: 'Docs', external: true });
    const link = view.container.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noreferrer noopener');
    expect(link?.querySelector('.wpl-sr-only')?.textContent).toContain('opens in a new tab');
    expect(link?.querySelector('.wpl-icon-dir')).toBeTruthy();
  });

  it('separates breadcrumbs toward the inline end', async () => {
    const view = await render(Breadcrumb, {
      items: [
        { href: '/home', label: 'Home' },
        { href: '/docs', label: 'Docs' },
        { label: 'Button' },
      ],
    });
    expect(view.container.querySelectorAll('.wpl-icon-dir')).toHaveLength(2);
    expect(view.container.querySelector('[aria-current="page"]')?.textContent).toBe('Button');
    expect(view.container.querySelector('a')?.getAttribute('href')).toBe('/home');
  });

  it('marks the current pagination page', async () => {
    const view = await render(Pagination, { page: 5, pageCount: 10 });
    expect(view.container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('5');
    expect(view.container.querySelector('.wpl-icon-dir')).toBeTruthy();
    expect(view.container.textContent).toContain('…');
    const six = [...view.container.querySelectorAll('button')].find((button) => button.textContent?.trim() === '6');
    six?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();
    expect(view.container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('6');
  });

  it('draws a chart line from the supplied points', async () => {
    const view = await render(Chart, {
      title: 'Sample volume',
      type: 'line',
      data: [
        { label: 'Mon', value: 12 },
        { label: 'Tue', value: 18 },
      ],
    });
    expect(view.container.querySelector('.wpl-graph-line')).toBeTruthy();
    expect(view.container.textContent).toContain('Mon');
    expect(view.container.querySelector('.wpl-graph-column')).toBeNull();
  });

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

  it('renders a notification as an inline notice, not a toast', async () => {
    const quiet = await render(Notification, { title: 'Saved', variant: 'success', description: 'Local only' });
    const notice = quiet.container.querySelector('.wpl-notification');
    expect(notice?.className).toContain('wpl-notification-success');
    expect(notice?.getAttribute('role')).toBe('status');
    expect(quiet.container.querySelector('.wpl-toast')).toBeNull();
    expect(quiet.container.querySelector('button')).toBeNull();

    const dismissed: unknown[] = [];
    const loud = await render(Notification, {
      title: 'Blocked',
      variant: 'danger',
      onDismiss: () => dismissed.push('closed'),
    });
    loud.container.addEventListener('wpl-dismiss', () => dismissed.push('event'));
    loud.container.querySelector('button')?.click();
    expect(loud.container.querySelector('[role="alert"]')?.className).toContain('wpl-notification-danger');
    expect(dismissed).toEqual(['event', 'closed']);
    expect(loud.container.querySelector('.wpl-notification')).toBeTruthy();
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
    start.value = '2026-13-01';
    start.dispatchEvent(new Event('change', { bubbles: true }));
    await flush();
    const alert = view.container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Use an ISO date: YYYY-MM-DD.');
    expect(start.getAttribute('aria-describedby')).toBe(alert?.id);
    expect(end.getAttribute('aria-describedby')).toBe(alert?.id);
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

  it('names an accordion panel from its trigger', async () => {
    const view = await render(Accordion, { items: [{ id: 'fees', title: 'Fees', content: 'No monthly fee.' }] });
    const trigger = view.container.querySelector('.wpl-accordion-trigger');
    const panel = view.container.querySelector('.wpl-accordion-panel');
    expect(trigger?.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('role')).toBe('region');
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(panel?.hasAttribute('hidden')).toBe(true);
    expect(trigger?.querySelector('.wpl-icon-dir')).toBeTruthy();
    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();
    expect(view.container.querySelector('.wpl-accordion-panel')?.hasAttribute('hidden')).toBe(false);
    expect(view.container.textContent).toContain('No monthly fee.');
  });

  it('moves a carousel toward the inline end', async () => {
    const slides = [
      { id: 'filter', label: 'Filter', content: 'October is the default.' },
      { id: 'activity', label: 'Activity', content: 'Recent notes.' },
      { id: 'save', label: 'Save', content: 'Save keeps a note.' },
    ];
    const view = await render(Carousel, { label: 'Notes', index: 1, slides });
    view.container.style.direction = 'rtl';
    const selected = () => view.container.querySelector('[role="tab"][aria-selected="true"]');
    expect(selected()?.textContent).toContain('Activity');
    expect(view.container.querySelector('[role="tabpanel"][aria-hidden="true"]')).toBeTruthy();
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flush();
    expect(selected()?.textContent).toContain('Filter');
    expect(view.container.querySelector('.wpl-carousel')?.getAttribute('data-index')).toBe('0');
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await flush();
    expect(selected()?.textContent).toContain('Filter');

    const dragged = await render(Carousel, { label: 'Notes', slides });
    const viewport = dragged.container.querySelector('.wpl-carousel-viewport');
    viewport?.dispatchEvent(new PointerEvent('pointerdown', { clientX: 180, bubbles: true }));
    viewport?.dispatchEvent(new PointerEvent('pointerup', { clientX: 20, bubbles: true }));
    await flush();
    expect(dragged.container.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('Activity');
  });

  it('shrinks the start pane when ArrowRight is pressed in RTL', async () => {
    const view = await render(SplitPane, { label: 'Resize editor' });
    view.container.setAttribute('dir', 'rtl');
    view.container.style.direction = 'rtl';
    const separator = view.container.querySelector('.wpl-split-separator');
    expect(separator?.getAttribute('role')).toBe('separator');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flush();
    expect(separator?.getAttribute('aria-valuenow')).toBe('45');
    expect(view.container.querySelector('.wpl-split')?.getAttribute('style')).toContain('--wpl-split-size:45%');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await flush();
    expect(separator?.getAttribute('aria-valuenow')).toBe('45');
  });

  it('moves a toggle toward the inline end in RTL', async () => {
    const view = await render(ToggleGroup, {
      label: 'Align',
      value: 'start',
      options: [
        { value: 'start', label: 'Start' },
        { value: 'middle', label: 'Middle' },
        { value: 'end', label: 'End' },
      ],
    });
    view.container.style.direction = 'rtl';
    const start = [...view.container.querySelectorAll('[role="radio"]')].find((item) => item.textContent === 'Start');
    start?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flush();
    expect(view.container.querySelector('[aria-checked="true"]')?.textContent).toBe('End');
  });

  it('expands a tree toward the inline end', async () => {
    const view = await render(TreeView, {
      label: 'Files',
      nodes: [{ id: 'src', label: 'src', children: [{ id: 'btn', label: 'button.tsx' }] }],
    });
    view.container.style.direction = 'rtl';
    const row = view.container.querySelector('[role="treeitem"]');
    expect(row?.className).toContain('wpl-tree-row');
    expect(row?.getAttribute('aria-expanded')).toBe('false');
    row?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await flush();
    expect(view.container.querySelector('[aria-expanded="true"]')?.textContent).toContain('src');
    expect(view.container.textContent).toContain('button.tsx');
  });

  it('moves a tab toward the inline end', async () => {
    const tabs = [
      { id: 'overview', label: 'Overview', panel: 'Balances' },
      { id: 'activity', label: 'Activity', panel: 'Recent' },
      { id: 'settings', label: 'Settings', panel: 'Prefs' },
    ];
    const view = await render(Tabs, { value: 'activity', tabs });
    const selected = () => view.container.querySelector('[aria-selected="true"]');
    const panelFor = (tab: Element | null) =>
      view.container.querySelector(`#${tab?.getAttribute('aria-controls') ?? ''}`);
    expect(selected()?.textContent).toBe('Activity');
    expect(panelFor(selected())?.textContent).toBe('Recent');
    expect(panelFor(selected())?.hasAttribute('hidden')).toBe(false);
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flush();
    expect(selected()?.textContent).toBe('Settings');
    expect(panelFor(selected())?.textContent).toBe('Prefs');
    view.container.style.direction = 'rtl';
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flush();
    expect(selected()?.textContent).toBe('Activity');
    expect(panelFor(selected())?.textContent).toBe('Recent');
    selected()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await flush();
    expect(selected()?.textContent).toBe('Activity');

    const vertical = await render(Tabs, { value: 'activity', orientation: 'vertical', tabs });
    expect(vertical.container.querySelector('.wpl-tabs')?.className).toContain('wpl-tabs-vertical');
    vertical.container.querySelector('[aria-selected="true"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flush();
    expect(vertical.container.querySelector('[aria-selected="true"]')?.textContent).toBe('Activity');
    vertical.container.querySelector('[aria-selected="true"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await flush();
    expect(vertical.container.querySelector('[aria-selected="true"]')?.textContent).toBe('Settings');
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
    expect(carousel.container.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('Save');

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
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(view.container.querySelector('[role="alert"]')?.id);

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

  it('hides the required word on a label', async () => {
    const view = await render(Label, { required: true });
    expect(view.container.querySelector('.wpl-required')?.getAttribute('aria-hidden')).toBe('true');
    expect(view.container.querySelector('.wpl-required')?.textContent).toBe('*');
    expect(view.container.querySelector('.wpl-sr-only')?.textContent).toBe('required');
    const optional = await render(Label, {});
    expect(optional.container.querySelector('.wpl-required')).toBeNull();
    expect(optional.container.querySelector('.wpl-sr-only')).toBeNull();
  });

  it('uses a time element only when a timeline date is set', async () => {
    const view = await render(Timeline, {
      items: [
        { id: '1', title: 'Draft saved', time: '09:40', dateTime: '2026-10-27T09:40', meta: 'Notes' },
        { id: '2', title: 'Sent', time: '10:05' },
      ],
    });
    const dated = view.container.querySelector('time');
    expect(dated?.getAttribute('datetime')).toBe('2026-10-27T09:40');
    expect(dated?.textContent).toBe('09:40');
    expect(view.container.querySelectorAll('time')).toHaveLength(1);
    expect(view.container.textContent).toContain('Sent');
    expect(view.container.textContent).toContain('10:05');
    expect(view.container.textContent).toContain('Notes');
  });

  it('names an avatar status with hidden text', async () => {
    const view = await render(Avatar, { name: 'Laleh Karimi', status: 'busy', statusLabel: 'Busy' });
    expect(view.container.querySelector('.wpl-avatar-status')?.getAttribute('style')).toContain('--wpl-color-warning');
    expect([...view.container.querySelectorAll('.wpl-sr-only')].map((node) => node.textContent)).toEqual(['Laleh Karimi', 'Busy']);
    expect(view.container.querySelector('[role="img"]')).toBeNull();
    const image = await render(Avatar, { name: 'Laleh Karimi', src: '/laleh.png' });
    expect(image.container.querySelector('img')?.getAttribute('alt')).toBe('Laleh Karimi');
    expect(image.container.querySelector('.wpl-avatar-status')).toBeNull();
  });

  it('uses the requested card heading', async () => {
    const view = await render(Card, { title: 'Analytics', titleAs: 'h3' });
    expect(view.container.querySelector('h3.wpl-card-title')?.textContent).toBe('Analytics');
    expect(view.container.querySelector('h2')).toBeNull();
    const fallback = await render(Card, { title: 'Overview' });
    expect(fallback.container.querySelector('h2.wpl-card-title')?.textContent).toBe('Overview');
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
