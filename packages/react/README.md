# @white-plumeria/react

React 19 components for White Plumeria.

```tsx
import { Button, Card, WhitePlumeriaProvider } from "@white-plumeria/react";
import "@white-plumeria/styles";

export function Example() {
  return (
    <WhitePlumeriaProvider>
      <Card title="Analytics" description="Overview of recent activity">
        <Button variant="primary">Save changes</Button>
      </Card>
    </WhitePlumeriaProvider>
  );
}
```

`@white-plumeria/styles` is an optional peer. Components render without it, but they will be unstyled.

The package does not read `window` or `document` at import time. Dialogs call `showModal()` after mount. Toasts, theme persistence, and focus traps require a browser and `WhitePlumeriaProvider` where noted in the catalog.

Peer dependency: `react` and `react-dom` `^19`.
