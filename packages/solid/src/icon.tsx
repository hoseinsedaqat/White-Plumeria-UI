import { cx, directionalIcons, iconPaths, type IconName } from '@white-plumeria/core';
import type { JSX } from 'solid-js';

export function Icon(props: { name: IconName; class?: string; className?: string; style?: JSX.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cx('wpl-icon', directionalIcons.has(props.name) && 'wpl-icon-dir', props.class, props.className)}
      style={props.style}
    >
      <path d={iconPaths[props.name]} />
    </svg>
  );
}

export function Mark(props: { class?: string }) {
  return (
    <svg class={cx('wpl-mark', props.class)} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            d="M32 10.5c5.2 6.7 6.6 14.1 1.6 21.1-1.1-2.2-2.1-2.2-3.2 0-5-7-3.6-14.4 1.6-21.1z"
            transform={`rotate(${angle} 32 32)`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="2.15" fill="currentColor" />
    </svg>
  );
}

export type IconProps = JSX.HTMLAttributes<SVGSVGElement> & { name: IconName };
