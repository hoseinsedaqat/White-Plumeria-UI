<script lang="ts">
  let { label, checked = $bindable(false), disabled = false, name = '' }: { label: string; checked?: boolean; disabled?: boolean; name?: string } = $props();
</script>
<button type="button" role="switch" class="wpl-switch" aria-checked={checked} {disabled} onclick={() => (checked = !checked)}>
  <span class="wpl-switch-control" aria-hidden="true"></span>
  <span>{label}</span>
  {#if name}<input type="checkbox" {name} {checked} hidden />{/if}
</button>
