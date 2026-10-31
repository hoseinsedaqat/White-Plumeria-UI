<script lang="ts">
  import { addMonths, buildMonthGrid, calendarDayClass, formatNumber, sameDay, toParts, type CalendarSystem } from '@white-plumeria/core';
  import Icon from './Icon.svelte';
  import IconButton from './IconButton.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    value = $bindable<Date | null>(null),
    calendar = 'gregory',
    locale = '',
    min = null,
    max = null,
    rangeStart = null,
    rangeEnd = null,
  }: {
    value?: Date | null;
    calendar?: CalendarSystem;
    locale?: '' | 'en' | 'fa';
    min?: Date | null;
    max?: Date | null;
    rangeStart?: Date | null;
    rangeEnd?: Date | null;
  } = $props();

  const wpl = useWhitePlumeria();
  let anchor = $state(value ?? new Date());
  const activeLocale = $derived(locale || wpl.preferences.locale);
  const grid = $derived(
    buildMonthGrid({
      anchor,
      calendar,
      locale: activeLocale,
      min: min ?? undefined,
      max: max ?? undefined,
    }),
  );
  const today = new Date();
</script>

<div class="wpl-calendar">
  <div class="wpl-calendar-head">
    <IconButton label={wpl.t('previous')} onclick={() => (anchor = addMonths(anchor, -1, calendar))}><Icon name="chevronLeft" /></IconButton>
    <strong>{grid.title}</strong>
    <IconButton label={wpl.t('next')} onclick={() => (anchor = addMonths(anchor, 1, calendar))}><Icon name="chevronRight" /></IconButton>
  </div>
  <div class="wpl-calendar-grid" role="grid" aria-label={grid.title}>
    {#each grid.weekdays as day (day)}
      <div class="wpl-calendar-weekday" role="columnheader">{day}</div>
    {/each}
    {#each grid.cells as cell (cell.key + (cell.inMonth ? '' : '-out'))}
      <button
        type="button"
        role="gridcell"
        class={calendarDayClass({ inMonth: cell.inMonth, date: cell.date, rangeStart, rangeEnd })}
        disabled={cell.disabled}
        aria-selected={(value && sameDay(value, cell.date)) || (rangeStart && sameDay(rangeStart, cell.date)) || (rangeEnd && sameDay(rangeEnd, cell.date)) ? true : undefined}
        aria-current={sameDay(today, cell.date) ? 'date' : undefined}
        aria-label={cell.label}
        onclick={() => (value = cell.date)}
      >
        {formatNumber(toParts(cell.date, calendar).day, activeLocale)}
      </button>
    {/each}
  </div>
</div>
