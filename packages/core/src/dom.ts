const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function canUseDOM(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

export function isVisible(element: HTMLElement): boolean {
  if (element.closest('[hidden]')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  const check = (element as HTMLElement & { checkVisibility?: () => boolean }).checkVisibility;
  if (typeof check === 'function') {
    try {
      return check.call(element);
    } catch {
      return element.getClientRects().length > 0;
    }
  }
  return element.getClientRects().length > 0;
}

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) => {
    if (element.hasAttribute('disabled')) return false;
    if (element.tabIndex < 0) return false;
    return isVisible(element);
  });
}

export interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
}

export function createFocusTrap(root: HTMLElement): FocusTrap {
  let previous: HTMLElement | null = null;

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const items = getFocusable(root);
    if (items.length === 0) {
      event.preventDefault();
      if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
      root.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !root.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !root.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    activate() {
      previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      root.addEventListener('keydown', onKeyDown);
      const items = getFocusable(root);
      const target = items[0] ?? root;
      if (target === root && !root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
      target.focus();
    },
    deactivate() {
      root.removeEventListener('keydown', onKeyDown);
      previous?.focus();
      previous = null;
    },
  };
}

export function bindDismissable(options: {
  root: HTMLElement;
  onDismiss: () => void;
  escape?: boolean;
  outside?: boolean;
  owner?: HTMLElement | null;
}): () => void {
  if (!canUseDOM()) return () => undefined;

  const onKey = (event: KeyboardEvent) => {
    if (options.escape === false || event.key !== 'Escape') return;
    event.stopPropagation();
    options.onDismiss();
  };
  const onPointer = (event: Event) => {
    if (options.outside === false) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (options.root.contains(target)) return;
    if (options.owner?.contains(target)) return;
    options.onDismiss();
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('pointerdown', onPointer, true);
  return () => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('pointerdown', onPointer, true);
  };
}

export function supportsModalDialog(): boolean {
  return (
    typeof HTMLDialogElement !== 'undefined' &&
    typeof HTMLDialogElement.prototype.showModal === 'function'
  );
}

let idCounter = 0;

export function createId(prefix = 'wpl'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}
