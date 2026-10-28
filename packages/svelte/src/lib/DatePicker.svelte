<script lang="ts">
  import { formatDate, parseIsoDate, type CalendarSystem } from '@white-plumeria/core';
  import Calendar from './Calendar.svelte';
  import IconButton from './IconButton.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    value = $bindable(''),
    calendar = 'gregory',
    min = '',
    max = '',
  }: {
    label: string;
    value?: string;
    calendar?: CalendarSystem;
    min?: string;
    max?: string;
  } = $props();

  const wpl = useWhitePlumeria();
  const id = $props.id();
  let open = $state(false);
  let text = $state(value);
  let error = $state('');
  const selected = $derived(parseIsoDate(value || text));
  let picked = $state<Date | null>(null);

  function iso(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
      error = wpl.preferences.locale === 'fa' ? 'تاریخ باید به شکل YYYY-MM-DD باشد.' : 'Use an ISO date: YYYY-MM-DD.';
      return;
    }
    error = '';
    value = next;
  }
</script>

<div class="wpl-field">
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
    <IconButton label={wpl.t('chooseDate')} onclick={() => (open = !open)}>▦</IconButton>
  </div>
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
    {selected ? formatDate(selected, wpl.preferences.locale, { dateStyle: 'full' }, calendar) : wpl.t('chooseDate')}
  </p>
</div>
