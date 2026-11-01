import { message, type Locale, type MessageKey } from '@white-plumeria/core';
import { localeOf } from './provider.ts';

const stack: Locale[] = [];

/** Push the locale for the provider body that is about to render. */
export function enterLocale(locale: Locale | undefined): Locale {
  const next = locale === 'fa' ? 'fa' : 'en';
  stack.push(next);
  return next;
}

/** Pop the locale pushed for that same render. */
export function leaveLocale(): boolean {
  stack.pop();
  return true;
}

/** Server renders have no mount hook, so the provider calls this after its body. */
export function leaveOnServer(): boolean {
  if (typeof window === 'undefined') stack.pop();
  return true;
}

export function activeLocale(): Locale {
  return stack.at(-1) ?? 'en';
}

export function text(key: MessageKey): string {
  return message(activeLocale(), key);
}

/** Event-time label. The render stack is already gone, so this reads the mounted provider. */
export function textAt(node: Node | null, key: MessageKey): string {
  return message(localeOf(node), key);
}
