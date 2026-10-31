import { bindDismissable, nextIndex } from '@white-plumeria/core';
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';
import { Icon } from './icon.tsx';
import { useWhitePlumeria } from './provider.tsx';

export interface ComboOption {
  value: string;
  label: string;
}

export function Combobox({
  label,
  options,
  value,
  onValueChange,
  placeholder,
}: {
  label: string;
  options: ComboOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const { t } = useWhitePlumeria();
  const selected = options.find((option) => option.value === value);
  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle || needle === selected?.label.toLocaleLowerCase()) return options;
    return options.filter((option) => option.label.toLocaleLowerCase().includes(needle));
  }, [options, query, selected?.label]);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    return bindDismissable({ root: rootRef.current, onDismiss: () => setOpen(false) });
  }, [open]);

  function choose(option: ComboOption) {
    onValueChange?.(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div className="wpl-combo" ref={rootRef}>
      <label className="wpl-label" htmlFor={id}>
        {label}
      </label>
      <div className="wpl-combo-control">
        <span className="wpl-combo-icon" aria-hidden="true">
          <Icon name="search" />
        </span>
        <input
        id={id}
        className="wpl-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        value={query}
        placeholder={placeholder}
        onInput={(event) => {
          setQuery(event.currentTarget.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp' ||
            event.key === 'Home' ||
            event.key === 'End'
          ) {
            event.preventDefault();
            setOpen(true);
            const next = nextIndex(active, filtered.length, event.key, 'vertical');
            if (next !== null) setActive(next);
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault();
            const option = filtered[active];
            if (option) choose(option);
          }
          if (event.key === 'Escape') setOpen(false);
        }}
      />
      </div>
      {open ? (
        <ul id={listId} role="listbox" className="wpl-listbox">
          {filtered.length === 0 ? (
            <li className="wpl-listbox-item">{t('noResults')}</li>
          ) : (
            filtered.map((option, index) => (
              <li key={option.value}>
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  data-active={index === active || undefined}
                  className="wpl-listbox-item"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
