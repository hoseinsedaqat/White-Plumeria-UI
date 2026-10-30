import { createId, message, moveIndex, stepIndex, stepState } from '@white-plumeria/core';
import { bubble, flag, glimmer, list, localeOf, num, str, type Host } from './runtime.ts';

interface MenuItem {
  id: string;
  label?: string;
  disabled?: boolean;
  shortcut?: string;
}

interface Slide {
  id?: string;
  label?: string;
  content?: string;
}

interface StepItem {
  id: string;
  title?: string;
  label?: string;
  description?: string;
}

function menuItems(value: unknown): MenuItem[] {
  return list<MenuItem>(value).map((item) => ({
    id: str(item.id),
    label: str(item.label, str(item.id)),
    disabled: item.disabled === true,
    shortcut: str(item.shortcut),
  }));
}

export const Dialog = glimmer(
  `<div class="wpl-dialog-root"><button type="button" class="wpl-btn wpl-btn-secondary" {{on "click" this.open}}>{{this.trigger}}</button>{{#if this.openState}}<div class="wpl-dialog" role="dialog" aria-modal="true" aria-labelledby={{this.titleId}}><header class="wpl-dialog-header"><h2 class="wpl-dialog-title" id={{this.titleId}}>{{this.title}}</h2><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" {{on "click" this.close}}>Close</button></header><div class="wpl-dialog-body"><p class="wpl-dialog-description">{{@description}}</p>{{yield}}</div>{{#if @confirm}}<footer class="wpl-dialog-footer"><button type="button" class="wpl-btn wpl-btn-danger wpl-btn-sm" {{on "click" this.confirm}}>{{@confirm}}</button></footer>{{/if}}</div>{{/if}}</div>`,
  {
    state: () => ({ open: false, titleId: createId('dialog') }),
    getters: {
      trigger: (host) => str(host.args.trigger, 'Open'),
      title: (host) => str(host.args.title, 'Dialog'),
      titleId: (host) => str(host.state.titleId),
      openState: (host) => Boolean(host.state.open),
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
      confirm(event) {
        this.state.open = false;
        bubble(event as Event, 'wpl-confirm', {});
      },
    },
  },
);

export const Modal = glimmer(
  `<div class="wpl-dialog-root"><button type="button" class="wpl-btn wpl-btn-secondary" {{on "click" this.open}}>{{this.trigger}}</button>{{#if this.openState}}<div class="wpl-dialog" role="dialog" aria-modal="true"><header class="wpl-dialog-header"><h2 class="wpl-dialog-title">{{this.title}}</h2><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" {{on "click" this.close}}>Close</button></header><div class="wpl-dialog-body">{{#if @description}}<p>{{@description}}</p>{{/if}}{{yield}}</div></div>{{/if}}</div>`,
  {
    state: () => ({ open: false }),
    getters: {
      trigger: (host) => str(host.args.trigger, str(host.args.label, 'Open')),
      title: (host) => str(host.args.title, 'Modal'),
      openState: (host) => Boolean(host.state.open),
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

export const Drawer = glimmer(
  `<div class="wpl-drawer-root"><button type="button" class="wpl-btn wpl-btn-secondary" {{on "click" this.open}}>{{this.trigger}}</button>{{#if this.openState}}<div class={{this.className}} role="dialog" aria-modal="true"><header class="wpl-dialog-header"><h2 class="wpl-dialog-title">{{this.title}}</h2><button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" {{on "click" this.close}}>Close</button></header><div class="wpl-dialog-body">{{yield}}</div></div>{{/if}}</div>`,
  {
    state: () => ({ open: false }),
    getters: {
      trigger: (host) => str(host.args.trigger, 'Open'),
      title: (host) => str(host.args.title, 'Drawer'),
      openState: (host) => Boolean(host.state.open),
      className: (host) => (str(host.args.side) === 'start' ? 'wpl-drawer wpl-drawer-start' : 'wpl-drawer'),
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
  `<div class="wpl-menu-root"><button type="button" class="wpl-btn wpl-btn-secondary" aria-haspopup="menu" aria-expanded={{this.expanded}} aria-controls={{this.menuId}} {{on "click" this.toggle}}>{{this.label}}</button>{{#if this.openState}}<div class="wpl-menu wpl-menu-panel" id={{this.menuId}} role="menu">{{#each this.items as |item|}}<button type="button" class="wpl-menu-item" role="menuitem" disabled={{item.disabled}} {{on "click" (fn this.choose item)}}>{{item.label}}{{#if item.shortcut}}<span class="wpl-menu-shortcut">{{item.shortcut}}</span>{{/if}}</button>{{/each}}</div>{{/if}}</div>`,
  {
    state: () => ({ open: false, menuId: createId('menu') }),
    getters: {
      label: (host) => str(host.args.label, 'Open menu'),
      menuId: (host) => str(host.state.menuId),
      openState: (host) => Boolean(host.state.open),
      expanded: (host) => (host.state.open ? 'true' : 'false'),
      items: (host) => menuItems(host.args.items),
    },
    methods: {
      toggle() {
        if (flag(this.args.disabled)) return;
        this.state.open = !this.state.open;
      },
      choose(item, event) {
        const chosen = item as MenuItem;
        if (chosen.disabled || flag(this.args.disabled)) return;
        this.state.open = false;
        this.state.value = chosen.id;
        bubble(event as Event, 'wpl-select', { id: chosen.id });
      },
    },
  },
);

export const ContextMenu = glimmer(
  `<div class="wpl-menu-root" {{on "contextmenu" this.open}}><span>{{this.label}}</span>{{#if this.openState}}<div class="wpl-menu wpl-menu-panel" role="menu">{{#each this.items as |item|}}<button type="button" class="wpl-menu-item" role="menuitem" disabled={{item.disabled}} {{on "click" (fn this.choose item)}}>{{item.label}}</button>{{/each}}</div>{{/if}}</div>`,
  {
    state: () => ({ open: false }),
    getters: {
      label: (host) => str(host.args.label, 'Context'),
      openState: (host) => Boolean(host.state.open),
      items: (host) => menuItems(host.args.items),
    },
    methods: {
      open(event) {
        (event as Event).preventDefault();
        this.state.open = true;
      },
      choose(item, event) {
        const chosen = item as MenuItem;
        if (chosen.disabled) return;
        this.state.open = false;
        bubble(event as Event, 'wpl-select', { id: chosen.id });
      },
    },
  },
);

export const Tabs = glimmer(
  `<div class="wpl-tabs"><div role="tablist" aria-label={{this.label}}>{{#each this.items as |item|}}<button type="button" class="wpl-tab" role="tab" aria-selected={{item.selected}} {{on "click" (fn this.pick item)}}>{{item.label}}</button>{{/each}}</div><div class="wpl-tab-panel" role="tabpanel">{{this.panel}}</div></div>`,
  {
    state: (args) => ({ value: str(args.value) }),
    getters: {
      label: (host) => str(host.args.label, 'Tabs'),
      items(this: Host) {
        const current = str(this.state.value, str(this.args.value));
        return list<{ id?: string; label?: string; panel?: string; content?: string }>(this.args.items).map((item, index) => {
          const id = str(item.id, String(index));
          return {
            id,
            label: str(item.label, id),
            panel: str(item.panel, str(item.content)),
            selected: (current || str(list<{ id?: string }>(this.args.items)[0]?.id, '0')) === id ? 'true' : 'false',
          };
        });
      },
      panel(this: Host) {
        const items = list<{ id?: string; panel?: string; content?: string; label?: string }>(this.args.items);
        const current = str(this.state.value, str(this.args.value, str(items[0]?.id)));
        const found = items.find((item) => str(item.id) === current) ?? items[0];
        return found ? str(found.panel, str(found.content, str(found.label))) : '';
      },
    },
    methods: {
      pick(item, event) {
        const id = str((item as { id?: string }).id);
        this.state.value = id;
        bubble(event as Event, 'wpl-change', { value: id });
      },
    },
  },
);

export const Accordion = glimmer(
  `<div class="wpl-accordion">{{#each this.items as |item|}}<div class="wpl-accordion-item"><h3><button type="button" class="wpl-accordion-trigger" aria-expanded={{item.expanded}} {{on "click" (fn this.toggle item)}}>{{item.title}}</button></h3>{{#if item.open}}<div class="wpl-accordion-panel">{{item.content}}</div>{{/if}}</div>{{/each}}</div>`,
  {
    state: (args) => ({ open: str(args.value) }),
    getters: {
      items(this: Host) {
        const open = str(this.state.open, str(this.args.value));
        return list<{ id?: string; title?: string; label?: string; content?: string }>(this.args.items).map((item, index) => {
          const id = str(item.id, String(index));
          const isOpen = open === id;
          return {
            id,
            title: str(item.title, str(item.label, id)),
            content: str(item.content),
            open: isOpen,
            expanded: isOpen ? 'true' : 'false',
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
      className: (host) => `wpl-toast${str(host.args.variant) && str(host.args.variant) !== 'neutral' ? ` wpl-toast-${str(host.args.variant)}` : ''}`,
      role: (host) => (str(host.args.variant) === 'danger' ? 'alert' : 'status'),
    },
  },
);

export const Notification = glimmer(
  `<div class={{this.className}} role="status"><div><strong>{{this.title}}</strong>{{#if @description}}<p>{{@description}}</p>{{/if}}</div>{{#if this.dismissible}}<button type="button" class="wpl-btn wpl-btn-ghost wpl-btn-sm" {{on "click" this.dismiss}}>{{this.dismissLabel}}</button>{{/if}}</div>`,
  {
    state: () => ({ hidden: false }),
    getters: {
      title: (host) => str(host.args.title, 'Notice'),
      className: (host) => (host.state.hidden ? 'wpl-notification wpl-sr-only' : 'wpl-notification'),
      dismissible: (host) => host.args.dismissible !== false,
      dismissLabel: () => message(localeOf(typeof document === 'undefined' ? null : document.body), 'dismiss'),
    },
    methods: {
      dismiss(event) {
        this.state.hidden = true;
        bubble(event as Event, 'wpl-dismiss', {});
      },
    },
  },
);

export const CommandPalette = glimmer(
  `<div class="wpl-command"><label class="wpl-sr-only" for={{this.fieldId}}>{{this.label}}</label><input id={{this.fieldId}} class="wpl-input" type="search" value={{this.query}} placeholder={{this.label}} role="combobox" aria-expanded="true" aria-controls={{this.listId}} {{on "input" this.filter}} /><ul class="wpl-command-list" id={{this.listId}} role="listbox">{{#each this.matches as |item|}}<li><button type="button" role="option" {{on "click" (fn this.pick item)}}>{{item.label}}</button></li>{{/each}}</ul></div>`,
  {
    state: () => ({ query: '', fieldId: createId('command'), listId: createId('command-list') }),
    getters: {
      label: (host) => str(host.args.label, 'Command palette'),
      query: (host) => str(host.state.query),
      fieldId: (host) => str(host.state.fieldId),
      listId: (host) => str(host.state.listId),
      matches(this: Host) {
        const query = str(this.state.query).toLocaleLowerCase();
        return list<{ id?: string; label?: string }>(this.args.items).filter((item) => str(item.label, str(item.id)).toLocaleLowerCase().includes(query)).map((item) => ({
          id: str(item.id),
          label: str(item.label, str(item.id)),
        }));
      },
    },
    methods: {
      filter(event) {
        this.state.query = event instanceof Event && event.target instanceof HTMLInputElement ? event.target.value : '';
      },
      pick(item, event) {
        const chosen = item as { id: string; label: string };
        this.state.query = chosen.label;
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

export const Carousel = glimmer(
  `<div class="wpl-carousel" aria-roledescription="carousel" aria-label={{this.label}}><div class="wpl-carousel-bar"><button type="button" class="wpl-carousel-control" aria-label="Previous" disabled={{this.atStart}} {{on "click" this.previous}}>Previous</button><div class="wpl-carousel-viewport"><div class="wpl-carousel-slide" aria-label={{this.slideLabel}}><div class="wpl-carousel-copy">{{this.slideText}}</div></div></div><button type="button" class="wpl-carousel-control" aria-label="Next" disabled={{this.atEnd}} {{on "click" this.next}}>Next</button></div></div>`,
  {
    state: () => ({ index: 0 }),
    getters: {
      label: (host) => str(host.args.label, 'Slides'),
      slides: (host) => list<Slide>(host.args.slides),
      index: (host) => num(host.state.index, 0),
      slide(this: Host) {
        return list<Slide>(this.args.slides)[num(this.state.index, 0)];
      },
      slideLabel(this: Host) {
        return str(list<Slide>(this.args.slides)[num(this.state.index, 0)]?.label);
      },
      slideText(this: Host) {
        const slide = list<Slide>(this.args.slides)[num(this.state.index, 0)];
        return str(slide?.content, str(slide?.label, message(localeOf(typeof document === 'undefined' ? null : document.body), 'empty')));
      },
      atStart(this: Host) {
        return !flag(this.args.loop) && num(this.state.index, 0) === 0;
      },
      atEnd(this: Host) {
        const count = list(this.args.slides).length;
        return !flag(this.args.loop) && num(this.state.index, 0) >= count - 1;
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
        this.state.index = moveIndex(num(this.state.index, 0), Number(delta), count, flag(this.args.loop));
        bubble(event as Event, 'wpl-change', { index: this.state.index });
      },
    },
  },
);

export const Combobox = glimmer(
  `<div class="wpl-field"><label class="wpl-label" for={{this.fieldId}}>{{this.label}}</label><input id={{this.fieldId}} class="wpl-input" role="combobox" aria-expanded={{this.expanded}} aria-controls={{this.listId}} value={{this.query}} {{on "input" this.filter}} {{on "focus" this.open}} />{{#if this.openState}}<ul class="wpl-menu" id={{this.listId}} role="listbox">{{#each this.matches as |option|}}<li><button type="button" role="option" {{on "click" (fn this.pick option)}}>{{option.label}}</button></li>{{/each}}</ul>{{/if}}</div>`,
  {
    state: (args) => ({ query: str(args.value), open: false, fieldId: createId('combo'), listId: createId('combo-list') }),
    getters: {
      label: (host) => str(host.args.label, 'Choose'),
      query: (host) => str(host.state.query),
      fieldId: (host) => str(host.state.fieldId),
      listId: (host) => str(host.state.listId),
      openState: (host) => Boolean(host.state.open),
      expanded: (host) => (host.state.open ? 'true' : 'false'),
      matches(this: Host) {
        const query = str(this.state.query).toLocaleLowerCase();
        return list<{ value?: string; label?: string }>(this.args.options).filter((option) => str(option.label, str(option.value)).toLocaleLowerCase().includes(query)).map((option) => ({
          value: str(option.value),
          label: str(option.label, str(option.value)),
        }));
      },
    },
    methods: {
      open() {
        this.state.open = true;
      },
      filter(event) {
        this.state.open = true;
        this.state.query = event instanceof Event && event.target instanceof HTMLInputElement ? event.target.value : '';
      },
      pick(option, event) {
        const chosen = option as { value: string; label: string };
        this.state.query = chosen.label;
        this.state.open = false;
        bubble(event as Event, 'wpl-change', { value: chosen.value });
      },
    },
  },
);
