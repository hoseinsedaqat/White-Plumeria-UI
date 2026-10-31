import {
  alertClassName,
  avatarClassName,
  badgeClassName,
  cardClassName,
  cx,
  notificationClassName,
  spinnerClassName,
  type AlertVariant,
  type AvatarSize,
  type BadgeVariant,
  type ControlSize,
  type ToastVariant,
} from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';
import { translate } from './provider';

export class Spinner extends WplElement {
  static override properties = {
    label: { type: String },
    size: { type: String },
  };

  declare label: string;
  declare size: ControlSize;

  constructor() {
    super();
    this.label = '';
    this.size = 'md';
  }

  protected override render(): RenderResult {
    const label = this.label || translate(this, 'loading');
    return html`<span class=${spinnerClassName(this.size)} role="status" aria-label=${label}></span>`;
  }
}

export class Alert extends WplElement {
  static override properties = {
    variant: { type: String },
    title: { type: String },
  };

  declare variant: AlertVariant;
  declare title: string;

  constructor() {
    super();
    this.variant = 'neutral';
    this.title = '';
  }

  protected override render(): RenderResult {
    const variant = this.variant || 'neutral';
    const icon = variant === 'success' ? 'success' : variant === 'neutral' ? 'info' : 'alert';
    return html`<div class=${alertClassName(variant)} role=${variant === 'danger' ? 'alert' : 'status'}>
      ${iconSvg(icon)}
      <div>
        ${this.title ? html`<p class="wpl-alert-title">${this.title}</p>` : nothing}
        <div class="wpl-alert-description"><span data-wpl-slot="" style="display:contents"></span></div>
      </div>
    </div>`;
  }
}

export class Avatar extends WplElement {
  static override properties = {
    name: { type: String },
    src: { type: String },
    alt: { type: String },
    size: { type: String },
    status: { type: String },
    statusLabel: { type: String, attribute: 'status-label' },
  };

  declare name: string;
  declare src: string;
  declare alt: string;
  declare size: AvatarSize;
  declare status: 'online' | 'busy' | 'offline' | '';
  declare statusLabel: string;
  private failed = false;

  constructor() {
    super();
    this.name = '';
    this.src = '';
    this.alt = '';
    this.size = 'md';
    this.status = '';
    this.statusLabel = '';
  }

  private initials(): string {
    return this.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0] ?? '')
      .join('')
      .toUpperCase();
  }

  protected override render(): RenderResult {
    const statusColor =
      this.status === 'busy' ? 'var(--wpl-color-warning)' : this.status === 'offline' ? 'var(--wpl-color-text-subtle)' : '';
    return html`<span class=${avatarClassName(this.size)}>
      ${this.src && !this.failed
        ? html`<img src=${this.src} alt=${this.alt || this.name} @error=${() => { this.failed = true; this.requestUpdate(); }} />`
        : html`<span aria-hidden=${this.src ? nothing : 'true'}>${this.initials()}</span>`}
      ${!this.src && !this.alt ? html`<span class="wpl-sr-only">${this.name}</span>` : nothing}
      ${this.status && this.statusLabel
        ? html`<span class="wpl-avatar-status" style=${statusColor ? `background:${statusColor}` : nothing}></span><span class="wpl-sr-only">${this.statusLabel}</span>`
        : nothing}
    </span>`;
  }
}

export class Badge extends WplElement {
  static override properties = {
    variant: { type: String },
  };

  declare variant: BadgeVariant;

  constructor() {
    super();
    this.variant = 'neutral';
  }

  protected override render(): RenderResult {
    return html`<span class=${badgeClassName(this.variant)}><span data-wpl-slot="" style="display:contents"></span></span>`;
  }
}

export class Card extends WplElement {
  static override properties = {
    title: { type: String },
    description: { type: String },
    titleAs: { type: String, attribute: 'title-as' },
  };

  declare title: string;
  declare description: string;
  declare titleAs: 'h1' | 'h2' | 'h3' | 'h4';

  constructor() {
    super();
    this.title = '';
    this.description = '';
    this.titleAs = 'h2';
  }

  private titleNode(): RenderResult {
    if (!this.title) return nothing;
    if (this.titleAs === 'h1') return html`<h1 class="wpl-card-title">${this.title}</h1>`;
    if (this.titleAs === 'h3') return html`<h3 class="wpl-card-title">${this.title}</h3>`;
    if (this.titleAs === 'h4') return html`<h4 class="wpl-card-title">${this.title}</h4>`;
    return html`<h2 class="wpl-card-title">${this.title}</h2>`;
  }

  protected override render(): RenderResult {
    return html`<section class=${cardClassName()}>
      ${this.title || this.description
        ? html`<header class="wpl-card-header">
            ${this.titleNode()}
            ${this.description ? html`<p class="wpl-card-description">${this.description}</p>` : nothing}
          </header>`
        : nothing}
      <div class="wpl-card-body"><span data-wpl-slot="" style="display:contents"></span></div>
    </section>`;
  }
}

export class Divider extends WplElement {
  static override properties = {
    label: { type: String },
  };

  declare label: string;

  constructor() {
    super();
    this.label = '';
  }

  protected override render(): RenderResult {
    if (!this.label) return html`<hr class="wpl-divider" />`;
    return html`<div class="wpl-divider-labeled" role="separator">${this.label}</div>`;
  }
}

export class Separator extends WplElement {
  static override properties = {
    orientation: { type: String },
  };

  declare orientation: 'horizontal' | 'vertical';

  constructor() {
    super();
    this.orientation = 'horizontal';
  }

  protected override render(): RenderResult {
    return html`<div
      role="separator"
      aria-orientation=${this.orientation || 'horizontal'}
      class=${cx('wpl-separator', this.orientation === 'vertical' && 'wpl-separator-vertical')}
    ></div>`;
  }
}

export class EmptyState extends WplElement {
  static override properties = {
    title: { type: String },
    description: { type: String },
  };

  declare title: string;
  declare description: string;

  constructor() {
    super();
    this.title = '';
    this.description = '';
  }

  protected override render(): RenderResult {
    return html`<div class="wpl-empty">
      <h2 class="wpl-empty-title">${this.title}</h2>
      ${this.description ? html`<p class="wpl-empty-description">${this.description}</p>` : nothing}
      <span data-wpl-slot="" style="display:contents"></span>
    </div>`;
  }
}

export class Link extends WplElement {
  static override properties = {
    href: { type: String },
    external: { type: Boolean },
  };

  declare href: string;
  declare external: boolean;

  constructor() {
    super();
    this.href = '#';
    this.external = false;
  }

  protected override render(): RenderResult {
    return html`<a
      class="wpl-link"
      href=${this.href || '#'}
      target=${this.external ? '_blank' : nothing}
      rel=${this.external ? 'noreferrer noopener' : nothing}
    >
      <span data-wpl-slot="" style="display:contents"></span>
      ${this.external ? html`<span class="wpl-sr-only"> (opens in a new tab)</span>${iconSvg('external')}` : nothing}
    </a>`;
  }
}

export class Progress extends WplElement {
  static override properties = {
    value: { type: Number },
    max: { type: Number },
    label: { type: String },
  };

  declare value: number | null;
  declare max: number;
  declare label: string;

  constructor() {
    super();
    this.value = null;
    this.max = 100;
    this.label = '';
  }

  protected override render(): RenderResult {
    const indeterminate = this.value === null || Number.isNaN(this.value);
    const safeMax = this.max > 0 ? this.max : 100;
    const percent = indeterminate || this.value === null ? undefined : Math.min(100, Math.max(0, (this.value / safeMax) * 100));
    return html`<div
      class=${cx('wpl-progress-track', indeterminate && 'wpl-progress-indeterminate')}
      role="progressbar"
      aria-label=${this.label}
      aria-valuemin="0"
      aria-valuemax=${safeMax}
      aria-valuenow=${indeterminate || this.value === null ? nothing : this.value}
    >
      <span class="wpl-progress-bar" style=${percent === undefined ? nothing : `inline-size:${percent}%`}></span>
    </div>`;
  }
}

export class Skeleton extends WplElement {
  static override properties = {
    width: { type: String },
    height: { type: String },
  };

  declare width: string;
  declare height: string;

  constructor() {
    super();
    this.width = '100%';
    this.height = '1rem';
  }

  protected override render(): RenderResult {
    return html`<span class="wpl-skeleton" style=${`width:${this.width || '100%'};height:${this.height || '1rem'}`} aria-hidden="true"></span>`;
  }
}

export class StatCard extends WplElement {
  static override properties = {
    label: { type: String },
    value: { type: String },
    hint: { type: String },
  };

  declare label: string;
  declare value: string;
  declare hint: string;

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.hint = '';
  }

  protected override render(): RenderResult {
    return html`<article class="wpl-card wpl-stat">
      <p class="wpl-stat-label">${this.label}</p>
      <p class="wpl-stat-value">${this.value}</p>
      ${this.hint ? html`<p class="wpl-stat-hint">${this.hint}</p>` : nothing}
    </article>`;
  }
}

export class Notification extends WplElement {
  static override properties = {
    title: { type: String },
    description: { type: String },
    variant: { type: String },
    dismissable: { type: Boolean },
  };

  declare title: string;
  declare description: string;
  declare variant: ToastVariant | 'info';
  declare dismissable: boolean;

  constructor() {
    super();
    this.title = '';
    this.description = '';
    this.variant = 'neutral';
    this.dismissable = false;
  }

  private dismiss = (): void => {
    this.emit('wpl-dismiss');
  };

  protected override render(): RenderResult {
    return html`<div class=${notificationClassName(this.variant)} role=${this.variant === 'danger' ? 'alert' : 'status'}>
      <div>
        <p class="wpl-toast-title">${this.title}</p>
        ${this.description ? html`<p class="wpl-toast-description">${this.description}</p>` : nothing}
        <span data-wpl-slot="" style="display:contents"></span>
      </div>
      ${this.dismissable
        ? html`<button type="button" class="wpl-icon-btn wpl-btn-ghost" aria-label=${translate(this, 'dismiss')} @click=${this.dismiss}>×</button>`
        : nothing}
    </div>`;
  }
}

export class Kbd extends WplElement {
  static override properties = {
    keys: { attribute: false },
  };

  declare keys: string[];

  constructor() {
    super();
    this.keys = [];
  }

  protected override render(): RenderResult {
    if (this.keys.length > 0) {
      return html`<span class="wpl-kbd-group">
        ${this.keys.map(
          (key, index) => html`<span class="wpl-kbd-group">${index > 0 ? html`<span aria-hidden="true">+</span>` : nothing}<kbd class="wpl-kbd">${key}</kbd></span>`,
        )}
      </span>`;
    }
    return html`<kbd class="wpl-kbd"><span data-wpl-slot="" style="display:contents"></span></kbd>`;
  }
}

defineTag('wpl-spinner', Spinner);
defineTag('wpl-alert', Alert);
defineTag('wpl-avatar', Avatar);
defineTag('wpl-badge', Badge);
defineTag('wpl-card', Card);
defineTag('wpl-divider', Divider);
defineTag('wpl-separator', Separator);
defineTag('wpl-empty-state', EmptyState);
defineTag('wpl-link', Link);
defineTag('wpl-progress', Progress);
defineTag('wpl-skeleton', Skeleton);
defineTag('wpl-stat-card', StatCard);
defineTag('wpl-notification', Notification);
defineTag('wpl-kbd', Kbd);
