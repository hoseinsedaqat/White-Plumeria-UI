<p align="center">
  <img src="apps/docs/public/brand/logo.jpg" alt="White Plumeria logo: a five-petal flower on ivory" width="168" />
</p>

<h1 align="center">White Plumeria</h1>

<p align="center">
  A design system you can read.<br />
  One stylesheet, six themes, and a native adapter for the framework you already use.<br />
  Tailwind is not required.
</p>

<p align="center">
  <img alt="MIT license" src="https://img.shields.io/badge/license-MIT-3F3F46" />
  <img alt="Version 0.1.0" src="https://img.shields.io/badge/version-0.1.0-3F3F46" />
  <img alt="Node 22.12 or newer" src="https://img.shields.io/badge/node-%3E%3D22.12-3F3F46" />
  <img alt="Not published to npm" src="https://img.shields.io/badge/npm-not%20published-854D0E" />
</p>

<p align="center">
  <a href="#quick-setup">Quick setup</a>
  ·
  <a href="#install">Install</a>
  ·
  <a href="#first-component">First component</a>
  ·
  <a href="#adapters">Adapters</a>
  ·
  <a href="#themes">Themes</a>
  ·
  <a href="#develop">Develop</a>
</p>

The flower is the product mark: five petals, one center. The picture above is the public logo. Inside an app, the `Mark` component is drawn in `currentColor`, so it follows the theme.

Packages are **not on npm**. The samples below are the API. Until a release, clone this repository.

## Quick setup

This is the path that works today.

```bash
git clone https://github.com/hoseinsedaqat/White-Plumeria-UI.git
cd White-Plumeria-UI
corepack pnpm install
corepack pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The docs app is English. Theme, direction, and reduced motion are working controls.

Requirements:

| Requirement    | Value                          |
| -------------- | ------------------------------ |
| Node           | `>= 22.12.0`                   |
| pnpm           | `12.15.0`, via `corepack pnpm` |
| Default branch | `test`                         |

`corepack pnpm` uses the version in `packageManager`. A global `pnpm` of another version is not required.

What you get after `pnpm dev`:

- the catalog, with a live preview for every component
- the theme lab, playground, and local AI studio
- the same `wpl-` classes the adapters render

To open one framework desk instead of the docs site:

```bash
corepack pnpm --filter @white-plumeria/example-react dev
```

That desk listens on port `5174`. The other desks are listed under [Develop](#develop).

## Install

The intended install, once `@white-plumeria` exists on npm:

```bash
npm install @white-plumeria/styles @white-plumeria/react
```

```bash
pnpm add @white-plumeria/styles @white-plumeria/react
```

```bash
yarn add @white-plumeria/styles @white-plumeria/react
```

Those three commands **do not work today**, and they stay unpublished until the catalog, every library example, and the server hosts are complete and stable. Swap `react` for the adapter you use: `vue`, `svelte`, `angular`, `solid`, `preact`, `qwik`, `lit`, `alpine`, `marko`, `ember`, or `elements`. Always install `@white-plumeria/styles` with it. The stylesheet is not bundled into the adapter.

Peers are the framework you already have. `@white-plumeria/styles` is also a peer, so the CSS import stays explicit.

## First component

Import the stylesheet once, wrap the tree in the provider, and use the catalog name.

```tsx
import { Button, WhitePlumeriaProvider } from '@white-plumeria/react';
import '@white-plumeria/styles';

export function Example() {
  return (
    <WhitePlumeriaProvider>
      <Button variant="primary">Save changes</Button>
    </WhitePlumeriaProvider>
  );
}
```

The same names exist in every adapter. A button is `Button` in React, Vue, Svelte, Solid, Preact, Qwik, Marko, and Ember. Angular puts `wplButton` on a native `<button>`. Lit and the elements package use `<wpl-button>`. Alpine mounts a factory on the host.

`pushToast` throws unless the node is inside the provider. That is intentional.

## Adapters

Each package is written for that framework. None of them wrap another adapter.

| Adapter  | Package                    | You already have   | Entry               |
| -------- | -------------------------- | ------------------ | ------------------- |
| HTML     | `@white-plumeria/styles`   | a page             | `wpl-` classes      |
| React    | `@white-plumeria/react`    | React 19           | `Button`            |
| Vue      | `@white-plumeria/vue`      | Vue 3.5            | `Button`            |
| Svelte   | `@white-plumeria/svelte`   | Svelte 5           | `Button`            |
| Angular  | `@white-plumeria/angular`  | Angular 22         | `wplButton`         |
| Solid    | `@white-plumeria/solid`    | Solid 1.9          | `Button`            |
| Preact   | `@white-plumeria/preact`   | Preact 11          | `Button`            |
| Qwik     | `@white-plumeria/qwik`     | `@qwik.dev/core` 2 | `Button`            |
| Lit      | `@white-plumeria/lit`      | Lit 3.3            | `<wpl-button>`      |
| Alpine   | `@white-plumeria/alpine`   | Alpine.js 3.17     | `Button({ ... })`   |
| Marko    | `@white-plumeria/marko`    | Marko 6.4          | `<Button>`          |
| Ember    | `@white-plumeria/ember`    | Ember 7.4          | `<Button>`          |
| Elements | `@white-plumeria/elements` | custom elements    | a documented subset |

Next, Nuxt, SvelteKit, SolidStart, Analog, and Qwik City are server hosts for those adapters. They are not extra packages, and they do not wrap another adapter. Each component page shows the host example, and Examples frames that host’s static export. Ember server render is not claimed.

<details>
<summary>React</summary>

React 19 hooks and controlled props. This is the adapter the docs site renders. `react` and `react-dom` are peers.

```tsx
import { Button, WhitePlumeriaProvider } from '@white-plumeria/react';
import '@white-plumeria/styles';

export function Example() {
  return (
    <WhitePlumeriaProvider>
      <Button variant="primary">Save changes</Button>
    </WhitePlumeriaProvider>
  );
}
```

</details>

<details>
<summary>Vue</summary>

Vue 3 render functions and `v-model`. Not a React wrapper. `vue` is a peer.

```vue
<script setup lang="ts">
import { Button, WhitePlumeriaProvider } from '@white-plumeria/vue';
import '@white-plumeria/styles';
</script>

<template>
  <WhitePlumeriaProvider>
    <Button variant="primary">Save changes</Button>
  </WhitePlumeriaProvider>
</template>
```

</details>

<details>
<summary>Svelte</summary>

Svelte 5 runes. State stays in the component file. `svelte` is a peer.

```svelte
<script lang="ts">
  import { Button, WhitePlumeriaProvider } from "@white-plumeria/svelte";
  import "@white-plumeria/styles";
</script>

<WhitePlumeriaProvider>
  <Button variant="primary">Save changes</Button>
</WhitePlumeriaProvider>
```

</details>

<details>
<summary>Angular</summary>

Angular 22 standalone components and signals. `Button` is the `wplButton` attribute on a native `<button>`. Composites such as `Card` are elements: `<wpl-card>`. `@angular/core` is a peer.

```ts
import { Component } from '@angular/core';
import { Button, WhitePlumeriaProvider } from '@white-plumeria/angular';
import '@white-plumeria/styles';

@Component({
  selector: 'app-example',
  imports: [WhitePlumeriaProvider, Button],
  template: `
    <wpl-provider>
      <button wplButton variant="primary">Save changes</button>
    </wpl-provider>
  `,
})
export class Example {}
```

</details>

<details>
<summary>Solid</summary>

Solid 1.9 JSX and signals. Not the React package under another import. `solid-js` is a peer.

```tsx
import { Button, WhitePlumeriaProvider } from '@white-plumeria/solid';
import '@white-plumeria/styles';

export function Example() {
  return (
    <WhitePlumeriaProvider>
      <Button variant="primary">Save changes</Button>
    </WhitePlumeriaProvider>
  );
}
```

</details>

<details>
<summary>Preact</summary>

Preact 11 JSX and hooks. Not a `preact/compat` wrapper around `@white-plumeria/react`. Text, range, and date fields use the DOM `input` event. `preact` is a peer.

```tsx
import { render } from 'preact';
import { Button, WhitePlumeriaProvider } from '@white-plumeria/preact';
import '@white-plumeria/styles';

const root = document.getElementById('app');
if (root) {
  render(
    <WhitePlumeriaProvider>
      <Button variant="primary">Save changes</Button>
    </WhitePlumeriaProvider>,
    root,
  );
}
```

</details>

<details>
<summary>Qwik</summary>

Qwik 2 (`@qwik.dev/core` `^2.0.0-rc.4`). Not the npm package named `qwik`, and not a React wrapper. Callbacks use the `$` suffix. Children are projected with `<Slot />`. Text, range, and date fields listen to `onInput$` and read the element from the second handler argument. Server rendering is not claimed.

```tsx
import { component$, render } from '@qwik.dev/core';
import { Button, WhitePlumeriaProvider } from '@white-plumeria/qwik';
import '@white-plumeria/styles';

export const App = component$(() => {
  return (
    <WhitePlumeriaProvider>
      <Button
        onClick$={() => {
          document.title = 'Saved · White Plumeria';
        }}
      >
        Save changes
      </Button>
    </WhitePlumeriaProvider>
  );
});

const root = document.getElementById('app');
if (root) void render(root, <App />);
```

</details>

<details>
<summary>Lit</summary>

Lit 3.3 custom elements in light DOM, so the global `wpl-` stylesheet applies. Call `defineWhitePlumeria()` once. It is safe to call again. Text, range, and date fields listen to `input` and emit `wpl-change`. Server rendering is not claimed. `lit` is a peer.

```ts
import { html, render } from 'lit';
import { defineWhitePlumeria } from '@white-plumeria/lit';
import '@white-plumeria/styles';

defineWhitePlumeria();

const root = document.querySelector('#app');
if (root) {
  render(html`<wpl-button variant="primary">Save changes</wpl-button>`, root);
}
```

</details>

<details>
<summary>Alpine</summary>

Alpine.js 3.17. Not a Vue wrapper and not a wrapper around `@white-plumeria/elements`. `whitePlumeria(Alpine)` registers one `Alpine.data` factory per catalog component and is safe to call again. A factory renders into its host during `init()`. Text, range, and date fields listen to `input` or `change` and emit `wpl-change`. Server rendering is not claimed. `alpinejs` is a peer.

```ts
import Alpine from 'alpinejs';
import { whitePlumeria } from '@white-plumeria/alpine';
import '@white-plumeria/styles';

Alpine.plugin(whitePlumeria);
Alpine.start();
```

```html
<div x-data="WhitePlumeriaProvider({ persist: false })">
  <div x-data="Button({ variant: 'primary', label: 'Save changes' })"></div>
</div>
```

</details>

<details>
<summary>Marko</summary>

Marko 6.4 Tags API. Not a wrapper around Alpine, Vue, or `@white-plumeria/elements`. Each catalog component is a `.marko` tag. Text, range, and date fields listen through `valueChange` and emit `wpl-change`. `pushToast` throws unless the node is inside `wpl-provider`. A Node test covers the server render of Button and Provider. The other tags are client components. The desk example mounts in the browser. `marko` is a peer.

```marko
import Button from "@white-plumeria/marko/tags/wpl-button.marko";
import "@white-plumeria/styles";

<Button variant="primary">Save changes</Button>
```

</details>

<details>
<summary>Ember</summary>

Ember 7.4 Glimmer components. Not a wrapper around Alpine, Vue, Marko, or `@white-plumeria/elements`. `renderComponent` mounts a component into any element. Text, range, and date fields listen to `input` or `change` and emit `wpl-change`. `pushToast` throws unless the node is inside `WhitePlumeriaProvider`. Server rendering is not claimed. The desk example mounts in the browser. `ember-source` and `@glimmer/component` are peers.

```gjs
import { Button } from "@white-plumeria/ember";
import "@white-plumeria/styles";

<template>
  <Button @variant="primary">Save changes</Button>
</template>
```

</details>

<details>
<summary>HTML and custom elements</summary>

Class names work without a framework. The stylesheet does not style bare `button` or `input` elements.

```html
<link rel="stylesheet" href="node_modules/@white-plumeria/styles/src/index.css" />
<button class="wpl-btn wpl-btn-primary" type="button">Save changes</button>
```

`@white-plumeria/elements` is a smaller light-DOM set, not a second catalog: `wpl-button`, `wpl-icon-button`, `wpl-badge`, `wpl-card`, `wpl-spinner`, `wpl-progress`, `wpl-alert`, `wpl-input`, `wpl-textarea`, `wpl-select`, `wpl-checkbox`, `wpl-switch`, `wpl-dialog`, `wpl-tabs`, and `wpl-accordion`. DataTable, Combobox, and the rest of the catalog stay in the framework adapters.

</details>

## Themes

```text
<html data-wpl-theme="white" data-wpl-scheme="light" lang="en" dir="ltr">
```

| Theme     | Character              |
| --------- | ---------------------- |
| `white`   | Default. Paper and ink |
| `ivory`   | Warm paper             |
| `ink`     | Dark-first             |
| `saffron` | Warm accent            |
| `lagoon`  | Cool accent            |
| `blush`   | Soft accent            |

Omit `data-wpl-scheme` to follow the system. Custom themes override `--wpl-color-*`. The same attributes color the docs site and the component previews. Component chrome uses those variables. It does not keep a second hardcoded palette.

`dir="rtl"` is a host-page setting. Directional icons opt in with `wpl-icon-dir`. A verification code stays left to right: a code is a sequence, not a sentence. Dates from DatePicker and DateRangePicker are Gregorian ISO strings. Optional times are 24-hour `HH:mm`, with no seconds and no timezone name.

## Motion

Dialog and drawer fade. The drawer slides from the logical side, so `start` and `end` follow writing direction. Menus, popovers, tooltips, and toasts rise in. The accordion chevron turns with the panel.

`prefers-reduced-motion: reduce` and `data-wpl-motion="reduce"` remove those transitions. Focus, names, and escape-to-close do not depend on motion.

`color-scheme` follows `data-wpl-scheme`, or the system preference when that attribute is omitted. A nested light scheme stays light. `forced-colors: active` keeps controls visible with system colors and does not turn forced colors off. `prefers-contrast: more` thickens borders. That is not a completed screen-reader audit.

## Packages

| Package                    | What it is                                           |
| -------------------------- | ---------------------------------------------------- |
| `@white-plumeria/tokens`   | Themes, CSS variables, contrast helpers              |
| `@white-plumeria/core`     | Class names, catalog, calendar, table, focus helpers |
| `@white-plumeria/styles`   | Prefixed CSS. Import this once                       |
| `@white-plumeria/react`    | React 19 components                                  |
| `@white-plumeria/vue`      | Vue 3.5 components                                   |
| `@white-plumeria/svelte`   | Svelte 5 components                                  |
| `@white-plumeria/angular`  | Angular 22 components                                |
| `@white-plumeria/solid`    | Solid 1.9 components                                 |
| `@white-plumeria/preact`   | Preact 11 components                                 |
| `@white-plumeria/qwik`     | Qwik 2 components                                    |
| `@white-plumeria/lit`      | Lit 3.3 custom elements                              |
| `@white-plumeria/alpine`   | Alpine.js 3.17 components                            |
| `@white-plumeria/marko`    | Marko 6.4 Tags API components                        |
| `@white-plumeria/ember`    | Ember 7.4 Glimmer components                         |
| `@white-plumeria/elements` | Light-DOM custom elements for the subset above       |
| `@white-plumeria/ai`       | Local planner and theme generator. No API key        |
| `@white-plumeria/mcp`      | Catalog MCP server. It does not call a model         |
| `@white-plumeria/cli`      | `wpl init`, `add`, `doctor`, `theme`                 |

## CLI

`wpl` does not copy component source into your app.

```text
wpl init
wpl add button --framework react
wpl doctor
wpl theme saffron
```

`init` writes `wpl.config.json` and prints the install command. `add` prints the package install for a catalog component. `--copy` writes a thin re-export, not a fork. `doctor` checks the Node version and the catalog. It does not claim packages are published. Unknown commands exit 2.

## Develop

From the repository root. If `pnpm` is not on your PATH, prefix these scripts with `corepack`.

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm docs:build
```

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `pnpm dev`             | Docs site on `5173`                             |
| `pnpm test`            | Adapter suites, then the shared Vitest run      |
| `pnpm typecheck`       | `tsc` and the Svelte check, per package         |
| `pnpm lint`            | ESLint                                          |
| `pnpm docs:build`      | Static docs build                               |
| `pnpm generate:tokens` | Regenerates token CSS from `packages/tokens`    |
| `pnpm verify:dist`     | Checks built entry files. Does not publish.     |
| `pnpm pack:dry-run`    | Dry-run tarball only. Does not publish.         |
| `pnpm size`            | Unpacked size of those files. Does not publish. |

Example desks alias workspace source, so they run before a publish:

| Desk       | Command                                                | Port |
| ---------- | ------------------------------------------------------ | ---- |
| Docs       | `pnpm dev`                                             | 5173 |
| React      | `pnpm --filter @white-plumeria/example-react dev`      | 5174 |
| Vue        | `pnpm --filter @white-plumeria/example-vue dev`        | 5175 |
| Svelte     | `pnpm --filter @white-plumeria/example-svelte dev`     | 5176 |
| Angular    | `pnpm --filter @white-plumeria/example-angular dev`    | 5177 |
| Solid      | `pnpm --filter @white-plumeria/example-solid dev`      | 5178 |
| Preact     | `pnpm --filter @white-plumeria/example-preact dev`     | 5179 |
| Qwik       | `pnpm --filter @white-plumeria/example-qwik dev`       | 5180 |
| Lit        | `pnpm --filter @white-plumeria/example-lit dev`        | 5181 |
| Alpine     | `pnpm --filter @white-plumeria/example-alpine dev`     | 5182 |
| Marko      | `pnpm --filter @white-plumeria/example-marko dev`      | 5183 |
| Ember      | `pnpm --filter @white-plumeria/example-ember dev`      | 5184 |
| Next       | `pnpm --filter @white-plumeria/example-next dev`       | 5185 |
| Nuxt       | `pnpm --filter @white-plumeria/example-nuxt dev`       | 5186 |
| SvelteKit  | `pnpm --filter @white-plumeria/example-sveltekit dev`  | 5187 |
| Analog     | `pnpm --filter @white-plumeria/example-analog dev`     | 5188 |
| SolidStart | `pnpm --filter @white-plumeria/example-solidstart dev` | 5189 |
| Qwik City  | `pnpm --filter @white-plumeria/example-qwikcity dev`   | 5190 |

## Logo

| File                                            | Use                              |
| ----------------------------------------------- | -------------------------------- |
| [logo.jpg](apps/docs/public/brand/logo.jpg)     | Square public logo               |
| [social.jpg](apps/docs/public/brand/social.jpg) | Wide preview                     |
| [mark.svg](apps/docs/public/brand/mark.svg)     | Vector mark                      |
| `Mark` component                                | Theme-colored mark inside an app |

## Not claimed

- npm publish. The `@white-plumeria` scope may still need to be created.
- A full manual screen-reader audit. The target is WCAG 2.2 AA. Automated tests cover the critical paths only.
- Server rendering for React, Vue, Svelte, Angular, Solid, Preact, Qwik, Lit, Alpine, Ember, or the elements package. Marko has a tested server render for Button and Provider only.
- A GitHub Pages deploy from every branch. The workflow is [`.github/workflows/pages.yml`](.github/workflows/pages.yml) and runs on `test` and `main`.

## Project

- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)
- [License: MIT](LICENSE)
