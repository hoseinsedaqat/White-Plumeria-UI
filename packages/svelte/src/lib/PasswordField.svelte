<script lang="ts">
  import Icon from './Icon.svelte';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    value = $bindable(''),
    name = '',
    autocomplete = 'current-password',
    invalid = false,
    disabled = false,
    onvaluechange,
  }: {
    label: string;
    value?: string;
    name?: string;
    autocomplete?: 'current-password' | 'new-password' | 'off';
    invalid?: boolean;
    disabled?: boolean;
    onvaluechange?: (value: string) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const inputId = $props.id();
  let visible = $state(false);
</script>

<div class="wpl-field">
  <label class="wpl-label" for={inputId}>{label}</label>
  <div class="wpl-password">
    <input
      id={inputId}
      class="wpl-input"
      type={visible ? 'text' : 'password'}
      {name}
      {autocomplete}
      {disabled}
      aria-invalid={invalid || undefined}
      bind:value
      oninput={() => onvaluechange?.(value)}
    />
    <button
      type="button"
      class="wpl-icon-btn wpl-btn-ghost"
      aria-pressed={visible}
      aria-label={visible ? wpl.t('hidePassword') : wpl.t('showPassword')}
      {disabled}
      onclick={() => (visible = !visible)}
    >
      <Icon name={visible ? 'eyeOff' : 'eye'} />
    </button>
  </div>
</div>
