import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const rangeError = [
  ['packages/react/src/calendar.tsx', '${startId}-error'],
  ['packages/vue/src/calendar.ts', '${startId}-error'],
  ['packages/svelte/src/lib/DateRangePicker.svelte', '{startId}-error'],
  ['packages/solid/src/calendar.tsx', '${startId}-error'],
  ['packages/preact/src/calendar.tsx', '${startId}-error'],
  ['packages/qwik/src/calendar.tsx', '${startId}-error'],
  ['packages/lit/src/calendar.ts', '${this.startId}-error'],
  ['packages/angular/src/calendar.ts', "startId + '-error'"],
  ['packages/alpine/src/data.ts', '${startId}-error'],
  ['packages/ember/src/data.ts', '${str(host.state.startId)}-error'],
  ['packages/marko/src/tags/wpl-date-range-picker.marko', 'startId + "-error"'],
] as const;

const fileError = [
  ['packages/react/src/file-upload.tsx', '${id}-error'],
  ['packages/vue/src/file-upload.ts', '${id}-error'],
  ['packages/svelte/src/lib/FileUpload.svelte', '{id}-error'],
  ['packages/solid/src/file-upload.tsx', '${id}-error'],
  ['packages/preact/src/file-upload.tsx', '${id}-error'],
  ['packages/qwik/src/file-upload.tsx', '${id}-error'],
  ['packages/lit/src/file-upload.ts', '${this.inputId}-error'],
  ['packages/angular/src/file-upload.ts', "inputId + '-error'"],
  ['packages/alpine/src/widgets.ts', 'aria-describedby'],
  ['packages/ember/src/controls.ts', '${str(host.state.fileId)}-error'],
  ['packages/marko/src/tags/wpl-file-upload.marko', 'fileId + "-error"'],
] as const;

describe('owned field errors', () => {
  it('names a date-range error from the fields that show it', () => {
    for (const [file, token] of rangeError) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).toContain('aria-describedby');
      expect(text, file).toContain(token);
    }
  });

  it('names a rejected file from the file input', () => {
    for (const [file, token] of fileError) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).toContain('aria-describedby');
      expect(text, file).toContain(token);
    }
  });
});
