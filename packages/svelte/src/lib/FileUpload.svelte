<script lang="ts">
  import { formatNumber } from '@white-plumeria/core';
  import { useWhitePlumeria } from './context.svelte.ts';

  let {
    label,
    accept = '',
    maxSize = 0,
    multiple = false,
    onfiles,
  }: {
    label: string;
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    onfiles?: (files: File[]) => void;
  } = $props();

  const wpl = useWhitePlumeria();
  const id = $props.id();
  let files = $state<File[]>([]);
  let errors = $state<string[]>([]);
  let active = $state(false);

  function matches(file: File) {
    if (!accept.trim()) return true;
    const rules = accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean);
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return rules.some((rule) => (rule.startsWith('.') ? name.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule));
  }

  function take(list: FileList | null) {
    const next: File[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(list ?? [])) {
      if ((accept && !matches(file)) || (maxSize && file.size > maxSize)) rejected.push(file.name);
      else next.push(file);
    }
    files = multiple ? [...files, ...next] : next.slice(0, 1);
    errors = rejected;
    onfiles?.(files);
  }
</script>

<div class="wpl-field">
  <label class="wpl-label" for={id}>{label}</label>
  <div
    role="group"
    class={active ? 'wpl-dropzone wpl-dropzone-active' : 'wpl-dropzone'}
    ondragover={(event) => {
      event.preventDefault();
      active = true;
    }}
    ondragleave={() => (active = false)}
    ondrop={(event) => {
      event.preventDefault();
      active = false;
      take(event.dataTransfer?.files ?? null);
    }}
  >
    <input {id} type="file" {accept} {multiple} onchange={(event) => take((event.currentTarget as HTMLInputElement).files)} />
    <p class="wpl-muted">{label}</p>
  </div>
  {#each files as file (file.name)}
    <p>{file.name} · {formatNumber(file.size, wpl.preferences.locale)}</p>
  {/each}
  {#each errors as error (error)}
    <p class="wpl-field-error" role="alert">{error}: {wpl.t('fileRejected')}</p>
  {/each}
  <p class="wpl-field-hint">Files stay in the browser. Nothing is uploaded.</p>
</div>
