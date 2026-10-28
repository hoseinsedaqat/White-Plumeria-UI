<script lang="ts">
  let { label, value = undefined, max = 100 }: { label: string; value?: number; max?: number } = $props();
  const indeterminate = $derived(value === undefined);
  const percent = $derived(indeterminate ? undefined : Math.min(100, Math.max(0, ((value ?? 0) / (max > 0 ? max : 100)) * 100)));
</script>
<div class={indeterminate ? 'wpl-progress-track wpl-progress-indeterminate' : 'wpl-progress-track'} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={indeterminate ? undefined : value}>
  <span class="wpl-progress-bar" style:inline-size={percent === undefined ? undefined : `${percent}%`}></span>
</div>
