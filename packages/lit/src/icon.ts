import { cx, directionalIcons, iconPaths, type IconName } from '@white-plumeria/core';
import type { PropertyValues } from 'lit';
import { defineTag, html, WplElement, type RenderResult } from './element';

export function iconSvg(name: IconName, className?: string): RenderResult {
  return html`<svg
    class=${cx('wpl-icon', directionalIcons.has(name) && 'wpl-icon-dir', className)}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d=${iconPaths[name]}></path>
  </svg>`;
}

export function markSvg(className?: string): RenderResult {
  return html`<svg class=${cx('wpl-mark', className)} viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      ${[0, 72, 144, 216, 288].map(
        (angle) => html`<path
          d="M32 10.5c5.2 6.7 6.6 14.1 1.6 21.1-1.1-2.2-2.1-2.2-3.2 0-5-7-3.6-14.4 1.6-21.1z"
          transform="rotate(${angle} 32 32)"
        ></path>`,
      )}
    </g>
    <circle cx="32" cy="32" r="2.15" fill="currentColor"></circle>
  </svg>`;
}

export class Icon extends WplElement {
  static override properties = {
    name: { type: String },
  };

  declare name: IconName;

  constructor() {
    super();
    this.name = 'info';
  }

  protected override render(): RenderResult {
    return iconSvg(this.name);
  }

  protected override updated(_changed: PropertyValues): void {
    super.updated(_changed);
  }
}

export class Mark extends WplElement {
  protected override render(): RenderResult {
    return markSvg();
  }
}

defineTag('wpl-icon', Icon);
defineTag('wpl-mark', Mark);
