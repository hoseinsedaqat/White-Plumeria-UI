<script lang="ts">
  let { label = '' }: { label?: string } = $props();
</script>
<div class="wpl-divider" role="separator">{#if label}<span>{label}</span>{/if}</div>
