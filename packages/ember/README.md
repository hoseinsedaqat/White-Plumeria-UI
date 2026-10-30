# @white-plumeria/ember

Ember 7.4 Glimmer components for White Plumeria. This uses `renderComponent` and compiled templates, not a wrapper around Alpine, Vue, Marko, or `@white-plumeria/elements`.

```gjs
import { Button, WhitePlumeriaProvider } from "@white-plumeria/ember";
import "@white-plumeria/styles";

<template>
  <WhitePlumeriaProvider @persist={{false}}>
    <Button @variant="primary">Save changes</Button>
  </WhitePlumeriaProvider>
</template>
```

`ember-source` and `@glimmer/component` are peer dependencies. Pair the components with `@white-plumeria/styles`. Text, range, and date fields listen to `input` or `change` and emit `wpl-change`. `pushToast` throws `WhitePlumeriaProvider is required to push a toast.` when the node is outside a provider. Server rendering is not claimed.
