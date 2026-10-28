<script lang="ts">
  let { label = 'Loading' }: { label?: string } = $props();
</script>
<span class="wpl-spinner" role="status"><span class="wpl-sr-only">{label}</span></span>
