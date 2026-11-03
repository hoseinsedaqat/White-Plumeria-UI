<script lang="ts">
  let { label = '' }: { label?: string } = $props();
</script>

{#if label}
  <div class="wpl-divider-labeled" role="separator">{label}</div>
{:else}
  <hr class="wpl-divider" />
{/if}
