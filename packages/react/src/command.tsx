import { nextIndex } from '@white-plumeria/core';
import { useMemo, useState } from 'react';
import { Dialog } from './dialog.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
}

export function CommandPalette({
  open,
  onOpenChange,
  commands,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItem[];
  onSelect?: (id: string) => void;
}) {
  const { t } = useWhitePlumeria();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      [command.label, command.group, ...(command.keywords ?? [])]
        .join(' ')
        .toLocaleLowerCase()
        .includes(needle),
    );
  }, [commands, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('command')} hideTitle className="wpl-command">
      <input
        className="wpl-input wpl-command-input"
        value={query}
        placeholder={t('search')}
        role="combobox"
        aria-expanded="true"
        aria-controls="wpl-command-list"
        aria-label={t('command')}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setActive(0);
        }}
        onKeyDown={(event) => {
          const next = nextIndex(active, filtered.length, event.key, 'vertical');
          if (next !== null) {
            event.preventDefault();
            setActive(next);
          }
          if (event.key === 'Enter') {
            const command = filtered[active];
            if (!command) return;
            onSelect?.(command.id);
            onOpenChange(false);
          }
        }}
      />
      <div id="wpl-command-list" role="listbox" className="wpl-command-list">
        {filtered.length === 0 ? <p className="wpl-muted">{t('noResults')}</p> : null}
        {filtered.map((command, index) => (
          <button
            key={command.id}
            type="button"
            role="option"
            aria-selected={index === active}
            className="wpl-menu-item"
            data-active={index === active || undefined}
            onMouseEnter={() => setActive(index)}
            onClick={() => {
              onSelect?.(command.id);
              onOpenChange(false);
            }}
          >
            <span>{command.label}</span>
            {command.group ? <span className="wpl-menu-shortcut">{command.group}</span> : null}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
