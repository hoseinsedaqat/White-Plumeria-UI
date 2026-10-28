<script lang="ts">
  let { value = $bindable(''), rows = 4, name = '', placeholder = '' }: { value?: string; rows?: number; name?: string; placeholder?: string } = $props();
</script>
<textarea class="wpl-textarea" {rows} {name} {placeholder} bind:value></textarea>
