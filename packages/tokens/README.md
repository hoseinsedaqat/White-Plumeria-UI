# @white-plumeria/tokens

Design tokens for [White Plumeria](https://github.com/hoseinsedaqat/White-Plumeria-UI).

This package has no framework dependency. It exports the same values that `@white-plumeria/styles` writes as CSS custom properties prefixed with `--wpl-`.

```ts
import { themes, sharedTokens, renderTokensCss } from '@white-plumeria/tokens';

const ivory = themes.find((theme) => theme.name === 'ivory');
console.log(ivory?.light.primary);
console.log(renderTokensCss());
```

Themes: `ivory`, `ink`, `saffron`, `lagoon`, `blush`. Each theme has a light and a dark scheme.

Breakpoints are exported in JavaScript (`sharedTokens.breakpoint`) because CSS media queries cannot reliably read custom properties. The values are `40rem`, `48rem`, `64rem`, and `80rem`.

Changing the product name or CSS prefix is a source change in `brand.config.json` plus the token prefix `--wpl-`. Published CSS is built from these tokens; it is not a runtime rename.
