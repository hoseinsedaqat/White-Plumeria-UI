import { buttonClassName, createFocusTrap, iconButtonClassName, supportsModalDialog, type ButtonVariant, type ControlSize } from '@white-plumeria/core';

export const elementTags = [
  'wpl-button',
  'wpl-icon-button',
  'wpl-badge',
  'wpl-card',
  'wpl-spinner',
  'wpl-progress',
  'wpl-alert',
  'wpl-input',
  'wpl-textarea',
  'wpl-select',
  'wpl-checkbox',
  'wpl-switch',
  'wpl-dialog',
  'wpl-tabs',
  'wpl-accordion',
] as const;

function variantOf(element: HTMLElement): ButtonVariant {
  const value = element.getAttribute('variant') ?? 'primary';
  if (value === 'secondary' || value === 'outline' || value === 'ghost' || value === 'danger' || value === 'link') return value;
  return 'primary';
}

function sizeOf(element: HTMLElement): ControlSize {
  const value = element.getAttribute('size');
  return value === 'sm' || value === 'lg' ? value : 'md';
}

function boolAttr(element: HTMLElement, name: string): boolean {
  return element.hasAttribute(name);
}

class WplButton extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'loading', 'disabled', 'block', 'type'];
  private button: HTMLButtonElement | null = null;

  connectedCallback() {
    if (!this.button) {
      const button = document.createElement('button');
      while (this.firstChild) button.append(this.firstChild);
      this.append(button);
      this.button = button;
      button.addEventListener('click', (event) => {
        if (boolAttr(this, 'loading') || boolAttr(this, 'disabled')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        this.dispatchEvent(new CustomEvent('wpl-click', { bubbles: true }));
      });
    }
    this.sync();
  }

  attributeChangedCallback() {
    this.sync();
  }

  private sync() {
    const button = this.button;
    if (!button) return;
    const loading = boolAttr(this, 'loading');
    const disabled = boolAttr(this, 'disabled') || loading;
    const type = this.getAttribute('type');
    button.type = type === 'submit' || type === 'reset' ? type : 'button';
    button.className = buttonClassName({
      variant: variantOf(this),
      size: sizeOf(this),
      loading,
      block: boolAttr(this, 'block'),
    });
    button.disabled = disabled;
    button.toggleAttribute('aria-busy', loading);
  }
}

class WplIconButton extends HTMLElement {
  static observedAttributes = ['label', 'variant', 'size'];
  private button: HTMLButtonElement | null = null;

  connectedCallback() {
    if (!this.button) {
      const button = document.createElement('button');
      button.type = 'button';
      if (!this.childNodes.length) button.textContent = '×';
      while (this.firstChild) button.append(this.firstChild);
      this.append(button);
      this.button = button;
    }
    const button = this.button;
    button.className = iconButtonClassName({ variant: variantOf(this) === 'primary' ? 'ghost' : variantOf(this), size: sizeOf(this) });
    button.setAttribute('aria-label', this.getAttribute('label') ?? '');
  }

  attributeChangedCallback() {
    this.connectedCallback();
  }
}

class WplBadge extends HTMLElement {
  connectedCallback() {
    const variant = this.getAttribute('variant');
    this.className = variant && variant !== 'neutral' ? `wpl-badge wpl-badge-${variant}` : 'wpl-badge';
  }
}

class WplCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.wplReady) return;
    this.dataset.wplReady = 'true';
    this.classList.add('wpl-card');
    const title = this.getAttribute('title');
    const description = this.getAttribute('description');
    if (title || description) {
      const header = document.createElement('header');
      header.className = 'wpl-card-header';
      if (title) {
        const heading = document.createElement('h2');
        heading.className = 'wpl-card-title';
        heading.textContent = title;
        header.append(heading);
      }
      if (description) {
        const text = document.createElement('p');
        text.className = 'wpl-card-description';
        text.textContent = description;
        header.append(text);
      }
      this.prepend(header);
    }
  }
}

class WplSpinner extends HTMLElement {
  connectedCallback() {
    this.className = 'wpl-spinner';
    this.setAttribute('role', 'status');
    if (!this.querySelector('.wpl-sr-only')) {
      const label = document.createElement('span');
      label.className = 'wpl-sr-only';
      label.textContent = this.getAttribute('label') ?? 'Loading';
      this.append(label);
    }
  }
}

class WplProgress extends HTMLElement {
  static observedAttributes = ['value', 'max', 'label'];
  connectedCallback() {
    this.sync();
  }
  attributeChangedCallback() {
    this.sync();
  }
  private sync() {
    const max = Number(this.getAttribute('max') ?? 100);
    const raw = this.getAttribute('value');
    const indeterminate = raw === null;
    this.className = indeterminate ? 'wpl-progress-track wpl-progress-indeterminate' : 'wpl-progress-track';
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-label', this.getAttribute('label') ?? 'Progress');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', String(max > 0 ? max : 100));
    if (indeterminate) this.removeAttribute('aria-valuenow');
    else this.setAttribute('aria-valuenow', raw);
    let bar = this.querySelector('.wpl-progress-bar');
    if (!bar) {
      bar = document.createElement('span');
      bar.className = 'wpl-progress-bar';
      this.append(bar);
    }
    if (!indeterminate && bar instanceof HTMLElement) {
      const percent = Math.min(100, Math.max(0, (Number(raw) / (max > 0 ? max : 100)) * 100));
      bar.style.inlineSize = `${percent}%`;
    }
  }
}

class WplAlert extends HTMLElement {
  connectedCallback() {
    if (this.dataset.wplReady) return;
    this.dataset.wplReady = 'true';
    const variant = this.getAttribute('variant') ?? 'neutral';
    this.className = variant === 'neutral' ? 'wpl-alert' : `wpl-alert wpl-alert-${variant}`;
    this.setAttribute('role', variant === 'danger' ? 'alert' : 'status');
    const title = this.getAttribute('title');
    if (title) {
      const heading = document.createElement('p');
      heading.className = 'wpl-alert-title';
      heading.textContent = title;
      this.prepend(heading);
    }
  }
}

class WplInput extends HTMLElement {
  static observedAttributes = ['type', 'name', 'placeholder', 'value', 'disabled', 'invalid'];
  private control: HTMLInputElement | null = null;
  connectedCallback() {
    if (!this.control) {
      const input = document.createElement('input');
      input.className = 'wpl-input';
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('wpl-input', { bubbles: true, detail: { value: input.value } }));
      });
      this.append(input);
      this.control = input;
    }
    this.sync();
  }
  attributeChangedCallback() {
    this.sync();
  }
  private sync() {
    const input = this.control;
    if (!input) return;
    input.type = this.getAttribute('type') ?? 'text';
    const name = this.getAttribute('name');
    if (name) input.name = name;
    input.placeholder = this.getAttribute('placeholder') ?? '';
    if (this.hasAttribute('value') && document.activeElement !== input) input.value = this.getAttribute('value') ?? '';
    input.disabled = boolAttr(this, 'disabled');
    input.toggleAttribute('aria-invalid', boolAttr(this, 'invalid'));
  }
}

class WplTextarea extends HTMLElement {
  private control: HTMLTextAreaElement | null = null;
  connectedCallback() {
    if (this.control) return;
    const area = document.createElement('textarea');
    area.className = 'wpl-textarea';
    area.rows = Number(this.getAttribute('rows') ?? 4);
    if (this.getAttribute('name')) area.name = this.getAttribute('name') ?? '';
    area.placeholder = this.getAttribute('placeholder') ?? '';
    this.append(area);
    this.control = area;
  }
}

class WplSelect extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('select')) return;
    const select = document.createElement('select');
    select.className = 'wpl-select';
    if (this.getAttribute('name')) select.name = this.getAttribute('name') ?? '';
    const options = Array.from(this.querySelectorAll('option'));
    for (const option of options) select.append(option);
    this.append(select);
    select.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('wpl-change', { bubbles: true, detail: { value: select.value } }));
    });
  }
}

class WplCheckbox extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('input')) return;
    const label = document.createElement('label');
    label.className = 'wpl-check';
    const input = document.createElement('input');
    input.type = 'checkbox';
    if (this.getAttribute('name')) input.name = this.getAttribute('name') ?? '';
    input.checked = boolAttr(this, 'checked');
    const text = document.createElement('span');
    text.textContent = this.getAttribute('label') ?? '';
    label.append(input, text);
    this.append(label);
    input.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('wpl-change', { bubbles: true, detail: { checked: input.checked } }));
    });
  }
}

class WplSwitch extends HTMLElement {
  static observedAttributes = ['checked', 'disabled', 'label'];
  private control: HTMLButtonElement | null = null;
  connectedCallback() {
    if (!this.control) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wpl-switch';
      button.setAttribute('role', 'switch');
      const knob = document.createElement('span');
      knob.className = 'wpl-switch-control';
      knob.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      button.append(knob, text);
      button.addEventListener('click', () => {
        const next = button.getAttribute('aria-checked') !== 'true';
        this.toggleAttribute('checked', next);
        this.dispatchEvent(new CustomEvent('wpl-change', { bubbles: true, detail: { checked: next } }));
      });
      this.append(button);
      this.control = button;
    }
    this.sync();
  }
  attributeChangedCallback() {
    this.sync();
  }
  private sync() {
    const button = this.control;
    if (!button) return;
    button.setAttribute('aria-checked', boolAttr(this, 'checked') ? 'true' : 'false');
    button.disabled = boolAttr(this, 'disabled');
    const text = button.querySelector('span:last-child');
    if (text) text.textContent = this.getAttribute('label') ?? '';
  }
}

class WplDialog extends HTMLElement {
  static observedAttributes = ['open', 'title'];
  private panel: HTMLElement | null = null;
  private trap: { activate: () => void; deactivate: () => void } | null = null;

  connectedCallback() {
    if (!this.panel) {
      const title = document.createElement('h2');
      title.className = 'wpl-dialog-title';
      title.id = `${this.tagName.toLowerCase()}-title`;
      title.textContent = this.getAttribute('title') ?? '';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'wpl-icon-btn wpl-btn-ghost';
      close.setAttribute('aria-label', 'Close');
      close.textContent = '×';
      close.addEventListener('click', () => this.removeAttribute('open'));
      const header = document.createElement('header');
      header.className = 'wpl-dialog-header';
      header.append(title, close);
      const body = document.createElement('div');
      body.className = 'wpl-dialog-body';
      while (this.firstChild) body.append(this.firstChild);
      if (supportsModalDialog()) {
        const dialog = document.createElement('dialog');
        dialog.className = 'wpl-dialog';
        dialog.setAttribute('aria-labelledby', title.id);
        dialog.append(header, body);
        dialog.addEventListener('cancel', (event) => {
          event.preventDefault();
          this.removeAttribute('open');
        });
        this.append(dialog);
        this.panel = dialog;
      } else {
        const fallback = document.createElement('div');
        fallback.className = 'wpl-dialog-panel';
        fallback.setAttribute('role', 'dialog');
        fallback.setAttribute('aria-modal', 'true');
        fallback.setAttribute('aria-labelledby', title.id);
        fallback.append(header, body);
        this.append(fallback);
        this.panel = fallback;
      }
    }
    this.sync();
  }

  attributeChangedCallback() {
    this.sync();
  }

  disconnectedCallback() {
    this.trap?.deactivate();
  }

  private sync() {
    const panel = this.panel;
    if (!panel) return;
    const title = panel.querySelector('.wpl-dialog-title');
    if (title) title.textContent = this.getAttribute('title') ?? '';
    const open = boolAttr(this, 'open');
    if (panel instanceof HTMLDialogElement) {
      if (open && !panel.open) panel.showModal();
      if (!open && panel.open) panel.close();
      return;
    }
    panel.hidden = !open;
    this.trap?.deactivate();
    this.trap = null;
    if (open) {
      this.trap = createFocusTrap(panel);
      this.trap.activate();
    }
  }
}

class WplTabs extends HTMLElement {
  connectedCallback() {
    if (this.dataset.wplReady) return;
    this.dataset.wplReady = 'true';
    const panels = Array.from(this.querySelectorAll('[data-tab]'));
    const list = document.createElement('div');
    list.setAttribute('role', 'tablist');
    this.prepend(list);
    panels.forEach((panel, index) => {
      if (!(panel instanceof HTMLElement)) return;
      const id = panel.dataset.tab ?? `tab-${index}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wpl-tab';
      button.setAttribute('role', 'tab');
      button.textContent = panel.dataset.label ?? id;
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      panel.setAttribute('role', 'tabpanel');
      panel.hidden = index !== 0;
      button.addEventListener('click', () => {
        for (const item of list.querySelectorAll('[role="tab"]')) item.setAttribute('aria-selected', 'false');
        button.setAttribute('aria-selected', 'true');
        for (const item of panels) if (item instanceof HTMLElement) item.hidden = item !== panel;
      });
      list.append(button);
    });
  }
}

class WplAccordion extends HTMLElement {
  connectedCallback() {
    if (this.dataset.wplReady) return;
    this.dataset.wplReady = 'true';
    this.classList.add('wpl-accordion');
    for (const item of this.querySelectorAll('[data-title]')) {
      if (!(item instanceof HTMLElement)) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wpl-accordion-trigger';
      button.textContent = item.dataset.title ?? '';
      button.setAttribute('aria-expanded', 'false');
      const panel = document.createElement('div');
      panel.className = 'wpl-accordion-panel';
      panel.hidden = true;
      while (item.firstChild) panel.append(item.firstChild);
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.hidden = open;
      });
      item.append(button, panel);
    }
  }
}

const registry: Record<(typeof elementTags)[number], CustomElementConstructor> = {
  'wpl-button': WplButton,
  'wpl-icon-button': WplIconButton,
  'wpl-badge': WplBadge,
  'wpl-card': WplCard,
  'wpl-spinner': WplSpinner,
  'wpl-progress': WplProgress,
  'wpl-alert': WplAlert,
  'wpl-input': WplInput,
  'wpl-textarea': WplTextarea,
  'wpl-select': WplSelect,
  'wpl-checkbox': WplCheckbox,
  'wpl-switch': WplSwitch,
  'wpl-dialog': WplDialog,
  'wpl-tabs': WplTabs,
  'wpl-accordion': WplAccordion,
};

export function defineWhitePlumeriaElements(): void {
  if (typeof customElements === 'undefined') return;
  for (const tag of elementTags) {
    if (customElements.get(tag)) continue;
    customElements.define(tag, registry[tag]);
  }
}
