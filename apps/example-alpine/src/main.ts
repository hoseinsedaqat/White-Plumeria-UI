import Alpine from 'alpinejs';
import type { ThemeName } from '@white-plumeria/tokens';
import { DataTable, pushToast, whitePlumeria, type DataColumn } from '@white-plumeria/alpine';
import '@white-plumeria/styles';
import './desk.css';

interface Booking {
  id: string;
  guest: string;
  arrive: string;
  nights: number;
  amount: number;
  status: 'hold' | 'confirmed' | 'cancelled';
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

const columns: DataColumn<Booking>[] = [
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

Alpine.plugin(whitePlumeria);

Alpine.data('bookingTable', () => {
  const table = DataTable({ caption: 'Bookings in this stay window', columns, rows: visible() });
  return {
    init(this: { $el: HTMLElement; $dispatch: (name: string, detail?: unknown) => void; $watch: (property: string, callback: (value: unknown) => void) => void; $nextTick: (callback: () => void) => void }) {
      table.init?.call(this);
    },
    refresh() {
      table.setRows(visible());
    },
  };
});

function component(name: string, config: object): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('x-data', `${name}(${JSON.stringify(config)})`);
  return el;
}

const app = document.querySelector('#app');
if (app) {
  const provider = document.createElement('div');
  provider.setAttribute('x-data', "WhitePlumeriaProvider({ persist: false, theme: 'white', appearance: 'light' })");
  provider.className = 'desk';

  const title = document.createElement('h1');
  title.textContent = 'Atelier desk';
  const lede = document.createElement('p');
  lede.className = 'desk-note';
  lede.textContent = 'Alpine.js 3.17. Bookings stay in this tab.';

  const themesRow = document.createElement('div');
  themesRow.className = 'desk-themes';
  for (const theme of themes) {
    const button = component('Button', { label: theme[0]?.toUpperCase() + theme.slice(1), variant: theme === 'white' ? 'primary' : 'secondary' });
    button.addEventListener('wpl-click', () => {
      provider.dispatchEvent(new CustomEvent('wpl-theme', { detail: { theme } }));
    });
    themesRow.append(button);
  }
  const light = component('Button', { label: 'Light', variant: 'ghost' });
  const dark = component('Button', { label: 'Dark', variant: 'ghost' });
  light.addEventListener('wpl-click', () => provider.dispatchEvent(new CustomEvent('wpl-appearance', { detail: { appearance: 'light' } })));
  dark.addEventListener('wpl-click', () => provider.dispatchEvent(new CustomEvent('wpl-appearance', { detail: { appearance: 'dark' } })));
  const locale = component('Button', { label: 'فارسی', variant: 'ghost' });
  locale.addEventListener('wpl-click', () => {
    const next = provider.getAttribute('lang') === 'fa' ? 'en' : 'fa';
    provider.dispatchEvent(new CustomEvent('wpl-locale', { detail: { locale: next } }));
    status.textContent = next === 'fa' ? 'جهت صفحه راست‌به‌چپ شد.' : state.note;
  });
  themesRow.append(light, dark, locale);

  const range = component('DateRangePicker', {
    label: 'Stay window',
    start: state.start,
    end: state.end,
    showTime: true,
    startTime: '09:00',
    endTime: '18:00',
  });
  const table = document.createElement('div');
  table.setAttribute('x-data', 'bookingTable');
  table.addEventListener('wpl-select', (event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail.id;
    if (!id) return;
    state.selected = id;
    status.textContent = `${id} selected.`;
    replaceSteps();
  });
  range.addEventListener('wpl-change', (event) => {
    const detail = (event as CustomEvent<{ start: string; end: string }>).detail;
    state.start = detail.start;
    state.end = detail.end;
    (Alpine.$data(table) as { refresh?: () => void }).refresh?.();
    status.textContent = `Showing ${detail.start || 'any'} to ${detail.end || 'any'}.`;
  });

  const menu = component('DropdownMenu', {
    label: 'Set status',
    items: [
      { id: 'confirmed', label: 'Confirmed' },
      { id: 'hold', label: 'Hold' },
      { id: 'cancelled', label: 'Cancelled' },
    ],
  });
  menu.addEventListener('wpl-select', (event) => {
    const id = (event as CustomEvent<{ id: Booking['status'] }>).detail.id;
    const booking = selected();
    if (!booking) return;
    booking.status = id;
    (Alpine.$data(table) as { refresh?: () => void }).refresh?.();
    status.textContent = `${booking.id} is now ${labelStatus(id).toLowerCase()}.`;
    replaceSteps();
  });

  const dialog = component('Dialog', {
    title: 'Cancel this booking?',
    description: 'The change stays in this tab. It is not sent anywhere.',
    trigger: 'Cancel booking',
    confirm: 'Cancel booking',
  });
  dialog.addEventListener('wpl-confirm', () => {
    const booking = selected();
    if (!booking) return;
    booking.status = 'cancelled';
    (Alpine.$data(table) as { refresh?: () => void }).refresh?.();
    pushToast(provider, { title: `${booking.id} cancelled`, variant: 'warning' });
    status.textContent = `${booking.id} cancelled in this tab.`;
  });

  const save = component('Button', { label: 'Save note', variant: 'primary' });
  save.addEventListener('wpl-click', () => {
    state.note = state.fileName ? `Saved with ${state.fileName}.` : 'Saved in this tab.';
    status.textContent = state.note;
    pushToast(provider, { title: 'Saved', description: state.note, variant: 'success' });
  });

  const upload = component('FileUpload', { label: 'Floor plan', accept: '.pdf,application/pdf', maxSize: 2_000_000 });
  upload.addEventListener('wpl-change', (event) => {
    const files = (event as CustomEvent<{ files?: string[] }>).detail.files ?? [];
    state.fileName = files[0] ?? '';
    status.textContent = state.fileName ? `${state.fileName} is ready to save.` : state.note;
  });
  upload.addEventListener('wpl-reject', () => {
    status.textContent = 'That file was rejected. Use a PDF under 2 MB.';
  });

  const carousel = component('Carousel', {
    label: 'House notes',
    slides: [
      { id: 'window', label: 'Window', content: 'October is the default stay window. Widen it to include November.' },
      { id: 'status', label: 'Status', content: 'Set status from the menu. Cancel asks before it changes the row.' },
      { id: 'save', label: 'Save', content: 'Save writes a note in this tab. It does not call a server.' },
    ],
  });

  const status = document.createElement('p');
  status.className = 'desk-status';
  status.textContent = state.note;

  function renderSteps(): HTMLElement {
    const booking = selected();
    const value = booking?.status === 'cancelled' ? 'hold' : booking?.status === 'confirmed' ? 'confirm' : 'hold';
    const el = component('Steps', {
      label: 'Booking',
      value,
      items: [
        { id: 'hold', title: 'Hold', description: 'The date can still move.' },
        { id: 'confirm', title: 'Confirm', description: 'The guest has a room.' },
        { id: 'arrive', title: 'Arrive', description: booking ? `${booking.guest} arrives ${booking.arrive}.` : 'Choose a row.' },
      ],
    });
    return el;
  }

  let steps = renderSteps();
  const replaceSteps = () => {
    const next = renderSteps();
    steps.replaceWith(next);
    Alpine.initTree(next);
    steps = next;
  };
  const side = document.createElement('section');
  side.className = 'desk-panel';
  const sideTitle = document.createElement('h2');
  sideTitle.textContent = 'Selected stay';
  const actions = document.createElement('div');
  actions.className = 'desk-actions';
  actions.append(menu, save);
  side.append(sideTitle, steps, actions, dialog, upload, carousel, status);

  const main = document.createElement('section');
  main.className = 'desk-panel';
  const tableTitle = document.createElement('h2');
  tableTitle.textContent = 'Bookings';
  main.append(tableTitle, range, table);

  const grid = document.createElement('div');
  grid.className = 'desk-grid';
  grid.append(main, side);

  provider.append(title, lede, themesRow, grid);
  app.replaceChildren(provider);
  Alpine.start();
}
