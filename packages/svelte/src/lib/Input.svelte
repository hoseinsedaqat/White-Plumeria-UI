<script lang="ts">
  import { inputClassName, type ControlSize } from '@white-plumeria/core';
  let { value = $bindable(''), size = 'md', invalid = false, type = 'text', name = '', placeholder = '' }: { value?: string; size?: ControlSize; invalid?: boolean; type?: string; name?: string; placeholder?: string } = $props();
</script>
<input class={inputClassName({ size })} {type} {name} {placeholder} bind:value aria-invalid={invalid || undefined} />
