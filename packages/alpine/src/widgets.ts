import {
  bindDismissable,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  moveEnabledIndex,
  typeaheadMove,
  moveIndex,
  readingDirection,
  stepIndex,
  stepState,
  supportsModalDialog,
  toastClassName,
  type MenuMotion,
} from '@white-plumeria/core';
import {
  emit,
  flag,
  h,
  labelOf,
  list,
  num,
  onDestroy,
  svgIcon,
  text,
  translate,
  uid,
  type Config,
  type Magic,
} from './runtime.ts';

interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  items?: MenuItem[];
}

interface TabItem {
  id: string;
  label: string;
  panel?: string;
}

interface AccordionItem {
  id: string;
  title: string;
  content?: string;
}

interface StepItem {
  id: string;
  title: string;
  description?: string;
}

interface Slide {
  id?: string;
  label: string;
  content?: string;
  caption?: string;
  src?: string;
  alt?: string;
}

function openDialog(kind: 'dialog' | 'drawer' | 'modal', config: Config, magic: Magic): void {
  const host = magic.$el;
  const title = text(config.title, kind === 'drawer' ? 'Drawer' : 'Dialog');
  const description = text(config.description || config.body);
  const dialog = document.createElement('dialog');
  dialog.className = kind === 'drawer' ? `wpl-drawer${config.side === 'start' ? ' wpl-drawer-start' : ''}` : 'wpl-dialog';
  const titleId = uid('title');
  const close = () => {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    emit(magic, 'wpl-close', { open: false });
    trigger.focus();
  };
  const confirm = h('button', {
    className: 'wpl-btn wpl-btn-danger wpl-btn-sm',
    text: text(config.confirm),
    attrs: { type: 'button' },
    on: {
      click: () => {
        emit(magic, 'wpl-confirm', {});
        close();
      },
    },
  });
  dialog.append(
    h('header', { className: 'wpl-dialog-header' }, [
      h('h2', { className: 'wpl-dialog-title', text: title, attrs: { id: titleId } }),
      h('button', {
        className: 'wpl-btn wpl-btn-ghost wpl-btn-sm',
        text: translate(host, 'close'),
        attrs: { type: 'button' },
        on: { click: close },
      }),
    ]),
    h('div', { className: 'wpl-dialog-body' }, [description ? h('p', { className: 'wpl-dialog-description', text: description }) : null]),
  );
  if (text(config.confirm)) dialog.append(h('footer', { className: 'wpl-dialog-footer' }, [confirm]));
  dialog.setAttribute('aria-labelledby', titleId);
  const trigger = h('button', {
    className: 'wpl-btn wpl-btn-secondary',
    text: text(config.trigger, translate(host, 'openMenu')),
    attrs: { type: 'button' },
    on: { click: () => show() },
  });
  const show = () => {
    if (supportsModalDialog() && typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    emit(magic, 'wpl-open', { open: true });
    dialog.querySelector('button')?.focus();
  };
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  });
  host.replaceChildren(trigger, dialog);
  if (flag(config.open)) show();
}

export function Dialog(config: Config = {}) {
  return { init(this: Magic) { openDialog('dialog', config, this); } };
}

export function Modal(config: Config = {}) {
  return { init(this: Magic) { openDialog('modal', config, this); } };
}

export function Drawer(config: Config = {}) {
  return { init(this: Magic) { openDialog('drawer', config, this); } };
}

function menuButton(item: MenuItem, active: boolean, onChoose: (item: MenuItem) => void): HTMLButtonElement {
  return h('button', {
    className: 'wpl-menu-item',
    text: item.label,
    attrs: {
      type: 'button',
      role: 'menuitem',
      disabled: item.disabled || undefined,
      'data-active': active ? 'true' : undefined,
      'aria-disabled': item.disabled ? 'true' : undefined,
      'aria-haspopup': item.items?.length ? 'menu' : undefined,
    },
    on: { click: () => onChoose(item) },
  }, [item.shortcut ? h('span', { className: 'wpl-menu-shortcut', text: item.shortcut }) : null]);
}

export function DropdownMenu(config: Config = {}) {
  return menu(config, 'click');
}

export function ContextMenu(config: Config = {}) {
  return menu(config, 'context');
}

function menu(config: Config, mode: 'click' | 'context') {
  return {
    init(this: Magic) {
      const host = this.$el;
      const items = list<MenuItem>(config.items);
      let open = false;
      let active = firstEnabledIndex(items);
      let sub: number | null = null;
      const typeahead = { query: '', at: 0 };
      let stop: (() => void) | undefined;
      const menuId = uid('menu');
      const panel = h('div', { className: 'wpl-menu wpl-menu-panel', attrs: { id: menuId, role: 'menu', hidden: true } });
      const trigger = h('button', {
        className: 'wpl-btn wpl-btn-secondary',
        text: text(config.label, translate(host, 'openMenu')),
        attrs: { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': menuId },
        on: {
          click: () => setOpen(!open),
          keydown: (event) => onKey(event as KeyboardEvent),
          contextmenu: (event) => {
            if (mode !== 'context') return;
            event.preventDefault();
            setOpen(true);
          },
        },
      });

      const paint = () => {
        trigger.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
        panel.replaceChildren();
        items.forEach((item, index) => {
          const row = menuButton(item, index === active && sub === null, (chosen) => choose(chosen, index));
          panel.append(row);
          if (item.items?.length && sub !== null && index === active) {
            const nested = h('div', { className: 'wpl-menu-sub', attrs: { role: 'menu' } });
            item.items.forEach((child, childIndex) => {
              nested.append(menuButton(child, childIndex === sub, (chosen) => {
                if (chosen.disabled) return;
                emit(this, 'wpl-select', { id: chosen.id });
                setOpen(false);
              }));
            });
            panel.append(nested);
          }
        });
      };

      const setOpen = (next: boolean) => {
        open = next;
        if (!open) sub = null;
        else active = firstEnabledIndex(items);
        stop?.();
        stop = undefined;
        if (open) {
          stop = bindDismissable({
            root: host,
            onDismiss: () => setOpen(false),
          });
        }
        paint();
      };

      const choose = (item: MenuItem, index: number) => {
        if (item.disabled) return;
        active = index;
        if (menuHasSubmenu(item)) {
          sub = firstEnabledIndex(item.items);
          paint();
          return;
        }
        emit(this, 'wpl-select', { id: item.id });
        setOpen(false);
      };

      const onKey = (event: KeyboardEvent) => {
        const parent = items[active];
        const children = parent?.items ?? [];
        const current = sub === null ? parent : children[sub];
        const command = menuCommand({
          key: event.key,
          direction: readingDirection(host),
          open,
          submenuOpen: sub !== null,
          hasSubmenu: menuHasSubmenu(current),
        });
        if (!command) {
          if (!open) return;
          const pool = sub === null ? items : children;
          const from = sub === null ? active : sub;
          const next = typeaheadMove(typeahead, pool, event.key, Date.now(), from);
          if (next === null) return;
          event.preventDefault();
          if (sub === null) active = next;
          else sub = next;
          paint();
          return;
        }
        event.preventDefault();
        if (command === 'open') {
          setOpen(true);
          return;
        }
        if (command === 'close') {
          setOpen(false);
          return;
        }
        if (command === 'close-submenu') {
          sub = null;
          paint();
          return;
        }
        if (command === 'open-submenu') {
          if (!open) setOpen(true);
          if (parent) choose(parent, active);
          return;
        }
        if (command === 'activate') {
          const child = sub === null ? undefined : parent?.items?.[sub];
          if (child) choose(child, active);
          else if (parent) choose(parent, active);
          return;
        }
        const motion = command as MenuMotion;
        if (sub === null) active = moveEnabledIndex(items, active, motion);
        else if (parent?.items) sub = moveEnabledIndex(parent.items, sub, motion);
        paint();
      };

      onDestroy(host, () => stop?.());
      host.classList.add('wpl-menu-root');
      host.replaceChildren(trigger, panel);
      paint();
    },
  };
}

export function Popover(config: Config = {}) {
  return {
    init(this: Magic) {
      const host = this.$el;
      let open = false;
      let stop: (() => void) | undefined;
      const panel = h('div', { className: 'wpl-popover', attrs: { role: 'dialog', hidden: true } }, [
        h('p', { text: text(config.content, labelOf(this, config, 'Details')) }),
      ]);
      const trigger = h('button', {
        className: 'wpl-btn wpl-btn-secondary wpl-btn-sm',
        text: text(config.label, 'Details'),
        attrs: { type: 'button', 'aria-expanded': 'false' },
        on: { click: () => setOpen(!open) },
      });
      const setOpen = (next: boolean) => {
        open = next;
        panel.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
        stop?.();
        stop = open ? bindDismissable({ root: host, onDismiss: () => setOpen(false) }) : undefined;
      };
      onDestroy(host, () => stop?.());
      host.replaceChildren(trigger, panel);
    },
  };
}

export function Tooltip(config: Config = {}) {
  return {
    init(this: Magic) {
      const id = uid('tip');
      let open = false;
      const tip = h('span', { className: 'wpl-tooltip', text: text(config.content, 'Tip'), attrs: { id, role: 'tooltip', hidden: true } });
      const trigger = h('button', {
        className: 'wpl-btn wpl-btn-ghost wpl-btn-sm',
        text: text(config.label, 'Info'),
        attrs: { type: 'button', 'aria-describedby': id },
        on: {
          focus: () => show(true),
          blur: () => show(false),
          mouseenter: () => show(true),
          mouseleave: () => show(false),
          keydown: (event) => {
            if ((event as KeyboardEvent).key === 'Escape') show(false);
          },
        },
      });
      const show = (next: boolean) => {
        open = next;
        tip.hidden = !open;
      };
      this.$el.replaceChildren(trigger, tip);
    },
  };
}

export function Tabs(config: Config = {}) {
  return {
    init(this: Magic) {
      const tabs = list<TabItem>(config.tabs);
      let value = text(config.value, tabs[0]?.id ?? '');
      const tablist = h('div', { className: 'wpl-tablist', attrs: { role: 'tablist', 'aria-label': text(config.label, 'Tabs') } });
      const panel = h('div', { className: 'wpl-tabpanel', attrs: { role: 'tabpanel', tabindex: '0' } });
      const paint = () => {
        tablist.replaceChildren();
        tabs.forEach((tab, index) => {
          const selected = tab.id === value;
          tablist.append(h('button', {
            className: 'wpl-tab',
            text: tab.label,
            attrs: { type: 'button', role: 'tab', 'aria-selected': String(selected), tabindex: selected ? '0' : '-1' },
            on: {
              click: () => select(tab.id),
              keydown: (event) => {
                const key = (event as KeyboardEvent).key;
                if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End') return;
                event.preventDefault();
                const next = key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : moveIndex(index, key === 'ArrowRight' ? 1 : -1, tabs.length, true);
                const item = tabs[next];
                if (item) select(item.id);
              },
            },
          }));
        });
        const current = tabs.find((tab) => tab.id === value);
        panel.textContent = current?.panel ?? '';
      };
      const select = (id: string) => {
        value = id;
        paint();
        emit(this, 'wpl-change', { value });
      };
      paint();
      this.$el.classList.add('wpl-tabs');
      this.$el.replaceChildren(tablist, panel);
    },
  };
}

export function Accordion(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<AccordionItem>(config.items);
      const open = new Set<string>(list<string>(config.open));
      const root = h('div', { className: 'wpl-accordion' });
      const paint = () => {
        root.replaceChildren();
        for (const item of items) {
          const expanded = open.has(item.id);
          const panelId = uid('acc');
          root.append(h('div', { className: 'wpl-accordion-item' }, [
            h('button', {
              className: 'wpl-accordion-trigger',
              text: item.title,
              attrs: { type: 'button', 'aria-expanded': String(expanded), 'aria-controls': panelId },
              on: {
                click: () => {
                  if (expanded) open.delete(item.id);
                  else {
                    if (!flag(config.multiple)) open.clear();
                    open.add(item.id);
                  }
                  paint();
                  emit(this, 'wpl-toggle', { id: item.id, open: open.has(item.id) });
                },
              },
            }, [svgIcon(expanded ? 'chevronDown' : 'chevronRight')]),
            h('div', { className: 'wpl-accordion-panel', text: item.content ?? '', attrs: { id: panelId, hidden: expanded ? undefined : true } }),
          ]));
        }
      };
      paint();
      this.$el.replaceChildren(root);
    },
  };
}

export function Carousel(config: Config = {}) {
  return {
    init(this: Magic) {
      const slides = list<Slide>(config.slides);
      let index = 0;
      const viewport = h('div', { className: 'wpl-carousel-viewport' });
      const paint = () => {
        const slide = slides[index];
        const figure = slide?.src
          ? h('figure', { className: 'wpl-carousel-figure' }, [
              h('img', { className: 'wpl-carousel-image', attrs: { src: slide.src, alt: slide.alt ?? slide.label ?? '' } }),
              h('figcaption', { className: 'wpl-carousel-caption' }, [
                h('strong', { text: slide.label }),
                slide.caption ? h('span', { text: slide.caption }) : null,
              ]),
            ])
          : null;
        viewport.replaceChildren(h('div', { className: 'wpl-carousel-slide', attrs: { 'aria-label': slide?.label } }, [
          figure,
          slide?.content ? h('div', { className: 'wpl-carousel-copy', text: slide.content }) : null,
          !slide?.src && !slide?.content ? h('p', { className: 'wpl-carousel-copy', text: slide?.label ?? translate(this.$el, 'empty') }) : null,
        ]));
        previous.disabled = !config.loop && index === 0;
        next.disabled = !config.loop && index >= slides.length - 1;
      };
      const go = (delta: number) => {
        index = moveIndex(index, delta, slides.length, flag(config.loop));
        paint();
        emit(this, 'wpl-change', { index });
      };
      const previous = h('button', {
        className: 'wpl-carousel-control',
        attrs: { type: 'button', 'aria-label': translate(this.$el, 'previous') },
        on: { click: () => go(-1) },
      }, [svgIcon('chevronLeft')]);
      const next = h('button', {
        className: 'wpl-carousel-control',
        attrs: { type: 'button', 'aria-label': translate(this.$el, 'next') },
        on: { click: () => go(1) },
      }, [svgIcon('chevronRight')]);
      paint();
      this.$el.classList.add('wpl-carousel');
      this.$el.replaceChildren(h('div', { className: 'wpl-carousel-bar' }, [previous, viewport, next]));
    },
  };
}

export function Steps(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<StepItem>(config.items);
      let value = text(config.value, items[0]?.id ?? '');
      const listEl = h('ol', { className: 'wpl-steps' });
      const paint = () => {
        const current = stepIndex(items, value);
        listEl.replaceChildren();
        items.forEach((item, index) => {
          const state = stepState(index, current);
          listEl.append(h('li', { className: 'wpl-step', attrs: { 'data-state': state } }, [
            h('button', {
              className: 'wpl-step-trigger',
              attrs: { type: 'button', 'aria-current': state === 'current' ? 'step' : undefined },
              on: {
                click: () => {
                  value = item.id;
                  paint();
                  emit(this, 'wpl-change', { value });
                },
              },
            }, [
              h('span', { className: 'wpl-step-marker', attrs: { 'aria-hidden': 'true' }, text: String(index + 1) }),
              h('span', { className: 'wpl-step-title', text: item.title }),
              item.description ? h('span', { className: 'wpl-step-desc', text: item.description }) : null,
            ]),
          ]));
        });
      };
      paint();
      this.$el.replaceChildren(listEl);
    },
  };
}

interface RejectedFile {
  name: string;
  reason: string;
}

export function FileUpload(config: Config = {}) {
  return {
    init(this: Magic) {
      const maxSize = num(config.maxSize, 0);
      const accept = text(config.accept);
      const names = h('ul', { className: 'wpl-file-list' });
      const errors = h('p', { className: 'wpl-field-error', attrs: { role: 'alert', hidden: true } });
      const input = h('input', {
        className: 'wpl-file-input',
        attrs: { type: 'file', accept: accept || undefined, multiple: flag(config.multiple) || undefined },
        on: { change: () => take(input.files) },
      });
      const drop = h('label', { className: 'wpl-file-drop', text: text(config.label, 'Choose a file') }, [input]);
      drop.addEventListener('dragover', (event) => {
        event.preventDefault();
        drop.setAttribute('data-active', 'true');
      });
      drop.addEventListener('dragleave', () => drop.removeAttribute('data-active'));
      drop.addEventListener('drop', (event) => {
        event.preventDefault();
        drop.removeAttribute('data-active');
        take(event.dataTransfer?.files ?? null);
      });
      const take = (files: FileList | null) => {
        const accepted: string[] = [];
        const rejected: RejectedFile[] = [];
        for (const file of files ? [...files] : []) {
          if (accept && !accept.split(',').some((rule) => matches(file, rule.trim()))) {
            rejected.push({ name: file.name, reason: translate(this.$el, 'fileRejected') });
            continue;
          }
          if (maxSize && file.size > maxSize) {
            rejected.push({ name: file.name, reason: translate(this.$el, 'fileRejected') });
            continue;
          }
          accepted.push(file.name);
        }
        names.replaceChildren(...accepted.map((name) => h('li', { className: 'wpl-file-item', text: name })));
        errors.hidden = rejected.length === 0;
        errors.textContent = rejected.map((item) => `${item.name}: ${item.reason}`).join(' ');
        if (accepted.length) emit(this, 'wpl-change', { files: accepted });
        if (rejected.length) emit(this, 'wpl-reject', { files: rejected });
      };
      this.$el.replaceChildren(h('div', { className: 'wpl-file' }, [drop, names, errors]));
    },
  };
}

function matches(file: File, rule: string): boolean {
  if (!rule) return true;
  if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule.toLowerCase());
  if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
  return file.type === rule;
}

interface ComboOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function Combobox(config: Config = {}) {
  return {
    init(this: Magic) {
      const options = list<ComboOption>(config.options);
      let query = text(config.value);
      let open = false;
      let active = 0;
      const listId = uid('list');
      const input = h('input', {
        className: 'wpl-input',
        attrs: { role: 'combobox', 'aria-expanded': 'false', 'aria-controls': listId, 'aria-autocomplete': 'list', value: query },
        on: {
          input: (event) => {
            query = (event.target as HTMLInputElement).value;
            open = true;
            active = 0;
            paint();
          },
          keydown: (event) => onKey(event as KeyboardEvent),
        },
      });
      const listbox = h('div', { className: 'wpl-listbox', attrs: { id: listId, role: 'listbox', hidden: true } });
      const filtered = () => options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
      const paint = () => {
        const items = filtered();
        input.setAttribute('aria-expanded', String(open));
        listbox.hidden = !open;
        listbox.replaceChildren();
        if (!items.length) {
          listbox.append(h('p', { className: 'wpl-muted', text: translate(this.$el, 'noResults') }));
          return;
        }
        items.forEach((option, index) => {
          listbox.append(h('button', {
            className: 'wpl-menu-item',
            text: option.label,
            attrs: { type: 'button', role: 'option', 'data-active': index === active ? 'true' : undefined, disabled: option.disabled || undefined },
            on: { click: () => choose(option) },
          }));
        });
      };
      const choose = (option: ComboOption) => {
        if (option.disabled) return;
        query = option.label;
        input.value = option.label;
        open = false;
        paint();
        emit(this, 'wpl-change', { value: option.value });
      };
      const onKey = (event: KeyboardEvent) => {
        const items = filtered().filter((option) => !option.disabled);
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          open = true;
          active = Math.min(items.length - 1, active + 1);
          paint();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          active = Math.max(0, active - 1);
          paint();
        } else if (event.key === 'Enter' && open) {
          event.preventDefault();
          const option = items[active];
          if (option) choose(option);
        } else if (event.key === 'Escape') {
          open = false;
          paint();
        }
      };
      paint();
      this.$el.replaceChildren(h('div', { className: 'wpl-combo' }, [
        h('label', { className: 'wpl-label', text: text(config.label, 'Choose') }),
        h('div', { className: 'wpl-combo-control' }, [svgIcon('search', 'wpl-icon wpl-combo-icon'), input]),
        listbox,
      ]));
    },
  };
}

interface CommandItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export function CommandPalette(config: Config = {}) {
  return {
    init(this: Magic) {
      const commands = list<CommandItem>(config.commands ?? config.items);
      let query = '';
      let active = 0;
      const results = h('div', { className: 'wpl-command-list', attrs: { role: 'listbox' } });
      const input = h('input', {
        className: 'wpl-input wpl-command-input',
        attrs: { type: 'search', placeholder: text(config.placeholder, translate(this.$el, 'search')), 'aria-label': text(config.label, translate(this.$el, 'search')) },
        on: {
          input: (event) => {
            query = (event.target as HTMLInputElement).value;
            active = 0;
            paint();
          },
          keydown: (event) => {
            const key = (event as KeyboardEvent).key;
            const items = filtered();
            if (key === 'ArrowDown') {
              event.preventDefault();
              active = Math.min(items.length - 1, active + 1);
              paint();
            } else if (key === 'ArrowUp') {
              event.preventDefault();
              active = Math.max(0, active - 1);
              paint();
            } else if (key === 'Enter') {
              event.preventDefault();
              const item = items[active];
              if (item) choose(item);
            }
          },
        },
      });
      const filtered = () => commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) && !item.disabled);
      const paint = () => {
        const items = filtered();
        results.replaceChildren();
        if (!items.length) {
          results.append(h('p', { className: 'wpl-muted', text: translate(this.$el, 'noResults') }));
          return;
        }
        items.forEach((item, index) => {
          results.append(h('button', {
            className: 'wpl-menu-item',
            text: item.label,
            attrs: { type: 'button', role: 'option', 'data-active': index === active ? 'true' : undefined },
            on: { click: () => choose(item) },
          }));
        });
      };
      const choose = (item: CommandItem) => {
        emit(this, 'wpl-select', { id: item.id });
      };
      paint();
      this.$el.replaceChildren(h('div', { className: 'wpl-command' }, [input, results]));
    },
  };
}

export function Toast(config: Config = {}) {
  return {
    init(this: Magic) {
      const variant = oneVariant(config.variant);
      const article = h('article', { className: toastClassName(variant), attrs: { role: variant === 'danger' ? 'alert' : 'status' } }, [
        h('strong', { className: 'wpl-toast-title', text: text(config.title, 'Notice') }),
        text(config.description) ? h('p', { className: 'wpl-toast-description', text: text(config.description) }) : null,
        h('button', {
          className: 'wpl-btn wpl-btn-ghost wpl-btn-sm',
          text: translate(this.$el, 'dismiss'),
          attrs: { type: 'button' },
          on: {
            click: () => {
              article.remove();
              emit(this, 'wpl-dismiss', {});
            },
          },
        }),
      ]);
      this.$el.replaceChildren(article);
    },
  };
}

export function Notification(config: Config = {}) {
  return Toast(config);
}

function oneVariant(value: unknown): 'neutral' | 'success' | 'warning' | 'danger' {
  return value === 'success' || value === 'warning' || value === 'danger' ? value : 'neutral';
}

