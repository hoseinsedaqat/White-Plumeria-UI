import {
  Alert,
  Badge,
  Button,
  Carousel,
  DataTable,
  DateRangePicker,
  Dialog,
  DropdownMenu,
  FileUpload,
  StatCard,
  Steps,
  WhitePlumeriaProvider,
  pushToast,
} from '@white-plumeria/ember';
import { renderComponent } from '@ember/renderer';
import type { ThemeName } from '@white-plumeria/tokens';
import '@white-plumeria/styles';
import './desk.css';

interface Column {
  id: string;
  header: string;
  text: (row: Booking) => string;
  sortValue?: (row: Booking) => string | number;
}

interface Booking {
  id: string;
  guest: string;
  arrive: string;
  nights: number;
  amount: number;
  status: 'hold' | 'confirmed' | 'cancelled';
}

interface Rendered {
  destroy(): void;
}

const bookings: Booking[] = [
  { id: 'BK-204', guest: 'North Atelier', arrive: '2026-10-03', nights: 3, amount: 840, status: 'confirmed' },
  { id: 'BK-211', guest: 'Paper & Pine', arrive: '2026-10-12', nights: 2, amount: 560, status: 'hold' },
  { id: 'BK-218', guest: 'Lagoon Press', arrive: '2026-10-18', nights: 4, amount: 1280, status: 'hold' },
  { id: 'BK-226', guest: 'Saffron Studio', arrive: '2026-10-27', nights: 2, amount: 640, status: 'confirmed' },
  { id: 'BK-230', guest: 'Ivory Goods', arrive: '2026-11-02', nights: 5, amount: 2100, status: 'hold' },
];

const state = {
  start: '2026-10-01',
  end: '2026-10-31',
  selected: 'BK-211',
  note: 'Session not saved. Nothing leaves this tab.',
  fileName: '',
};

const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });
const themes: ThemeName[] = ['white', 'ivory', 'ink', 'saffron', 'lagoon', 'blush'];
const columns: Column[] = [
  { id: 'id', header: 'Booking', text: (row) => row.id },
  { id: 'guest', header: 'Guest', text: (row) => row.guest },
  { id: 'arrive', header: 'Arrive', text: (row) => row.arrive, sortValue: (row) => row.arrive },
  { id: 'nights', header: 'Nights', text: (row) => String(row.nights), sortValue: (row) => row.nights },
  { id: 'amount', header: 'Amount', text: (row) => money.format(row.amount), sortValue: (row) => row.amount },
  { id: 'status', header: 'Status', text: (row) => labelStatus(row.status) },
];

function labelStatus(status: Booking['status']): string {
  if (status === 'hold') return 'Hold';
  if (status === 'confirmed') return 'Confirmed';
  return 'Cancelled';
}

function visible(): Booking[] {
  return bookings.filter((booking) => {
    if (state.start && booking.arrive < state.start) return false;
    if (state.end && booking.arrive > state.end) return false;
    return true;
  });
}

function selected(): Booking | undefined {
  return bookings.find((booking) => booking.id === state.selected) ?? visible()[0];
}

function slot(): HTMLElement {
  return document.createElement('div');
}

function place(component: unknown, args: Record<string, unknown>, into: HTMLElement): Rendered {
  return renderComponent(component as never, { into, args }) as Rendered;
}

const app = document.querySelector('#app');
if (app instanceof HTMLElement) {
  place(WhitePlumeriaProvider, { persist: false, theme: 'white', appearance: 'light' }, app);
  app.classList.add('desk');

  const head = document.createElement('header');
  head.className = 'desk-head';
  const title = document.createElement('div');
  const heading = document.createElement('h1');
  heading.textContent = 'Atelier desk';
  const lede = document.createElement('p');
  lede.className = 'desk-note';
  lede.textContent = 'Ember 7.4. Bookings stay in this tab.';
  title.append(heading, lede);

  const themesRow = document.createElement('div');
  themesRow.className = 'desk-themes';
  for (const theme of themes) {
    const host = slot();
    place(Button, { label: theme[0]?.toUpperCase() + theme.slice(1), variant: theme === 'white' ? 'primary' : 'secondary' }, host);
    host.addEventListener('wpl-click', () => {
      app.dispatchEvent(new CustomEvent('wpl-theme', { detail: { theme } }));
    });
    themesRow.append(host);
  }
  const light = slot();
  const dark = slot();
  const locale = slot();
  place(Button, { label: 'Light', variant: 'ghost' }, light);
  place(Button, { label: 'Dark', variant: 'ghost' }, dark);
  place(Button, { label: 'فارسی', variant: 'ghost' }, locale);
  light.addEventListener('wpl-click', () => app.dispatchEvent(new CustomEvent('wpl-appearance', { detail: { appearance: 'light' } })));
  dark.addEventListener('wpl-click', () => app.dispatchEvent(new CustomEvent('wpl-appearance', { detail: { appearance: 'dark' } })));
  locale.addEventListener('wpl-click', () => {
    const next = app.getAttribute('lang') === 'fa' ? 'en' : 'fa';
    app.dispatchEvent(new CustomEvent('wpl-locale', { detail: { locale: next } }));
    app.dispatchEvent(new CustomEvent('wpl-direction', { detail: { direction: next === 'fa' ? 'rtl' : 'ltr' } }));
    setStatus(next === 'fa' ? 'جهت صفحه راست‌به‌چپ شد.' : state.note);
  });
  themesRow.append(light, dark, locale);
  head.append(title, themesRow);

  const stats = document.createElement('div');
  stats.className = 'desk-stats';
  const count = slot();
  const total = slot();
  const held = slot();
  stats.append(count, total, held);

  const alert = slot();
  place(Alert, { title: 'Local only', description: 'Saving a note writes nothing outside this tab.', variant: 'neutral' }, alert);

  const range = slot();
  place(DateRangePicker, { label: 'Stay window', start: state.start, end: state.end, showTime: true, startTime: '09:00', endTime: '18:00' }, range);
  range.addEventListener('wpl-change', (event) => {
    const detail = (event as CustomEvent<{ start?: string; end?: string }>).detail;
    state.start = detail.start ?? '';
    state.end = detail.end ?? '';
    paint();
    setStatus(`Showing ${state.start || 'any'} to ${state.end || 'any'}.`);
  });

  const table = slot();
  table.addEventListener('wpl-select', (event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail.id;
    if (!id) return;
    state.selected = id;
    paint();
    setStatus(`${id} selected.`);
  });

  const steps = slot();
  const badge = slot();
  const menu = slot();
  place(DropdownMenu, {
    label: 'Set status',
    items: [
      { id: 'confirmed', label: 'Confirmed' },
      { id: 'hold', label: 'Hold' },
      { id: 'cancelled', label: 'Cancelled' },
    ],
  }, menu);
  menu.addEventListener('wpl-select', (event) => {
    const id = (event as CustomEvent<{ id?: Booking['status'] }>).detail.id;
    const booking = selected();
    if (!booking || !id) return;
    booking.status = id;
    paint();
    setStatus(`${booking.id} is now ${labelStatus(id).toLowerCase()}.`);
  });

  const dialog = slot();
  place(Dialog, {
    title: 'Cancel this booking?',
    description: 'The change stays in this tab. It is not sent anywhere.',
    trigger: 'Cancel booking',
    confirm: 'Cancel booking',
  }, dialog);
  dialog.addEventListener('wpl-confirm', () => {
    const booking = selected();
    if (!booking) return;
    booking.status = 'cancelled';
    paint();
    pushToast(app, { title: `${booking.id} cancelled`, variant: 'warning' });
    setStatus(`${booking.id} cancelled in this tab.`);
  });

  const save = slot();
  place(Button, { label: 'Save note', variant: 'primary' }, save);
  save.addEventListener('wpl-click', () => {
    state.note = state.fileName ? `Saved with ${state.fileName}.` : 'Saved in this tab.';
    setStatus(state.note);
    pushToast(app, { title: 'Saved', description: state.note, variant: 'success' });
  });

  const upload = slot();
  place(FileUpload, { label: 'Floor plan', accept: '.pdf,application/pdf', maxSize: 2_000_000 }, upload);
  upload.addEventListener('wpl-change', (event) => {
    const files = (event as CustomEvent<{ files?: string[] }>).detail.files ?? [];
    state.fileName = files[0] ?? '';
    setStatus(state.fileName ? `${state.fileName} is ready to save.` : state.note);
  });
  upload.addEventListener('wpl-reject', () => {
    setStatus('That file was rejected. Use a PDF under 2 MB.');
  });

  const carousel = slot();
  place(Carousel, {
    label: 'House notes',
    slides: [
      { id: 'window', label: 'Window', content: 'October is the default stay window. Widen it to include November.' },
      { id: 'status', label: 'Status', content: 'Set status from the menu. Cancel asks before it changes the row.' },
      { id: 'save', label: 'Save', content: 'Save writes a note in this tab. It does not call a server.' },
    ],
  }, carousel);

  const status = document.createElement('p');
  status.className = 'desk-status';
  status.textContent = state.note;

  const side = document.createElement('section');
  side.className = 'desk-panel';
  const sideTitle = document.createElement('h2');
  sideTitle.textContent = 'Selected stay';
  const actions = document.createElement('div');
  actions.className = 'desk-actions';
  actions.append(menu, save);
  side.append(sideTitle, badge, steps, actions, dialog, upload, carousel, status);

  const main = document.createElement('section');
  main.className = 'desk-panel';
  const tableTitle = document.createElement('h2');
  tableTitle.textContent = 'Bookings';
  main.append(tableTitle, range, table);

  const grid = document.createElement('div');
  grid.className = 'desk-grid';
  grid.append(main, side);
  app.append(head, alert, stats, grid);

  const rendered = new Map<HTMLElement, Rendered>();
  function mount(component: unknown, args: Record<string, unknown>, into: HTMLElement): void {
    rendered.get(into)?.destroy();
    rendered.set(into, place(component, args, into));
  }

  function paint(): void {
    const rows = visible();
    const current = selected();
    if (current) state.selected = current.id;
    mount(StatCard, { label: 'In window', value: String(rows.length), hint: 'Filtered stays' }, count);
    mount(StatCard, { label: 'Total', value: money.format(rows.reduce((sum, row) => sum + row.amount, 0)), hint: 'This tab only' }, total);
    mount(StatCard, { label: 'On hold', value: String(rows.filter((row) => row.status === 'hold').length), hint: 'Not confirmed' }, held);
    mount(DataTable, { caption: 'Bookings in this stay window', columns, rows }, table);
    mount(Badge, { label: current ? `${current.id} · ${labelStatus(current.status)}` : 'No row', variant: current?.status === 'cancelled' ? 'danger' : 'neutral' }, badge);
    mount(Steps, {
      label: 'Booking',
      value: current?.status === 'confirmed' ? 'confirm' : 'hold',
      items: [
        { id: 'hold', title: 'Hold', description: 'The date can still move.' },
        { id: 'confirm', title: 'Confirm', description: 'The guest has a room.' },
        { id: 'arrive', title: 'Arrive', description: current ? `${current.guest} arrives ${current.arrive}.` : 'Choose a row.' },
      ],
    }, steps);
  }

  function setStatus(text: string): void {
    status.textContent = text;
  }

  paint();
}
