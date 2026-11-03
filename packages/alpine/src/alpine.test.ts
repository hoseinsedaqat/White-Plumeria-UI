import { formatDate, parseIsoDate, catalog, toIsoDate } from '@white-plumeria/core';
import Alpine from 'alpinejs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Accordion, Avatar, Breadcrumb, Calendar, Card, Combobox, CommandPalette, ChartContainer, DataTable, DatePicker, DateRangePicker, Divider, DropdownMenu, EmptyState, FileUpload, FormField, Label, Link, Navbar, NavigationMenu, Notification, Pagination, ButtonGroup, PasswordField, Popover, Progress, RadioGroup, RangeSlider, Rating, Skeleton, Slider, Spinner, SplitPane, Separator, Switch, Tabs, Timeline, Tooltip, TreeView, whitePlumeria, pushToast, Button, WhitePlumeriaProvider, Carousel, Steps } from './index.ts';
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
  it('names the date picker calendar button', () => {
    const host = mount(DatePicker, { label: 'Start' });
    const button = host.querySelector('button[aria-label="Choose date"]');
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('.wpl-calendar')).toBeNull();
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    const day = host.querySelector('.wpl-day:not([disabled])');
    day?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(host.querySelector('input')?.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(button?.getAttribute('aria-expanded')).toBe('false');
  });

  it('marks the selected calendar day and today', () => {
    const today = toIsoDate(new Date());
    const host = mount(Calendar, { value: today });
    const selected = host.querySelector('[aria-selected="true"]');
    expect(selected?.getAttribute('aria-current')).toBe('date');
    expect(selected?.getAttribute('role')).toBe('gridcell');
    expect(host.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
    const range = mount(DateRangePicker, { start: today, end: today });
    expect(range.querySelector('[aria-current="date"]')?.getAttribute('aria-selected')).toBe('true');
  });

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
    expect(provider.querySelector('.wpl-toast-region')?.getAttribute('aria-live')).toBe('polite');
    pushToast(provider, { title: 'Failed', variant: 'danger' });
    expect(provider.querySelector('.wpl-toast-region')?.getAttribute('aria-live')).toBe('assertive');
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

  it('omits the current value while progress is indeterminate', () => {
    const waiting = mount(Progress, { label: 'Upload' });
    const bar = waiting.querySelector('[role="progressbar"]');
    expect(bar?.classList.contains('wpl-progress-indeterminate')).toBe(true);
    expect(bar?.hasAttribute('aria-valuenow')).toBe(false);
    expect(bar?.getAttribute('aria-valuemin')).toBe('0');
    expect(bar?.getAttribute('aria-valuemax')).toBe('100');
    const done = mount(Progress, { label: 'Upload', value: 40, max: 80 });
    const known = done.querySelector('[role="progressbar"]');
    expect(known?.getAttribute('aria-valuenow')).toBe('40');
    expect(known?.getAttribute('aria-valuemax')).toBe('80');
    expect(known?.querySelector('.wpl-progress-bar')?.getAttribute('style')).toContain('50%');
  });

  it('closes a popover from escape and an outside pointer', () => {
    const host = mount(Popover, { label: 'Details', content: 'Settles tomorrow' });
    const trigger = host.querySelector('button');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-controls')).toBe(host.querySelector('.wpl-popover')?.id);
    trigger?.click();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('.wpl-popover')?.hasAttribute('hidden')).toBe(true);
    trigger?.click();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(host.querySelector('.wpl-popover')?.hasAttribute('hidden')).toBe(true);
  });

  it('keeps the chart table available and hides the bars', () => {
    const host = mount(ChartContainer, { title: 'Volume', data: [{ label: 'Mon', value: 12 }] });
    expect(host.querySelector('table caption')?.textContent).toBe('Volume');
    expect(host.querySelector('tbody th')?.textContent).toBe('Mon');
    expect(host.querySelector('[aria-hidden="true"] .wpl-chart-bar')).not.toBeNull();
    expect(host.querySelector('[role="img"]')).toBeNull();
    const bad = mount(ChartContainer, { title: 'Volume', data: [{ label: 'Mon', value: -1 }] });
    expect(bad.querySelector('[role="alert"]')?.textContent).toContain('finite');
    expect(bad.querySelector('.wpl-chart-bar')).toBeNull();
    expect(bad.querySelector('table')).not.toBeNull();
  });

  it('submits a switch through a hidden checkbox', () => {
    const host = mount(Switch, { label: 'Reduced motion', name: 'motion', checked: true });
    const button = host.querySelector('button');
    expect(button?.getAttribute('role')).toBe('switch');
    expect(button?.getAttribute('aria-checked')).toBe('true');
    const box = host.querySelector('input') as HTMLInputElement;
    expect(box.name).toBe('motion');
    expect(box.hidden).toBe(true);
    expect(box.checked).toBe(true);
    button?.click();
    expect(button?.getAttribute('aria-checked')).toBe('false');
    expect(box.checked).toBe(false);
    expect(mount(Switch, { label: 'Reduced motion' }).querySelector('input')).toBeNull();
  });

  it('hides the range readout from assistive tech', () => {
    const host = mount(RangeSlider, { label: 'Price', start: 20, end: 80 });
    const readout = host.querySelector('output');
    expect(readout?.getAttribute('aria-hidden')).toBe('true');
    expect(readout?.textContent).toContain('20');
    expect(host.querySelector('[data-edge="start"]')?.getAttribute('aria-label')).toBe('Price start');
  });

  it('shows a read-only rating as a named image', () => {
    const host = mount(Rating, { label: 'Quality', value: 3, readOnly: true });
    const image = host.querySelector('[role="img"]');
    expect(image?.getAttribute('aria-label')).toBe('Quality: 3 of 5');
    expect(host.querySelector('input')).toBeNull();
    expect(host.querySelectorAll('.is-on').length).toBe(3);
    const field = mount(Rating, { label: 'Quality', value: 2 });
    expect(field.querySelector('fieldset')).not.toBeNull();
    expect(field.querySelector('.wpl-sr-only')?.textContent).toBe('1 of 5');
  });

  it('renders an empty state heading and description', () => {
    const host = mount(EmptyState, { title: 'No invoices', description: 'Create the first invoice.' });
    expect(host.querySelector('h2.wpl-empty-title')?.textContent).toBe('No invoices');
    expect(host.querySelector('p.wpl-empty-description')?.textContent).toBe('Create the first invoice.');
  });

  it('names a button group and keeps the buttons direct children', () => {
    const host = mount(ButtonGroup, { label: 'Save options', joined: true, items: [{ label: 'Save' }, { label: 'Draft' }] });
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Save options');
    expect(host.className).toContain('wpl-btn-group-joined');
    expect([...host.children].every((child) => child.tagName === 'BUTTON')).toBe(true);
    expect(host.textContent).toContain('Save');
  });

  it('renders a navigation menu as a named list', () => {
    const host = mount(NavigationMenu, { label: 'Docs', items: [{ href: '#start', label: 'Start', current: true }] });
    const nav = host.querySelector('nav');
    const list = nav?.querySelector(':scope > ul.wpl-nav-menu');
    const current = list?.querySelector('li > a');
    expect(nav?.getAttribute('aria-label')).toBe('Docs');
    expect(list).toBeTruthy();
    expect(current?.getAttribute('aria-current')).toBe('page');
    expect(current?.textContent).toBe('Start');
  });

  it('sizes a spinner without dropping its name', () => {
    const host = mount(Spinner, { size: 'lg', label: 'Saving' });
    const spinner = host.querySelector('[role="status"]');
    expect(spinner?.className).toContain('wpl-spinner-lg');
    expect(spinner?.getAttribute('aria-label')).toBe('Saving');
  });

  it('sizes a skeleton and hides it from assistive tech', () => {
    const host = mount(Skeleton, { width: '12rem', height: '2rem' });
    const bone = host.querySelector('.wpl-skeleton');
    expect(bone?.getAttribute('aria-hidden')).toBe('true');
    expect(bone?.getAttribute('style')).toContain('inline-size:12rem');
    expect(bone?.getAttribute('style')).toContain('block-size:2rem');
    expect(mount(Skeleton, {}).querySelector('.wpl-skeleton')?.getAttribute('style')).toContain('block-size:1rem');
  });

  it('renders a labeled divider as a separator and an unlabeled divider as a rule', () => {
    const labeled = mount(Divider, { label: 'Or' });
    expect(labeled.querySelector('[role="separator"]')?.textContent).toBe('Or');
    expect(labeled.querySelector('.wpl-divider-labeled')).toBeTruthy();
    expect(labeled.querySelector('hr')).toBeNull();
    const plain = mount(Divider, {});
    expect(plain.querySelector('hr.wpl-divider')).toBeTruthy();
    expect(plain.querySelector('[role="separator"]')).toBeNull();
  });

  it('orients a separator and names its axis', () => {
    const host = mount(Separator, { orientation: 'vertical' });
    const rule = host.querySelector('[role="separator"]');
    expect(rule?.tagName).toBe('DIV');
    expect(rule?.getAttribute('aria-orientation')).toBe('vertical');
    expect(rule?.className).toContain('wpl-separator-vertical');
    expect(host.querySelector('hr')).toBeNull();
  });

  it('renders a radio group as a fieldset', () => {
    const host = mount(RadioGroup, {
      label: 'Plan',
      options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }],
    });
    expect(host.querySelector('fieldset')).not.toBeNull();
    expect(host.querySelector('legend')?.textContent).toBe('Plan');
    expect(host.querySelector('[role="radiogroup"]')).toBeNull();
    expect(host.querySelectorAll('input[type="radio"]').length).toBe(2);
  });

  it('names the navbar toggle in the page language', () => {
    const host = mount(Navbar, { brand: 'White Plumeria', items: [{ href: '#docs', label: 'Docs' }] });
    const toggle = host.querySelector('.wpl-navbar-toggle');
    const nav = host.querySelector('nav');
    expect(toggle?.getAttribute('aria-label')).toBe('Open menu');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-controls')).toBe(nav?.id);
    expect(nav?.hasAttribute('hidden')).toBe(false);
    toggle?.click();
    expect(toggle?.getAttribute('aria-label')).toBe('Close menu');
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(host.hasAttribute('data-open')).toBe(true);
    const provider = mount(WhitePlumeriaProvider, { persist: false, locale: 'fa' });
    const nested = document.createElement('div');
    provider.append(nested);
    const data = Navbar({ brand: 'White Plumeria' });
    data.init?.call({ ...data, ...magicFor(nested) });
    expect(nested.querySelector('.wpl-navbar-toggle')?.getAttribute('aria-label')).toBe('باز کردن منو');
  });

  it('names the password reveal button in the provider language', () => {
    const provider = mount(WhitePlumeriaProvider, { persist: false, locale: 'fa' });
    const host = document.createElement('div');
    provider.append(host);
    const data = PasswordField();
    data.init?.call({ ...data, ...magicFor(host) });
    const reveal = host.querySelector('button');
    const input = host.querySelector('input');
    expect(input?.getAttribute('type')).toBe('password');
    expect(reveal?.getAttribute('aria-pressed')).toBe('false');
    expect(reveal?.getAttribute('aria-label')).toBe('نمایش رمز');
    reveal?.click();
    expect(input?.getAttribute('type')).toBe('text');
    expect(reveal?.getAttribute('aria-pressed')).toBe('true');
    expect(reveal?.getAttribute('aria-label')).toBe('پنهان کردن رمز');
  });

  it('waits to show a tooltip and dismisses it with escape', async () => {
    vi.useFakeTimers();
    try {
      const host = mount(Tooltip, { label: 'Hint', content: 'Copy token' });
      const trigger = host.querySelector('button');
      expect(host.querySelector('[role="tooltip"]')?.hasAttribute('hidden')).toBe(true);
      trigger?.dispatchEvent(new FocusEvent('focus'));
      await vi.advanceTimersByTimeAsync(399);
      expect(host.querySelector('[role="tooltip"]')?.hasAttribute('hidden')).toBe(true);
      await vi.advanceTimersByTimeAsync(1);
      expect(host.querySelector('[role="tooltip"]')?.hasAttribute('hidden')).toBe(false);
      expect(trigger?.getAttribute('aria-describedby')).toBe(host.querySelector('[role="tooltip"]')?.id);
      trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(host.querySelector('[role="tooltip"]')?.hasAttribute('hidden')).toBe(true);
      expect(trigger?.hasAttribute('aria-describedby')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('names steps in the provider language', () => {
    const provider = mount(WhitePlumeriaProvider, { persist: false, locale: 'fa' });
    const host = document.createElement('div');
    provider.append(host);
    const data = Steps();
    data.init?.call({ ...data, ...magicFor(host) });
    expect(host.querySelector('.wpl-steps')?.getAttribute('aria-label')).toBe('مراحل');
  });

  it('names a spinner in the provider language', () => {
    const provider = mount(WhitePlumeriaProvider, { persist: false, locale: 'fa' });
    const host = document.createElement('div');
    provider.append(host);
    const data = Spinner();
    data.init?.call({ ...data, ...magicFor(host) });
    expect(host.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('در حال بارگذاری');
    const named = mount(Spinner, { label: 'Saving' });
    expect(named.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Saving');
  });

  it('names the active command and chooses it from the keyboard', () => {
    const chosen: unknown[] = [];
    const host = mount(CommandPalette, {
      commands: [
        { id: 'docs', label: 'Open docs', group: 'Navigate' },
        { id: 'theme', label: 'Switch theme', keywords: ['dark'] },
      ],
    });
    host.addEventListener('wpl-select', (event) => chosen.push((event as CustomEvent).detail));
    const input = host.querySelector<HTMLInputElement>('[role="combobox"]');
    expect(input?.getAttribute('aria-controls')).toBe(host.querySelector('[role="listbox"]')?.id);
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    const active = host.querySelector('[data-active="true"]');
    expect(active?.textContent).toContain('Switch theme');
    expect(input?.getAttribute('aria-activedescendant')).toBe(active?.id);
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(chosen).toEqual([{ id: 'theme' }]);
    if (input) input.value = 'dark';
    input?.dispatchEvent(new Event('input'));
    expect(host.querySelectorAll('[role="option"]').length).toBe(1);
    expect(host.querySelector('[role="option"]')?.textContent).toContain('Switch theme');
  });

  it('names the active menu item and opens its submenu from the keyboard', () => {
    const events: unknown[] = [];
    const host = mount(DropdownMenu, {
      label: 'Account',
      items: [
        { id: 'profile', label: 'Profile' },
        { id: 'theme', label: 'Theme', items: [{ id: 'ivory', label: 'Ivory' }] },
      ],
    });
    host.addEventListener('wpl-select', (event) => events.push((event as CustomEvent).detail));
    const trigger = host.querySelector('button');
    expect(trigger?.hasAttribute('aria-activedescendant')).toBe(false);
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    const active = host.querySelector('[data-active="true"]');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger?.getAttribute('aria-activedescendant')).toBe(active?.id);
    expect(active?.textContent).toContain('Profile');
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    const nested = host.querySelector('[data-active="true"]');
    expect(nested?.textContent).toContain('Ivory');
    expect(trigger?.getAttribute('aria-activedescendant')).toBe(nested?.id);
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(events).toEqual([{ id: 'ivory' }]);
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
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

  it('names an avatar status with hidden text', () => {
    const host = mount(Avatar, { name: 'Laleh Karimi', status: 'busy', statusLabel: 'Busy' });
    expect(host.querySelector('.wpl-avatar-status')?.getAttribute('style')).toContain('--wpl-color-warning');
    expect([...host.querySelectorAll('.wpl-sr-only')].map((node) => node.textContent)).toEqual(['Laleh Karimi', 'Busy']);
    expect(host.querySelector('[role="img"]')).toBeNull();
    const image = mount(Avatar, { name: 'Laleh Karimi', src: '/laleh.png' });
    expect(image.querySelector('img')?.getAttribute('alt')).toBe('Laleh Karimi');
    expect(image.querySelector('.wpl-avatar-status')).toBeNull();
  });

  it('hides the required word on a label', () => {
    const host = mount(Label, { label: 'Email', required: true });
    expect(host.querySelector('.wpl-required')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('.wpl-required')?.textContent).toBe('*');
    expect(host.querySelector('.wpl-sr-only')?.textContent).toBe('required');
    const optional = mount(Label, { label: 'Name' });
    expect(optional.querySelector('.wpl-required')).toBeNull();
    expect(optional.querySelector('.wpl-sr-only')).toBeNull();
  });

  it('uses a time element only when a timeline date is set', () => {
    const host = mount(Timeline, {
      items: [
        { id: '1', title: 'Draft saved', time: '09:40', dateTime: '2026-10-27T09:40', meta: 'Notes' },
        { id: '2', title: 'Sent', time: '10:05' },
      ],
    });
    const dated = host.querySelector('time');
    expect(dated?.getAttribute('datetime')).toBe('2026-10-27T09:40');
    expect(dated?.textContent).toBe('09:40');
    expect(host.querySelectorAll('time')).toHaveLength(1);
    expect(host.textContent).toContain('Sent');
    expect(host.textContent).toContain('10:05');
    expect(host.textContent).toContain('Notes');
  });

  it('uses the requested card heading', () => {
    const host = mount(Card, { title: 'Analytics', titleAs: 'h3' });
    expect(host.querySelector('h3.wpl-card-title')?.textContent).toBe('Analytics');
    expect(host.querySelector('h2')).toBeNull();
    const fallback = mount(Card, { title: 'Overview' });
    expect(fallback.querySelector('h2.wpl-card-title')?.textContent).toBe('Overview');
  });

  it('names the active combobox option and chooses it from the keyboard', () => {
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
    const input = host.querySelector<HTMLInputElement>('[role="combobox"]');
    expect(input?.getAttribute('aria-expanded')).toBe('false');
    expect(input?.hasAttribute('aria-activedescendant')).toBe(false);
    expect(host.querySelector('label')?.getAttribute('for')).toBe(input?.id);
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    const active = host.querySelector('[data-active="true"]');
    expect(input?.getAttribute('aria-expanded')).toBe('true');
    expect(input?.getAttribute('aria-activedescendant')).toBe(active?.id);
    expect(active?.textContent).toBe('Ink');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(chosen).toEqual(['ink']);
    expect(input?.value).toBe('Ink');
    expect(input?.getAttribute('aria-expanded')).toBe('false');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(host.querySelector('[data-active="true"]')?.textContent).toBe('Saffron');
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(chosen).toEqual(['ink']);
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(input?.getAttribute('aria-expanded')).toBe('false');
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
