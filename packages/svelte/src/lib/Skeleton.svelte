<script lang="ts">
  let { width = '100%', height = '1rem' }: { width?: string; height?: string } = $props();
</script>
<span class="wpl-skeleton" style:inline-size={width} style:block-size={height} aria-hidden="true"></span>
