import { capabilities, setModifierManager } from '@ember/modifier';
import {
  canMove,
  carouselIndexFromKey,
  clampIndex,
  createId,
  iconMarkup,
  iconPaths,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  message,
  notificationClassName,
  moveEnabledIndex,
  moveIndex,
  nextIndex,
  readingDirection,
  stepIndex,
  stepState,
  typeaheadMove,
} from '@white-plumeria/core';
import {
  bubble,
  flag,
  glimmer,
  list,
  localeOf,
  num,
  registerHelper,
  str,
  type Host,
} from './runtime.ts';

const dialogFrame = setModifierManager(
  () => ({
    capabilities: capabilities('3.22'),
    createModifier() {
      return {};
    },
    installModifier(_state: unknown, element: Element) {
      if (!(element instanceof HTMLDialogElement)) return;
      if (typeof element.showModal === 'function' && !element.open) element.showModal();
      else element.setAttribute('open', '');
    },
    updateModifier() {},
    destroyModifier(_state: unknown, element: Element) {
      if (
        element instanceof HTMLDialogElement &&
        element.open &&
        typeof element.close === 'function'
      )
        element.close();
    },
  }),
  class DialogFrame {},
);
registerHelper('dialogFrame', dialogFrame);

interface MenuItem {
  id: string;
  label?: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
}

interface Slide {
  id?: string;
  label?: string;
  content?: string;
  caption?: string;
  src?: string;
  alt?: string;
}

interface StepItem {
  id: string;
  title?: string;
  label?: string;
  description?: string;
}

function menuView(host: Host) {
  const items = list<MenuItem>(host.args.items);
  const menuId = str(host.state.menuId);
  const active = num(host.state.active, 0);
  const sub = typeof host.state.sub === 'number' ? host.state.sub : null;
  return items.map((item, index) => {
    const expanded = menuHasSubmenu(item) && index === active && sub !== null;
    return {
      id: str(item.id),
      itemId: `${menuId}-${str(item.id)}`,
      label: str(item.label, str(item.id)),
      disabled: item.disabled === true,
      shortcut: str(item.shortcut),
      nested: menuHasSubmenu(item),
      popup: menuHasSubmenu(item) ? 'menu' : null,
      expanded,
      expandedAttr: menuHasSubmenu(item) ? String(expanded) : null,
      controls: expanded ? `${menuId}-sub-${str(item.id)}` : null,
      subId: `${menuId}-sub-${str(item.id)}`,
      active: sub === null && index === active ? 'true' : null,
      children: (item.items ?? []).map((child, childIndex) => ({
        id: str(child.id),
        itemId: `${menuId}-${str(child.id)}`,
        label: str(child.label, str(child.id)),
        disabled: child.disabled === true,
        active: childIndex === sub ? 'true' : null,
      })),
    };
  });
}

function activeDescendant(host: Host): string | undefined {
  if (!host.state.open) return undefined;
  const items = list<MenuItem>(host.args.items);
  const active = num(host.state.active, 0);
  const sub = typeof host.state.sub === 'number' ? host.state.sub : null;
  const parent = items[active];
  const current = sub === null ? parent : parent?.items?.[sub];
  if (!current) return undefined;
  return `${str(host.state.menuId)}-${str(current.id)}`;
}

function menuKey(host: Host, event: Event, closeOnLeaf: boolean): void {
  const keyEvent = event as KeyboardEvent;
  const items = list<MenuItem>(host.args.items);
  const active = num(host.state.active, 0);
  const sub = typeof host.state.sub === 'number' ? host.state.sub : null;
  const parent = items[active];
  const children = parent?.items ?? [];
  const current = sub === null ? parent : children[sub];
  const command = menuCommand({
    key: keyEvent.key,
    direction: readingDirection(
      keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget : null,
    ),
    open: Boolean(host.state.open),
    submenuOpen: sub !== null,
    hasSubmenu: menuHasSubmenu(current),
  });
  const buffer = (host.state.typeahead ?? { query: '', at: 0 }) as { query: string; at: number };
  host.state.typeahead = buffer;
  if (!command) {
    if (!host.state.open) return;
    const pool = sub === null ? items : children;
    const from = sub === null ? active : sub;
    const next = typeaheadMove(buffer, pool, keyEvent.key, Date.now(), from);
    if (next === null) return;
    keyEvent.preventDefault();
    if (sub === null) host.state.active = next;
    else host.state.sub = next;
    return;
  }
  keyEvent.preventDefault();
  if (command === 'open') {
    host.state.open = true;
    host.state.active = firstEnabledIndex(items);
    host.state.sub = null;
    return;
  }
  if (command === 'close') {
    host.state.open = false;
    host.state.sub = null;
    return;
  }
  if (command === 'close-submenu') {
    host.state.sub = null;
    return;
  }
  if (command === 'open-submenu') {
    host.state.open = true;
    if (menuHasSubmenu(parent)) host.state.sub = firstEnabledIndex(parent.items);
    return;
  }
  if (command === 'activate') {
    if (current && !current.disabled && !menuHasSubmenu(current)) {
      host.state.open = false;
      host.state.sub = null;
      if (closeOnLeaf) bubble(keyEvent, 'wpl-select', { id: current.id });
    }
    return;
  }
  if (!host.state.open) {
    host.state.open = true;
    host.state.active = firstEnabledIndex(items);
    host.state.sub = null;
    return;
  }
  if (command === 'typeahead') return;
  if (sub === null) host.state.active = moveEnabledIndex(items, active, command);
  else host.state.sub = moveEnabledIndex(children, sub, command);
}

export const Dialog = glimmer(
  `<div class="wpl-dialog-root"><button type="button" class="wpl-btn wpl-btn-secondary" {{on "click" this.open}}>{{this.trigger}}</button>{{#if this.openState}}<dialog class="wpl-dialog" aria-labelledby={{this.titleId}} {{dialogFrame}} {{on "cancel" this.close}}><header class="wpl-dialog-header"><h2 class="wpl-dialog-title" id={{this.titleId}}>{{this.title}}</h2><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" {{on "click" this.close}}>{{this.closeLabel}}</button></header><div class="wpl-dialog-body"><p class="wpl-dialog-description">{{@description}}</p>{{yield}}</div>{{#if @confirm}}<footer class="wpl-dialog-footer"><button type="button" class="wpl-btn wpl-btn-danger wpl-btn-sm" {{on "click" this.confirm}}>{{@confirm}}</button></footer>{{/if}}</dialog>{{/if}}</div>`,
  {
    state: () => ({ open: false, titleId: createId('dialog') }),
    getters: {
      trigger: (host) => str(host.args.trigger, 'Open'),
      title: (host) => str(host.args.title, 'Dialog'),
      closeLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'close'),
      titleId: (host) => str(host.state.titleId),
      openState: (host) => Boolean(host.state.open),
    },
    methods: {
      open(event) {
        this.state.open = true;
        bubble(event as Event, 'wpl-open', { open: true });
      },
      close(event) {
        (event as Event).preventDefault();
        this.state.open = false;
        bubble(event as Event, 'wpl-close', { open: false });
      },
      confirm(event) {
        this.state.open = false;
        bubble(event as Event, 'wpl-confirm', {});
      },
    },
  },
);

export const Modal = glimmer(
  `<div class="wpl-dialog-root"><button type="button" class="wpl-btn wpl-btn-secondary" {{on "click" this.open}}>{{this.trigger}}</button>{{#if this.openState}}<dialog class="wpl-dialog" aria-labelledby={{this.titleId}} {{dialogFrame}} {{on "cancel" this.close}}><header class="wpl-dialog-header"><h2 class="wpl-dialog-title" id={{this.titleId}}>{{this.title}}</h2><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" {{on "click" this.close}}>{{this.closeLabel}}</button></header><div class="wpl-dialog-body">{{#if @description}}<p>{{@description}}</p>{{/if}}{{yield}}</div></dialog>{{/if}}</div>`,
  {
    state: () => ({ open: false, titleId: createId('modal') }),
    getters: {
      trigger: (host) => str(host.args.trigger, str(host.args.label, 'Open')),
      title: (host) => str(host.args.title, 'Modal'),
      closeLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'close'),
      titleId: (host) => str(host.state.titleId),
      openState: (host) => Boolean(host.state.open),
    },
    methods: {
      open(event) {
        this.state.open = true;
        bubble(event as Event, 'wpl-open', { open: true });
      },
      close(event) {
        (event as Event).preventDefault();
        this.state.open = false;
        bubble(event as Event, 'wpl-close', { open: false });
      },
    },
  },
);

export const Drawer = glimmer(
  `<div class="wpl-drawer-root"><button type="button" class="wpl-btn wpl-btn-secondary" {{on "click" this.open}}>{{this.trigger}}</button>{{#if this.openState}}<div class={{this.className}} role="dialog" aria-modal="true"><header class="wpl-dialog-header"><h2 class="wpl-dialog-title">{{this.title}}</h2><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" {{on "click" this.close}}>{{this.closeLabel}}</button></header><div class="wpl-dialog-body">{{yield}}</div></div>{{/if}}</div>`,
  {
    state: () => ({ open: false }),
    getters: {
      trigger: (host) => str(host.args.trigger, 'Open'),
      title: (host) => str(host.args.title, 'Drawer'),
      closeLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'close'),
      openState: (host) => Boolean(host.state.open),
      className: (host) =>
        str(host.args.side) === 'start' ? 'wpl-drawer wpl-drawer-start' : 'wpl-drawer',
    },
    methods: {
      open(event) {
        this.state.open = true;
        bubble(event as Event, 'wpl-open', { open: true });
      },
      close(event) {
        this.state.open = false;
        bubble(event as Event, 'wpl-close', { open: false });
      },
    },
  },
);

export const Popover = glimmer(
  `<div class="wpl-popover-root"><button type="button" class="wpl-btn wpl-btn-secondary wpl-btn-sm" aria-expanded={{this.expanded}} {{on "click" this.toggle}}>{{this.label}}</button>{{#if this.openState}}<div class="wpl-popover" role="dialog">{{#if @text}}<p>{{@text}}</p>{{else}}{{yield}}{{/if}}</div>{{/if}}</div>`,
  {
    state: () => ({ open: false }),
    getters: {
      label: (host) => str(host.args.label, 'Details'),
      openState: (host) => Boolean(host.state.open),
      expanded: (host) => (host.state.open ? 'true' : 'false'),
    },
    methods: {
      toggle(event) {
        this.state.open = !this.state.open;
        bubble(event as Event, 'wpl-toggle', { open: this.state.open });
      },
    },
  },
);

export const Tooltip = glimmer(
  `<span class="wpl-tooltip-root"><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" aria-describedby={{this.tipId}} {{on "mouseenter" this.show}} {{on "focus" this.show}} {{on "mouseleave" this.hide}} {{on "blur" this.hide}}>{{this.label}}</button>{{#if this.openState}}<span class="wpl-tooltip" id={{this.tipId}} role="tooltip">{{this.text}}</span>{{/if}}</span>`,
  {
    state: () => ({ open: false, tipId: createId('tip') }),
    getters: {
      label: (host) => str(host.args.label, 'Tip'),
      text: (host) => str(host.args.text, str(host.args.label, 'Tip')),
      tipId: (host) => str(host.state.tipId),
      openState: (host) => Boolean(host.state.open),
    },
    methods: {
      show() {
        this.state.open = true;
      },
      hide() {
        this.state.open = false;
      },
    },
  },
);

export const DropdownMenu = glimmer(
  `<div class="wpl-menu-root" {{on "keydown" this.onKey}}><button type="button" class="wpl-btn wpl-btn-secondary" aria-haspopup="menu" aria-expanded={{this.expanded}} aria-controls={{this.menuId}} aria-activedescendant={{this.activeId}} {{on "click" this.toggle}}>{{this.label}}</button>{{#if this.openState}}<div class="wpl-menu wpl-menu-panel" id={{this.menuId}} role="menu" aria-label={{this.label}}>{{#each this.items as |item|}}<div class="wpl-menu-row"><button type="button" id={{item.itemId}} class="wpl-menu-item" role="menuitem" disabled={{item.disabled}} data-active={{item.active}} aria-haspopup={{item.popup}} aria-expanded={{item.expandedAttr}} aria-controls={{item.controls}} {{on "click" (fn this.choose item)}}>{{item.label}}{{#if item.nested}}<span class="wpl-menu-caret" aria-hidden="true"></span>{{/if}}{{#if item.shortcut}}<span class="wpl-menu-shortcut">{{item.shortcut}}</span>{{/if}}</button>{{#if item.expanded}}<div class="wpl-menu-sub" id={{item.subId}} role="menu" aria-label={{item.label}}>{{#each item.children as |child|}}<button type="button" id={{child.itemId}} class="wpl-menu-item" role="menuitem" disabled={{child.disabled}} data-active={{child.active}} {{on "click" (fn this.choose child)}}>{{child.label}}</button>{{/each}}</div>{{/if}}</div>{{/each}}</div>{{/if}}</div>`,
  {
    state: () => ({
      open: false,
      active: 0,
      sub: null,
      menuId: createId('menu'),
      typeahead: { query: '', at: 0 },
    }),
    getters: {
      label: (host) => str(host.args.label, 'Open menu'),
      menuId: (host) => str(host.state.menuId),
      openState: (host) => Boolean(host.state.open),
      expanded: (host) => (host.state.open ? 'true' : 'false'),
      activeId: (host) => activeDescendant(host),
      items: (host) => menuView(host),
    },
    methods: {
      toggle() {
        if (flag(this.args.disabled)) return;
        this.state.open = !this.state.open;
        if (this.state.open) this.state.active = firstEnabledIndex(list<MenuItem>(this.args.items));
        this.state.sub = null;
      },
      choose(item, event) {
        const chosen = item as { id?: string; disabled?: boolean; nested?: boolean };
        if (chosen.disabled || flag(this.args.disabled)) return;
        if (chosen.nested) {
          const items = list<MenuItem>(this.args.items);
          const index = items.findIndex((entry) => str(entry.id) === str(chosen.id));
          this.state.active = index < 0 ? 0 : index;
          this.state.sub = firstEnabledIndex(items[index]?.items ?? []);
          return;
        }
        this.state.open = false;
        this.state.sub = null;
        bubble(event as Event, 'wpl-select', { id: str(chosen.id) });
      },
      onKey(event) {
        menuKey(this, event as Event, true);
      },
    },
  },
);

export const ContextMenu = glimmer(
  `<div class="wpl-menu-root" tabindex="0" aria-controls={{this.controls}} aria-activedescendant={{this.activeId}} {{on "contextmenu" this.open}} {{on "keydown" this.onKey}}><span>{{this.label}}</span>{{#if this.openState}}<div class="wpl-menu wpl-menu-panel" id={{this.menuId}} role="menu" aria-label={{this.label}}>{{#each this.items as |item|}}<div class="wpl-menu-row"><button type="button" id={{item.itemId}} class="wpl-menu-item" role="menuitem" disabled={{item.disabled}} data-active={{item.active}} aria-haspopup={{item.popup}} aria-expanded={{item.expandedAttr}} aria-controls={{item.controls}} {{on "click" (fn this.choose item)}}>{{item.label}}{{#if item.nested}}<span class="wpl-menu-caret" aria-hidden="true"></span>{{/if}}</button>{{#if item.expanded}}<div class="wpl-menu-sub" id={{item.subId}} role="menu" aria-label={{item.label}}>{{#each item.children as |child|}}<button type="button" id={{child.itemId}} class="wpl-menu-item" role="menuitem" disabled={{child.disabled}} data-active={{child.active}} {{on "click" (fn this.choose child)}}>{{child.label}}</button>{{/each}}</div>{{/if}}</div>{{/each}}</div>{{/if}}</div>`,
  {
    state: () => ({ open: false, active: 0, sub: null, menuId: createId('menu'), typeahead: { query: '', at: 0 } }),
    getters: {
      label: (host) => str(host.args.label, 'Context menu'),
      menuId: (host) => str(host.state.menuId),
      controls: (host) => (host.state.open ? str(host.state.menuId) : undefined),
      openState: (host) => Boolean(host.state.open),
      activeId: (host) => activeDescendant(host),
      items: (host) => menuView(host),
    },
    methods: {
      open(event) {
        (event as Event).preventDefault();
        this.state.open = true;
        this.state.active = firstEnabledIndex(list<MenuItem>(this.args.items));
        this.state.sub = null;
        const node = (event as Event).currentTarget;
        if (node instanceof HTMLElement) node.focus();
      },
      choose(item, event) {
        const chosen = item as { id?: string; disabled?: boolean; nested?: boolean };
        if (chosen.disabled) return;
        if (chosen.nested) {
          const items = list<MenuItem>(this.args.items);
          const index = items.findIndex((entry) => str(entry.id) === str(chosen.id));
          this.state.active = index < 0 ? 0 : index;
          this.state.sub = firstEnabledIndex(items[index]?.items ?? []);
          return;
        }
        this.state.open = false;
        this.state.sub = null;
        bubble(event as Event, 'wpl-select', { id: str(chosen.id) });
      },
      onKey(event) {
        menuKey(this, event as Event, true);
      },
    },
  },
);

function tabSource(host: Host): Array<{ id?: string; label?: string; panel?: string; content?: string }> {
  const tabs = host.args.tabs;
  return list(Array.isArray(tabs) ? tabs : host.args.items);
}

export const Tabs = glimmer(
  `<div class={{this.className}}><div class="wpl-tablist" role="tablist" aria-orientation={{this.orientation}} aria-label={{this.label}}>{{#each this.items as |item|}}<button type="button" class="wpl-tab" role="tab" id={{item.tabId}} aria-selected={{item.selected}} aria-controls={{this.panelId}} tabindex={{item.tabIndex}} {{on "click" (fn this.pick item)}} {{on "keydown" (fn this.move item)}}>{{item.label}}</button>{{/each}}</div><div id={{this.panelId}} class="wpl-tabpanel" role="tabpanel" aria-labelledby={{this.labelledBy}} tabindex="0">{{this.panel}}</div></div>`,
  {
    state: (args) => ({ value: str(args.value), panelId: createId('wpl-tabpanel') }),
    getters: {
      label: (host) => str(host.args.label, 'Tabs'),
      orientation: (host) => (host.args.orientation === 'vertical' ? 'vertical' : 'horizontal'),
      className: (host) => (host.args.orientation === 'vertical' ? 'wpl-tabs wpl-tabs-vertical' : 'wpl-tabs'),
      panelId: (host) => str(host.state.panelId),
      items(this: Host) {
        const source = tabSource(this);
        const current = str(this.state.value, str(this.args.value, str(source[0]?.id, '0')));
        return source.map((item, index) => {
          const id = str(item.id, String(index));
          const selected = current === id;
          return {
            id,
            tabId: `wpl-tab-${id}`,
            label: str(item.label, id),
            panel: str(item.panel, str(item.content)),
            selected: selected ? 'true' : 'false',
            tabIndex: selected ? '0' : '-1',
          };
        });
      },
      labelledBy(this: Host) {
        const selected = (this.items as Array<{ selected: string; tabId: string }>).find((item) => item.selected === 'true');
        return selected?.tabId ?? '';
      },
      panel(this: Host) {
        const source = tabSource(this);
        const current = str(this.state.value, str(this.args.value, str(source[0]?.id)));
        const found = source.find((item) => str(item.id) === current) ?? source[0];
        return found ? str(found.panel, str(found.content, str(found.label))) : '';
      },
    },
    methods: {
      pick(item, event) {
        const id = str((item as { id?: string }).id);
        this.state.value = id;
        bubble(event as Event, 'wpl-change', { value: id });
      },
      move(item, event) {
        const keyEvent = event as KeyboardEvent;
        const items = this.items as Array<{ id: string; tabId: string }>;
        const index = items.findIndex((entry) => entry.id === str((item as { id?: string }).id));
        const next = nextIndex(
          Math.max(0, index),
          items.length,
          keyEvent.key,
          this.orientation === 'vertical' ? 'vertical' : 'horizontal',
          readingDirection(keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget : null),
        );
        if (next === null) return;
        keyEvent.preventDefault();
        const tab = items[next];
        if (!tab) return;
        this.state.value = tab.id;
        bubble(keyEvent, 'wpl-change', { value: tab.id });
        const list = keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget.parentElement : null;
        queueMicrotask(() => list?.querySelector<HTMLElement>(`#${CSS.escape(tab.tabId)}`)?.focus());
      },
    },
  },
);

export const Accordion = glimmer(
  `<div class="wpl-accordion">{{#each this.items as |item|}}<div class="wpl-accordion-item"><h3><button type="button" id={{item.triggerId}} class="wpl-accordion-trigger" aria-expanded={{item.expanded}} aria-controls={{item.panelId}} {{on "click" (fn this.toggle item)}}>{{item.title}}<svg class={{item.iconClass}} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d={{item.icon}}></path></svg></button></h3><div id={{item.panelId}} class="wpl-accordion-panel" role="region" aria-labelledby={{item.triggerId}} {{flagAttr "hidden" item.closed}}>{{item.content}}</div></div>{{/each}}</div>`,
  {
    state: (args) => ({ open: str(args.value), baseId: createId('wpl-accordion') }),
    getters: {
      items(this: Host) {
        const open = str(this.state.open, str(this.args.value));
        return list<{ id?: string; title?: string; label?: string; content?: string }>(
          this.args.items,
        ).map((item, index) => {
          const id = str(item.id, String(index));
          const isOpen = open === id;
          return {
            id,
            title: str(item.title, str(item.label, id)),
            content: str(item.content),
            open: isOpen,
            closed: !isOpen,
            expanded: isOpen ? 'true' : 'false',
            panelId: `${str(this.state.baseId, 'wpl-accordion')}-${id}`,
            triggerId: `${str(this.state.baseId, 'wpl-accordion')}-trigger-${id}`,
            icon: iconPaths[isOpen ? 'chevronDown' : 'chevronRight'],
            iconClass: isOpen ? 'wpl-icon' : 'wpl-icon wpl-icon-dir',
          };
        });
      },
    },
    methods: {
      toggle(item) {
        const id = str((item as { id?: string }).id);
        this.state.open = this.state.open === id ? '' : id;
      },
    },
  },
);

export const Toast = glimmer(
  `<article class={{this.className}} role={{this.role}}><strong class="wpl-toast-title">{{this.title}}</strong>{{#if @description}}<p class="wpl-toast-description">{{@description}}</p>{{/if}}</article>`,
  {
    getters: {
      title: (host) => str(host.args.title, 'Notice'),
      className: (host) =>
        `wpl-toast${str(host.args.variant) && str(host.args.variant) !== 'neutral' ? ` wpl-toast-${str(host.args.variant)}` : ''}`,
      role: (host) => (str(host.args.variant) === 'danger' ? 'alert' : 'status'),
    },
  },
);

export const Notification = glimmer(
  `<div class={{this.className}} role={{this.role}}><div><p class="wpl-toast-title">{{this.title}}</p>{{#if @description}}<p class="wpl-toast-description">{{@description}}</p>{{/if}}{{yield}}</div>{{#if this.dismissible}}<button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label={{this.dismissLabel}} {{on "click" this.dismiss}}>${iconMarkup('close')}</button>{{/if}}</div>`,
  {
    getters: {
      title: (host) => str(host.args.title, 'Notice'),
      className: (host) => notificationClassName(notificationTone(host.args.variant)),
      role: (host) => (notificationTone(host.args.variant) === 'danger' ? 'alert' : 'status'),
      dismissible: (host) => flag(host.args.dismissible) || typeof host.args.onDismiss === 'function',
      dismissLabel: () =>
        message(localeOf(typeof document === 'undefined' ? null : document.body), 'dismiss'),
    },
    methods: {
      dismiss(event) {
        bubble(event as Event, 'wpl-dismiss', {});
        const handler = this.args.onDismiss;
        if (typeof handler === 'function') handler();
      },
    },
  },
);

function notificationTone(value: unknown): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  return value === 'info' || value === 'success' || value === 'warning' || value === 'danger' ? value : 'neutral';
}

export const CommandPalette = glimmer(
  `<div class="wpl-command" role="dialog" aria-label={{this.label}}><label class="wpl-sr-only" for={{this.fieldId}}>{{this.label}}</label><input id={{this.fieldId}} class="wpl-input" type="search" value={{this.query}} placeholder={{this.placeholder}} role="combobox" aria-expanded="true" aria-controls={{this.listId}} aria-autocomplete="list" aria-activedescendant={{this.activeId}} {{on "input" this.filter}} {{on "keydown" this.onKey}} /><ul class="wpl-command-list" id={{this.listId}} role="listbox">{{#if this.empty}}<li class="wpl-muted">{{this.emptyLabel}}</li>{{else}}{{#each this.matches as |item|}}<li><button type="button" id={{item.itemId}} class="wpl-menu-item" role="option" aria-selected={{item.selected}} data-active={{item.active}} {{on "click" (fn this.pick item)}}>{{item.label}}{{#if item.group}}<span class="wpl-menu-shortcut">{{item.group}}</span>{{/if}}</button></li>{{/each}}{{/if}}</ul></div>`,
  {
    state: () => ({ query: '', active: 0, fieldId: createId('command'), listId: createId('command-list') }),
    getters: {
      label: (host) =>
        str(host.args.label, message(localeOf(typeof document === 'undefined' ? null : document.body), 'command')),
      placeholder: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'search'),
      emptyLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'noResults'),
      query: (host) => str(host.state.query),
      fieldId: (host) => str(host.state.fieldId),
      listId: (host) => str(host.state.listId),
      empty: (host) => host.matches.length === 0,
      activeId(this: Host) {
        return this.matches[num(this.state.active, 0)]?.itemId;
      },
      matches(this: Host) {
        const query = str(this.state.query).trim().toLocaleLowerCase();
        const listId = str(this.state.listId);
        const active = num(this.state.active, 0);
        const source = this.args.commands ?? this.args.items;
        return list<{ id?: string; label?: string; group?: string; keywords?: unknown; disabled?: boolean }>(source)
          .filter((item) => {
            if (item.disabled) return false;
            if (!query) return true;
            const keywords = Array.isArray(item.keywords) ? item.keywords.map((word) => str(word)) : [];
            return [str(item.label, str(item.id)), str(item.group), ...keywords]
              .join(' ')
              .toLocaleLowerCase()
              .includes(query);
          })
          .map((item, index) => ({
            id: str(item.id),
            label: str(item.label, str(item.id)),
            group: str(item.group),
            itemId: `${listId}-${index}`,
            selected: index === active ? 'true' : 'false',
            active: index === active ? 'true' : null,
          }));
      },
    },
    methods: {
      filter(event) {
        this.state.active = 0;
        this.state.query =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? event.target.value
            : '';
      },
      onKey(event) {
        const keyEvent = event as KeyboardEvent;
        const items = this.matches;
        if (
          keyEvent.key === 'ArrowDown' ||
          keyEvent.key === 'ArrowUp' ||
          keyEvent.key === 'Home' ||
          keyEvent.key === 'End'
        ) {
          keyEvent.preventDefault();
          const next = nextIndex(num(this.state.active, 0), items.length, keyEvent.key, 'vertical');
          if (next !== null) this.state.active = next;
          return;
        }
        if (keyEvent.key === 'Enter') {
          keyEvent.preventDefault();
          const item = items[num(this.state.active, 0)];
          if (item) this.pick(item, keyEvent);
        }
      },
      pick(item, event) {
        const chosen = item as { id: string };
        bubble(event as Event, 'wpl-select', { id: chosen.id });
      },
    },
  },
);

export const Steps = glimmer(
  `<ol class="wpl-steps" aria-label={{this.label}}>{{#each this.steps as |step|}}<li class="wpl-step" data-state={{step.state}}><button type="button" class="wpl-step-trigger" aria-current={{step.current}} {{on "click" (fn this.pick step)}}><span class="wpl-step-marker" aria-hidden="true">{{step.index}}</span><span class="wpl-step-title">{{step.title}}</span>{{#if step.description}}<span class="wpl-step-desc">{{step.description}}</span>{{/if}}</button></li>{{/each}}</ol>`,
  {
    state: (args) => ({ value: str(args.value) }),
    getters: {
      label: (host) => str(host.args.label, 'Steps'),
      steps(this: Host) {
        const items = list<StepItem>(this.args.items);
        const value = str(this.state.value, str(this.args.value, items[0]?.id ?? ''));
        const current = stepIndex(items, value);
        return items.map((item, index) => {
          const state = stepState(index, current);
          return {
            id: item.id,
            title: str(item.title, str(item.label, item.id)),
            description: str(item.description),
            index: String(index + 1),
            state,
            current: state === 'current' ? 'step' : '',
          };
        });
      },
    },
    methods: {
      pick(step, event) {
        const id = str((step as { id?: string }).id);
        this.state.value = id;
        bubble(event as Event, 'wpl-change', { value: id });
      },
    },
  },
);

function carouselView(host: Host) {
  const source = list<Slide>(host.args.slides);
  const count = source.length;
  const index = clampIndex(num(host.state.index, 0), count);
  const baseId = str(host.state.baseId, 'wpl-slide');
  const ofLabel = message(localeOf(typeof document === 'undefined' ? null : document.body), 'of');
  return source.map((slide, slideIndex) => {
    const id = str(slide.id, String(slideIndex));
    const label = str(slide.label, id);
    const active = slideIndex === index;
    return {
      id,
      label,
      panelId: `${baseId}-panel-${id}`,
      dotId: `${baseId}-tab-${id}`,
      selected: active ? 'true' : 'false',
      hidden: active ? null : 'true',
      inactive: !active,
      tab: active ? '-1' : null,
      dotTab: active ? '0' : '-1',
      ariaLabel: `${label}, ${slideIndex + 1} ${ofLabel} ${count}`,
      src: str(slide.src),
      alt: str(slide.alt, label),
      caption: str(slide.caption),
      copy: str(slide.content),
      fallback: !str(slide.src) && !str(slide.content),
    };
  });
}

export const Carousel = glimmer(
  `<div class={{this.className}} aria-roledescription="carousel" aria-label={{this.label}} data-index={{this.index}}>{{#if this.empty}}<p class="wpl-muted">{{this.emptyLabel}}</p>{{else}}<div class="wpl-carousel-viewport" {{on "pointerdown" this.pointerDown}} {{on "pointerup" this.pointerUp}} {{on "pointercancel" this.pointerCancel}}><div class="wpl-carousel-track" style={{this.trackStyle}}>{{#each this.slides as |slide|}}<div id={{slide.panelId}} class="wpl-carousel-slide" role="tabpanel" aria-roledescription="slide" aria-label={{slide.ariaLabel}} {{flagAttr "aria-hidden" slide.hidden}} {{flagAttr "inert" slide.inactive}} {{flagAttr "tabindex" slide.tab}}>{{#if slide.src}}<figure class="wpl-carousel-figure"><img class="wpl-carousel-image" src={{slide.src}} alt={{slide.alt}} draggable="false" /><figcaption class="wpl-carousel-caption"><strong>{{slide.label}}</strong>{{#if slide.caption}}<span>{{slide.caption}}</span>{{/if}}</figcaption></figure>{{/if}}{{#if slide.copy}}<div class="wpl-carousel-copy">{{slide.copy}}</div>{{/if}}{{#if slide.fallback}}<p class="wpl-carousel-copy">{{slide.label}}</p>{{/if}}</div>{{/each}}</div>{{#if this.media}}<div class="wpl-carousel-nav"><button type="button" class="wpl-carousel-control" aria-label={{this.previousLabel}} disabled={{this.atStart}} {{on "click" this.previous}}>${iconMarkup('chevronLeft')}</button><button type="button" class="wpl-carousel-control" aria-label={{this.nextLabel}} disabled={{this.atEnd}} {{on "click" this.next}}>${iconMarkup('chevronRight')}</button></div><div class="wpl-carousel-dots" role="tablist" aria-label={{this.label}}>{{#each this.slides as |slide|}}<button type="button" id={{slide.dotId}} role="tab" class="wpl-carousel-dot" aria-selected={{slide.selected}} aria-controls={{slide.panelId}} tabindex={{slide.dotTab}} {{on "click" (fn this.pick slide)}} {{on "keydown" (fn this.key slide)}}><span class="wpl-sr-only">{{slide.label}}</span></button>{{/each}}</div>{{/if}}</div>{{#if this.bar}}<div class="wpl-carousel-bar"><button type="button" class={{this.controlClass}} aria-label={{this.previousLabel}} disabled={{this.atStart}} {{on "click" this.previous}}>${iconMarkup('chevronLeft')}</button><div class="wpl-carousel-dots" role="tablist" aria-label={{this.label}}>{{#each this.slides as |slide|}}<button type="button" id={{slide.dotId}} role="tab" class="wpl-carousel-dot" aria-selected={{slide.selected}} aria-controls={{slide.panelId}} tabindex={{slide.dotTab}} {{on "click" (fn this.pick slide)}} {{on "keydown" (fn this.key slide)}}><span class="wpl-sr-only">{{slide.label}}</span></button>{{/each}}</div><button type="button" class={{this.controlClass}} aria-label={{this.nextLabel}} disabled={{this.atEnd}} {{on "click" this.next}}>${iconMarkup('chevronRight')}</button></div>{{/if}}{{/if}}</div>`,
  {
    state: (args) => ({ index: num(args.index, 0), baseId: createId('wpl-slide') }),
    getters: {
      label: (host) => str(host.args.label, message(localeOf(typeof document === 'undefined' ? null : document.body), 'carousel')),
      emptyLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'empty'),
      previousLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'previous'),
      nextLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'next'),
      empty: (host) => list(host.args.slides).length === 0,
      media: (host) => list<Slide>(host.args.slides).some((slide) => Boolean(slide.src)),
      bar: (host) => list(host.args.slides).length > 0 && !list<Slide>(host.args.slides).some((slide) => Boolean(slide.src)),
      className: (host) =>
        list<Slide>(host.args.slides).some((slide) => Boolean(slide.src))
          ? 'wpl-carousel wpl-carousel-media'
          : 'wpl-carousel',
      controlClass: () => 'wpl-btn wpl-btn-outline wpl-btn-sm',
      index: (host) => clampIndex(num(host.state.index, 0), list(host.args.slides).length),
      trackStyle: (host) => `--wpl-carousel-index:${clampIndex(num(host.state.index, 0), list(host.args.slides).length)}`,
      slides: (host) => carouselView(host),
      atStart(this: Host) {
        return !flag(this.args.loop) && clampIndex(num(this.state.index, 0), list(this.args.slides).length) === 0;
      },
      atEnd(this: Host) {
        const count = list(this.args.slides).length;
        return !flag(this.args.loop) && clampIndex(num(this.state.index, 0), count) >= count - 1;
      },
    },
    methods: {
      previous(event) {
        this.go(-1, event as Event);
      },
      next(event) {
        this.go(1, event as Event);
      },
      go(delta, event) {
        const count = list(this.args.slides).length;
        const loop = flag(this.args.loop);
        const current = clampIndex(num(this.state.index, 0), count);
        if (!canMove(current, Number(delta), count, loop)) return;
        this.state.index = moveIndex(current, Number(delta), count, loop);
        bubble(event as Event, 'wpl-change', { index: this.state.index });
      },
      pick(slide, event) {
        const slides = this.slides as Array<{ id: string }>;
        const index = slides.findIndex((item) => item.id === str((slide as { id?: string }).id));
        if (index < 0) return;
        this.state.index = index;
        bubble(event as Event, 'wpl-change', { index });
      },
      key(slide, event) {
        const keyEvent = event as KeyboardEvent;
        const slides = this.slides as Array<{ id: string; dotId: string }>;
        const index = slides.findIndex((item) => item.id === str((slide as { id?: string }).id));
        const next = carouselIndexFromKey(
          Math.max(0, index),
          slides.length,
          keyEvent.key,
          readingDirection(keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget : null),
          flag(this.args.loop),
        );
        if (next === null) return;
        keyEvent.preventDefault();
        const tab = slides[next];
        if (!tab) return;
        this.state.index = next;
        bubble(keyEvent, 'wpl-change', { index: next });
        const list = keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget.parentElement : null;
        queueMicrotask(() => list?.querySelector<HTMLElement>(`#${CSS.escape(tab.dotId)}`)?.focus());
      },
      pointerDown(event) {
        const pointer = event as PointerEvent;
        if (pointer.target instanceof Element && pointer.target.closest('button, a, input, textarea, select')) return;
        this.dragX = pointer.clientX;
      },
      pointerUp(event) {
        const pointer = event as PointerEvent;
        const start = typeof this.dragX === 'number' ? this.dragX : null;
        this.dragX = null;
        if (start === null) return;
        const delta = pointer.clientX - start;
        if (Math.abs(delta) < 48) return;
        const direction = readingDirection(pointer.currentTarget instanceof HTMLElement ? pointer.currentTarget : null);
        this.go(direction === 'rtl' ? (delta > 0 ? 1 : -1) : delta < 0 ? 1 : -1, pointer);
      },
      pointerCancel() {
        this.dragX = null;
      },
    },
  },
);

export const Combobox = glimmer(
  `<div class="wpl-combo"><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><div class="wpl-combo-control"><span class="wpl-combo-icon" aria-hidden="true"><svg class="wpl-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${iconPaths.search}"/></svg></span><input id={{this.fieldId}} class="wpl-input" role="combobox" aria-expanded={{this.expanded}} aria-controls={{this.listId}} aria-autocomplete="list" aria-activedescendant={{this.activeId}} value={{this.query}} {{on "input" this.filter}} {{on "focus" this.open}} {{on "keydown" this.onKey}} /></div>{{#if this.openState}}<ul class="wpl-listbox" id={{this.listId}} role="listbox">{{#if this.empty}}<li class="wpl-listbox-item">{{this.emptyLabel}}</li>{{else}}{{#each this.matches as |option|}}<li><button type="button" class="wpl-listbox-item" id={{option.id}} role="option" aria-selected={{option.selected}} data-active={{option.active}} {{on "click" (fn this.pick option)}}>{{option.label}}</button></li>{{/each}}{{/if}}</ul>{{/if}}</div>`,
  {
    state: (args) => {
      const options = list<{ value?: string; label?: string }>(args.options);
      const initial = options.find((option) => str(option.value) === str(args.value));
      return {
        query: initial ? str(initial.label, str(initial.value)) : str(args.value),
        selected: initial ? str(initial.value) : str(args.value),
        open: false,
        active: 0,
        fieldId: createId('combo'),
        listId: createId('combo-list'),
      };
    },
    getters: {
      label: (host) => str(host.args.label, 'Choose'),
      query: (host) => str(host.state.query),
      fieldId: (host) => str(host.state.fieldId),
      listId: (host) => str(host.state.listId),
      openState: (host) => Boolean(host.state.open),
      expanded: (host) => (host.state.open ? 'true' : 'false'),
      empty: (host) => host.matches.length === 0,
      emptyLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'noResults'),
      activeId(this: Host) {
        if (!this.state.open) return undefined;
        const current = this.matches[Number(this.state.active)];
        return current?.id;
      },
      matches(this: Host) {
        const options = list<{ value?: string; label?: string; disabled?: boolean }>(this.args.options).map(
          (option) => ({
            value: str(option.value),
            label: str(option.label, str(option.value)),
            disabled: Boolean(option.disabled),
          }),
        );
        const query = str(this.state.query).toLocaleLowerCase();
        const selected = options.find((option) => option.value === str(this.state.selected));
        const source =
          !query || query === selected?.label.toLocaleLowerCase()
            ? options
            : options.filter((option) => option.label.toLocaleLowerCase().includes(query));
        return source.map((option, index) => ({
          value: option.value,
          label: option.label,
          disabled: option.disabled,
          id: `${str(this.state.listId)}-${index}`,
          selected: option.value === str(this.state.selected) ? 'true' : 'false',
          active: index === Number(this.state.active) ? 'true' : null,
        }));
      },
    },
    methods: {
      open() {
        this.state.open = true;
      },
      filter(event) {
        this.state.open = true;
        this.state.active = 0;
        this.state.query =
          event instanceof Event && event.target instanceof HTMLInputElement
            ? event.target.value
            : '';
      },
      onKey(event) {
        const keyEvent = event as KeyboardEvent;
        const items = this.matches;
        if (
          keyEvent.key === 'ArrowDown' ||
          keyEvent.key === 'ArrowUp' ||
          keyEvent.key === 'Home' ||
          keyEvent.key === 'End'
        ) {
          keyEvent.preventDefault();
          this.state.open = true;
          const next = nextIndex(Number(this.state.active) || 0, items.length, keyEvent.key, 'vertical');
          if (next !== null) this.state.active = next;
          return;
        }
        if (keyEvent.key === 'Enter' && this.state.open) {
          keyEvent.preventDefault();
          const option = items[Number(this.state.active)];
          if (option && !option.disabled) this.pick(option, keyEvent);
          return;
        }
        if (keyEvent.key === 'Escape') this.state.open = false;
      },
      pick(option, event) {
        const chosen = option as { value: string; label: string; disabled?: boolean };
        if (chosen.disabled) return;
        this.state.query = chosen.label;
        this.state.selected = chosen.value;
        this.state.open = false;
        bubble(event as Event, 'wpl-change', { value: chosen.value });
      },
    },
  },
);
