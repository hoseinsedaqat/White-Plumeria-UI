# @white-plumeria/ai

Local planning tools for White Plumeria. The default provider is deterministic and does not call a network or read an API key.

```ts
import { LocalDeterministicProvider, generateTheme } from "@white-plumeria/ai";

const plan = await new LocalDeterministicProvider().complete({
  prompt: "A finance dashboard with a dark saffron theme",
});
```

`HttpProvider` can POST a prompt to an endpoint you supply. It refuses endpoint strings that look like they contain a secret. Put model keys on your server, never in this package, the docs build, or browser JavaScript.

Generated code is validated against the real component catalog. HTML output uses catalog `wpl-` classes, and an unknown class is rejected. Tailwind is not required. The docs preview renders the structured plan with library components. It does not `eval` model output.

Limitations: keyword planning, not a general model. Unknown component names are rejected. Contrast adjustment is reported, not silently claimed when a pair still fails.
