<script lang="ts">
  import type { Snippet } from 'svelte';
  let { content, children }: { content: string; children?: Snippet } = $props();
  let open = $state(false);
  const id = $props.id();
  let timer: number | undefined;
  function show() {
    timer = window.setTimeout(() => (open = true), 400);
  }
  function hide() {
    if (timer) window.clearTimeout(timer);
    open = false;
  }
</script>

<span role="group" style:position="relative" style:display="inline-flex" onmouseenter={show} onmouseleave={hide} onfocusin={show} onfocusout={hide}>
  <span aria-describedby={open ? id : undefined}>{@render children?.()}</span>
  {#if open}<span {id} role="tooltip" class="wpl-tooltip">{content}</span>{/if}
</span>
