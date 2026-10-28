<script lang="ts">
  import type { Snippet } from 'svelte';
  import Label from './Label.svelte';
  import FormMessage from './FormMessage.svelte';
  import ValidationMessage from './ValidationMessage.svelte';
  let { label, hint = '', error = '', required = false, children }: { label: string; hint?: string; error?: string; required?: boolean; children?: Snippet } = $props();
  const id = $props.id();
</script>
<div class={error ? 'wpl-field wpl-field-invalid' : 'wpl-field'}>
  <Label for={id} {required}>{label}</Label>
  {@render children?.()}
  {#if hint}<FormMessage id={`${id}-hint`}>{hint}</FormMessage>{/if}
  {#if error}<ValidationMessage id={`${id}-error`}>{error}</ValidationMessage>{/if}
</div>
