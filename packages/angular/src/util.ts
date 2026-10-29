import { computed, signal, type Signal } from '@angular/core';

export function controlledValue<T>(explicit: Signal<T | undefined>, fallback: T): {
  current: Signal<T>;
  commit: (next: T) => void;
  controlled: () => boolean;
} {
  const internal = signal(fallback);
  return {
    current: computed(() => {
      const value = explicit();
      return value === undefined ? internal() : value;
    }),
    controlled: () => explicit() !== undefined,
    commit(next: T) {
      if (explicit() === undefined) internal.set(next);
    },
  };
}
