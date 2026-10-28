<script lang="ts">
  import type { Snippet } from 'svelte';
  let { note = '', children }: { note?: string; children?: Snippet } = $props();
</script>
<footer class="wpl-footer">{#if note}<p>{note}</p>{/if}{@render children?.()}</footer>
