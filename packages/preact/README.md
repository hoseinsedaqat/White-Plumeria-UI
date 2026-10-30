# @white-plumeria/preact

Preact 11 components for White Plumeria. The package is a native adapter: components are Preact functions, not a React runtime. Styles come from `@white-plumeria/styles`. Tailwind is not required.

```tsx
import { render } from 'preact';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/preact';
import '@white-plumeria/styles';

const root = document.getElementById('app');
if (root) {
  render(
    <WhitePlumeriaProvider>
      <Card title="Preact">
        <Button onClick={() => console.log('saved')}>Save changes</Button>
      </Card>
    </WhitePlumeriaProvider>,
    root,
  );
}
```

Run the example from the repository root:

```bash
pnpm --filter @white-plumeria/example-preact dev
```

Packages are not published to npm yet. `preact` is a peer dependency. Preact 11 forwards refs as a prop, and `useRef` requires an initial value. Text, range, and date fields listen to the DOM `input` event (`onInput`). Checkbox, radio, select, and file inputs keep `onChange`.
