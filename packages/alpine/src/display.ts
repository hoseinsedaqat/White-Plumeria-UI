import {
  alertClassName,
  avatarClassName,
  badgeClassName,
  spinnerClassName,
  type AlertVariant,
  type AvatarSize,
  type BadgeVariant,
} from '@white-plumeria/core';
import { h, num, oneOf, svgIcon, text, translate, type Config, type Magic } from './runtime.ts';
import type { IconName } from '@white-plumeria/core';
import { iconPaths } from '@white-plumeria/core';

const alerts = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
const headings = ['h1', 'h2', 'h3', 'h4'] as const;
const badges = ['neutral', 'primary', 'success', 'warning', 'danger'] as const;
const avatars = ['sm', 'md', 'lg'] as const;

export function Alert(config: Config = {}) {
  return {
    init(this: Magic) {
      const variant = oneOf(config.variant, alerts, 'neutral');
      this.$el.replaceChildren(h('div', {
        className: alertClassName(variant as AlertVariant),
        attrs: { role: variant === 'danger' ? 'alert' : 'status' },
      }, [
        h('strong', { text: text(config.title, 'Notice') }),
        text(config.description || config.label) ? h('p', { text: text(config.description || config.label) }) : null,
      ]));
    },
  };
}

export function Avatar(config: Config = {}) {
  return {
    init(this: Magic) {
      const size = oneOf(config.size, avatars, 'md');
      const name = text(config.name || config.label, 'User');
      const src = text(config.src);
      const alt = text(config.alt);
      const status = text(config.status);
      const statusLabel = text(config.statusLabel);
      const initials = name.split(' ').map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase();
      const known = status === 'online' || status === 'busy' || status === 'offline';
      const node = h('span', { className: avatarClassName(size as AvatarSize) }, [
        src
          ? h('img', { attrs: { src, alt: alt || name } })
          : h('span', { attrs: { 'aria-hidden': 'true' }, text: initials }),
        !src && !alt ? h('span', { className: 'wpl-sr-only', text: name }) : null,
        ...(known && statusLabel
          ? [
              h('span', {
                className: 'wpl-avatar-status',
                attrs: {
                  style:
                    status === 'busy'
                      ? 'background:var(--wpl-color-warning)'
                      : status === 'offline'
                        ? 'background:var(--wpl-color-text-subtle)'
                        : undefined,
                },
              }),
              h('span', { className: 'wpl-sr-only', text: statusLabel }),
            ]
          : []),
      ]);
      this.$el.replaceChildren(node);
    },
  };
}

export function Badge(config: Config = {}) {
  return {
    init(this: Magic) {
      const variant = oneOf(config.variant, badges, 'neutral');
      this.$el.replaceChildren(h('span', { className: badgeClassName(variant as BadgeVariant), text: text(config.label, this.$el.textContent?.trim() || 'Badge') }));
    },
  };
}

export function Card(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('article', { className: 'wpl-card' }, [
        h(oneOf(config.titleAs, headings, 'h2'), { className: 'wpl-card-title', text: text(config.title, 'Card') }),
        text(config.description) ? h('p', { text: text(config.description) }) : null,
      ]));
    },
  };
}

export function Divider(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('hr', { className: 'wpl-divider', attrs: { 'aria-orientation': config.orientation === 'vertical' ? 'vertical' : undefined } }));
    },
  };
}

export function Separator(config: Config = {}) {
  return Divider(config);
}

export function EmptyState(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('div', { className: 'wpl-empty' }, [
        h('h2', { text: text(config.title, 'Nothing here') }),
        text(config.description) ? h('p', { text: text(config.description) }) : null,
      ]));
    },
  };
}

export function Kbd(config: Config = {}) {
  return {
    init(this: Magic) {
      const keys = listKeys(config.keys ?? config.label);
      this.$el.replaceChildren(h('span', { className: 'wpl-kbd-group' }, keys.map((key) => h('kbd', { className: 'wpl-kbd', text: key }))));
    },
  };
}

function listKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  const raw = text(value, 'Enter');
  return raw.split('+').map((part) => part.trim()).filter(Boolean);
}

export function Link(config: Config = {}) {
  return {
    init(this: Magic) {
      const external = config.external === true;
      this.$el.replaceChildren(h('a', {
        className: 'wpl-link',
        attrs: {
          href: text(config.href, '#'),
          target: external ? '_blank' : undefined,
          rel: external ? 'noreferrer noopener' : undefined,
        },
      }, [
        text(config.label, this.$el.textContent?.trim() || 'Link'),
        external ? h('span', { className: 'wpl-sr-only', text: ` (${translate(this.$el, 'newTab')})` }) : null,
        external ? svgIcon('external', 'wpl-icon wpl-icon-dir') : null,
      ]));
    },
  };
}

export function Progress(config: Config = {}) {
  return {
    init(this: Magic) {
      const value = Math.min(100, Math.max(0, num(config.value, 0)));
      const label = text(config.label, 'Progress');
      this.$el.replaceChildren(h('div', {
        className: 'wpl-progress',
        attrs: { role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': value },
      }, [h('span', { className: 'wpl-progress-bar', attrs: { style: `inline-size:${value}%` } })]));
    },
  };
}

export function Skeleton(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('span', { className: 'wpl-skeleton', attrs: { 'aria-hidden': 'true', style: text(config.width) ? `inline-size:${text(config.width)}` : undefined } }));
    },
  };
}

export function Spinner(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('span', { className: spinnerClassName(), attrs: { role: 'status', 'aria-label': text(config.label, 'Loading') } }));
    },
  };
}

export function StatCard(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('article', { className: 'wpl-stat' }, [
        h('p', { className: 'wpl-stat-label', text: text(config.label, 'Stat') }),
        h('p', { className: 'wpl-stat-value', text: text(config.value, '0') }),
        text(config.hint) ? h('p', { className: 'wpl-muted', text: text(config.hint) }) : null,
      ]));
    },
  };
}

export function Icon(config: Config = {}) {
  return {
    init(this: Magic) {
      const name = text(config.name, 'info');
      const icon = name in iconPaths ? (name as IconName) : 'info';
      const label = text(config.label);
      const node = svgIcon(icon);
      if (label) {
        node.removeAttribute('aria-hidden');
        node.setAttribute('role', 'img');
        node.setAttribute('aria-label', label);
      }
      this.$el.replaceChildren(node);
    },
  };
}

export function Mark(config: Config = {}) {
  return {
    init(this: Magic) {
      this.$el.replaceChildren(h('span', { className: 'wpl-mark', attrs: { 'aria-hidden': text(config.label) ? undefined : 'true' } }, [svgIcon('star')]));
    },
  };
}
