import { nextIndex, readingDirection } from '@white-plumeria/core';
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from './icon.tsx';

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
}: {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}) {
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.id ?? '');
  const selected = value ?? internal;
  const baseId = useId();

  function select(id: string) {
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = Math.max(0, tabs.findIndex((tab) => tab.id === selected));
    const direction = readingDirection(event.currentTarget);
    const next = nextIndex(index, tabs.length, event.key, orientation, direction);
    if (next === null) return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    select(tab.id);
    event.currentTarget.querySelector<HTMLButtonElement>(`#${CSS.escape(`${baseId}-${tab.id}`)}`)?.focus();
  }

  return (
    <div className={orientation === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs'}>
      <div role="tablist" aria-orientation={orientation} className="wpl-tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const selectedTab = tab.id === selected;
          return (
            <button
              key={tab.id}
              id={`${baseId}-${tab.id}`}
              type="button"
              role="tab"
              className="wpl-tab"
              aria-selected={selectedTab}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selectedTab ? 0 : -1}
              onClick={() => select(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${tab.id}`}
          hidden={tab.id !== selected}
          className="wpl-tabpanel"
          tabIndex={0}
        >
          {tab.id === selected ? tab.panel : null}
        </div>
      ))}
    </div>
  );
}

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export function Accordion({
  items,
  multiple = false,
  value,
  onValueChange,
}: {
  items: AccordionItem[];
  multiple?: boolean;
  value?: string[];
  onValueChange?: (value: string[]) => void;
}) {
  const [internal, setInternal] = useState<string[]>(items[0] ? [items[0].id] : []);
  const open = value ?? internal;
  const baseId = useId();

  function toggle(id: string) {
    const next = open.includes(id)
      ? open.filter((item) => item !== id)
      : multiple
        ? [...open, id]
        : [id];
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <div className="wpl-accordion">
      {items.map((item) => {
        const expanded = open.includes(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div className="wpl-accordion-item" key={item.id}>
            <h3 style={{ margin: 0, font: 'inherit' }}>
              <button
                type="button"
                className="wpl-accordion-trigger"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                {item.title}
                <Icon name="chevronDown" style={{ transform: expanded ? 'rotate(180deg)' : undefined }} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={undefined} hidden={!expanded} className="wpl-accordion-panel">
              {expanded ? item.content : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
