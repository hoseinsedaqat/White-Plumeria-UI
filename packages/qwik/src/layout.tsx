import {
  containerClassName,
  cx,
  gridClassName,
  readingDirection,
  stackClassName,
  type ContainerSize,
  type GridColumns,
  type StackGap,
} from '@white-plumeria/core';
import { component$, Slot, useId, useSignal, type QRL } from '@qwik.dev/core';
import { IconButton } from './button';
import { useWhitePlumeria } from './provider';

export const Container = component$<{ size?: ContainerSize; class?: string }>((props) => {
  return <div class={containerClassName(props.size, props.class)}><Slot /></div>;
});

export const Stack = component$<{ gap?: StackGap; class?: string }>((props) => {
  return <div class={stackClassName(props.gap, props.class)}><Slot /></div>;
});

export const Flex = component$<{ justify?: 'start' | 'between' | 'end'; wrap?: boolean; class?: string }>((props) => {
  return (
    <div class={cx('wpl-flex', props.wrap && 'wpl-flex-wrap', props.justify === 'between' && 'wpl-flex-between', props.justify === 'end' && 'wpl-flex-end', props.class)}>
      <Slot />
    </div>
  );
});

export const Grid = component$<{ columns?: GridColumns; class?: string }>((props) => {
  return <div class={gridClassName(props.columns, props.class)}><Slot /></div>;
});

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
}

export const NavigationMenu = component$<{ items: NavItem[]; label: string }>((props) => {
  return (
    <nav aria-label={props.label}>
      <ul class="wpl-nav-menu">
        {props.items.map((item) => (
          <li key={item.href}>
            <a class="wpl-nav-link" href={item.href} aria-current={item.current ? 'page' : undefined}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
});

export const Navbar = component$<{ brand: string; href?: string; items: NavItem[] }>((props) => {
  const open = useSignal(false);
  const menuId = useId();
  const wpl = useWhitePlumeria();
  return (
    <header class="wpl-navbar" data-open={open.value || undefined}>
      <a class="wpl-navbar-brand" href={props.href ?? '#'}>{props.brand}</a>
      <IconButton
        class="wpl-navbar-toggle"
        label={open.value ? wpl.t('closeMenu') : wpl.t('openMenu')}
        aria-expanded={open.value}
        aria-controls={menuId}
        onClick$={() => { open.value = !open.value; }}
      >
        ☰
      </IconButton>
      <ul id={menuId} class="wpl-nav-menu">
        {props.items.map((item) => (
          <li key={item.href}>
            <a class="wpl-nav-link" href={item.href} aria-current={item.current ? 'page' : undefined} onClick$={() => { open.value = false; }}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
});

export const Sidebar = component$<{ label: string; items: NavItem[] }>((props) => {
  return (
    <nav class="wpl-sidebar" aria-label={props.label}>
      {props.items.map((item) => (
        <a key={item.href} href={item.href} aria-current={item.current ? 'page' : undefined}>{item.label}</a>
      ))}
    </nav>
  );
});

export const PageHeader = component$<{ title: string; description?: string }>((props) => {
  return (
    <header class="wpl-page-header">
      <div>
        <h1 class="wpl-page-title">{props.title}</h1>
        {props.description ? <p class="wpl-page-description">{props.description}</p> : null}
      </div>
      <div class="wpl-cluster">
        <Slot name="actions" />
      </div>
    </header>
  );
});

export const Footer = component$<{ note?: string }>((props) => {
  return (
    <footer class="wpl-footer">
      {props.note ? <p style={{ margin: 0 }}>{props.note}</p> : null}
      <Slot />
    </footer>
  );
});

export const ResponsiveLayout = component$<{ open?: boolean }>((props) => {
  return (
    <div class="wpl-layout" data-open={props.open || undefined}>
      <Slot name="sidebar" />
      <div class="wpl-layout-main">
        <Slot />
      </div>
    </div>
  );
});

export const SplitPane = component$<{
  label: string;
  size?: number;
  onSizeChange$?: QRL<(size: number) => void>;
}>((props) => {
  const internal = useSignal(props.size ?? 50);
  const current = props.onSizeChange$ ? (props.size ?? internal.value) : internal.value;
  const root = useSignal<HTMLDivElement>();

  return (
    <div ref={root} class="wpl-split" style={{ '--wpl-split-size': `${current}%` }}>
      <div class="wpl-split-pane"><Slot name="start" /></div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={20}
        aria-valuemax={80}
        aria-valuenow={Math.round(current)}
        aria-label={props.label}
        tabIndex={0}
        class="wpl-split-separator"
        onKeyDown$={(event) => {
          const direction = readingDirection(root.value);
          const step = event.key === 'ArrowRight' ? (direction === 'rtl' ? -5 : 5) : event.key === 'ArrowLeft' ? (direction === 'rtl' ? 5 : -5) : 0;
          if (!step) return;
          event.preventDefault();
          const next = Math.min(80, Math.max(20, current + step));
          if (!props.onSizeChange$) internal.value = next;
          void props.onSizeChange$?.(next);
        }}
        onPointerDown$={(event, element) => {
          const host = root.value;
          if (!host) return;
          element.setPointerCapture(event.pointerId);
          const move = (next: PointerEvent) => {
            const rect = host.getBoundingClientRect();
            const direction = readingDirection(host);
            const ratio = direction === 'rtl' ? (rect.right - next.clientX) / rect.width : (next.clientX - rect.left) / rect.width;
            const clamped = Math.min(80, Math.max(20, ratio * 100));
            if (!props.onSizeChange$) internal.value = clamped;
            void props.onSizeChange$?.(clamped);
          };
          const up = () => {
            element.removeEventListener('pointermove', move);
            element.removeEventListener('pointerup', up);
          };
          element.addEventListener('pointermove', move);
          element.addEventListener('pointerup', up);
        }}
      />
      <div class="wpl-split-pane"><Slot name="end" /></div>
    </div>
  );
});
