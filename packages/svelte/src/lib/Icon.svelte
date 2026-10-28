<script lang="ts">
  import { cx, directionalIcons, iconPaths, type IconName } from '@white-plumeria/core';
  let { name, class: className = '' }: { name: IconName; class?: string } = $props();
</script>

<svg
  class={cx('wpl-icon', directionalIcons.has(name) && 'wpl-icon-dir', className)}
  viewBox="0 0 24 24"
  aria-hidden="true"
  focusable="false"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d={iconPaths[name]} />
</svg>
