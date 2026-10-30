# @white-plumeria/qwik

Qwik components for White Plumeria. The package is a native adapter: components are `component$` functions, not a React runtime. Styles come from `@white-plumeria/styles`. Tailwind is not required.

```tsx
import { component$, render } from '@qwik.dev/core';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/qwik';
import '@white-plumeria/styles';

export const App = component$(() => {
  return (
    <WhitePlumeriaProvider>
      <Card title="Qwik">
        <Button onClick$={() => console.log('saved')}>Save changes</Button>
      </Card>
    </WhitePlumeriaProvider>
  );
});

const root = document.getElementById('app');
if (root) void render(root, <App />);
```

Run the example from the repository root:

```bash
pnpm --filter @white-plumeria/example-qwik dev
```

Packages are not published to npm yet. `@qwik.dev/core` is a peer dependency. This tracks `@qwik.dev/core` 2.0.0-rc.4 because it is the Vite 8 line. It is not the unrelated npm package named `qwik`, and it is not a stable 2.0.0.

Callbacks are QRLs and use the `$` suffix: `onClick$`, `onValueChange$`, `onOpenChange$`. Children are projected with `<Slot />`. Text, range, and date fields listen to `onInput$` and read the current element from the second handler argument. Checkbox, radio, select, and file inputs keep `onChange$`.

SSR is not claimed. The example renders in the browser with `render()`.
