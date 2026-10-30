import { type ComponentChildren } from 'preact';

export function Kbd({ keys, children }: { keys?: string[]; children?: ComponentChildren }) {
  if (keys && keys.length > 0) {
    return (
      <span className="wpl-kbd-group">
        {keys.map((key, index) => (
          <span key={`${key}-${index}`} className="wpl-kbd-group">
            {index > 0 ? <span aria-hidden="true">+</span> : null}
            <kbd className="wpl-kbd">{key}</kbd>
          </span>
        ))}
      </span>
    );
  }
  return <kbd className="wpl-kbd">{children}</kbd>;
}
