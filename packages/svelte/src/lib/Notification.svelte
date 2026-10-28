<script lang="ts">
  let { title, description = '', variant = 'neutral' }: { title: string; description?: string; variant?: string } = $props();
</script>
<div class="wpl-notification" role={variant === 'danger' ? 'alert' : 'status'}>
  <p class="wpl-toast-title">{title}</p>
  {#if description}<p class="wpl-toast-description">{description}</p>{/if}
</div>
