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
import { createSignal, type JSX , createUniqueId } from 'solid-js';
import { IconButton } from './button.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function Container(props: { size?: ContainerSize; class?: string; className?: string; children: JSX.Element }) {
  return <div class={containerClassName(props.size ?? 'lg', props.class ?? props.className)}>{props.children}</div>;
}

export function Stack(props: { gap?: StackGap; class?: string; className?: string; children: JSX.Element }) {
  return <div class={stackClassName(props.gap ?? 'md', props.class ?? props.className)}>{props.children}</div>;
}

export function Flex(props: {
  justify?: 'start' | 'between' | 'end';
  wrap?: boolean;
  class?: string;
  className?: string;
  children: JSX.Element;
}) {
  return (
    <div
      class={cx(
        'wpl-flex',
        props.wrap && 'wpl-flex-wrap',
        props.justify === 'between' && 'wpl-flex-between',
        props.justify === 'end' && 'wpl-flex-end',
        props.class,
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

export function Grid(props: { columns?: GridColumns; class?: string; className?: string; children: JSX.Element }) {
  return <div class={gridClassName(props.columns ?? 2, props.class ?? props.className)}>{props.children}</div>;
}

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
}

export function NavigationMenu(props: { items: NavItem[]; label: string }) {
  return (
    <nav aria-label={props.label}>
      <ul class="wpl-nav-menu">
        {props.items.map((item) => (
          <li>
            <a class="wpl-nav-link" href={item.href} aria-current={item.current ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Navbar(props: { brand: string; href?: string; items: NavItem[] }) {
  const [open, setOpen] = createSignal(false);
  const menuId = createUniqueId();
  const { t } = useWhitePlumeria();
  return (
    <header class="wpl-navbar" data-open={open() || undefined}>
      <a class="wpl-navbar-brand" href={props.href ?? '#'}>
        {props.brand}
      </a>
      <IconButton
        class="wpl-navbar-toggle"
        label={open() ? t('closeMenu') : t('openMenu')}
        aria-expanded={open()}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        ☰
      </IconButton>
      <ul id={menuId} class="wpl-nav-menu">
        {props.items.map((item) => (
          <li>
            <a class="wpl-nav-link" href={item.href} aria-current={item.current ? 'page' : undefined} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}

export function Sidebar(props: { label: string; items: NavItem[] }) {
  return (
    <nav class="wpl-sidebar" aria-label={props.label}>
      {props.items.map((item) => (
        <a href={item.href} aria-current={item.current ? 'page' : undefined}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function PageHeader(props: { title: string; description?: string; actions?: JSX.Element }) {
  return (
    <header class="wpl-page-header">
      <div>
        <h1 class="wpl-page-title">{props.title}</h1>
        {props.description ? <p class="wpl-page-description">{props.description}</p> : null}
      </div>
      {props.actions ? <div class="wpl-cluster">{props.actions}</div> : null}
    </header>
  );
}

export function Footer(props: { note?: string; children?: JSX.Element }) {
  return (
    <footer class="wpl-footer">
      <p style={{ margin: 0 }}>{props.note}</p>
      {props.children}
    </footer>
  );
}

export function ResponsiveLayout(props: { sidebar: JSX.Element; children: JSX.Element; open?: boolean }) {
  return (
    <div class="wpl-layout" data-open={props.open || undefined}>
      {props.sidebar}
      <div class="wpl-layout-main">{props.children}</div>
    </div>
  );
}

export function SplitPane(props: {
  label: string;
  start: JSX.Element;
  end: JSX.Element;
  size?: number;
  onSizeChange?: (size: number) => void;
}) {
  const [internal, setInternal] = createSignal(props.size ?? 50);
  const current = () => (props.onSizeChange ? (props.size ?? internal()) : internal());
  let root: HTMLDivElement | undefined;

  function commit(next: number) {
    const clamped = Math.min(80, Math.max(20, next));
    if (!props.onSizeChange) setInternal(clamped);
    props.onSizeChange?.(clamped);
  }

  return (
    <div ref={root} class="wpl-split" style={{ '--wpl-split-size': `${current()}%` }}>
      <div class="wpl-split-pane">{props.start}</div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={20}
        aria-valuemax={80}
        aria-valuenow={Math.round(current())}
        aria-label={props.label}
        tabindex={0}
        class="wpl-split-separator"
        onKeyDown={(event) => {
          const direction = readingDirection(root ?? null);
          const step = event.key === 'ArrowRight' ? (direction === 'rtl' ? -5 : 5) : event.key === 'ArrowLeft' ? (direction === 'rtl' ? 5 : -5) : 0;
          if (!step) return;
          event.preventDefault();
          commit(current() + step);
        }}
        onPointerDown={(event) => {
          if (!root) return;
          const pointer = event.currentTarget;
          pointer.setPointerCapture(event.pointerId);
          const move = (next: PointerEvent) => {
            const rect = root!.getBoundingClientRect();
            const direction = readingDirection(root ?? null);
            const ratio = direction === 'rtl' ? (rect.right - next.clientX) / rect.width : (next.clientX - rect.left) / rect.width;
            commit(ratio * 100);
          };
          const up = () => {
            pointer.removeEventListener('pointermove', move);
            pointer.removeEventListener('pointerup', up);
          };
          pointer.addEventListener('pointermove', move);
          pointer.addEventListener('pointerup', up);
        }}
      />
      <div class="wpl-split-pane">{props.end}</div>
    </div>
  );
}
