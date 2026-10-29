import { nextIndex } from '@white-plumeria/core';
import { createMemo, createSignal } from 'solid-js';
import { Dialog } from './dialog.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
}

export function CommandPalette(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItem[];
  onSelect?: (id: string) => void;
}) {
  const { t } = useWhitePlumeria();
  const [query, setQuery] = createSignal('');
  const [active, setActive] = createSignal(0);
  const filtered = createMemo(() => {
    const needle = query().trim().toLocaleLowerCase();
    if (!needle) return props.commands;
    return props.commands.filter((command) =>
      [command.label, command.group, ...(command.keywords ?? [])].join(' ').toLocaleLowerCase().includes(needle),
    );
  });

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange} title={t('command')} hideTitle class="wpl-command">
      <input
        class="wpl-input wpl-command-input"
        value={query()}
        placeholder={t('search')}
        role="combobox"
        aria-expanded="true"
        aria-controls="wpl-command-list"
        aria-label={t('command')}
        onInput={(event) => {
          setQuery(event.currentTarget.value);
          setActive(0);
        }}
        onKeyDown={(event) => {
          const next = nextIndex(active(), filtered().length, event.key, 'vertical');
          if (next !== null) {
            event.preventDefault();
            setActive(next);
          }
          if (event.key === 'Enter') {
            const command = filtered()[active()];
            if (!command) return;
            props.onSelect?.(command.id);
            props.onOpenChange(false);
          }
        }}
      />
      <div id="wpl-command-list" role="listbox" class="wpl-command-list">
        {filtered().length === 0 ? <p class="wpl-muted">{t('noResults')}</p> : null}
        {filtered().map((command, index) => (
          <button
            type="button"
            role="option"
            aria-selected={index === active()}
            class="wpl-menu-item"
            data-active={index === active() || undefined}
            onMouseEnter={() => setActive(index)}
            onClick={() => {
              props.onSelect?.(command.id);
              props.onOpenChange(false);
            }}
          >
            <span>{command.label}</span>
            {command.group ? <span class="wpl-menu-shortcut">{command.group}</span> : null}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
