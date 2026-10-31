import { bindDismissable, nextIndex } from '@white-plumeria/core';
import { $, component$, useId, useSignal, useVisibleTask$, type QRL } from '@qwik.dev/core';
import { Icon } from './icon';
import { useWhitePlumeria } from './provider';

export interface ComboOption {
  value: string;
  label: string;
}

export const Combobox = component$<{
  label: string;
  options: ComboOption[];
  value?: string;
  placeholder?: string;
  onValueChange$?: QRL<(value: string) => void>;
}>((props) => {
  const id = useId();
  const listId = `${id}-list`;
  const wpl = useWhitePlumeria();
  const selected = props.options.find((option) => option.value === props.value);
  const query = useSignal(selected?.label ?? '');
  const open = useSignal(false);
  const active = useSignal(0);
  const rootRef = useSignal<HTMLDivElement>();
  const needle = query.value.trim().toLocaleLowerCase();
  const filtered = !needle || needle === selected?.label.toLocaleLowerCase()
    ? props.options
    : props.options.filter((option) => option.label.toLocaleLowerCase().includes(needle));

  const choose = $((option: ComboOption) => {
    void props.onValueChange$?.(option.value);
    query.value = option.label;
    open.value = false;
  });

  useVisibleTask$(({ track, cleanup }) => {
    const isOpen = track(() => open.value);
    const root = rootRef.value;
    if (!isOpen || !root) return;
    const stop = bindDismissable({ root, onDismiss: () => { open.value = false; } });
    cleanup(() => stop());
  });

  return (
    <div class="wpl-combo" ref={rootRef}>
      <label class="wpl-label" for={id}>{props.label}</label>
      <div class="wpl-combo-control">
        <span class="wpl-combo-icon" aria-hidden="true">
          <Icon name="search" />
        </span>
        <input
        id={id}
        class="wpl-input"
        role="combobox"
        aria-expanded={open.value}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open.value ? `${listId}-${active.value}` : undefined}
        value={query.value}
        placeholder={props.placeholder}
        onInput$={(_, element) => {
          query.value = element.value;
          open.value = true;
          active.value = 0;
        }}
        onFocus$={() => { open.value = true; }}
        onKeyDown$={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            open.value = true;
            const next = nextIndex(active.value, filtered.length, event.key, 'vertical');
            if (next !== null) active.value = next;
          }
          if (event.key === 'Enter' && open.value) {
            event.preventDefault();
            const option = filtered[active.value];
            if (option) choose(option);
          }
          if (event.key === 'Escape') open.value = false;
        }}
      />
      </div>
      {open.value ? (
        <ul id={listId} role="listbox" class="wpl-listbox">
          {filtered.length === 0 ? (
            <li class="wpl-listbox-item">{wpl.t('noResults')}</li>
          ) : (
            filtered.map((option, index) => (
              <li key={option.value}>
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === props.value}
                  data-active={index === active.value || undefined}
                  class="wpl-listbox-item"
                  onMouseEnter$={() => { active.value = index; }}
                  onClick$={() => choose(option)}
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
});
