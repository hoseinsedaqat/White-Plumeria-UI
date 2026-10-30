import {
  buttonClassName,
  buttonGroupClassName,
  iconButtonClassName,
  type ButtonAppearance,
  type ButtonSize,
  type ButtonVariant,
  type IconName,
} from '@white-plumeria/core';
import type { PropertyValues } from 'lit';
import { defineTag, html, lightChildren, nothing, WplElement, WplHost, type RenderResult } from './element';
import { iconSvg } from './icon';
import { translate } from './provider';

export class Button extends WplElement {
  static override properties = {
    variant: { type: String },
    size: { type: String },
    appearance: { type: String },
    loading: { type: Boolean },
    disabled: { type: Boolean },
    block: { type: Boolean },
    type: { type: String },
  };

  declare variant: ButtonVariant;
  declare size: ButtonSize;
  declare appearance: ButtonAppearance;
  declare loading: boolean;
  declare disabled: boolean;
  declare block: boolean;
  declare type: 'button' | 'submit' | 'reset';

  constructor() {
    super();
    this.variant = 'primary';
    this.size = 'md';
    this.appearance = 'solid';
    this.loading = false;
    this.disabled = false;
    this.block = false;
    this.type = 'button';
  }

  private onClick = (event: Event): void => {
    if (this.loading || this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.emit('wpl-click', { event });
  };

  protected override render(): RenderResult {
    const blocked = this.disabled || this.loading;
    return html`<button
      class=${buttonClassName({
        variant: this.variant,
        size: this.size,
        appearance: this.appearance,
        loading: this.loading,
        block: this.block,
      })}
      type=${this.type === 'submit' || this.type === 'reset' ? this.type : 'button'}
      ?disabled=${blocked}
      aria-busy=${this.loading ? 'true' : nothing}
      @click=${this.onClick}
    >
      ${this.loading
        ? html`<span class="wpl-spinner wpl-spinner-sm" aria-hidden="true"></span><span class="wpl-sr-only">${translate(this, 'loading')}</span>`
        : nothing}
      <span data-wpl-slot="" style="display:contents"></span>
    </button>`;
  }
}

export class IconButton extends WplElement {
  static override properties = {
    label: { type: String },
    icon: { type: String },
    variant: { type: String },
    size: { type: String },
    appearance: { type: String },
    disabled: { type: Boolean },
  };

  declare label: string;
  declare icon: IconName | '';
  declare variant: ButtonVariant;
  declare size: ButtonSize;
  declare appearance: ButtonAppearance;
  declare disabled: boolean;

  constructor() {
    super();
    this.label = '';
    this.icon = '';
    this.variant = 'ghost';
    this.size = 'md';
    this.appearance = 'solid';
    this.disabled = false;
  }

  private onClick = (event: Event): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.emit('wpl-click', { event });
  };

  protected override render(): RenderResult {
    const pending = lightChildren(this, this.view);
    const showFallback = !this.icon && pending.length === 0 && !this.sawLightChildren;
    return html`<button
      class=${iconButtonClassName({ variant: this.variant, size: this.size, appearance: this.appearance })}
      type="button"
      aria-label=${this.label}
      ?disabled=${this.disabled}
      @click=${this.onClick}
    >
      ${this.icon ? iconSvg(this.icon) : nothing}
      ${showFallback ? iconSvg('close') : nothing}
      <span data-wpl-slot="" style="display:contents"></span>
    </button>`;
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
  }
}

export class ButtonGroup extends WplHost {
  static override properties = {
    label: { type: String },
    joined: { type: Boolean },
  };

  declare label: string;
  declare joined: boolean;

  constructor() {
    super();
    this.label = '';
    this.joined = false;
  }

  protected override syncHost(_changed: PropertyValues): void {
    this.className = buttonGroupClassName(this.joined);
    this.setAttribute('role', 'group');
    if (this.label) this.setAttribute('aria-label', this.label);
    else this.removeAttribute('aria-label');
  }
}

defineTag('wpl-button', Button);
defineTag('wpl-icon-button', IconButton);
defineTag('wpl-button-group', ButtonGroup);
