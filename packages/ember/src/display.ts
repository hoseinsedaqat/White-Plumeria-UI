import { alertClassName, avatarClassName, badgeClassName, cardClassName, spinnerClassName } from '@white-plumeria/core';
import { flag, glimmer, list, num, str, type Host } from './runtime.ts';

export const Kbd = glimmer(
  `<span class="wpl-kbd-group">{{#each this.keys as |key|}}<kbd class="wpl-kbd">{{key}}</kbd>{{/each}}</span>`,
  {
    getters: {
      keys(this: Host) {
        const keys = list<string>(this.args.keys);
        if (keys.length) return keys;
        const text = str(this.args.text);
        return text ? [text] : ['⌘'];
      },
    },
  },
);

export const Link = glimmer(
  `<a class="wpl-link" href={{this.href}} target={{this.target}} rel={{this.rel}}>{{#if @label}}{{@label}}{{else}}{{yield}}{{/if}}</a>`,
  {
    getters: {
      href: (host) => str(host.args.href, '#'),
      target: (host) => (flag(host.args.external) ? '_blank' : ''),
      rel: (host) => (flag(host.args.external) ? 'noreferrer noopener' : ''),
    },
  },
);

export const Badge = glimmer(`<span class={{this.className}}>{{#if @label}}{{@label}}{{else}}{{yield}}{{/if}}</span>`, {
  getters: {
    className: (host) => badgeClassName(typeof host.args.variant === 'string' ? (host.args.variant as 'neutral') : 'neutral'),
  },
});

export const Avatar = glimmer(
  `<span class={{this.className}}>{{#if @src}}<img src={{@src}} alt={{this.alt}} />{{else}}<span aria-hidden="true">{{this.initials}}</span>{{/if}}{{#if @status}}<span class="wpl-avatar-status" data-status={{@status}} aria-label={{@statusLabel}}></span>{{/if}}</span>`,
  {
    getters: {
      className: (host) => avatarClassName(host.args.size === 'sm' || host.args.size === 'lg' ? host.args.size : 'md'),
      alt: (host) => str(host.args.alt, str(host.args.name, 'Avatar')),
      initials(this: Host) {
        const name = str(this.args.name, '?');
        const parts = name.split(/\s+/).filter(Boolean);
        return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || name.slice(0, 2).toUpperCase();
      },
    },
  },
);

export const Card = glimmer(
  `<article class={{this.className}}>{{#if @title}}<h2 class="wpl-card-title">{{@title}}</h2>{{/if}}{{#if @description}}<p class="wpl-card-description">{{@description}}</p>{{/if}}{{yield}}</article>`,
  { getters: { className: (host) => cardClassName(str(host.args.className) || undefined) } },
);

export const Divider = glimmer(
  `<div class="wpl-divider" role="separator">{{#if @label}}<span>{{@label}}</span>{{/if}}</div>`,
);

export const Separator = glimmer(`<hr class="wpl-divider" aria-orientation={{this.orientation}} />`, {
  getters: {
    orientation: (host) => (str(host.args.orientation) === 'vertical' ? 'vertical' : 'horizontal'),
  },
});

export const Spinner = glimmer(`<span class={{this.className}} role="status" aria-label={{this.label}}></span>`, {
  getters: {
    label: (host) => str(host.args.label, 'Loading'),
    className: (host) => spinnerClassName(host.args.size === 'sm' || host.args.size === 'lg' ? host.args.size : 'md'),
  },
});

export const Skeleton = glimmer(`<span class="wpl-skeleton" aria-hidden="true" style={{this.style}}></span>`, {
  getters: {
    style(this: Host) {
      const width = str(this.args.width);
      const height = str(this.args.height, '1rem');
      return `${width ? `inline-size:${width};` : ''}block-size:${height}`;
    },
  },
});

export const Progress = glimmer(
  `<div class="wpl-progress" role="progressbar" aria-label={{this.label}} aria-valuenow={{this.now}} aria-valuemin="0" aria-valuemax={{this.max}}><span class="wpl-progress-bar" style={{this.bar}}></span></div>`,
  {
    getters: {
      label: (host) => str(host.args.label, 'Progress'),
      max: (host) => String(num(host.args.max, 100)),
      now(this: Host) {
        if (this.args.value == null || this.args.value === '') return '';
        const max = num(this.args.max, 100);
        return String(Math.min(max, Math.max(0, num(this.args.value, 0))));
      },
      bar(this: Host) {
        if (this.args.value == null || this.args.value === '') return '';
        const max = num(this.args.max, 100);
        const value = Math.min(max, Math.max(0, num(this.args.value, 0)));
        return `inline-size:${max === 0 ? 0 : (value / max) * 100}%`;
      },
    },
  },
);

export const EmptyState = glimmer(
  `<div class="wpl-empty"><h2>{{this.title}}</h2>{{#if @description}}<p>{{@description}}</p>{{/if}}{{yield}}</div>`,
  { getters: { title: (host) => str(host.args.title, 'Nothing to show yet') } },
);

export const Alert = glimmer(
  `<div class={{this.className}} role={{this.role}}>{{#if @title}}<strong>{{@title}}</strong>{{/if}}{{#if @description}}<p>{{@description}}</p>{{else}}{{yield}}{{/if}}</div>`,
  {
    getters: {
      className: (host) =>
        alertClassName(typeof host.args.variant === 'string' ? (host.args.variant as 'neutral') : 'neutral'),
      role: (host) => (str(host.args.variant) === 'danger' ? 'alert' : 'status'),
    },
  },
);

