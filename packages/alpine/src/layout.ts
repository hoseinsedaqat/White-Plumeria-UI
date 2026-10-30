import {
  containerClassName,
  gridClassName,
  stackClassName,
  type ContainerSize,
  type GridColumns,
  type StackGap,
} from '@white-plumeria/core';
import { h, list, num, oneOf, text, type Config, type Magic } from './runtime.ts';

const gaps = ['sm', 'md', 'lg'] as const;
const containers = ['sm', 'md', 'lg', 'xl'] as const;
const columns = [1, 2, 3, 4] as const;

export function Container(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.className = containerClassName(oneOf(config.size, containers, 'lg') as ContainerSize, text(config.className) || undefined);
    },
  };
}

export function Stack(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.className = stackClassName(oneOf(config.gap, gaps, 'md') as StackGap, text(config.className) || undefined);
    },
  };
}

export function Grid(config: Config = {}) {
  return {
    init(this: Magic) {
      const count = columns.includes(num(config.columns, 2) as GridColumns) ? (num(config.columns, 2) as GridColumns) : 2;
      this.$el.className = gridClassName(count, text(config.className) || undefined);
    },
  };
}

export function Flex(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.classList.add('wpl-flex');
      if (config.justify === 'between') this.$el.classList.add('wpl-flex-between');
      if (config.wrap === true) this.$el.classList.add('wpl-flex-wrap');
    },
  };
}

interface NavItem {
  href?: string;
  label: string;
  current?: boolean;
}

function links(items: NavItem[], className: string): HTMLElement[] {
  return items.map((item) => h('a', {
    className,
    text: item.label,
    attrs: { href: item.href || '#', 'aria-current': item.current ? 'page' : undefined },
  }));
}

export function Navbar(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<NavItem>(config.items);
      const menuId = 'wpl-nav-menu';
      let open = false;
      const menu = h('nav', { className: 'wpl-nav-menu', attrs: { id: menuId } }, links(items, 'wpl-nav-link'));
      const toggle = h('button', {
        className: 'wpl-navbar-toggle',
        text: 'Menu',
        attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': menuId },
        on: {
          click: () => {
            open = !open;
            toggle.setAttribute('aria-expanded', String(open));
            this.$el.toggleAttribute('data-open', open);
          },
        },
      });
      this.$el.classList.add('wpl-navbar');
      this.$el.replaceChildren(
        h('a', { className: 'wpl-navbar-brand', text: text(config.brand, 'White Plumeria'), attrs: { href: text(config.href, '/') } }),
        toggle,
        menu,
      );
    },
  };
}

export function Sidebar(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<NavItem>(config.items);
      this.$el.replaceChildren(h('nav', { className: 'wpl-sidebar', attrs: { 'aria-label': text(config.label, 'Sidebar') } }, links(items, '')));
    },
  };
}

export function NavigationMenu(config: Config = {}) {
  return {
    init(this: Magic) {
      const items = list<NavItem>(config.items);
      this.$el.replaceChildren(h('nav', { className: 'wpl-nav-menu', attrs: { 'aria-label': text(config.label, 'Navigation') } }, links(items, 'wpl-nav-link')));
    },
  };
}

export function PageHeader(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('header', { className: 'wpl-page-header' }, [
        h('h1', { className: 'wpl-page-title', text: text(config.title, 'Page') }),
        text(config.description) ? h('p', { className: 'wpl-page-description', text: text(config.description) }) : null,
      ]));
    },
  };
}

export function Footer(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('footer', { className: 'wpl-footer' }, [h('p', { text: text(config.note, 'White Plumeria') })]));
    },
  };
}

export function ResponsiveLayout(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.classList.add('wpl-responsive');
      const label = text(config.label);
      if (label && !this.$el.querySelector('.wpl-sidebar')) {
        this.$el.prepend(h('nav', { className: 'wpl-sidebar', attrs: { 'aria-label': label } }));
      }
    },
  };
}

export function SplitPane(config: Config = {}) {
  return {
    init(this: Magic) {
      const host = this.$el;
      let size = Math.min(80, Math.max(20, num(config.size, 50)));
      const start = host.querySelector('[data-wpl-start]') ?? h('div', { className: 'wpl-split-pane', attrs: { 'data-wpl-start': '' }, text: text(config.start, 'Start') });
      const end = host.querySelector('[data-wpl-end]') ?? h('div', { className: 'wpl-split-pane', attrs: { 'data-wpl-end': '' }, text: text(config.end, 'End') });
      if (!start.classList.contains('wpl-split-pane')) start.classList.add('wpl-split-pane');
      if (!end.classList.contains('wpl-split-pane')) end.classList.add('wpl-split-pane');
      const separator = h('button', {
        className: 'wpl-split-separator',
        attrs: {
          type: 'button',
          role: 'separator',
          'aria-label': text(config.label, 'Resize'),
          'aria-valuemin': 20,
          'aria-valuemax': 80,
          'aria-valuenow': size,
          'aria-orientation': 'vertical',
        },
        on: {
          keydown: (event) => {
            const key = (event as KeyboardEvent).key;
            if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') return;
            event.preventDefault();
            const delta = key === 'ArrowRight' || key === 'ArrowDown' ? 5 : -5;
            size = Math.min(80, Math.max(20, size + delta));
            apply();
            host.dispatchEvent(new CustomEvent('wpl-resize', { detail: { size }, bubbles: true }));
          },
        },
      });
      const apply = () => {
        host.style.gridTemplateColumns = `minmax(0, ${size}fr) auto minmax(0, ${100 - size}fr)`;
        separator.setAttribute('aria-valuenow', String(size));
      };
      host.classList.add('wpl-split');
      host.replaceChildren(start, separator, end);
      apply();
    },
  };
}

