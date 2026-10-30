<p align="center">
  <img src="apps/docs/public/brand/logo.jpg" alt="White Plumeria logo: a five-petal flower on ivory" width="168" />
</p>

<h1 align="center">White Plumeria</h1>

<p align="center">
  A design system for HTML, React, Vue, Svelte, Angular, Solid, Preact, Qwik, Lit, and Alpine.<br />
  Its own tokens. Its own CSS. No Tailwind required.
</p>

<p align="center">
  <img alt="MIT license" src="https://img.shields.io/badge/license-MIT-3F3F46" />
  <img alt="Version 0.1.0" src="https://img.shields.io/badge/version-0.1.0-3F3F46" />
  <img alt="Not published to npm" src="https://img.shields.io/badge/npm-not%20published-854D0E" />
</p>

The flower is the product mark: five petals, one center. The picture above is the public logo. In the components it is drawn in `currentColor`, so it follows the theme.

Packages are **not on npm**. The code samples are the API. Until a release, clone this repository.

## Start the docs

```bash
pnpm install
pnpm dev
```

The docs app listens on `0.0.0.0:5173`. It is English. Theme, direction, and reduced motion are working controls, not pictures of a settings panel.

```bash
pnpm test
pnpm --filter @white-plumeria/docs build
```

## Why this exists

Most component kits ask you to adopt their utility framework. White Plumeria does not. You import one stylesheet, pick one adapter, and keep the class names prefixed with `wpl-` so they can sit beside another system.

What you get:

| | |
| --- | --- |
| **One contract** | The same component names in React, Vue, Svelte, Angular, Solid, Preact, Qwik, Lit, and Alpine |
| **Own CSS** | Tokens, six themes, light and dark. `white` is the default |
| **Direction** | Logical properties. `dir="rtl"` does not flip the page with a transform |
| **Motion** | Dialogs, drawers, menus, and toasts move briefly. Reduced motion removes it |
| **No paid tier** | Patterns that other libraries sell are included. No API key for basic use |
| **Honest limits** | Unpublished, no claimed SSR, no claimed full screen-reader audit |

## Use a component

Import the CSS once. The component names match across adapters.

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

### Angular

```ts
import { Component } from "@angular/core";
import { Button, WhitePlumeriaProvider } from "@white-plumeria/angular";
import "@white-plumeria/styles";

@Component({
  selector: "app-example",
  imports: [WhitePlumeriaProvider, Button],
  template: `
    <wpl-provider>
      <button wplButton variant="primary">Save changes</button>
    </wpl-provider>
  `,
})
export class Example {}
```

`Button` is the attribute `wplButton` on a native `<button>`. Composites such as `Card` are elements: `<wpl-card>`.

### Solid

```tsx
import { Button, WhitePlumeriaProvider } from "@white-plumeria/solid";
import "@white-plumeria/styles";

export function Example() {
  return (
    <WhitePlumeriaProvider>
      <Button variant="primary">Save changes</Button>
    </WhitePlumeriaProvider>
  );
}
```

This is Solid 1.9 JSX, not a React wrapper. `solid-js` is a peer dependency.

### Preact

```tsx
import { render } from "preact";
import { Button, WhitePlumeriaProvider } from "@white-plumeria/preact";
import "@white-plumeria/styles";

const root = document.getElementById("app");
if (root) {
  render(
    <WhitePlumeriaProvider>
      <Button variant="primary">Save changes</Button>
    </WhitePlumeriaProvider>,
    root,
  );
}
```

This is Preact 11 JSX and hooks, not a `preact/compat` wrapper around the React package. `preact` is a peer dependency. Text, range, and date fields use the DOM `input` event.

### Qwik

```tsx
import { component$, render } from "@qwik.dev/core";
import { Button, WhitePlumeriaProvider } from "@white-plumeria/qwik";
import "@white-plumeria/styles";

export const App = component$(() => {
  return (
    <WhitePlumeriaProvider>
      <Button onClick$={() => { document.title = "Saved · White Plumeria"; }}>Save changes</Button>
    </WhitePlumeriaProvider>
  );
});

const root = document.getElementById("app");
if (root) void render(root, <App />);
```

This is Qwik 2 (`@qwik.dev/core` 2.0.0-rc.4), not a React wrapper and not the npm package named `qwik`. Callbacks use the `$` suffix. Children are projected with `<Slot />`. `@qwik.dev/core` is a peer dependency. Text, range, and date fields listen to `onInput$` and read the element from the second handler argument. SSR is not claimed until a server render is tested.

### Lit

```ts
import { html, render } from "lit";
import { Button, defineWhitePlumeria } from "@white-plumeria/lit";
import "@white-plumeria/styles";

defineWhitePlumeria();

const root = document.querySelector("#app");
if (root) {
  render(html`<wpl-button variant="primary">Save changes</wpl-button>`, root);
}
```

This is Lit 3.3 custom elements, not a React wrapper and not `@lit/react`. Call `defineWhitePlumeria()` once. It registers the tags and is safe to call again. Components render in light DOM, so the global `wpl-` stylesheet applies. `lit` is a peer dependency. Text, range, and date fields listen to `input` and emit `wpl-change`. SSR is not claimed until a server render is tested.

### Alpine

```ts
import Alpine from "alpinejs";
import { whitePlumeria } from "@white-plumeria/alpine";
import "@white-plumeria/styles";

Alpine.plugin(whitePlumeria);
Alpine.start();
```

```html
<div x-data="WhitePlumeriaProvider({ persist: false })">
  <div x-data="Button({ variant: 'primary', label: 'Save changes' })"></div>
</div>
```

This is Alpine.js 3.17, not a Vue wrapper and not a wrapper around `@white-plumeria/elements`. `whitePlumeria(Alpine)` registers one `Alpine.data` factory per catalog component and is safe to call again. A factory renders into its host during `init()`. `alpinejs` is a peer dependency. Text, range, and date fields listen to `input` or `change` and emit `wpl-change`. `pushToast` throws unless the node is inside `WhitePlumeriaProvider`. SSR is not claimed.

### HTML

```html
<link rel="stylesheet" href="node_modules/@white-plumeria/styles/src/index.css" />
<button class="wpl-btn wpl-btn-primary" type="button">Save changes</button>
```

`@white-plumeria/elements` covers a documented subset as light-DOM custom elements. Dialog, DataTable, and Combobox stay in the framework adapters.

The intended install, once the scope exists on npm:

```bash
npm install @white-plumeria/styles @white-plumeria/react
```

That command does not work today.

## Packages

| Package | What it is |
| --- | --- |
| `@white-plumeria/tokens` | Themes, CSS variables, contrast helpers |
| `@white-plumeria/core` | Class names, catalog, calendar, table, focus helpers |
| `@white-plumeria/styles` | Prefixed CSS |
| `@white-plumeria/react` | React 19 components |
| `@white-plumeria/vue` | Vue 3 render-function components |
| `@white-plumeria/svelte` | Svelte 5 components |
| `@white-plumeria/angular` | Angular 22 components |
| `@white-plumeria/solid` | Solid 1.9 components |
| `@white-plumeria/preact` | Preact 11 components |
| `@white-plumeria/qwik` | Qwik 2 components |
| `@white-plumeria/lit` | Lit 3 custom elements |
| `@white-plumeria/alpine` | Alpine.js 3.17 components |
| `@white-plumeria/elements` | Light-DOM custom elements for a documented subset |
| `@white-plumeria/ai` | Local planner and theme generator. No API key |
| `@white-plumeria/mcp` | Catalog MCP server. It does not call a model |
| `@white-plumeria/cli` | `wpl init`, `add`, `doctor`, `theme` |

Peers are the framework you already use.

## Themes

```html
<html data-wpl-theme="white" data-wpl-scheme="light" lang="en" dir="ltr">
```

| Theme | Character |
| --- | --- |
| `white` | Default. Paper and ink |
| `ivory` | Warm paper |
| `ink` | Dark-first |
| `saffron` | Warm accent |
| `lagoon` | Cool accent |
| `blush` | Soft accent |

Omit `data-wpl-scheme` to follow the system. Custom themes override `--wpl-color-*`. The same attributes color the docs site and the component previews.

## Motion

Dialog and drawer fade. The drawer slides from the logical side, so `start` and `end` follow writing direction. Menus, popovers, tooltips, and toasts rise in. The accordion chevron turns with the panel.

`prefers-reduced-motion: reduce` and `data-wpl-motion="reduce"` remove those transitions. Focus, names, and escape-to-close do not depend on motion.

## Direction and dates

Set `dir="rtl"` on a host page. Directional icons opt in with `wpl-icon-dir`. Dates from DatePicker and DateRangePicker are Gregorian ISO strings. Optional times are 24-hour `HH:mm`, with no seconds and no timezone name.

## Logo

| File | Use |
| --- | --- |
| [logo.jpg](apps/docs/public/brand/logo.jpg) | Square public logo |
| [social.jpg](apps/docs/public/brand/social.jpg) | Wide preview |
| [mark.svg](apps/docs/public/brand/mark.svg) | Vector mark |
| `Mark` component | Theme-colored mark inside an app |

## Not claimed

- npm publish. The `@white-plumeria` scope may still need to be created.
- A full manual screen-reader audit. The target is WCAG 2.2 AA. Automated tests cover the critical paths only.
- SSR. Dialogs call `showModal()` in the browser after mount.
- A GitHub Pages deploy from the current branch. The workflow is [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## Project

- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)
- [License: MIT](LICENSE)
