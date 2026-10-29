# @white-plumeria/solid

Solid 1.9 components for White Plumeria. The package is a native adapter: components are Solid functions, not a React wrapper. Styles come from `@white-plumeria/styles`. Tailwind is not required.

```tsx
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/solid';
import '@white-plumeria/styles';

export function App() {
  return (
    <WhitePlumeriaProvider>
      <Card title="Solid">
        <Button onClick={() => console.log('saved')}>Save changes</Button>
      </Card>
    </WhitePlumeriaProvider>
  );
}
```

Run the example from the repository root:

```bash
pnpm --filter @white-plumeria/example-solid dev
```

Packages are not published to npm yet. `solid-js` is a peer dependency.
