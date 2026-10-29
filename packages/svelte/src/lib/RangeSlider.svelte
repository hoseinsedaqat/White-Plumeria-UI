<script lang="ts">
  import {
    clampRangeEdge,
    formatNumber,
    nearerEdge,
    normalizeRange,
    rangeBounds,
    rangeFill,
    valueFromPointer,
    type NumberRange,
  } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    min = 0,
    max = 100,
    step = 1,
    start = $bindable(0),
    end = $bindable(100),
    disabled = false,
    name = '',
    onchange,
  }: {
    label: string;
    min?: number;
    max?: number;
    step?: number;
    start?: number;
    end?: number;
    disabled?: boolean;
    name?: string;
    onchange?: (value: NumberRange) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const id = $props.id();
  let startInput = $state<HTMLInputElement>();
  let endInput = $state<HTMLInputElement>();
  const bounds = $derived(rangeBounds(min, max, step));
  const current = $derived(normalizeRange(start, end, bounds));
  const fill = $derived(rangeFill(current, bounds));

  function commit(edge: 'start' | 'end', next: number) {
    const ordered = clampRangeEdge(edge, next, current, bounds);
    start = ordered.start;
    end = ordered.end;
    onchange?.(ordered);
  }

  function onTrackPointerDown(event: PointerEvent) {
    if (disabled || event.target instanceof HTMLInputElement) return;
    const host = event.currentTarget as HTMLElement;
    const rect = host.getBoundingClientRect();
    const direction = getComputedStyle(host).direction === 'rtl' ? 'rtl' : 'ltr';
    const value = valueFromPointer(event.clientX, rect.left, rect.width, bounds, direction);
    const edge = nearerEdge(value, current);
    commit(edge, value);
    (edge === 'start' ? startInput : endInput)?.focus();
  }
</script>

<div class="wpl-field">
  <div class="wpl-flex wpl-flex-between">
    <span class="wpl-label" id="{id}-label">{label}</span>
    <output class="wpl-range-readout" aria-hidden="true">{formatNumber(current.start, wpl.preferences.locale)} – {formatNumber(current.end, wpl.preferences.locale)}</output>
  </div>
  <div
    class="wpl-range"
    role="group"
    aria-labelledby="{id}-label"
    data-disabled={disabled ? 'true' : undefined}
    style="--wpl-range-start: {fill.start}; --wpl-range-size: {fill.size}"
    onpointerdown={onTrackPointerDown}
  >
    <span class="wpl-range-track" aria-hidden="true"></span>
    <span class="wpl-range-fill" aria-hidden="true"></span>
    <input
      bind:this={startInput}
      id="{id}-start"
      class="wpl-range-input"
      type="range"
      min={bounds.min}
      max={bounds.max}
      step={bounds.step}
      value={current.start}
      {disabled}
      name={name ? `${name}-start` : undefined}
      aria-label="{label} start"
      aria-valuetext={formatNumber(current.start, wpl.preferences.locale)}
      oninput={(event) => commit('start', Number(event.currentTarget.value))}
    />
    <input
      bind:this={endInput}
      id="{id}-end"
      class="wpl-range-input"
      data-edge="end"
      type="range"
      min={bounds.min}
      max={bounds.max}
      step={bounds.step}
      value={current.end}
      {disabled}
      name={name ? `${name}-end` : undefined}
      aria-label="{label} end"
      aria-valuetext={formatNumber(current.end, wpl.preferences.locale)}
      oninput={(event) => commit('end', Number(event.currentTarget.value))}
    />
  </div>
</div>
