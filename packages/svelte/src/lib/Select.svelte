<script lang="ts">
  let { value = $bindable(''), name = '', options = [] as Array<{ value: string; label: string; disabled?: boolean }>, placeholder = '' }: { value?: string; name?: string; options?: Array<{ value: string; label: string; disabled?: boolean }>; placeholder?: string } = $props();
</script>
<select class="wpl-select" {name} bind:value>
  {#if placeholder}<option value="">{placeholder}</option>{/if}
  {#each options as option (option.value)}
    <option value={option.value} disabled={option.disabled}>{option.label}</option>
  {/each}
</select>
