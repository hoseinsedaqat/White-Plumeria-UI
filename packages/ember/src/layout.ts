import { containerClassName, gridClassName, stackClassName } from '@white-plumeria/core';
import { bubble, flag, glimmer, list, num, str, type Host } from './runtime.ts';

interface NavItem {
  href?: string;
  label?: string;
  current?: boolean;
}

export const Container = glimmer(`<div class={{this.className}}>{{yield}}</div>`, {
  getters: {
    className: (host) =>
      containerClassName(
        host.args.size === 'sm' || host.args.size === 'md' || host.args.size === 'xl' ? host.args.size : 'lg',
        str(host.args.className) || undefined,
      ),
  },
});

export const Grid = glimmer(`<div class={{this.className}}>{{yield}}</div>`, {
  getters: {
    className(this: Host) {
      const columns = num(this.args.columns, 2);
      const count = columns === 1 || columns === 3 || columns === 4 ? columns : 2;
      return gridClassName(count, str(this.args.className) || undefined);
    },
  },
});

export const Stack = glimmer(`<div class={{this.className}}>{{yield}}</div>`, {
  getters: {
    className: (host) =>
      stackClassName(host.args.gap === 'sm' || host.args.gap === 'lg' ? host.args.gap : 'md', str(host.args.className) || undefined),
  },
});

export const Flex = glimmer(`<div class={{this.className}}>{{yield}}</div>`, {
  getters: {
    className(this: Host) {
      const classes = ['wpl-flex'];
      if (str(this.args.justify) === 'between') classes.push('wpl-flex-between');
      if (str(this.args.justify) === 'end') classes.push('wpl-flex-end');
      if (flag(this.args.wrap)) classes.push('wpl-flex-wrap');
      if (str(this.args.className)) classes.push(str(this.args.className));
      return classes.join(' ');
    },
  },
});

function links(value: unknown) {
  return list<NavItem>(value).map((item) => ({
    href: str(item.href, '#'),
    label: str(item.label),
    current: item.current ? 'page' : '',
  }));
}

export const Navbar = glimmer(
  `<header class="wpl-navbar"><a class="wpl-navbar-brand" href={{this.href}}>{{this.brand}}</a><button type="button" class="wpl-navbar-toggle" aria-expanded={{this.expanded}} aria-controls="wpl-nav-menu" {{on "click" this.toggle}}>Menu</button><nav class="wpl-nav-menu" id="wpl-nav-menu" hidden={{this.closed}}>{{#each this.items as |item|}}<a class="wpl-nav-link" href={{item.href}} aria-current={{item.current}}>{{item.label}}</a>{{/each}}</nav></header>`,
  {
    state: () => ({ open: false }),
    getters: {
      brand: (host) => str(host.args.brand, 'White Plumeria'),
      href: (host) => str(host.args.href, '/'),
      items: (host) => links(host.args.items),
      expanded: (host) => (host.state.open ? 'true' : 'false'),
      closed: (host) => !host.state.open,
    },
    methods: {
      toggle() {
        this.state.open = !this.state.open;
      },
    },
  },
);

export const Sidebar = glimmer(
  `<nav class="wpl-sidebar" aria-label={{this.label}}>{{#each this.items as |item|}}<a href={{item.href}} aria-current={{item.current}}>{{item.label}}</a>{{/each}}{{yield}}</nav>`,
  {
    getters: {
      label: (host) => str(host.args.label, 'Sidebar'),
      items: (host) => links(host.args.items),
    },
  },
);

export const NavigationMenu = glimmer(
  `<nav class="wpl-nav-menu" aria-label={{this.label}}>{{#each this.items as |item|}}<a class="wpl-nav-link" href={{item.href}} aria-current={{item.current}}>{{item.label}}</a>{{/each}}</nav>`,
  {
    getters: {
      label: (host) => str(host.args.label, 'Navigation'),
      items: (host) => links(host.args.items),
    },
  },
);

export const PageHeader = glimmer(
  `<header class="wpl-page-header"><h1 class="wpl-page-title">{{this.title}}</h1>{{#if @description}}<p class="wpl-page-description">{{@description}}</p>{{/if}}{{yield}}</header>`,
  { getters: { title: (host) => str(host.args.title, 'Page') } },
);

export const Footer = glimmer(`<footer class="wpl-footer"><p>{{this.note}}</p>{{yield}}</footer>`, {
  getters: { note: (host) => str(host.args.note, 'White Plumeria') },
});

export const ResponsiveLayout = glimmer(
  `<div class="wpl-responsive" data-open={{this.open}}><div class="wpl-sidebar">{{yield to="sidebar"}}</div><div class="wpl-responsive-main">{{yield}}</div></div>`,
  { getters: { open: (host) => (flag(host.args.open) ? 'true' : 'false') } },
);

export const SplitPane = glimmer(
  `<div class="wpl-split" style={{this.style}}><div class="wpl-split-pane" data-wpl-start>{{#if @start}}{{@start}}{{else}}{{yield to="start"}}{{/if}}</div><button type="button" class="wpl-split-separator" aria-label={{this.label}} aria-valuenow={{this.size}} aria-valuemin="20" aria-valuemax="80" {{on "pointerdown" this.drag}}></button><div class="wpl-split-pane" data-wpl-end>{{#if @end}}{{@end}}{{else}}{{yield to="end"}}{{/if}}</div></div>`,
  {
    state: (args) => ({ size: Math.min(80, Math.max(20, num(args.size, 50))) }),
    getters: {
      label: (host) => str(host.args.label, 'Resize'),
      size: (host) => num(host.state.size, 50),
      style: (host) => `--wpl-split-size:${num(host.state.size, 50)}%`,
    },
    methods: {
      drag(event) {
        const pointer = event as PointerEvent;
        const host = pointer.currentTarget instanceof Element ? pointer.currentTarget.closest('.wpl-split') : null;
        if (!(host instanceof HTMLElement)) return;
        const move = (next: PointerEvent) => {
          const rect = host.getBoundingClientRect();
          if (!(rect.width > 0)) return;
          const ratio = host.dir === 'rtl' || host.closest('[dir="rtl"]') ? rect.right - next.clientX : next.clientX - rect.left;
          const size = Math.min(80, Math.max(20, (ratio / rect.width) * 100));
          this.state.size = Math.round(size);
          host.dispatchEvent(new CustomEvent('wpl-resize', { detail: { size: this.state.size }, bubbles: true }));
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        bubble(pointer, 'wpl-resize', { size: num(this.state.size, 50) });
      },
    },
  },
);
