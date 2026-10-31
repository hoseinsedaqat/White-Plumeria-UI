import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  signal,
} from '@angular/core';
import {
  addMonths,
  buildMonthGrid,
  calendarDayClass,
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
import { IconButton } from './button';
import { Icon } from './icon';
import { injectWhitePlumeria } from './provider';

export type { DateRangeValue, DateTimeRangeValue };

@Component({
  selector: 'wpl-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Icon, IconButton],
  template: `
    <div class="wpl-calendar">
      <div class="wpl-calendar-head">
        <button wplIconButton [label]="previousLabel()" [hasIcon]="true" (click)="shift(-1)"><wpl-icon name="chevronLeft" /></button>
        <strong>{{ grid().title }}</strong>
        <button wplIconButton [label]="nextLabel()" [hasIcon]="true" (click)="shift(1)"><wpl-icon name="chevronRight" /></button>
      </div>
      <div class="wpl-calendar-grid" role="grid" [attr.aria-label]="grid().title">
        @for (day of grid().weekdays; track day) {
          <div class="wpl-calendar-weekday" role="columnheader">{{ day }}</div>
        }
        @for (cell of grid().cells; track cell.key) {
          <button
            type="button"
            role="gridcell"
            [class]="dayClass(cell)"
            [disabled]="cell.disabled"
            [attr.aria-selected]="selected(cell.date) ? true : null"
            [attr.aria-current]="isToday(cell.date) ? 'date' : null"
            [attr.aria-label]="cell.label"
            (click)="valueChange.emit(cell.date)"
          >
            {{ dayNumber(cell.date) }}
          </button>
        }
      </div>
    </div>
  `,
})
export class Calendar {
  readonly value = input<Date | null>(null);
  readonly calendar = input<CalendarSystem>('gregory');
  readonly locale = input<'en' | 'fa'>();
  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly rangeStart = input<Date | null>(null);
  readonly rangeEnd = input<Date | null>(null);
  readonly valueChange = output<Date>();
  private readonly wpl = injectWhitePlumeria();
  private readonly anchor = signal(new Date());
  readonly previousLabel = () => this.wpl.t('previous');
  readonly nextLabel = () => this.wpl.t('next');

  activeLocale(): 'en' | 'fa' {
    return this.locale() ?? this.wpl.preferences().locale;
  }

  grid() {
    return buildMonthGrid({
      anchor: this.anchor(),
      calendar: this.calendar(),
      locale: this.activeLocale(),
      min: this.min(),
      max: this.max(),
    });
  }

  shift(amount: number) {
    this.anchor.set(addMonths(this.anchor(), amount, this.calendar()));
  }

  dayClass(cell: { inMonth: boolean; date: Date }) {
    return calendarDayClass({
      inMonth: cell.inMonth,
      date: cell.date,
      rangeStart: this.rangeStart(),
      rangeEnd: this.rangeEnd(),
    });
  }

  selected(date: Date): boolean {
    const value = this.value();
    return Boolean(
      (value && sameDay(value, date)) ||
        (this.rangeStart() && sameDay(this.rangeStart() as Date, date)) ||
        (this.rangeEnd() && sameDay(this.rangeEnd() as Date, date)),
    );
  }

  isToday(date: Date): boolean {
    return sameDay(new Date(), date);
  }

  dayNumber(date: Date): string {
    return formatNumber(toParts(date, this.calendar()).day, this.activeLocale());
  }
}

@Component({
  selector: 'wpl-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Calendar, Icon, IconButton],
  template: `
    <div class="wpl-date">
      <label class="wpl-label" [attr.for]="inputId">{{ label() }}</label>
      <div class="wpl-flex">
        <input
          class="wpl-input"
          [id]="inputId"
          [value]="text()"
          inputmode="numeric"
          placeholder="YYYY-MM-DD"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="error() ? inputId + '-error' : null"
          (input)="commit($any($event.target).value)"
        />
        <button wplIconButton [label]="chooseLabel()" [hasIcon]="true" (click)="open.set(!open())"><wpl-icon name="calendar" /></button>
      </div>
      @if (showTime()) {
        <div class="wpl-field wpl-time">
          <label class="wpl-label" [attr.for]="timeId">{{ timeLabel() }}</label>
          <input
            class="wpl-input"
            [id]="timeId"
            [value]="timeText()"
            inputmode="numeric"
            placeholder="HH:mm"
            [attr.aria-invalid]="error() ? true : null"
            (input)="commitTime($any($event.target).value)"
          />
        </div>
      }
      @if (error()) {
        <p class="wpl-field-error" role="alert" [id]="inputId + '-error'">{{ error() }}</p>
      }
      @if (open()) {
        <wpl-calendar
          [value]="selected()"
          [calendar]="calendar()"
          [locale]="activeLocale()"
          [min]="minDate()"
          [max]="maxDate()"
          (valueChange)="pick($event)"
        />
      }
      <p class="wpl-field-hint">{{ hint() }}</p>
    </div>
  `,
})
export class DatePicker {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly calendar = input<CalendarSystem>('gregory');
  readonly min = input<string>();
  readonly max = input<string>();
  readonly showTime = input(false, { transform: booleanAttribute });
  readonly time = input('');
  readonly valueChange = output<string>();
  readonly timeChange = output<string>();
  private readonly wpl = injectWhitePlumeria();
  readonly inputId = 'wpl-date-' + Math.random().toString(36).slice(2, 8);
  readonly timeId = this.inputId + '-time';
  readonly open = signal(false);
  readonly text = signal('');
  readonly timeText = signal('');
  readonly error = signal('');
  readonly chooseLabel = () => this.wpl.t('chooseDate');
  readonly timeLabel = () => this.wpl.t('time');

  constructor() {
    queueMicrotask(() => {
      this.text.set(this.value());
      this.timeText.set(this.time());
    });
  }

  activeLocale(): 'en' | 'fa' {
    return this.wpl.preferences().locale;
  }

  selected(): Date | null {
    return parseIsoDate(this.value() || this.text());
  }

  minDate(): Date | undefined {
    return this.min() ? (parseIsoDate(this.min() ?? '') ?? undefined) : undefined;
  }

  maxDate(): Date | undefined {
    return this.max() ? (parseIsoDate(this.max() ?? '') ?? undefined) : undefined;
  }

  commit(next: string) {
    this.text.set(next);
    if (!next) {
      this.error.set('');
      this.valueChange.emit('');
      return;
    }
    if (!parseIsoDate(next)) {
      this.error.set(this.wpl.t('invalidDate'));
      return;
    }
    this.error.set('');
    this.valueChange.emit(next);
  }

  commitTime(next: string) {
    this.timeText.set(next);
    if (!next) {
      this.error.set('');
      this.timeChange.emit('');
      return;
    }
    const parsed = parseTimeValue(next);
    if (!parsed) {
      this.error.set(this.wpl.t('invalidTime'));
      return;
    }
    const stored = `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
    this.timeText.set(stored);
    this.error.set('');
    this.timeChange.emit(stored);
  }

  pick(date: Date) {
    this.commit(toIsoDate(date));
    this.open.set(false);
  }

  hint(): string {
    const selected = this.selected();
    if (!selected) return this.wpl.t('chooseDate');
    const time = this.showTime() && this.timeText() && parseTimeValue(this.timeText()) ? `, ${this.timeText()}` : '';
    return `${formatDate(selected, this.activeLocale(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, this.calendar())}${time}`;
  }
}

@Component({
  selector: 'wpl-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [Calendar, Icon, IconButton],
  template: `
    <div class="wpl-date">
      <span class="wpl-label">{{ label() }}</span>
      <div class="wpl-date-row">
        <div class="wpl-field">
          <label class="wpl-label" [attr.for]="startId">{{ startLabel() }}</label>
          <input class="wpl-input" [id]="startId" [value]="startText()" inputmode="numeric" placeholder="YYYY-MM-DD" [attr.aria-invalid]="error() ? true : null" (input)="commit('start', $any($event.target).value)" />
        </div>
        <div class="wpl-field">
          <label class="wpl-label" [attr.for]="endId">{{ endLabel() }}</label>
          <input class="wpl-input" [id]="endId" [value]="endText()" inputmode="numeric" placeholder="YYYY-MM-DD" [attr.aria-invalid]="error() ? true : null" (input)="commit('end', $any($event.target).value)" />
        </div>
        <button wplIconButton [label]="chooseLabel()" [attr.aria-expanded]="open()" [hasIcon]="true" (click)="open.set(!open())"><wpl-icon name="calendar" /></button>
      </div>
      @if (showTime()) {
        <div class="wpl-date-row">
          <div class="wpl-field wpl-time">
            <label class="wpl-label" [attr.for]="startTimeId">{{ startTimeLabel() }}</label>
            <input class="wpl-input" [id]="startTimeId" [value]="startTimeText()" inputmode="numeric" placeholder="HH:mm" [attr.aria-invalid]="error() ? true : null" (input)="commitTime('start', $any($event.target).value)" />
          </div>
          <div class="wpl-field wpl-time">
            <label class="wpl-label" [attr.for]="endTimeId">{{ endTimeLabel() }}</label>
            <input class="wpl-input" [id]="endTimeId" [value]="endTimeText()" inputmode="numeric" placeholder="HH:mm" [attr.aria-invalid]="error() ? true : null" (input)="commitTime('end', $any($event.target).value)" />
          </div>
        </div>
      }
      @if (error()) {
        <p class="wpl-field-error" role="alert">{{ error() }}</p>
      }
      @if (open()) {
        <wpl-calendar [calendar]="calendar()" [locale]="activeLocale()" [min]="minDate()" [max]="maxDate()" [rangeStart]="startDate()" [rangeEnd]="endDate()" (valueChange)="pick($event)" />
      }
      <p class="wpl-field-hint">{{ hint() }}</p>
    </div>
  `,
})
export class DateRangePicker {
  readonly label = input.required<string>();
  readonly start = input('');
  readonly end = input('');
  readonly startTime = input('');
  readonly endTime = input('');
  readonly showTime = input(false, { transform: booleanAttribute });
  readonly calendar = input<CalendarSystem>('gregory');
  readonly min = input<string>();
  readonly max = input<string>();
  readonly valueChange = output<DateRangeValue | DateTimeRangeValue>();
  private readonly wpl = injectWhitePlumeria();
  readonly startId = 'wpl-range-start-' + Math.random().toString(36).slice(2, 8);
  readonly endId = this.startId + '-end';
  readonly startTimeId = this.startId + '-time';
  readonly endTimeId = this.endId + '-time';
  readonly open = signal(false);
  readonly startText = signal('');
  readonly endText = signal('');
  readonly startTimeText = signal('');
  readonly endTimeText = signal('');
  readonly error = signal('');
  readonly awaitingEnd = signal(false);
  readonly startLabel = () => this.wpl.t('startDate');
  readonly endLabel = () => this.wpl.t('endDate');
  readonly startTimeLabel = () => this.wpl.t('startTime');
  readonly endTimeLabel = () => this.wpl.t('endTime');
  readonly chooseLabel = () => this.wpl.t('chooseDate');

  constructor() {
    queueMicrotask(() => {
      this.startText.set(this.start());
      this.endText.set(this.end());
      this.startTimeText.set(this.startTime());
      this.endTimeText.set(this.endTime());
    });
  }

  activeLocale(): 'en' | 'fa' {
    return this.wpl.preferences().locale;
  }

  minDate(): Date | undefined {
    return this.min() ? (parseIsoDate(this.min() ?? '') ?? undefined) : undefined;
  }

  maxDate(): Date | undefined {
    return this.max() ? (parseIsoDate(this.max() ?? '') ?? undefined) : undefined;
  }

  startDate(): Date | null {
    return parseIsoDate(this.startText());
  }

  endDate(): Date | null {
    return parseIsoDate(this.endText());
  }

  emit(nextStart: string, nextEnd: string, nextStartTime = this.startTimeText(), nextEndTime = this.endTimeText()) {
    if (this.showTime() && ((nextStartTime && !parseTimeValue(nextStartTime)) || (nextEndTime && !parseTimeValue(nextEndTime)))) {
      this.error.set(this.wpl.t('invalidTime'));
      return;
    }
    if (!this.showTime()) {
      const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
      this.startText.set(ordered.start);
      this.endText.set(ordered.end);
      this.error.set('');
      this.valueChange.emit(ordered);
      return;
    }
    const ordered = orderDateTimeRange({ start: nextStart, end: nextEnd, startTime: nextStartTime, endTime: nextEndTime });
    this.startText.set(ordered.start);
    this.endText.set(ordered.end);
    this.startTimeText.set(ordered.startTime);
    this.endTimeText.set(ordered.endTime);
    this.error.set('');
    this.valueChange.emit(ordered);
  }

  commit(which: 'start' | 'end', next: string) {
    const nextStart = which === 'start' ? next : this.startText();
    const nextEnd = which === 'end' ? next : this.endText();
    if (which === 'start') this.startText.set(next);
    else this.endText.set(next);
    if ((nextStart && !parseIsoDate(nextStart)) || (nextEnd && !parseIsoDate(nextEnd))) {
      this.error.set(this.wpl.t('invalidDate'));
      return;
    }
    this.emit(nextStart, nextEnd);
  }

  commitTime(which: 'start' | 'end', next: string) {
    if (which === 'start') this.startTimeText.set(next);
    else this.endTimeText.set(next);
    if (next && !parseTimeValue(next)) {
      this.error.set(this.wpl.t('invalidTime'));
      return;
    }
    this.emit(this.startText(), this.endText(), which === 'start' ? next : this.startTimeText(), which === 'end' ? next : this.endTimeText());
  }

  pick(date: Date) {
    const iso = toIsoDate(date);
    if (!this.awaitingEnd() || !this.startText() || this.endText()) {
      this.startText.set(iso);
      this.endText.set('');
      if (this.showTime()) this.endTimeText.set('');
      this.awaitingEnd.set(true);
      this.error.set('');
      this.valueChange.emit(this.showTime() ? { start: iso, end: '', startTime: this.startTimeText(), endTime: '' } : { start: iso, end: '' });
      return;
    }
    this.emit(this.startText(), iso);
    this.awaitingEnd.set(false);
    this.open.set(false);
  }

  hint(): string {
    const start = this.startDate();
    const end = this.endDate();
    const dated = (date: Date, timeValue: string) => {
      const label = formatDate(date, this.activeLocale(), { year: 'numeric', month: 'short', day: 'numeric' }, this.calendar());
      return this.showTime() && parseTimeValue(timeValue) ? `${label}, ${timeValue}` : label;
    };
    if (start && end) return `${dated(start, this.startTimeText())} – ${dated(end, this.endTimeText())}`;
    if (start) return dated(start, this.startTimeText());
    return this.wpl.t('chooseDate');
  }
}
