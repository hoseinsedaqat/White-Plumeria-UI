import { directionalIcons, iconPaths, type IconName } from '@white-plumeria/core';
import { cx } from '@white-plumeria/core';
import type { SVGAttributes } from 'react';

export function Icon({
  name,
  className,
  ...rest
}: SVGAttributes<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('wpl-icon', directionalIcons.has(name) && 'wpl-icon-dir', className)}
      {...rest}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={cx('wpl-mark', className)} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="32"
            cy="18"
            rx="6.5"
            ry="12"
            transform={`rotate(${angle} 32 32)`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="3.2" fill="currentColor" />
    </svg>
  );
}
