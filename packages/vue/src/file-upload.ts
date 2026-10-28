import { formatNumber } from '@white-plumeria/core';
import { defineComponent, h, ref, useId } from 'vue';
import { useWhitePlumeria } from './provider.ts';

export interface RejectedFile {
  name: string;
  reason: string;
}

function matchesAccept(file: File, accept: string): boolean {
  if (!accept.trim()) return true;
  const rules = accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export const FileUpload = defineComponent({
  name: 'FileUpload',
  props: {
    label: { type: String, required: true },
    accept: { type: String, default: '' },
    maxSize: { type: Number, default: 0 },
    multiple: { type: Boolean, default: false },
  },
  emits: ['files'],
  setup(props, { emit }) {
    const id = useId();
    const { t, locale } = useWhitePlumeria();
    const files = ref<File[]>([]);
    const errors = ref<RejectedFile[]>([]);
    const active = ref(false);

    function take(list: FileList | null) {
      const next: File[] = [];
      const rejected: RejectedFile[] = [];
      for (const file of Array.from(list ?? [])) {
        if (props.accept && !matchesAccept(file, props.accept)) {
          rejected.push({ name: file.name, reason: t('fileRejected') });
          continue;
        }
        if (props.maxSize && file.size > props.maxSize) {
          rejected.push({ name: file.name, reason: t('fileRejected') });
          continue;
        }
        next.push(file);
      }
      files.value = props.multiple ? [...files.value, ...next] : next.slice(0, 1);
      errors.value = rejected;
      emit('files', files.value);
    }

    return () =>
      h('div', { class: 'wpl-field' }, [
        h('label', { class: 'wpl-label', for: id }, props.label),
        h(
          'div',
          {
            class: active.value ? 'wpl-dropzone wpl-dropzone-active' : 'wpl-dropzone',
            onDragover: (event: DragEvent) => {
              event.preventDefault();
              active.value = true;
            },
            onDragleave: () => (active.value = false),
            onDrop: (event: DragEvent) => {
              event.preventDefault();
              active.value = false;
              take(event.dataTransfer?.files ?? null);
            },
          },
          [
            h('input', {
              id,
              type: 'file',
              accept: props.accept || undefined,
              multiple: props.multiple,
              onChange: (event: Event) => take((event.target as HTMLInputElement).files),
            }),
            h('p', { class: 'wpl-muted' }, props.label),
          ],
        ),
        files.value.map((file) =>
          h('p', { key: file.name }, `${file.name} · ${formatNumber(file.size, locale.value)}`),
        ),
        errors.value.map((error) => h('p', { key: error.name, class: 'wpl-field-error', role: 'alert' }, `${error.name}: ${error.reason}`)),
        h('p', { class: 'wpl-field-hint' }, 'Files stay in the browser. Nothing is uploaded.'),
      ]);
  },
});
