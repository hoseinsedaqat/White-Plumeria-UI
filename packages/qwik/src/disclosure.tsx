import { nextIndex, readingDirection } from '@white-plumeria/core';
import { component$, useId, useSignal, type JSXOutput, type QRL } from '@qwik.dev/core';
import { Icon } from './icon';

export interface TabItem {
  id: string;
  label: string;
  panel: JSXOutput;
}

export const Tabs = component$<{
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
  onValueChange$?: QRL<(value: string) => void>;
}>((props) => {
  const internal = useSignal(props.defaultValue ?? props.tabs[0]?.id ?? '');
  const selected = props.value ?? internal.value;
  const baseId = useId();
  const orientation = props.orientation ?? 'horizontal';

  return (
    <div class={orientation === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs'}>
      <div
        role="tablist"
        aria-orientation={orientation}
        class="wpl-tablist"
        onKeyDown$={(event, element) => {
          const index = Math.max(0, props.tabs.findIndex((tab) => tab.id === selected));
          const next = nextIndex(index, props.tabs.length, event.key, orientation, readingDirection(element));
          if (next === null) return;
          event.preventDefault();
          const tab = props.tabs[next];
          if (!tab) return;
          if (props.value === undefined) internal.value = tab.id;
          void props.onValueChange$?.(tab.id);
          queueMicrotask(() => element.querySelector<HTMLButtonElement>(`#${CSS.escape(`${baseId}-${tab.id}`)}`)?.focus());
        }}
      >
        {props.tabs.map((tab) => {
          const selectedTab = tab.id === selected;
          return (
            <button
              key={tab.id}
              id={`${baseId}-${tab.id}`}
              type="button"
              role="tab"
              class="wpl-tab"
              aria-selected={selectedTab}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selectedTab ? 0 : -1}
              onClick$={() => {
                if (props.value === undefined) internal.value = tab.id;
                void props.onValueChange$?.(tab.id);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {props.tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${tab.id}`}
          hidden={tab.id !== selected}
          class="wpl-tabpanel"
          tabIndex={0}
        >
          {tab.id === selected ? tab.panel : null}
        </div>
      ))}
    </div>
  );
});

export interface AccordionItem {
  id: string;
  title: string;
  content: JSXOutput;
}

export const Accordion = component$<{
  items: AccordionItem[];
  multiple?: boolean;
  value?: string[];
  onValueChange$?: QRL<(value: string[]) => void>;
}>((props) => {
  const internal = useSignal<string[]>(props.items[0] ? [props.items[0].id] : []);
  const open = props.value ?? internal.value;
  const baseId = useId();
  return (
    <div class="wpl-accordion">
      {props.items.map((item) => {
        const expanded = open.includes(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div class="wpl-accordion-item" key={item.id}>
            <h3 style={{ margin: 0, font: 'inherit' }}>
              <button
                type="button"
                class="wpl-accordion-trigger"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick$={() => {
                  const next = open.includes(item.id)
                    ? open.filter((entry) => entry !== item.id)
                    : props.multiple
                      ? [...open, item.id]
                      : [item.id];
                  if (props.value === undefined) internal.value = next;
                  void props.onValueChange$?.(next);
                }}
              >
                {item.title}
                <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(180deg)' : undefined }}>
                  <Icon name="chevronDown" />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" hidden={!expanded} class="wpl-accordion-panel">
              {expanded ? item.content : null}
            </div>
          </div>
        );
      })}
    </div>
  );
});
