import { directionalIcons, iconPaths, type IconName } from '@white-plumeria/core';
import { cx } from '@white-plumeria/core';
import { type SVGAttributes } from 'preact';

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
      className={cx(
        'wpl-icon',
        directionalIcons.has(name) && 'wpl-icon-dir',
        typeof className === 'string' ? className : undefined,
      )}
      {...rest}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={cx('wpl-mark', className)} viewBox="0 0 64 64" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d="M32 10.5c5.2 6.7 6.6 14.1 1.6 21.1-1.1-2.2-2.1-2.2-3.2 0-5-7-3.6-14.4 1.6-21.1z"
            transform={`rotate(${angle} 32 32)`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="2.15" fill="currentColor" />
    </svg>
  );
}
