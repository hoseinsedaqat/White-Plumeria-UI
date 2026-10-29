# White Plumeria

A design system for HTML, React, Vue, and Svelte. It brings its own tokens and CSS. Tailwind is not required, and the class names are prefixed `wpl-` so they can sit next to another stylesheet.

The packages are **not published to npm**. The snippets below are the API. Until a release, install from this repository.

## Run the docs

```bash
pnpm install
pnpm dev
```

The docs app listens on `0.0.0.0:5173`. The site is English. Theme, direction, and reduced motion are real preferences, not pictures of a settings panel.

```bash
pnpm test
pnpm --filter @white-plumeria/docs build
```

## Use it

Import the CSS once, then render a component. The same names exist in each adapter.

### React

```tsx
import { Button, WhitePlumeriaProvider } from "@white-plumeria/react";
import "@white-plumeria/styles";

export function Example() {
  return (
    <WhitePlumeriaProvider>
      <Button variant="primary">Save changes</Button>
    </WhitePlumeriaProvider>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { Button, WhitePlumeriaProvider } from "@white-plumeria/vue";
import "@white-plumeria/styles";
</script>

<template>
  <WhitePlumeriaProvider>
    <Button variant="primary">Save changes</Button>
  </WhitePlumeriaProvider>
</template>
```

### Svelte

```svelte
<script lang="ts">
  import { Button, WhitePlumeriaProvider } from "@white-plumeria/svelte";
  import "@white-plumeria/styles";
</script>

<WhitePlumeriaProvider>
  <Button variant="primary">Save changes</Button>
</WhitePlumeriaProvider>
```

### HTML

```html
<link rel="stylesheet" href="node_modules/@white-plumeria/styles/dist/styles.css" />
<button class="wpl-btn wpl-btn-primary" type="button">Save changes</button>
```

A documented subset also ships as light-DOM custom elements in `@white-plumeria/elements`. Dialog, DataTable, and Combobox are framework components, not custom elements.

## Packages

| Package | What it is |
| --- | --- |
| `@white-plumeria/tokens` | Themes, CSS variables, contrast helpers |
| `@white-plumeria/core` | Class names, catalog, calendar, table, and focus helpers |
| `@white-plumeria/styles` | Prefixed CSS |
| `@white-plumeria/react` | React 19 components |
| `@white-plumeria/vue` | Vue 3 render-function components |
| `@white-plumeria/svelte` | Svelte 5 components |
| `@white-plumeria/elements` | Light-DOM custom elements for a documented subset |
| `@white-plumeria/ai` | Local planner and theme generator. No API key |
| `@white-plumeria/mcp` | Catalog MCP server. It does not call a model |
| `@white-plumeria/cli` | `wpl init`, `add`, `doctor`, `theme` |

Peers are the framework you already use. Basic use does not need an API key or a paid service.

## Themes

Set `data-wpl-theme` and, if you want to override the system, `data-wpl-scheme` on an ancestor.

```html
<html data-wpl-theme="white" data-wpl-scheme="light" lang="en" dir="ltr">
```

Themes: `white`, `ivory`, `ink`, `saffron`, `lagoon`, `blush`. `white` is the default. Custom themes override the `--wpl-color-*` variables. The same attributes color the docs site and the component previews.

## Motion

Dialog and drawer open and close with a short fade. The drawer slides from the logical side, so `start` and `end` follow writing direction. Menus, popovers, tooltips, and toasts rise in. The accordion chevron turns with the panel.

`prefers-reduced-motion: reduce` and `data-wpl-motion="reduce"` remove those transitions. Motion is decoration. Focus, names, and escape-to-close do not depend on it.

## Direction

Components use CSS logical properties. Set `dir="rtl"` on a host page. Directional icons opt in with `wpl-icon-dir`. Dates stored by DatePicker and DateRangePicker are Gregorian ISO strings. Optional times are 24-hour `HH:mm` values, without seconds or a timezone name.

## Not claimed

- npm publish. The `@white-plumeria` scope may still need to be created.
- A full manual screen-reader audit. The target is WCAG 2.2 AA. Automated tests cover the critical paths only.
- SSR. Dialogs call `showModal()` in the browser after mount.
- A GitHub Pages deploy from the current branch. The workflow is in `.github/workflows/pages.yml`.

## License

[MIT](LICENSE)
