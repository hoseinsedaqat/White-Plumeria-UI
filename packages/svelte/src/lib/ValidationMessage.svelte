<script lang="ts">
  import type { Snippet } from 'svelte';
  import FormMessage from './FormMessage.svelte';
  let { id = '', children }: { id?: string; children?: Snippet } = $props();
</script>
<FormMessage tone="error" {id}>{@render children?.()}</FormMessage>
