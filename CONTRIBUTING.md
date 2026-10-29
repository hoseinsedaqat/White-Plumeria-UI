# Contributing

1. Add the component to `packages/core/src/catalog` with props, events, examples, accessibility notes, RTL notes, and limitations.
2. Add the CSS under `packages/styles/src`. Do not style bare `button` or `input` elements outside `.wpl-*`.
3. Implement the same names in the adapters you claim: React, Vue, Svelte, Angular, and Solid.
4. Add a live demo in `apps/docs/src/demos.tsx`.
5. Add a behavior test. A test that only checks a component rendered is not enough.
6. Do not add a catalog entry for a component that is not implemented.
7. Do not copy another library’s source or visual identity.

Run `pnpm test` before opening a pull request. Do not commit secrets. Do not present an unfinished feature as final.
