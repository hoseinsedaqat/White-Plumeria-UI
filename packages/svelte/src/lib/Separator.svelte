<script lang="ts">
  let { orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' } = $props();
</script>
<div class={orientation === 'vertical' ? 'wpl-separator wpl-separator-vertical' : 'wpl-separator'} role="separator" aria-orientation={orientation}></div>
