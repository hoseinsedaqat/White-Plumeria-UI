<script lang="ts">
  import {
    formatDate,
    orderDateRange,
    orderDateTimeRange,
    parseIsoDate,
    parseTimeValue,
    toIsoDate,
    type CalendarSystem,
    type DateRangeValue,
    type DateTimeRangeValue,
  } from '@white-plumeria/core';
  import Calendar from './Calendar.svelte';
  import IconButton from './IconButton.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    start = $bindable(''),
    end = $bindable(''),
    calendar = 'gregory',
    min = '',
    max = '',
    showTime = false,
    startTime = $bindable(''),
    endTime = $bindable(''),
    onchange,
  }: {
    label: string;
    start?: string;
    end?: string;
    calendar?: CalendarSystem;
    min?: string;
    max?: string;
    showTime?: boolean;
    startTime?: string;
    endTime?: string;
    onchange?: (value: DateRangeValue | DateTimeRangeValue) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const startId = $props.id();
  let open = $state(false);
  let startText = $state(start);
  let endText = $state(end);
  let startTimeText = $state(startTime);
  let endTimeText = $state(endTime);
  let error = $state('');
  let awaitingEnd = $state(false);
  let picked = $state<Date | null>(null);
  const startDate = $derived(parseIsoDate(startText));
  const endDate = $derived(parseIsoDate(endText));

  function emit(nextStart: string, nextEnd: string, nextStartTime = startTimeText, nextEndTime = endTimeText) {
    if (showTime && ((nextStartTime && !parseTimeValue(nextStartTime)) || (nextEndTime && !parseTimeValue(nextEndTime)))) {
      error = wpl.t('invalidTime');
      return;
    }
    if (!showTime) {
      const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
      startText = ordered.start;
      endText = ordered.end;
      start = ordered.start;
      end = ordered.end;
      error = '';
      onchange?.(ordered);
      return;
    }
    const ordered = orderDateTimeRange({ start: nextStart, end: nextEnd, startTime: nextStartTime, endTime: nextEndTime });
    startText = ordered.start;
    endText = ordered.end;
    startTimeText = ordered.startTime;
    endTimeText = ordered.endTime;
    start = ordered.start;
    end = ordered.end;
    startTime = ordered.startTime;
    endTime = ordered.endTime;
    error = '';
    onchange?.(ordered);
  }

  function commitTime(which: 'start' | 'end', next: string) {
    if (which === 'start') startTimeText = next;
    else endTimeText = next;
    if (next && !parseTimeValue(next)) {
      error = wpl.t('invalidTime');
      return;
    }
    emit(startText, endText, which === 'start' ? next : startTimeText, which === 'end' ? next : endTimeText);
  }

  function commit(which: 'start' | 'end', next: string) {
    const nextStart = which === 'start' ? next : startText;
    const nextEnd = which === 'end' ? next : endText;
    if (which === 'start') startText = next;
    else endText = next;
    if ((nextStart && !parseIsoDate(nextStart)) || (nextEnd && !parseIsoDate(nextEnd))) {
      error = wpl.t('invalidDate');
      return;
    }
    emit(nextStart, nextEnd);
  }

  $effect(() => {
    if (!open || !picked) return;
    const iso = toIsoDate(picked);
    if (!awaitingEnd || !startText || endText) {
      startText = iso;
      endText = '';
      if (showTime) endTimeText = '';
      start = iso;
      end = '';
      if (showTime) endTime = '';
      awaitingEnd = true;
      error = '';
      onchange?.(showTime ? { start: iso, end: '', startTime: startTimeText, endTime: '' } : { start: iso, end: '' });
      picked = null;
      return;
    }
    emit(startText, iso);
    awaitingEnd = false;
    open = false;
    picked = null;
  });
</script>

<div class="wpl-date">
  <span class="wpl-label">{label}</span>
  <div class="wpl-date-row">
    <div class="wpl-field">
      <label class="wpl-label" for={startId}>{wpl.t('startDate')}</label>
      <input
        id={startId}
        class="wpl-input"
        value={startText}
        placeholder="YYYY-MM-DD"
        inputmode="numeric"
        aria-invalid={error ? true : undefined}
        oninput={(event) => commit('start', (event.currentTarget as HTMLInputElement).value)}
      />
    </div>
    <div class="wpl-field">
      <label class="wpl-label" for="{startId}-end">{wpl.t('endDate')}</label>
      <input
        id="{startId}-end"
        class="wpl-input"
        value={endText}
        placeholder="YYYY-MM-DD"
        inputmode="numeric"
        aria-invalid={error ? true : undefined}
        oninput={(event) => commit('end', (event.currentTarget as HTMLInputElement).value)}
      />
    </div>
    <IconButton label={wpl.t('chooseDate')} onclick={() => (open = !open)}>▦</IconButton>
  </div>
  {#if showTime}
    <div class="wpl-date-row">
      <div class="wpl-field wpl-time">
        <label class="wpl-label" for="{startId}-start-time">{wpl.t('startTime')}</label>
        <input
          id="{startId}-start-time"
          class="wpl-input"
          value={startTimeText}
          placeholder="HH:mm"
          inputmode="numeric"
          aria-invalid={error ? true : undefined}
          oninput={(event) => commitTime('start', (event.currentTarget as HTMLInputElement).value)}
        />
      </div>
      <div class="wpl-field wpl-time">
        <label class="wpl-label" for="{startId}-end-time">{wpl.t('endTime')}</label>
        <input
          id="{startId}-end-time"
          class="wpl-input"
          value={endTimeText}
          placeholder="HH:mm"
          inputmode="numeric"
          aria-invalid={error ? true : undefined}
          oninput={(event) => commitTime('end', (event.currentTarget as HTMLInputElement).value)}
        />
      </div>
    </div>
  {/if}
  {#if error}<p class="wpl-field-error" role="alert">{error}</p>{/if}
  {#if open}
    <Calendar
      bind:value={picked}
      {calendar}
      locale={wpl.preferences.locale}
      min={min ? parseIsoDate(min) : null}
      max={max ? parseIsoDate(max) : null}
      rangeStart={startDate}
      rangeEnd={endDate}
    />
  {/if}
  <p class="wpl-field-hint">
    {#if startDate && endDate}
      {formatDate(startDate, wpl.preferences.locale, { dateStyle: 'medium' }, calendar)}{showTime && parseTimeValue(startTimeText) ? `, ${startTimeText}` : ''} – {formatDate(endDate, wpl.preferences.locale, { dateStyle: 'medium' }, calendar)}{showTime && parseTimeValue(endTimeText) ? `, ${endTimeText}` : ''}
    {:else if startDate}
      {formatDate(startDate, wpl.preferences.locale, { dateStyle: 'medium' }, calendar)}{showTime && parseTimeValue(startTimeText) ? `, ${startTimeText}` : ''}
    {:else}
      {wpl.t('chooseDate')}
    {/if}
  </p>
</div>
