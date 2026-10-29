import type { JSX } from 'solid-js';

export function Kbd(props: { keys?: string[]; children?: JSX.Element }) {
  if (props.keys && props.keys.length > 0) {
    return (
      <span class="wpl-kbd-group">
        {props.keys.map((key, index) => (
          <span class="wpl-kbd-group">
            {index > 0 ? <span aria-hidden="true">+</span> : null}
            <kbd class="wpl-kbd">{key}</kbd>
          </span>
        ))}
      </span>
    );
  }
  return <kbd class="wpl-kbd">{props.children}</kbd>;
}
