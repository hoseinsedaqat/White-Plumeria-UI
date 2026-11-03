import {
  bindDismissable,
  canMove,
  carouselIndexFromKey,
  clampIndex,
  firstEnabledIndex,
  menuCommand,
  menuHasSubmenu,
  moveEnabledIndex,
  typeaheadMove,
  moveIndex,
  nextIndex,
  readingDirection,
  stepIndex,
  stepState,
  supportsModalDialog,
  notificationClassName,
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
  oneOf,
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
  dialog.className =
    kind === 'drawer'
      ? `wpl-drawer${config.side === 'start' ? ' wpl-drawer-start' : ''}`
      : 'wpl-dialog';
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
    h('div', { className: 'wpl-dialog-body' }, [
      description ? h('p', { className: 'wpl-dialog-description', text: description }) : null,
    ]),
  );
  if (text(config.confirm))
    dialog.append(h('footer', { className: 'wpl-dialog-footer' }, [confirm]));
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
  return {
    init(this: Magic) {
      openDialog('dialog', config, this);
    },
  };
}

export function Modal(config: Config = {}) {
  return {
    init(this: Magic) {
      openDialog('modal', config, this);
    },
  };
}

export function Drawer(config: Config = {}) {
  return {
    init(this: Magic) {
      openDialog('drawer', config, this);
    },
  };
}

function menuButton(
  item: MenuItem,
  active: boolean,
  onChoose: (item: MenuItem) => void,
  extra: Record<string, string | undefined> = {},
): HTMLButtonElement {
  return h(
    'button',
    {
      className: 'wpl-menu-item',
      text: item.label,
      attrs: {
        type: 'button',
        role: 'menuitem',
        disabled: item.disabled || undefined,
        'data-active': active ? 'true' : undefined,
        'aria-disabled': item.disabled ? 'true' : undefined,
        'aria-haspopup': item.items?.length ? 'menu' : undefined,
        ...extra,
      },
      on: { click: () => onChoose(item) },
    },
    [item.shortcut ? h('span', { className: 'wpl-menu-shortcut', text: item.shortcut }) : null],
  );
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
      const panel = h('div', {
        className: 'wpl-menu wpl-menu-panel',
        attrs: { id: menuId, role: 'menu', hidden: true },
      });
      const trigger = h('button', {
        className: 'wpl-btn wpl-btn-secondary',
        text: text(config.label, translate(host, 'openMenu')),
        attrs: {
          type: 'button',
          'aria-haspopup': 'menu',
          'aria-expanded': 'false',
          'aria-controls': menuId,
        },
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
        const parent = items[active];
        const current = sub === null ? parent : parent?.items?.[sub];
        const activeId = open && current ? `${menuId}-${current.id}` : '';
        trigger.setAttribute('aria-expanded', String(open));
        if (activeId) trigger.setAttribute('aria-activedescendant', activeId);
        else trigger.removeAttribute('aria-activedescendant');
        panel.hidden = !open;
        panel.replaceChildren();
        items.forEach((item, index) => {
          const expanded = Boolean(item.items?.length && sub !== null && index === active);
          const row = menuButton(
            item,
            index === active && sub === null,
            (chosen) => choose(chosen, index),
            {
              id: `${menuId}-${item.id}`,
              'aria-expanded': item.items?.length ? String(expanded) : undefined,
              'aria-controls': expanded ? `${menuId}-sub-${item.id}` : undefined,
            },
          );
          panel.append(row);
          if (expanded && item.items) {
            const nested = h('div', {
              className: 'wpl-menu-sub',
              attrs: { id: `${menuId}-sub-${item.id}`, role: 'menu', 'aria-label': item.label },
            });
            item.items.forEach((child, childIndex) => {
              nested.append(
                menuButton(
                  child,
                  childIndex === sub,
                  (chosen) => {
                    if (chosen.disabled) return;
                    emit(this, 'wpl-select', { id: chosen.id });
                    setOpen(false);
                  },
                  { id: `${menuId}-${child.id}` },
                ),
              );
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
        if (!open) {
          setOpen(true);
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
      const panelId = uid('popover');
      const panel = h(
        'div',
        { className: 'wpl-popover', attrs: { id: panelId, role: 'dialog', hidden: true } },
        [h('p', { text: text(config.content, labelOf(this, config, 'Details')) })],
      );
      const trigger = h('button', {
        className: 'wpl-btn wpl-btn-secondary wpl-btn-sm',
        text: text(config.label, 'Details'),
        attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': panelId },
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
      const host = this.$el;
      const id = uid('tip');
      let open = false;
      let timer = 0;
      const tip = h('span', {
        className: 'wpl-tooltip',
        text: text(config.content, 'Tip'),
        attrs: { id, role: 'tooltip', hidden: true },
      });
      const trigger = h('button', {
        className: 'wpl-btn wpl-btn-ghost wpl-btn-sm',
        text: text(config.label, 'Info'),
        attrs: { type: 'button' },
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
        window.clearTimeout(timer);
        if (!next) {
          open = false;
          tip.hidden = true;
          trigger.removeAttribute('aria-describedby');
          return;
        }
        timer = window.setTimeout(() => {
          open = true;
          tip.hidden = false;
          trigger.setAttribute('aria-describedby', id);
        }, 400);
      };
      onDestroy(host, () => window.clearTimeout(timer));
      host.replaceChildren(trigger, tip);
    },
  };
}

export function Tabs(config: Config = {}) {
  return {
    init(this: Magic) {
      const tabs = list<TabItem>(config.tabs);
      let value = text(config.value, tabs[0]?.id ?? '');
      const orientation = config.orientation === 'vertical' ? 'vertical' : 'horizontal';
      const panelId = uid('wpl-tabpanel');
      const tablist = h('div', {
        className: 'wpl-tablist',
        attrs: {
          role: 'tablist',
          'aria-label': text(config.label, 'Tabs'),
          'aria-orientation': orientation,
        },
      });
      const panel = h('div', {
        className: 'wpl-tabpanel',
        attrs: { role: 'tabpanel', id: panelId, tabindex: '0' },
      });
      const paint = () => {
        tablist.replaceChildren();
        tabs.forEach((tab, index) => {
          const selected = tab.id === value;
          tablist.append(
            h('button', {
              className: 'wpl-tab',
              text: tab.label,
              attrs: {
                type: 'button',
                role: 'tab',
                id: `wpl-tab-${tab.id}`,
                'aria-selected': String(selected),
                'aria-controls': panelId,
                tabindex: selected ? '0' : '-1',
              },
              on: {
                click: () => select(tab.id),
                keydown: (event) => {
                  const keyEvent = event as KeyboardEvent;
                  const next = nextIndex(
                    index,
                    tabs.length,
                    keyEvent.key,
                    orientation,
                    readingDirection(
                      keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget : null,
                    ),
                  );
                  if (next === null) return;
                  keyEvent.preventDefault();
                  const item = tabs[next];
                  if (item) select(item.id, true);
                },
              },
            }),
          );
        });
        const current = tabs.find((tab) => tab.id === value);
        panel.textContent = current?.panel ?? '';
        panel.setAttribute('aria-labelledby', current ? `wpl-tab-${current.id}` : '');
      };
      const select = (id: string, focus = false) => {
        value = id;
        paint();
        emit(this, 'wpl-change', { value });
        if (focus) tablist.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
      };
      paint();
      this.$el.classList.add('wpl-tabs');
      if (orientation === 'vertical') this.$el.classList.add('wpl-tabs-vertical');
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
          const panelId = `wpl-accordion-${item.id}`;
          root.append(
            h('div', { className: 'wpl-accordion-item' }, [
              h(
                'button',
                {
                  className: 'wpl-accordion-trigger',
                  text: item.title,
                  attrs: {
                    type: 'button',
                    id: `${panelId}-trigger`,
                    'aria-expanded': String(expanded),
                    'aria-controls': panelId,
                  },
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
                },
                [svgIcon(expanded ? 'chevronDown' : 'chevronRight', expanded ? 'wpl-icon' : 'wpl-icon wpl-icon-dir')],
              ),
              h('div', {
                className: 'wpl-accordion-panel',
                text: item.content ?? '',
                attrs: {
                  id: panelId,
                  role: 'region',
                  'aria-labelledby': `${panelId}-trigger`,
                  hidden: expanded ? undefined : true,
                },
              }),
            ]),
          );
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
      const media = slides.some((slide) => Boolean(slide.src));
      const loop = flag(config.loop);
      const baseId = uid('wpl-slide');
      let index = clampIndex(num(config.index, 0), slides.length);
      let startX: number | null = null;
      if (slides.length === 0) {
        this.$el.classList.add('wpl-carousel');
        this.$el.replaceChildren(h('p', { className: 'wpl-muted', text: translate(this.$el, 'empty') }));
        return;
      }
      const viewport = h('div', { className: 'wpl-carousel-viewport' });
      const track = h('div', { className: 'wpl-carousel-track' });
      const dots = h('div', {
        className: 'wpl-carousel-dots',
        attrs: { role: 'tablist', 'aria-label': text(config.label, translate(this.$el, 'carousel')) },
      });
      const control = (name: 'previous' | 'next', delta: number) =>
        h(
          'button',
          {
            className: media ? 'wpl-carousel-control' : 'wpl-btn wpl-btn-outline wpl-btn-sm',
            attrs: { type: 'button', 'aria-label': translate(this.$el, name) },
            on: { click: () => go(delta) },
          },
          [svgIcon(delta < 0 ? 'chevronLeft' : 'chevronRight', 'wpl-icon wpl-icon-dir')],
        );
      const previous = control('previous', -1);
      const next = control('next', 1);
      const commit = (nextIndex: number, focus = false) => {
        index = clampIndex(nextIndex, slides.length);
        paint();
        emit(this, 'wpl-change', { index });
        if (focus) dots.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
      };
      const go = (delta: number) => {
        if (!canMove(index, delta, slides.length, loop)) return;
        commit(moveIndex(index, delta, slides.length, loop));
      };
      const paint = () => {
        track.style.setProperty('--wpl-carousel-index', String(index));
        track.replaceChildren(
          ...slides.map((slide, slideIndex) => {
            const active = slideIndex === index;
            const panel = h(
              'div',
              {
                className: 'wpl-carousel-slide',
                attrs: {
                  id: `${baseId}-panel-${slide.id || slideIndex}`,
                  role: 'tabpanel',
                  'aria-roledescription': 'slide',
                  'aria-label': `${slide.label}, ${slideIndex + 1} ${translate(this.$el, 'of')} ${slides.length}`,
                  'aria-hidden': active ? undefined : 'true',
                  inert: active ? undefined : true,
                  tabindex: active ? -1 : undefined,
                },
              },
              [
                slide.src
                  ? h('figure', { className: 'wpl-carousel-figure' }, [
                      h('img', {
                        className: 'wpl-carousel-image',
                        attrs: {
                          src: slide.src,
                          alt: slide.alt ?? slide.label ?? '',
                          draggable: 'false',
                        },
                      }),
                      h('figcaption', { className: 'wpl-carousel-caption' }, [
                        h('strong', { text: slide.label }),
                        slide.caption ? h('span', { text: slide.caption }) : null,
                      ]),
                    ])
                  : null,
                slide.content ? h('div', { className: 'wpl-carousel-copy', text: slide.content }) : null,
                !slide.src && !slide.content
                  ? h('p', { className: 'wpl-carousel-copy', text: slide.label })
                  : null,
              ],
            );
            return panel;
          }),
        );
        dots.replaceChildren(
          ...slides.map((slide, slideIndex) => {
            const selected = slideIndex === index;
            return h(
              'button',
              {
                className: 'wpl-carousel-dot',
                text: '',
                attrs: {
                  type: 'button',
                  role: 'tab',
                  'aria-selected': String(selected),
                  'aria-controls': `${baseId}-panel-${slide.id || slideIndex}`,
                  tabindex: selected ? '0' : '-1',
                },
                on: {
                  click: () => commit(slideIndex),
                  keydown: (event) => {
                    const keyEvent = event as KeyboardEvent;
                    const nextIndex = carouselIndexFromKey(
                      index,
                      slides.length,
                      keyEvent.key,
                      readingDirection(
                        keyEvent.currentTarget instanceof HTMLElement ? keyEvent.currentTarget : null,
                      ),
                      loop,
                    );
                    if (nextIndex === null) return;
                    keyEvent.preventDefault();
                    commit(nextIndex, true);
                  },
                },
              },
              [h('span', { className: 'wpl-sr-only', text: slide.label })],
            );
          }),
        );
        previous.disabled = !canMove(index, -1, slides.length, loop);
        next.disabled = !canMove(index, 1, slides.length, loop);
        this.$el.dataset.index = String(index);
      };
      viewport.addEventListener('pointerdown', (event) => {
        if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
        startX = event.clientX;
      });
      viewport.addEventListener('pointerup', (event) => {
        if (startX === null) return;
        const delta = event.clientX - startX;
        startX = null;
        if (Math.abs(delta) < 48) return;
        const direction = readingDirection(viewport);
        go(direction === 'rtl' ? (delta > 0 ? 1 : -1) : delta < 0 ? 1 : -1);
      });
      viewport.addEventListener('pointercancel', () => {
        startX = null;
      });
      paint();
      this.$el.classList.add('wpl-carousel');
      if (media) this.$el.classList.add('wpl-carousel-media');
      this.$el.setAttribute('aria-roledescription', 'carousel');
      this.$el.setAttribute('aria-label', text(config.label, translate(this.$el, 'carousel')));
      if (media) {
        viewport.append(track, h('div', { className: 'wpl-carousel-nav' }, [previous, next]), dots);
        this.$el.replaceChildren(viewport);
      } else {
        viewport.append(track);
        this.$el.replaceChildren(viewport, h('div', { className: 'wpl-carousel-bar' }, [previous, dots, next]));
      }
    },
  };
}

export function Steps(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<StepItem>(config.items);
      let value = text(config.value, items[0]?.id ?? '');
      const linear = config.linear !== false;
      const listEl = h('ol', {
        className: config.orientation === 'vertical' ? 'wpl-steps wpl-steps-vertical' : 'wpl-steps',
        attrs: { 'aria-label': text(config.label, translate(this.$el, 'steps')) },
      });
      const paint = () => {
        const current = stepIndex(items, value);
        listEl.replaceChildren();
        items.forEach((item, index) => {
          const state = stepState(index, current);
          const blocked = linear && index > current;
          listEl.append(
            h('li', { className: 'wpl-step', attrs: { 'data-state': state } }, [
              h(
                'button',
                {
                  className: 'wpl-step-trigger',
                  attrs: {
                    type: 'button',
                    disabled: blocked || undefined,
                    'aria-current': state === 'current' ? 'step' : undefined,
                  },
                  on: {
                    click: () => {
                      if (blocked) return;
                      value = item.id;
                      paint();
                      emit(this, 'wpl-change', { value });
                    },
                  },
                },
                [
                  h('span', {
                    className: 'wpl-step-marker',
                    attrs: { 'aria-hidden': 'true' },
                  }, state === 'complete' ? [svgIcon('check')] : [String(index + 1)]),
                  h('span', { className: 'wpl-step-title', text: item.title }),
                  item.description
                    ? h('span', { className: 'wpl-step-desc', text: item.description })
                    : null,
                ],
              ),
            ]),
          );
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
      const errorId = uid('file-error');
      const errors = h('p', {
        className: 'wpl-field-error',
        attrs: { id: errorId, role: 'alert', hidden: true },
      });
      const input = h('input', {
        className: 'wpl-file-input',
        attrs: {
          type: 'file',
          accept: accept || undefined,
          multiple: flag(config.multiple) || undefined,
        },
        on: { change: () => take(input.files) },
      });
      const drop = h(
        'label',
        { className: 'wpl-file-drop', text: text(config.label, 'Choose a file') },
        [input],
      );
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
        names.replaceChildren(
          ...accepted.map((name) => h('li', { className: 'wpl-file-item', text: name })),
        );
        errors.hidden = rejected.length === 0;
        errors.textContent = rejected.map((item) => `${item.name}: ${item.reason}`).join(' ');
        if (rejected.length) {
          input.setAttribute('aria-invalid', 'true');
          input.setAttribute('aria-describedby', errorId);
        } else {
          input.removeAttribute('aria-invalid');
          input.removeAttribute('aria-describedby');
        }
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
      const initial = options.find((option) => option.value === text(config.value));
      let selected = initial?.value ?? '';
      let query = initial?.label ?? text(config.value);
      let open = false;
      let active = 0;
      const fieldId = uid('combo');
      const listId = uid('list');
      const input = h('input', {
        className: 'wpl-input',
        attrs: {
          id: fieldId,
          role: 'combobox',
          'aria-expanded': 'false',
          'aria-controls': listId,
          'aria-autocomplete': 'list',
          value: query,
        },
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
      const listbox = h('div', {
        className: 'wpl-listbox',
        attrs: { id: listId, role: 'listbox', hidden: true },
      });
      const filtered = () => {
        const needle = query.trim().toLowerCase();
        const current = options.find((option) => option.value === selected);
        if (!needle || needle === current?.label.toLowerCase()) return options;
        return options.filter((option) => option.label.toLowerCase().includes(needle));
      };
      const paint = () => {
        const items = filtered();
        input.setAttribute('aria-expanded', String(open));
        const activeId = open && items[active] ? `${listId}-${active}` : '';
        if (activeId) input.setAttribute('aria-activedescendant', activeId);
        else input.removeAttribute('aria-activedescendant');
        listbox.hidden = !open;
        listbox.replaceChildren();
        if (!items.length) {
          listbox.append(
            h('p', { className: 'wpl-listbox-item', text: translate(this.$el, 'noResults') }),
          );
          return;
        }
        items.forEach((option, index) => {
          listbox.append(
            h('button', {
              className: 'wpl-listbox-item',
              text: option.label,
              attrs: {
                id: `${listId}-${index}`,
                type: 'button',
                role: 'option',
                'aria-selected': option.value === selected ? 'true' : 'false',
                'data-active': index === active ? 'true' : undefined,
                disabled: option.disabled || undefined,
              },
              on: { click: () => choose(option) },
            }),
          );
        });
      };
      const choose = (option: ComboOption) => {
        if (option.disabled) return;
        selected = option.value;
        query = option.label;
        input.value = option.label;
        open = false;
        paint();
        emit(this, 'wpl-change', { value: option.value });
      };
      const onKey = (event: KeyboardEvent) => {
        const items = filtered();
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          open = true;
          const next = nextIndex(active, items.length, event.key, 'vertical');
          if (next !== null) active = next;
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
      this.$el.replaceChildren(
        h('div', { className: 'wpl-combo' }, [
          h('label', { className: 'wpl-label', text: text(config.label, 'Choose'), attrs: { for: fieldId } }),
          h('div', { className: 'wpl-combo-control' }, [
            svgIcon('search', 'wpl-icon wpl-combo-icon'),
            input,
          ]),
          listbox,
        ]),
      );
    },
  };
}

interface CommandItem {
  id: string;
  label: string;
  disabled?: boolean;
  group?: string;
  keywords?: string[];
}

export function CommandPalette(config: Config = {}) {
  return {
    init(this: Magic) {
      const commands = list<CommandItem>(config.commands ?? config.items);
      let query = '';
      let active = 0;
      const listId = uid('command-list');
      const results = h('div', {
        className: 'wpl-command-list',
        attrs: { id: listId, role: 'listbox' },
      });
      const input = h('input', {
        className: 'wpl-input wpl-command-input',
        attrs: {
          type: 'search',
          role: 'combobox',
          'aria-expanded': 'true',
          'aria-controls': listId,
          'aria-autocomplete': 'list',
          placeholder: text(config.placeholder, translate(this.$el, 'search')),
          'aria-label': text(config.label, translate(this.$el, 'command')),
        },
        on: {
          input: (event) => {
            query = (event.target as HTMLInputElement).value;
            active = 0;
            paint();
          },
          keydown: (event) => onKey(event as KeyboardEvent),
        },
      });
      const filtered = () => {
        const needle = query.trim().toLowerCase();
        return commands.filter((item) => {
          if (item.disabled) return false;
          if (!needle) return true;
          return [item.label, item.group, ...(item.keywords ?? [])]
            .join(' ')
            .toLowerCase()
            .includes(needle);
        });
      };
      const paint = () => {
        const items = filtered();
        const activeId = items[active] ? `${listId}-${active}` : '';
        if (activeId) input.setAttribute('aria-activedescendant', activeId);
        else input.removeAttribute('aria-activedescendant');
        results.replaceChildren();
        if (!items.length) {
          results.append(h('p', { className: 'wpl-muted', text: translate(this.$el, 'noResults') }));
          return;
        }
        items.forEach((item, index) => {
          results.append(
            h(
              'button',
              {
                className: 'wpl-menu-item',
                attrs: {
                  id: `${listId}-${index}`,
                  type: 'button',
                  role: 'option',
                  'aria-selected': index === active ? 'true' : 'false',
                  'data-active': index === active ? 'true' : undefined,
                },
                on: { click: () => choose(item) },
              },
              [item.label, item.group ? h('span', { className: 'wpl-menu-shortcut', text: item.group }) : null],
            ),
          );
        });
      };
      const choose = (item: CommandItem) => {
        emit(this, 'wpl-select', { id: item.id });
      };
      const onKey = (event: KeyboardEvent) => {
        const items = filtered();
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const next = nextIndex(active, items.length, event.key, 'vertical');
          if (next !== null) active = next;
          paint();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          const item = items[active];
          if (item) choose(item);
        }
      };
      paint();
      this.$el.replaceChildren(
        h('div', {
          className: 'wpl-command',
          attrs: { role: 'dialog', 'aria-label': text(config.label, translate(this.$el, 'command')) },
        }, [input, results]),
      );
    },
  };
}

export function Toast(config: Config = {}) {
  return {
    init(this: Magic) {
      const variant = oneVariant(config.variant);
      const article = h(
        'article',
        {
          className: toastClassName(variant),
          attrs: { role: variant === 'danger' ? 'alert' : 'status' },
        },
        [
          h('strong', { className: 'wpl-toast-title', text: text(config.title, 'Notice') }),
          text(config.description)
            ? h('p', { className: 'wpl-toast-description', text: text(config.description) })
            : null,
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
        ],
      );
      this.$el.replaceChildren(article);
    },
  };
}

const notificationTones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;

export function Notification(config: Config = {}) {
  return {
    init(this: Magic) {
      const variant = oneOf(config.variant, notificationTones, 'neutral');
      const dismissable = config.dismissable === true || typeof config.onDismiss === 'function';
      const panel = h(
        'div',
        {
          className: notificationClassName(variant),
          attrs: { role: variant === 'danger' ? 'alert' : 'status' },
        },
        [
          h('div', {}, [
            h('p', { className: 'wpl-toast-title', text: text(config.title, 'Notice') }),
            text(config.description) ? h('p', { className: 'wpl-toast-description', text: text(config.description) }) : null,
          ]),
          dismissable
            ? h(
                'button',
                {
                  className: 'wpl-icon-btn wpl-btn-ghost',
                  attrs: { type: 'button', 'aria-label': translate(this.$el, 'dismiss') },
                  on: {
                    click: () => {
                      emit(this, 'wpl-dismiss', {});
                      if (typeof config.onDismiss === 'function') config.onDismiss();
                    },
                  },
                },
                [svgIcon('close')],
              )
            : null,
        ],
      );
      this.$el.replaceChildren(panel);
    },
  };
}

function oneVariant(value: unknown): 'neutral' | 'success' | 'warning' | 'danger' {
  return value === 'success' || value === 'warning' || value === 'danger' ? value : 'neutral';
}
