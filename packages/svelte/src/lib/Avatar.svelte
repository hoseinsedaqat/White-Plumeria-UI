<script lang="ts">
  import { avatarClassName, type AvatarSize } from '@white-plumeria/core';
  let { name, src = '', alt = '', size = 'md', status = '', statusLabel = '' }: { name: string; src?: string; alt?: string; size?: AvatarSize; status?: '' | 'online' | 'busy' | 'offline'; statusLabel?: string } = $props();
  let failed = $state(false);
  const initials = $derived(name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase());
</script>
<span class={avatarClassName(size)}>
  {#if src && !failed}
    <img {src} alt={alt || name} onerror={() => (failed = true)} />
  {:else}
    <span aria-hidden="true">{initials}</span>
    <span class="wpl-sr-only">{name}</span>
  {/if}
  {#if status && statusLabel}
    <span class="wpl-avatar-status"></span>
    <span class="wpl-sr-only">{statusLabel}</span>
  {/if}
</span>
