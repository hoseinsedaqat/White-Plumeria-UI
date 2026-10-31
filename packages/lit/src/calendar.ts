import {
  addMonths,
  buildMonthGrid,
  calendarDayClass,
  createId,
  formatDate,
  formatNumber,
  orderDateRange,
  orderDateTimeRange,
  parseIsoDate,
  parseTimeValue,
  sameDay,
  toIsoDate,
  toParts,
  type CalendarSystem,
  type DateRangeValue,
  type DateTimeRangeValue,
} from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';
import { localeOf, translate } from './provider';

export type { DateRangeValue, DateTimeRangeValue };

function applyRange(
  showTime: boolean,
  nextStart: string,
  nextEnd: string,
  nextStartTime: string,
  nextEndTime: string,
  invalidDate: string,
  invalidTime: string,
): { ok: false; error: string } | { ok: true; value: DateRangeValue | DateTimeRangeValue } {
  if ((nextStart && !parseIsoDate(nextStart)) || (nextEnd && !parseIsoDate(nextEnd))) return { ok: false, error: invalidDate };
  if (showTime && ((nextStartTime && !parseTimeValue(nextStartTime)) || (nextEndTime && !parseTimeValue(nextEndTime)))) {
    return { ok: false, error: invalidTime };
  }
  if (!showTime) {
    const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
    return { ok: true, value: ordered };
  }
  return {
    ok: true,
    value: orderDateTimeRange({ start: nextStart, end: nextEnd, startTime: nextStartTime, endTime: nextEndTime }),
  };
}

function storedTime(value: string): string | null {
  const parsed = parseTimeValue(value);
  if (!parsed) return null;
  return `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
}

export class Calendar extends WplElement {
  static override properties = {
    value: { attribute: false },
    calendar: { type: String },
    locale: { type: String },
    min: { attribute: false },
    max: { attribute: false },
    rangeStart: { attribute: false },
    rangeEnd: { attribute: false },
  };

  declare value: Date | null;
  declare calendar: CalendarSystem;
  declare locale: 'en' | 'fa' | '';
  declare min: Date | null;
  declare max: Date | null;
  declare rangeStart: Date | null;
  declare rangeEnd: Date | null;
  private anchor = new Date();

  constructor() {
    super();
    this.value = null;
    this.calendar = 'gregory';
    this.locale = '';
    this.min = null;
    this.max = null;
    this.rangeStart = null;
    this.rangeEnd = null;
  }

  protected override render(): RenderResult {
    const locale = this.locale === 'fa' || this.locale === 'en' ? this.locale : localeOf(this);
    const calendar = this.calendar === 'persian' ? 'persian' : 'gregory';
    const grid = buildMonthGrid({
      anchor: this.anchor,
      calendar,
      locale,
      min: this.min ?? undefined,
      max: this.max ?? undefined,
    });
    const today = new Date();
    return html`<div class="wpl-calendar">
      <div class="wpl-calendar-head">
        <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=${translate(this, 'previous')} @click=${() => { this.anchor = addMonths(this.anchor, -1, calendar); this.requestUpdate(); }}>${iconSvg('chevronLeft')}</button>
        <strong>${grid.title}</strong>
        <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=${translate(this, 'next')} @click=${() => { this.anchor = addMonths(this.anchor, 1, calendar); this.requestUpdate(); }}>${iconSvg('chevronRight')}</button>
      </div>
      <div class="wpl-calendar-grid" role="grid" aria-label=${grid.title}>
        ${grid.weekdays.map((day) => html`<div class="wpl-calendar-weekday" role="columnheader">${day}</div>`)}
        ${grid.cells.map((cell) => html`<button
          type="button"
          role="gridcell"
          class=${calendarDayClass({ inMonth: cell.inMonth, date: cell.date, rangeStart: this.rangeStart, rangeEnd: this.rangeEnd })}
          ?disabled=${cell.disabled}
          aria-selected=${(this.value && sameDay(this.value, cell.date)) || (this.rangeStart && sameDay(this.rangeStart, cell.date)) || (this.rangeEnd && sameDay(this.rangeEnd, cell.date)) ? 'true' : nothing}
          aria-current=${sameDay(today, cell.date) ? 'date' : nothing}
          aria-label=${cell.label}
          @click=${() => this.emit('wpl-change', { value: cell.date })}
        >
          ${formatNumber(toParts(cell.date, calendar).day, locale)}
        </button>`)}
      </div>
    </div>`;
  }
}

export class DatePicker extends WplElement {
  static override properties = {
    label: { type: String },
    value: { type: String },
    calendar: { type: String },
    min: { type: String },
    max: { type: String },
    showTime: { type: Boolean, attribute: 'show-time' },
    time: { type: String },
  };

  declare label: string;
  declare value: string;
  declare calendar: CalendarSystem;
  declare min: string;
  declare max: string;
  declare showTime: boolean;
  declare time: string;
  private text = '';
  private timeText = '';
  private error = '';
  private open = false;
  private seeded = false;
  private readonly inputId = createId('wpl-date');
  private readonly timeId = createId('wpl-time');

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.calendar = 'gregory';
    this.min = '';
    this.max = '';
    this.showTime = false;
    this.time = '';
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    this.text = this.value;
    this.timeText = this.time;
  }

  private commitDate(next: string): void {
    this.text = next;
    if (!next) {
      this.error = '';
      this.value = '';
      this.emit('wpl-change', { value: '' });
      this.requestUpdate();
      return;
    }
    if (!parseIsoDate(next)) {
      this.error = translate(this, 'invalidDate');
      this.requestUpdate();
      return;
    }
    this.error = '';
    this.value = next;
    this.emit('wpl-change', { value: next });
    this.requestUpdate();
  }

  private commitTime(next: string): void {
    this.timeText = next;
    if (!next) {
      this.error = '';
      this.time = '';
      this.emit('wpl-time-change', { time: '' });
      this.requestUpdate();
      return;
    }
    const stored = storedTime(next);
    if (!stored) {
      this.error = translate(this, 'invalidTime');
      this.requestUpdate();
      return;
    }
    this.timeText = stored;
    this.time = stored;
    this.error = '';
    this.emit('wpl-time-change', { time: stored });
    this.requestUpdate();
  }

  protected override render(): RenderResult {
    const calendar = this.calendar === 'persian' ? 'persian' : 'gregory';
    const locale = localeOf(this);
    const selected = parseIsoDate(this.text);
    const hint = selected
      ? `${formatDate(selected, locale, { dateStyle: 'full' }, calendar)}${this.showTime && storedTime(this.timeText) ? `, ${this.timeText}` : ''}`
      : translate(this, 'chooseDate');
    return html`<div class="wpl-date">
      <label class="wpl-label" for=${this.inputId}>${this.label}</label>
      <div class="wpl-flex">
        <input
          id=${this.inputId}
          class="wpl-input"
          .value=${this.text}
          inputmode="numeric"
          placeholder="YYYY-MM-DD"
          aria-invalid=${this.error ? 'true' : nothing}
          aria-describedby=${this.error ? `${this.inputId}-error` : nothing}
          @input=${(event: Event) => {
            const element = event.target instanceof HTMLInputElement ? event.target : null;
            if (element) this.commitDate(element.value);
          }}
        />
        <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=${translate(this, 'chooseDate')} aria-expanded=${this.open ? 'true' : 'false'} @click=${() => { this.open = !this.open; this.requestUpdate(); }}>${iconSvg('calendar')}</button>
      </div>
      ${this.showTime
        ? html`<div class="wpl-field wpl-time">
            <label class="wpl-label" for=${this.timeId}>${translate(this, 'time')}</label>
            <input id=${this.timeId} class="wpl-input" .value=${this.timeText} inputmode="numeric" placeholder="HH:mm" aria-invalid=${this.error ? 'true' : nothing} @input=${(event: Event) => {
              const element = event.target instanceof HTMLInputElement ? event.target : null;
              if (element) this.commitTime(element.value);
            }} />
          </div>`
        : nothing}
      ${this.error ? html`<p id=${`${this.inputId}-error`} class="wpl-field-error" role="alert">${this.error}</p>` : nothing}
      ${this.open
        ? html`<wpl-calendar
            .value=${selected}
            calendar=${calendar}
            locale=${locale}
            .min=${this.min ? parseIsoDate(this.min) : null}
            .max=${this.max ? parseIsoDate(this.max) : null}
            @wpl-change=${(event: CustomEvent<{ value: Date }>) => {
              const iso = toIsoDate(event.detail.value);
              this.text = iso;
              this.value = iso;
              this.error = '';
              this.open = false;
              this.emit('wpl-change', { value: iso });
              this.requestUpdate();
            }}
          ></wpl-calendar>`
        : nothing}
      <p class="wpl-field-hint">${hint}</p>
    </div>`;
  }
}

export class DateRangePicker extends WplElement {
  static override properties = {
    label: { type: String },
    start: { type: String },
    end: { type: String },
    startTime: { type: String, attribute: 'start-time' },
    endTime: { type: String, attribute: 'end-time' },
    showTime: { type: Boolean, attribute: 'show-time' },
    calendar: { type: String },
    min: { type: String },
    max: { type: String },
  };

  declare label: string;
  declare start: string;
  declare end: string;
  declare startTime: string;
  declare endTime: string;
  declare showTime: boolean;
  declare calendar: CalendarSystem;
  declare min: string;
  declare max: string;
  private startText = '';
  private endText = '';
  private startTimeText = '';
  private endTimeText = '';
  private error = '';
  private open = false;
  private awaitingEnd = false;
  private seeded = false;
  private readonly startId = createId('wpl-start');
  private readonly endId = createId('wpl-end');
  private readonly startTimeId = createId('wpl-start-time');
  private readonly endTimeId = createId('wpl-end-time');

  constructor() {
    super();
    this.label = '';
    this.start = '';
    this.end = '';
    this.startTime = '';
    this.endTime = '';
    this.showTime = false;
    this.calendar = 'gregory';
    this.min = '';
    this.max = '';
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    this.startText = this.start;
    this.endText = this.end;
    this.startTimeText = this.startTime;
    this.endTimeText = this.endTime;
  }

  private apply(nextStart: string, nextEnd: string, nextStartTime: string, nextEndTime: string, keepInvalid: 'start' | 'end' | 'startTime' | 'endTime' | null, raw: string): void {
    const result = applyRange(this.showTime, nextStart, nextEnd, nextStartTime, nextEndTime, translate(this, 'invalidDate'), translate(this, 'invalidTime'));
    if (!result.ok) {
      if (keepInvalid === 'start') this.startText = raw;
      if (keepInvalid === 'end') this.endText = raw;
      if (keepInvalid === 'startTime') this.startTimeText = raw;
      if (keepInvalid === 'endTime') this.endTimeText = raw;
      this.error = result.error;
      this.requestUpdate();
      return;
    }
    this.startText = result.value.start;
    this.endText = result.value.end;
    this.start = result.value.start;
    this.end = result.value.end;
    if ('startTime' in result.value) {
      this.startTimeText = result.value.startTime ?? '';
      this.endTimeText = result.value.endTime ?? '';
      this.startTime = this.startTimeText;
      this.endTime = this.endTimeText;
    }
    this.error = '';
    this.emit('wpl-change', { value: result.value });
    this.requestUpdate();
  }

  protected override render(): RenderResult {
    const calendar = this.calendar === 'persian' ? 'persian' : 'gregory';
    const locale = localeOf(this);
    const startDate = parseIsoDate(this.startText);
    const endDate = parseIsoDate(this.endText);
    const hint = startDate && endDate
      ? `${formatDate(startDate, locale, { dateStyle: 'medium' }, calendar)}${this.showTime && parseTimeValue(this.startTimeText) ? `, ${this.startTimeText}` : ''} – ${formatDate(endDate, locale, { dateStyle: 'medium' }, calendar)}${this.showTime && parseTimeValue(this.endTimeText) ? `, ${this.endTimeText}` : ''}`
      : startDate
        ? `${formatDate(startDate, locale, { dateStyle: 'medium' }, calendar)}${this.showTime && parseTimeValue(this.startTimeText) ? `, ${this.startTimeText}` : ''}`
        : translate(this, 'chooseDate');
    return html`<div class="wpl-date">
      <span class="wpl-label">${this.label}</span>
      <div class="wpl-date-row">
        <div class="wpl-field">
          <label class="wpl-label" for=${this.startId}>${translate(this, 'startDate')}</label>
          <input id=${this.startId} class="wpl-input" .value=${this.startText} inputmode="numeric" placeholder="YYYY-MM-DD" aria-invalid=${this.error ? 'true' : nothing} @input=${(event: Event) => {
            const element = event.target instanceof HTMLInputElement ? event.target : null;
            if (element) this.apply(element.value, this.endText, this.startTimeText, this.endTimeText, 'start', element.value);
          }} />
        </div>
        <div class="wpl-field">
          <label class="wpl-label" for=${this.endId}>${translate(this, 'endDate')}</label>
          <input id=${this.endId} class="wpl-input" .value=${this.endText} inputmode="numeric" placeholder="YYYY-MM-DD" aria-invalid=${this.error ? 'true' : nothing} @input=${(event: Event) => {
            const element = event.target instanceof HTMLInputElement ? event.target : null;
            if (element) this.apply(this.startText, element.value, this.startTimeText, this.endTimeText, 'end', element.value);
          }} />
        </div>
        <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=${translate(this, 'chooseDate')} aria-expanded=${this.open ? 'true' : 'false'} @click=${() => { this.open = !this.open; this.requestUpdate(); }}>${iconSvg('calendar')}</button>
      </div>
      ${this.showTime
        ? html`<div class="wpl-date-row">
            <div class="wpl-field wpl-time">
              <label class="wpl-label" for=${this.startTimeId}>${translate(this, 'startTime')}</label>
              <input id=${this.startTimeId} class="wpl-input" .value=${this.startTimeText} inputmode="numeric" placeholder="HH:mm" aria-invalid=${this.error ? 'true' : nothing} @input=${(event: Event) => {
                const element = event.target instanceof HTMLInputElement ? event.target : null;
                if (element) this.apply(this.startText, this.endText, element.value, this.endTimeText, 'startTime', element.value);
              }} />
            </div>
            <div class="wpl-field wpl-time">
              <label class="wpl-label" for=${this.endTimeId}>${translate(this, 'endTime')}</label>
              <input id=${this.endTimeId} class="wpl-input" .value=${this.endTimeText} inputmode="numeric" placeholder="HH:mm" aria-invalid=${this.error ? 'true' : nothing} @input=${(event: Event) => {
                const element = event.target instanceof HTMLInputElement ? event.target : null;
                if (element) this.apply(this.startText, this.endText, this.startTimeText, element.value, 'endTime', element.value);
              }} />
            </div>
          </div>`
        : nothing}
      ${this.error ? html`<p class="wpl-field-error" role="alert">${this.error}</p>` : nothing}
      ${this.open
        ? html`<wpl-calendar
            calendar=${calendar}
            locale=${locale}
            .min=${this.min ? parseIsoDate(this.min) : null}
            .max=${this.max ? parseIsoDate(this.max) : null}
            .rangeStart=${startDate}
            .rangeEnd=${endDate}
            @wpl-change=${(event: CustomEvent<{ value: Date }>) => {
              const iso = toIsoDate(event.detail.value);
              if (!this.awaitingEnd || !this.startText || this.endText) {
                this.startText = iso;
                this.endText = '';
                this.start = iso;
                this.end = '';
                if (this.showTime) this.endTimeText = '';
                this.awaitingEnd = true;
                this.error = '';
                this.emit('wpl-change', {
                  value: this.showTime
                    ? { start: iso, end: '', startTime: this.startTimeText, endTime: '' }
                    : { start: iso, end: '' },
                });
                this.requestUpdate();
                return;
              }
              this.apply(this.startText, iso, this.startTimeText, this.endTimeText, null, iso);
              this.awaitingEnd = false;
              this.open = false;
              this.requestUpdate();
            }}
          ></wpl-calendar>`
        : nothing}
      <p class="wpl-field-hint">${hint}</p>
    </div>`;
  }
}

defineTag('wpl-calendar', Calendar);
defineTag('wpl-date-picker', DatePicker);
defineTag('wpl-date-range-picker', DateRangePicker);
