import { component$, Slot } from '@qwik.dev/core';

export const Kbd = component$<{ keys?: string[] }>((props) => {
  if (props.keys && props.keys.length > 0) {
    return (
      <span class="wpl-kbd-group">
        {props.keys.map((key, index) => (
          <span key={`${key}-${index}`} class="wpl-kbd-group">
            {index > 0 ? <span aria-hidden="true">+</span> : null}
            <kbd class="wpl-kbd">{key}</kbd>
          </span>
        ))}
      </span>
    );
  }
  return (
    <kbd class="wpl-kbd">
      <Slot />
    </kbd>
  );
});
