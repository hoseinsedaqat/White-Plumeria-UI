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
import { useRef, useState, type ReactNode } from 'react';
import { IconButton } from './button.tsx';
import { useWhitePlumeria } from './provider.tsx';

export function Container({
  size = 'lg',
  className,
  children,
}: {
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
}) {
  return <div className={containerClassName(size, className)}>{children}</div>;
}

export function Stack({
  gap = 'md',
  className,
  children,
}: {
  gap?: StackGap;
  className?: string;
  children: ReactNode;
}) {
  return <div className={stackClassName(gap, className)}>{children}</div>;
}

export function Flex({
  justify = 'start',
  wrap = false,
  className,
  children,
}: {
  justify?: 'start' | 'between' | 'end';
  wrap?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        'wpl-flex',
        wrap && 'wpl-flex-wrap',
        justify === 'between' && 'wpl-flex-between',
        justify === 'end' && 'wpl-flex-end',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Grid({
  columns = 2,
  className,
  children,
}: {
  columns?: GridColumns;
  className?: string;
  children: ReactNode;
}) {
  return <div className={gridClassName(columns, className)}>{children}</div>;
}

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
}

export function NavigationMenu({ items, label }: { items: NavItem[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="wpl-nav-menu">
        {items.map((item) => (
          <li key={item.href}>
            <a className="wpl-nav-link" href={item.href} aria-current={item.current ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Navbar({
  brand,
  href = '#',
  items,
}: {
  brand: string;
  href?: string;
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const menuId = 'wpl-navbar-menu';
  const { t } = useWhitePlumeria();
  return (
    <header className="wpl-navbar" data-open={open || undefined}>
      <a className="wpl-navbar-brand" href={href}>
        {brand}
      </a>
      <IconButton
        className="wpl-navbar-toggle"
        label={t('openMenu')}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        ☰
      </IconButton>
      <ul id={menuId} className="wpl-nav-menu">
        {items.map((item) => (
          <li key={item.href}>
            <a className="wpl-nav-link" href={item.href} aria-current={item.current ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}

export function Sidebar({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <nav className="wpl-sidebar" aria-label={label}>
      {items.map((item) => (
        <a key={item.href} href={item.href} aria-current={item.current ? 'page' : undefined}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="wpl-page-header">
      <div>
        <h1 className="wpl-page-title">{title}</h1>
        {description ? <p className="wpl-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="wpl-cluster">{actions}</div> : null}
    </header>
  );
}

export function Footer({ note, children }: { note?: string; children?: ReactNode }) {
  return (
    <footer className="wpl-footer">
      <p style={{ margin: 0 }}>{note}</p>
      {children}
    </footer>
  );
}

export function ResponsiveLayout({
  sidebar,
  children,
  open = false,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <div className="wpl-layout" data-open={open || undefined}>
      {sidebar}
      <div className="wpl-layout-main">{children}</div>
    </div>
  );
}

export function SplitPane({
  label,
  start,
  end,
  size = 50,
  onSizeChange,
}: {
  label: string;
  start: ReactNode;
  end: ReactNode;
  size?: number;
  onSizeChange?: (size: number) => void;
}) {
  const [internal, setInternal] = useState(size);
  const current = onSizeChange ? size : internal;
  const ref = useRef<HTMLDivElement>(null);

  function commit(next: number) {
    const clamped = Math.min(80, Math.max(20, next));
    if (!onSizeChange) setInternal(clamped);
    onSizeChange?.(clamped);
  }

  return (
    <div ref={ref} className="wpl-split" style={{ ['--wpl-split-size' as string]: `${current}%` }}>
      <div className="wpl-split-pane">{start}</div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={20}
        aria-valuemax={80}
        aria-valuenow={Math.round(current)}
        aria-label={label}
        tabIndex={0}
        className="wpl-split-separator"
        onKeyDown={(event) => {
          const direction = readingDirection(ref.current);
          const step = event.key === 'ArrowRight' ? (direction === 'rtl' ? -5 : 5) : event.key === 'ArrowLeft' ? (direction === 'rtl' ? 5 : -5) : 0;
          if (!step) return;
          event.preventDefault();
          commit(current + step);
        }}
        onPointerDown={(event) => {
          const root = ref.current;
          if (!root) return;
          const pointer = event.currentTarget;
          pointer.setPointerCapture(event.pointerId);
          const move = (next: PointerEvent) => {
            const rect = root.getBoundingClientRect();
            const direction = readingDirection(root);
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
      <div className="wpl-split-pane">{end}</div>
    </div>
  );
}
