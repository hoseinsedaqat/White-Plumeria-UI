<script lang="ts">
  import type { Snippet } from 'svelte';
  let { tone = 'hint', id = '', children }: { tone?: 'hint' | 'error'; id?: string; children?: Snippet } = $props();
</script>
<p {id} class={tone === 'error' ? 'wpl-field-error' : 'wpl-field-hint'} role={tone === 'error' ? 'alert' : undefined}>{@render children?.()}</p>
