<script lang="ts">
  let { label, value = $bindable(''), placeholder = '' }: { label: string; value?: string; placeholder?: string } = $props();
  const id = $props.id();
</script>
<div class="wpl-search">
  <label class="wpl-sr-only" for={id}>{label}</label>
  <input {id} class="wpl-input" type="search" bind:value placeholder={placeholder || label} />
</div>
