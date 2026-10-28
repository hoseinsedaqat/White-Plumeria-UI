<script lang="ts">
  import { inputClassName, otpApply, otpCells, otpDelete, otpLength, readingDirection } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    length = 6,
    value = $bindable(''),
    name = '',
    numeric = true,
    disabled = false,
    onvaluechange,
  }: {
    label: string;
    length?: number;
    value?: string;
    name?: string;
    numeric?: boolean;
    disabled?: boolean;
    onvaluechange?: (value: string) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  let refs: Array<HTMLInputElement | null> = [];
  const size = $derived(otpLength(length));
  const cells = $derived(otpCells(value, size, numeric));

  function commit(next: string, focus: number) {
    value = next;
    onvaluechange?.(next);
    queueMicrotask(() => refs[focus]?.focus());
  }
</script>

<fieldset class="wpl-field">
  <legend class="wpl-label">{label}</legend>
  <div class="wpl-otp" role="group" aria-label={label}>
    {#each cells as cell, index (index)}
      <input
        bind:this={refs[index]}
        class={inputClassName({ className: 'wpl-otp-cell' })}
        value={cell}
        inputmode={numeric ? 'numeric' : 'text'}
        autocomplete={index === 0 ? 'one-time-code' : 'off'}
        aria-label="{wpl.t('character')} {index + 1} {wpl.t('of')} {size}"
        {disabled}
        maxlength="1"
        oninput={(event) => {
          const raw = event.currentTarget.value;
          const result = raw ? otpApply(value, size, numeric, index, raw.slice(-1)) : otpDelete(value, size, numeric, index);
          commit(result.value, result.focus);
        }}
        onpaste={(event) => {
          event.preventDefault();
          const result = otpApply(value, size, numeric, index, event.clipboardData?.getData('text') ?? '');
          commit(result.value, result.focus);
        }}
        onkeydown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const direction = readingDirection(event.currentTarget);
            const delta = event.key === 'ArrowRight' ? (direction === 'rtl' ? -1 : 1) : direction === 'rtl' ? 1 : -1;
            refs[Math.min(size - 1, Math.max(0, index + delta))]?.focus();
          }
          if (event.key === 'Backspace' && !cells[index]) {
            event.preventDefault();
            const result = otpDelete(value, size, numeric, index);
            commit(result.value, result.focus);
          }
        }}
      />
    {/each}
  </div>
  {#if name}<input type="hidden" {name} {value} />{/if}
</fieldset>
