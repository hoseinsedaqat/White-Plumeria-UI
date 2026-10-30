import { nextIndex } from '@white-plumeria/core';
import { component$, useSignal, type QRL } from '@qwik.dev/core';
import { Dialog } from './dialog';
import { useWhitePlumeria } from './provider';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
}

export const CommandPalette = component$<{
  open: boolean;
  commands: CommandItem[];
  onOpenChange$: QRL<(open: boolean) => void>;
  onSelect$?: QRL<(id: string) => void>;
}>((props) => {
  const wpl = useWhitePlumeria();
  const query = useSignal('');
  const active = useSignal(0);
  const needle = query.value.trim().toLocaleLowerCase();
  const filtered = !needle
    ? props.commands
    : props.commands.filter((command) =>
        [command.label, command.group, ...(command.keywords ?? [])].join(' ').toLocaleLowerCase().includes(needle),
      );

  return (
    <Dialog open={props.open} onOpenChange$={props.onOpenChange$} title={wpl.t('command')} hideTitle class="wpl-command">
      <input
        class="wpl-input wpl-command-input"
        value={query.value}
        placeholder={wpl.t('search')}
        role="combobox"
        aria-expanded="true"
        aria-controls="wpl-command-list"
        aria-label={wpl.t('command')}
        onInput$={(_, element) => {
          query.value = element.value;
          active.value = 0;
        }}
        onKeyDown$={(event) => {
          const next = nextIndex(active.value, filtered.length, event.key, 'vertical');
          if (next !== null) {
            event.preventDefault();
            active.value = next;
          }
          if (event.key === 'Enter') {
            const command = filtered[active.value];
            if (!command) return;
            void props.onSelect$?.(command.id);
            void props.onOpenChange$?.(false);
          }
        }}
      />
      <div id="wpl-command-list" role="listbox" class="wpl-command-list">
        {filtered.length === 0 ? <p class="wpl-muted">{wpl.t('noResults')}</p> : null}
        {filtered.map((command, index) => (
          <button
            key={command.id}
            type="button"
            role="option"
            aria-selected={index === active.value}
            class="wpl-menu-item"
            data-active={index === active.value || undefined}
            onMouseEnter$={() => { active.value = index; }}
            onClick$={() => {
              void props.onSelect$?.(command.id);
              void props.onOpenChange$?.(false);
            }}
          >
            <span>{command.label}</span>
            {command.group ? <span class="wpl-menu-shortcut">{command.group}</span> : null}
          </button>
        ))}
      </div>
    </Dialog>
  );
});
