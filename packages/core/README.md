# @white-plumeria/core

Framework-agnostic contracts for White Plumeria.

It does not render UI and it does not touch `window` or `document` when imported. DOM helpers such as `createFocusTrap` run only when called, and they no-op outside the browser.

```ts
import { buttonClassName, catalog, applyPreferences } from '@white-plumeria/core';

buttonClassName({ variant: 'primary', size: 'md' });
```

The component catalog in this package is the source used by the docs site, the CLI, the MCP server, and the local AI planner. Do not invent component names outside this catalog.
