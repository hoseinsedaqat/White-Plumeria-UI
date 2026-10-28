<script lang="ts">
  import { formatDate, orderDateRange, parseIsoDate, toIsoDate, type CalendarSystem, type DateRangeValue } from '@white-plumeria/core';
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
    onchange,
  }: {
    label: string;
    start?: string;
    end?: string;
    calendar?: CalendarSystem;
    min?: string;
    max?: string;
    onchange?: (value: DateRangeValue) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const startId = $props.id();
  let open = $state(false);
  let startText = $state(start);
  let endText = $state(end);
  let error = $state('');
  let awaitingEnd = $state(false);
  let picked = $state<Date | null>(null);
  const startDate = $derived(parseIsoDate(startText));
  const endDate = $derived(parseIsoDate(endText));

  function emit(nextStart: string, nextEnd: string) {
    const ordered = nextStart && nextEnd ? orderDateRange(nextStart, nextEnd) : { start: nextStart, end: nextEnd };
    startText = ordered.start;
    endText = ordered.end;
    start = ordered.start;
    end = ordered.end;
    error = '';
    onchange?.(ordered);
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
      start = iso;
      end = '';
      awaitingEnd = true;
      error = '';
      onchange?.({ start: iso, end: '' });
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
      {formatDate(startDate, wpl.preferences.locale, { dateStyle: 'medium' }, calendar)} – {formatDate(endDate, wpl.preferences.locale, { dateStyle: 'medium' }, calendar)}
    {:else if startDate}
      {formatDate(startDate, wpl.preferences.locale, { dateStyle: 'medium' }, calendar)}
    {:else}
      {wpl.t('chooseDate')}
    {/if}
  </p>
</div>
