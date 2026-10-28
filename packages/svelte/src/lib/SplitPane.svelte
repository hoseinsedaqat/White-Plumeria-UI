<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, size = $bindable(50), start, end }: { label: string; size?: number; start?: Snippet; end?: Snippet } = $props();
</script>
<div class="wpl-split" style:--wpl-split-size={`${size}%`}>
  <div class="wpl-split-pane">{@render start?.()}</div>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="separator"
    aria-orientation="vertical"
    aria-label={label}
    aria-valuenow={size}
    aria-valuemin={20}
    aria-valuemax={80}
    tabindex="0"
    class="wpl-split-handle"
    onkeydown={(event) => {
      if (event.key === 'ArrowRight') size = Math.min(80, size + 5);
      if (event.key === 'ArrowLeft') size = Math.max(20, size - 5);
    }}
  ></div>
  <div class="wpl-split-pane">{@render end?.()}</div>
</div>
