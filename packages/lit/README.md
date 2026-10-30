# @white-plumeria/lit

Lit components for White Plumeria. Each component is a light-DOM custom element, not a React wrapper and not `@lit/react`. Styles come from `@white-plumeria/styles`. Tailwind is not required.

```ts
import { html, render } from 'lit';
import { Button, defineWhitePlumeria } from '@white-plumeria/lit';
import '@white-plumeria/styles';

defineWhitePlumeria();

const root = document.querySelector('#app');
if (root) {
  render(html`<wpl-button variant="primary">Save changes</wpl-button>`, root);
}
```

Run the example from the repository root:

```bash
pnpm --filter @white-plumeria/example-lit dev
```

Packages are not published to npm yet. `lit` 3.3 is a peer dependency.

Call `defineWhitePlumeria()` once before creating tags. Calling it again does not redefine a tag that is already registered. Custom elements use explicit end tags, such as `<wpl-button></wpl-button>`. Object props are set as properties (`items`, `columns`, `rows`, `slides`), not attributes. Text, range, and date fields listen to `input` and emit `wpl-change`.

The elements render into light DOM so the global `wpl-` stylesheet applies. There is no shadow root.

SSR is not claimed. The example renders in the browser with `render()`.
