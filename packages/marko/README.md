# @white-plumeria/marko

Marko 6.4 Tags API components for White Plumeria. These are native `.marko` tags, not an Alpine wrapper, a Vue wrapper, or a wrapper around `@white-plumeria/elements`.

```marko
import Button from "@white-plumeria/marko/tags/wpl-button.marko";
import "@white-plumeria/styles";

<Button variant="primary">Save changes</Button>
```

`marko.json` exports `./src/tags`, so an installed app can also use `<wpl-button>` without an import. `marko` is a peer dependency. Pair the tags with `@white-plumeria/styles`.

Text, range, and date fields sync through `valueChange` and emit `wpl-change`. `pushToast` throws `WhitePlumeriaProvider is required to push a toast.` when the node is outside `wpl-provider`.

The tags render to HTML on the server. That path is covered by `src/ssr.server.test.ts`. The desk example mounts in the browser with `template.mount()`.

Built-in labels follow `wpl-provider`'s `locale`. Without a provider they stay English.
