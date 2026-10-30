import { cx, stepIndex, stepState } from '@white-plumeria/core';
import { defineTag, html, nothing, WplElement, type RenderResult } from './element';
import { iconSvg } from './icon';
import { translate } from './provider';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export class Steps extends WplElement {
  static override properties = {
    label: { type: String },
    items: { attribute: false },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    orientation: { type: String },
    linear: { type: Boolean },
  };

  declare label: string;
  declare items: StepItem[];
  declare value: string | undefined;
  declare defaultValue: string;
  declare orientation: 'horizontal' | 'vertical';
  declare linear: boolean;
  private internal = '';
  private seeded = false;

  constructor() {
    super();
    this.label = '';
    this.items = [];
    this.value = undefined;
    this.defaultValue = '';
    this.orientation = 'horizontal';
    this.linear = true;
  }

  protected override willUpdate(): void {
    if (this.seeded) return;
    this.seeded = true;
    if (this.value === undefined) this.internal = this.defaultValue || this.items[0]?.id || '';
  }

  private selected(): string {
    return this.value !== undefined ? this.value : this.internal;
  }

  protected override render(): RenderResult {
    const selected = this.selected();
    const current = stepIndex(this.items, selected);
    const interactive = this.value === undefined || this.hasAttribute('interactive');
    return html`<ol class=${cx('wpl-steps', this.orientation === 'vertical' && 'wpl-steps-vertical')} aria-label=${this.label || translate(this, 'steps')}>
      ${this.items.map((item, index) => {
        const state = stepState(index, current);
        const blocked = this.linear && index > current;
        const body = html`<span class="wpl-step-marker" aria-hidden="true">${state === 'complete' ? iconSvg('check') : index + 1}</span>
          <span>
            <span class="wpl-step-title">${item.title}</span>
            ${item.description ? html`<span class="wpl-step-desc">${item.description}</span>` : null}
          </span>`;
        return html`<li class="wpl-step" data-state=${state}>
          ${interactive
            ? html`<button
                type="button"
                class="wpl-step-trigger"
                aria-current=${state === 'current' ? 'step' : nothing}
                ?disabled=${blocked}
                @click=${() => {
                  if (blocked) return;
                  if (this.value === undefined) {
                    this.internal = item.id;
                    this.requestUpdate();
                  }
                  this.emit('wpl-change', { value: item.id });
                }}
              >
                ${body}
              </button>`
            : html`<div class="wpl-step-trigger" aria-current=${state === 'current' ? 'step' : nothing}>${body}</div>`}
        </li>`;
      })}
    </ol>`;
  }
}

defineTag('wpl-steps', Steps);
