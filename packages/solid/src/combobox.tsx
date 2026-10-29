import { bindDismissable, nextIndex } from '@white-plumeria/core';
import { createEffect, createMemo, createSignal, onCleanup , createUniqueId } from 'solid-js';
import { useWhitePlumeria } from './provider.tsx';

export interface ComboOption {
  value: string;
  label: string;
}

export function Combobox(props: {
  label: string;
  options: ComboOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}) {
  const id = createUniqueId();
  const listId = `${id}-list`;
  const { t } = useWhitePlumeria();
  const selected = () => props.options.find((option) => option.value === props.value);
  const [query, setQuery] = createSignal(selected()?.label ?? '');
  const [open, setOpen] = createSignal(false);
  const [active, setActive] = createSignal(0);
  let rootRef: HTMLDivElement | undefined;
  const filtered = createMemo(() => {
    const needle = query().trim().toLocaleLowerCase();
    const current = selected()?.label.toLocaleLowerCase();
    if (!needle || needle === current) return props.options;
    return props.options.filter((option) => option.label.toLocaleLowerCase().includes(needle));
  });

  createEffect(() => {
    if (!open() || !rootRef) return;
    const stop = bindDismissable({ root: rootRef, onDismiss: () => setOpen(false) });
    onCleanup(stop);
  });

  function choose(option: ComboOption) {
    props.onValueChange?.(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div class="wpl-combo" ref={rootRef}>
      <label class="wpl-label" for={id}>
        {props.label}
      </label>
      <input
        id={id}
        class="wpl-input"
        role="combobox"
        aria-expanded={open()}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open() ? `${listId}-${active()}` : undefined}
        value={query()}
        placeholder={props.placeholder}
        onInput={(event) => {
          setQuery(event.currentTarget.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            setOpen(true);
            const next = nextIndex(active(), filtered().length, event.key, 'vertical');
            if (next !== null) setActive(next);
          }
          if (event.key === 'Enter' && open()) {
            event.preventDefault();
            const option = filtered()[active()];
            if (option) choose(option);
          }
          if (event.key === 'Escape') setOpen(false);
        }}
      />
      {open() ? (
        <ul id={listId} role="listbox" class="wpl-listbox">
          {filtered().length === 0 ? (
            <li class="wpl-listbox-item">{t('noResults')}</li>
          ) : (
            filtered().map((option, index) => (
              <li>
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === props.value}
                  data-active={index === active() || undefined}
                  class="wpl-listbox-item"
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
