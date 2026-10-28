<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Preferences } from '@white-plumeria/core';
  import { message } from '@white-plumeria/core';
  import {
    createPreferences,
    mergePreferences,
    persistPreferences,
    setWpl,
    storedPreferences,
    type ToastInput,
  } from './context.svelte.ts';

  let { children }: { children?: Snippet } = $props();
  let preferences = $state<Preferences>(createPreferences());
  let toasts = $state<ToastInput[]>([]);
  let ready = $state(false);

  setWpl({
    get preferences() {
      return preferences;
    },
    setPreferences(next) {
      preferences = mergePreferences(preferences, next);
    },
    t: (key) => message(preferences.locale, key),
    get toasts() {
      return toasts;
    },
    pushToast(toast) {
      toasts = [...toasts, toast];
    },
    dismissToast(index) {
      toasts = toasts.filter((_, item) => item !== index);
    },
  });

  $effect(() => {
    if (!ready) {
      preferences = storedPreferences();
      ready = true;
      return;
    }
    persistPreferences(preferences);
  });
</script>

{@render children?.()}
<div class="wpl-toast-region" role="region" aria-label="Notifications">
  {#each toasts as toast, index (toast.title + index)}
    <div class="wpl-toast" role={toast.variant === 'danger' ? 'alert' : 'status'}>
      <p class="wpl-toast-title">{toast.title}</p>
      {#if toast.description}<p class="wpl-toast-description">{toast.description}</p>{/if}
      <button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label="Dismiss" onclick={() => (toasts = toasts.filter((_, item) => item !== index))}>×</button>
    </div>
  {/each}
</div>
