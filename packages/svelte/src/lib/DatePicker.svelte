<script lang="ts">
  import { formatDate, parseIsoDate, parseTimeValue, toIsoDate, type CalendarSystem } from '@white-plumeria/core';
  import Calendar from './Calendar.svelte';
  import Icon from './Icon.svelte';
  import IconButton from './IconButton.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    value = $bindable(''),
    calendar = 'gregory',
    min = '',
    max = '',
    showTime = false,
    time = $bindable(''),
  }: {
    label: string;
    value?: string;
    calendar?: CalendarSystem;
    min?: string;
    max?: string;
    showTime?: boolean;
    time?: string;
  } = $props();

  const wpl = useWhitePlumeria();
  const id = $props.id();
  let open = $state(false);
  let text = $state(value);
  let timeText = $state(time);
  let error = $state('');
  const selected = $derived(parseIsoDate(value || text));
  let picked = $state<Date | null>(null);

  function iso(date: Date) {
    return toIsoDate(date);
  }

  $effect(() => {
    if (!open || !picked) return;
    const next = iso(picked);
    if (next !== value) {
      commit(next);
      open = false;
    }
  });

  function commit(next: string) {
    text = next;
    if (!next) {
      error = '';
      value = '';
      return;
    }
    if (!parseIsoDate(next)) {
      error = wpl.t('invalidDate');
      return;
    }
    error = '';
    value = next;
  }

  function commitTime(next: string) {
    timeText = next;
    if (!next) {
      error = '';
      time = '';
      return;
    }
    const parsed = parseTimeValue(next);
    if (!parsed) {
      error = wpl.t('invalidTime');
      return;
    }
    const stored = `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
    timeText = stored;
    time = stored;
    error = '';
  }
</script>

<div class="wpl-date">
  <label class="wpl-label" for={id}>{label}</label>
  <div class="wpl-flex">
    <input
      {id}
      class="wpl-input"
      bind:value={text}
      placeholder="YYYY-MM-DD"
      inputmode="numeric"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      oninput={(event) => commit((event.currentTarget as HTMLInputElement).value)}
    />
    <IconButton label={wpl.t('chooseDate')} onclick={() => (open = !open)}><Icon name="calendar" /></IconButton>
  </div>
  {#if showTime}
    <div class="wpl-field wpl-time">
      <label class="wpl-label" for="{id}-time">{wpl.t('time')}</label>
      <input
        id="{id}-time"
        class="wpl-input"
        value={timeText}
        placeholder="HH:mm"
        inputmode="numeric"
        aria-invalid={error ? true : undefined}
        oninput={(event) => commitTime((event.currentTarget as HTMLInputElement).value)}
      />
    </div>
  {/if}
  {#if error}<p id="{id}-error" class="wpl-field-error" role="alert">{error}</p>{/if}
  {#if open}
    <Calendar
      bind:value={picked}
      {calendar}
      locale={wpl.preferences.locale}
      min={min ? parseIsoDate(min) : null}
      max={max ? parseIsoDate(max) : null}
    />
  {/if}
  <p class="wpl-field-hint">
    {selected ? formatDate(selected, wpl.preferences.locale, { dateStyle: 'full' }, calendar) : wpl.t('chooseDate')}{showTime && parseTimeValue(timeText) ? `, ${timeText}` : ''}
  </p>
</div>
