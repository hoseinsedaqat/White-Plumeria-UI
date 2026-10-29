import { nextIndex, readingDirection } from '@white-plumeria/core';
import { createSignal, type JSX , createUniqueId } from 'solid-js';
import { Icon } from './icon.tsx';

export interface TabItem {
  id: string;
  label: string;
  panel: JSX.Element;
}

export function Tabs(props: {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}) {
  const [internal, setInternal] = createSignal(props.defaultValue ?? props.tabs[0]?.id ?? '');
  const selected = () => props.value ?? internal();
  const baseId = createUniqueId();
  const orientation = () => props.orientation ?? 'horizontal';

  function select(id: string) {
    if (props.value === undefined) setInternal(id);
    props.onValueChange?.(id);
  }

  return (
    <div class={orientation() === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs'}>
      <div
        role="tablist"
        aria-orientation={orientation()}
        class="wpl-tablist"
        onKeyDown={(event) => {
          const index = Math.max(0, props.tabs.findIndex((tab) => tab.id === selected()));
          const direction = readingDirection(event.currentTarget);
          const next = nextIndex(index, props.tabs.length, event.key, orientation(), direction);
          if (next === null) return;
          event.preventDefault();
          const tab = props.tabs[next];
          if (!tab) return;
          select(tab.id);
          event.currentTarget.querySelector<HTMLButtonElement>(`#${CSS.escape(`${baseId}-${tab.id}`)}`)?.focus();
        }}
      >
        {props.tabs.map((tab) => {
          const selectedTab = () => tab.id === selected();
          return (
            <button
              id={`${baseId}-${tab.id}`}
              type="button"
              role="tab"
              class="wpl-tab"
              aria-selected={selectedTab()}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabindex={selectedTab() ? 0 : -1}
              onClick={() => select(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {props.tabs.map((tab) => (
        <div
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${tab.id}`}
          hidden={tab.id !== selected()}
          class="wpl-tabpanel"
          tabindex={0}
        >
          {tab.id === selected() ? tab.panel : null}
        </div>
      ))}
    </div>
  );
}

export interface AccordionItem {
  id: string;
  title: string;
  content: JSX.Element;
}

export function Accordion(props: {
  items: AccordionItem[];
  multiple?: boolean;
  value?: string[];
  onValueChange?: (value: string[]) => void;
}) {
  const [internal, setInternal] = createSignal<string[]>(props.items[0] ? [props.items[0].id] : []);
  const open = () => props.value ?? internal();
  const baseId = createUniqueId();

  function toggle(id: string) {
    const current = open();
    const next = current.includes(id) ? current.filter((item) => item !== id) : props.multiple ? [...current, id] : [id];
    if (props.value === undefined) setInternal(next);
    props.onValueChange?.(next);
  }

  return (
    <div class="wpl-accordion">
      {props.items.map((item) => {
        const expanded = () => open().includes(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div class="wpl-accordion-item">
            <h3 style={{ margin: 0, font: 'inherit' }}>
              <button type="button" class="wpl-accordion-trigger" aria-expanded={expanded()} aria-controls={panelId} onClick={() => toggle(item.id)}>
                {item.title}
                <Icon name="chevronDown" style={{ transform: expanded() ? 'rotate(180deg)' : undefined }} />
              </button>
            </h3>
            <div id={panelId} role="region" hidden={!expanded()} class="wpl-accordion-panel">
              {expanded() ? item.content : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
