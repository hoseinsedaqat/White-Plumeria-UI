import { html, render, type TemplateResult } from 'lit';
import type { ThemeName } from '@white-plumeria/tokens';
import {
  defineWhitePlumeria,
  type DateRangeValue,
  type DateTimeRangeValue,
  type WhitePlumeriaProvider,
} from '@white-plumeria/lit';
import '@white-plumeria/styles';
import './desk.css';

interface Invoice {
  id: string;
  client: string;
  issued: string;
  amount: number;
  status: 'open' | 'paid' | 'void';
}

const seed: Invoice[] = [
  { id: 'INV-1042', client: 'North Atelier', issued: '2026-09-28', amount: 840, status: 'paid' },
  { id: 'INV-1048', client: 'Paper & Pine', issued: '2026-10-03', amount: 1260, status: 'open' },
  { id: 'INV-1051', client: 'Lagoon Press', issued: '2026-10-11', amount: 640, status: 'open' },
  { id: 'INV-1056', client: 'Saffron Studio', issued: '2026-10-19', amount: 2100, status: 'open' },
  { id: 'INV-1060', client: 'Ivory Goods', issued: '2026-10-27', amount: 480, status: 'paid' },
  { id: 'INV-1064', client: 'Harbor Notes', issued: '2026-11-02', amount: 990, status: 'open' },
];

const steps = [
  { id: 'draft', title: 'Draft', description: 'Records can still be voided.' },
  { id: 'review', title: 'Review', description: 'Check the period before sending.' },
  { id: 'send', title: 'Send', description: 'Save writes a note in this tab.' },
];

const slides = [
  { id: 'filter', label: 'Filter', content: 'October is the default period. Widen the range to include September and November.' },
  { id: 'void', label: 'Void', content: 'Void asks for confirmation and only applies to an open invoice.' },
  { id: 'save', label: 'Save', content: 'Save keeps a note in this browser tab. It does not call a server.' },
];

const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

const state = {
  theme: 'white' as ThemeName,
  appearance: 'light' as 'light' | 'dark',
  invoices: seed.map((invoice) => ({ ...invoice })),
  start: '2026-10-01',
  end: '2026-10-31',
  startTime: '09:00',
  endTime: '18:00',
  selected: 'INV-1048',
  step: 'draft',
  fileName: '',
  note: 'Session not saved.',
  confirm: false,
};

const columns = [
  { id: 'id', header: 'Invoice', text: (row: Invoice) => row.id },
  { id: 'client', header: 'Client', text: (row: Invoice) => row.client },
  { id: 'issued', header: 'Issued', text: (row: Invoice) => row.issued, sortValue: (row: Invoice) => row.issued },
  { id: 'amount', header: 'Amount', text: (row: Invoice) => money.format(row.amount), sortValue: (row: Invoice) => row.amount },
  { id: 'status', header: 'Status', text: (row: Invoice) => labelStatus(row.status) },
];

function labelStatus(status: Invoice['status']): string {
  if (status === 'open') return 'Open';
  if (status === 'paid') return 'Paid';
  return 'Void';
}

function inPeriod(invoice: Invoice): boolean {
  if (state.start && invoice.issued < state.start) return false;
  if (state.end && invoice.issued > state.end) return false;
  return true;
}

function visibleInvoices(): Invoice[] {
  return state.invoices.filter(inPeriod);
}

function selectedInvoice(): Invoice | undefined {
  return state.invoices.find((invoice) => invoice.id === state.selected);
}

function chooseTheme(theme: ThemeName): void {
  state.theme = theme;
  paint();
}

function stepCopy(): string {
  if (state.step === 'review') return 'Review the filtered period, then void anything that should not be sent.';
  if (state.step === 'send') return 'Saving records the open count for this tab. It does not email a client.';
  return 'Draft mode. Void an open invoice or change the period before review.';
}

function paint(): void {
  const host = document.querySelector('#app');
  const provider = host?.querySelector('wpl-provider');
  const view = host?.querySelector('.desk-view');
  if (!(provider instanceof HTMLElement) || !(view instanceof HTMLElement)) return;
  const desk = provider as WhitePlumeriaProvider;
  desk.theme = state.theme;
  desk.appearance = state.appearance;
  render(template(), view);
}

function template(): TemplateResult {
  const visible = visibleInvoices();
  const selected = selectedInvoice();
  const openCount = state.invoices.filter((invoice) => invoice.status === 'open').length;
  const canVoid = selected?.status === 'open';
  return html`
    <main class="desk" id="top">
      <wpl-navbar
        brand="Studio desk"
        href="#top"
        .items=${[
          { href: '#invoices', label: 'Invoices', current: true },
          { href: '#period', label: 'Period' },
          { href: '#send', label: 'Send' },
        ]}
      ></wpl-navbar>
      <wpl-breadcrumb .items=${[{ href: '#top', label: 'Studio desk' }, { label: 'Invoices' }]}></wpl-breadcrumb>
      <wpl-page-header title="Studio desk" description="Filter sample invoices, void an open one, and save a note in this tab."></wpl-page-header>
      <div class="desk-themes" role="group" aria-label="Theme">
        <wpl-button variant=${state.theme === 'white' ? 'primary' : 'ghost'} size="sm" @wpl-click=${() => chooseTheme('white')}>White</wpl-button>
        <wpl-button variant=${state.theme === 'ivory' ? 'primary' : 'ghost'} size="sm" @wpl-click=${() => chooseTheme('ivory')}>Ivory</wpl-button>
        <wpl-button variant=${state.theme === 'ink' ? 'primary' : 'ghost'} size="sm" @wpl-click=${() => chooseTheme('ink')}>Ink</wpl-button>
        <wpl-button variant=${state.theme === 'saffron' ? 'primary' : 'ghost'} size="sm" @wpl-click=${() => chooseTheme('saffron')}>Saffron</wpl-button>
        <wpl-button variant=${state.theme === 'lagoon' ? 'primary' : 'ghost'} size="sm" @wpl-click=${() => chooseTheme('lagoon')}>Lagoon</wpl-button>
        <wpl-button variant=${state.theme === 'blush' ? 'primary' : 'ghost'} size="sm" @wpl-click=${() => chooseTheme('blush')}>Blush</wpl-button>
        <wpl-switch
          label="Dark mode"
          .checked=${state.appearance === 'dark'}
          @wpl-change=${(event: Event) => {
            const value = (event as CustomEvent<{ value: boolean }>).detail.value;
            state.appearance = value ? 'dark' : 'light';
            paint();
          }}
        ></wpl-switch>
      </div>
      <p class="desk-status">${state.note} ${openCount} open sample invoices remain.</p>
      <div class="desk-grid">
        <section class="desk-panel" id="invoices" aria-labelledby="invoices-title">
          <h2 id="invoices-title">Sample invoices</h2>
          <p class="desk-note">Showing ${visible.length} of ${state.invoices.length} records in the selected period.</p>
          <wpl-data-table caption="Sample invoices" .columns=${columns} .rows=${visible} page-size="4"></wpl-data-table>
        </section>
        <div class="desk-panel" id="period">
          <h2>Period</h2>
          <wpl-date-range-picker
            label="Statement period"
            show-time
            start=${state.start}
            end=${state.end}
            start-time=${state.startTime}
            end-time=${state.endTime}
            @wpl-change=${(event: Event) => {
              const value = (event as CustomEvent<{ value: DateRangeValue | DateTimeRangeValue }>).detail.value;
              state.start = value.start;
              state.end = value.end;
              if ('startTime' in value) {
                state.startTime = value.startTime ?? '';
                state.endTime = value.endTime ?? '';
              }
              const stillVisible = visibleInvoices().some((invoice) => invoice.id === state.selected);
              if (!stillVisible) state.selected = visibleInvoices().find((invoice) => invoice.status === 'open')?.id ?? '';
              paint();
            }}
          ></wpl-date-range-picker>
          <wpl-form-field label="Invoice to void" hint="Only an open invoice can be voided.">
            <wpl-select
              placeholder="Choose an invoice"
              .value=${state.selected}
              .options=${state.invoices.map((invoice) => ({
                value: invoice.id,
                label: `${invoice.id} · ${invoice.client} · ${labelStatus(invoice.status)}`,
              }))}
              @wpl-change=${(event: Event) => {
                state.selected = (event as CustomEvent<{ value: string }>).detail.value;
                paint();
              }}
            ></wpl-select>
          </wpl-form-field>
          <div class="desk-actions">
            <wpl-button
              variant="danger"
              ?disabled=${!canVoid}
              @wpl-click=${() => {
                if (!canVoid) return;
                state.confirm = true;
                paint();
              }}
            >Void invoice</wpl-button>
            <wpl-button
              variant="ghost"
              @wpl-click=${() => {
                state.invoices = seed.map((invoice) => ({ ...invoice }));
                state.selected = 'INV-1048';
                state.note = 'Sample records restored. Session not saved.';
                state.confirm = false;
                paint();
                const provider = document.querySelector('wpl-provider') as WhitePlumeriaProvider | null;
                provider?.pushToast({ title: 'Samples restored', description: 'The six sample invoices are back.', variant: 'neutral' });
              }}
            >Restore samples</wpl-button>
          </div>
          <p class="desk-note">${selected ? `${selected.id} is ${labelStatus(selected.status).toLowerCase()}.` : 'No invoice is selected.'}</p>
        </div>
      </div>
      <section class="desk-panel" id="send" aria-labelledby="send-title">
        <h2 id="send-title">Send</h2>
        <wpl-steps
          interactive
          label="Send an invoice"
          .items=${steps}
          .value=${state.step}
          @wpl-change=${(event: Event) => {
            state.step = (event as CustomEvent<{ value: string }>).detail.value;
            paint();
          }}
        ></wpl-steps>
        <p class="desk-note">${stepCopy()}</p>
        <wpl-carousel label="How this desk works" loop .slides=${slides}></wpl-carousel>
        <wpl-file-upload
          label="Attach a sample PDF"
          accept="application/pdf"
          max-size="2000000"
          @wpl-change=${(event: Event) => {
            const files = (event as CustomEvent<{ value: File[] }>).detail.value;
            state.fileName = files[0]?.name ?? '';
            paint();
          }}
        ></wpl-file-upload>
        <p class="desk-note">${state.fileName ? `Attached ${state.fileName}.` : 'No PDF attached. Other file types are rejected.'}</p>
        <div class="desk-actions">
          <wpl-button
            variant="primary"
            @wpl-click=${() => {
              const count = state.invoices.filter((invoice) => invoice.status === 'open').length;
              state.note = `Saved in this tab at ${new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}.`;
              paint();
              const provider = document.querySelector('wpl-provider') as WhitePlumeriaProvider | null;
              provider?.pushToast({
                title: 'Saved in this tab',
                description: `${count} open sample invoices. No server was called.`,
                variant: 'success',
              });
            }}
          >Save session</wpl-button>
        </div>
      </section>
      <wpl-dialog
        .open=${state.confirm}
        title="Void this invoice?"
        .description=${selected ? `${selected.id} for ${selected.client} (${money.format(selected.amount)}) will be marked void in this tab.` : ''}
        @wpl-open-change=${() => {
          state.confirm = false;
          paint();
        }}
      >
        <wpl-button
          variant="danger"
          @wpl-click=${() => {
            const invoice = selectedInvoice();
            if (!invoice || invoice.status !== 'open') return;
            invoice.status = 'void';
            state.confirm = false;
            state.note = `${invoice.id} was voided in this tab.`;
            paint();
            const provider = document.querySelector('wpl-provider') as WhitePlumeriaProvider | null;
            provider?.pushToast({ title: 'Invoice voided', description: invoice.id, variant: 'warning' });
          }}
        >Confirm void</wpl-button>
      </wpl-dialog>
    </main>
  `;
}

defineWhitePlumeria();

const app = document.querySelector('#app');
if (app) {
  const provider = document.createElement('wpl-provider') as WhitePlumeriaProvider;
  provider.persist = false;
  provider.setAttribute('theme', state.theme);
  provider.setAttribute('locale', 'en');
  provider.locale = 'en';
  provider.direction = 'ltr';
  provider.appearance = state.appearance;
  const view = document.createElement('div');
  view.className = 'desk-view';
  provider.append(view);
  app.append(provider);
  paint();
}
