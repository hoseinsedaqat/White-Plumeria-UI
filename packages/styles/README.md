# @white-plumeria/styles

CSS for White Plumeria. It does not depend on Tailwind, React, Vue, or Svelte.

```css
@import "@white-plumeria/styles";
```

Or in JavaScript:

```ts
import "@white-plumeria/styles";
```

Classes are prefixed with `wpl-`. Tokens are CSS custom properties prefixed with `--wpl-`. A scoped reset exists as `.wpl-reset` and is never applied to the document automatically.

Set the theme on any ancestor:

```html
<html data-wpl-theme="ivory" data-wpl-scheme="dark" lang="fa" dir="rtl">
```

`data-wpl-scheme` may be omitted to follow `prefers-color-scheme`. Themes: `ivory`, `ink`, `saffron`, `lagoon`, `blush`.

Logical properties are used for spacing and alignment. Directional icons opt into mirroring with `.wpl-icon-dir`. The page is not flipped as a whole.

Token CSS is generated from `@white-plumeria/tokens`. Run `pnpm generate:tokens` after editing token values.
