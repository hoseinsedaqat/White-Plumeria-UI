# White Plumeria

A framework-agnostic design system for HTML, React, Vue, and Svelte. It ships its own tokens and CSS. Tailwind is not required.

The temporary name NovaForge was not used. `@white-plumeria` was free on npm when this repository was created. The name lives in `brand.config.json` and `packages/core/src/brand.ts`. Packages are **not published**.

## Packages

| Package | What it is |
| --- | --- |
| `@white-plumeria/tokens` | Themes, CSS variables, contrast helpers |
| `@white-plumeria/core` | Class names, catalog, calendar, table, focus helpers |
| `@white-plumeria/styles` | Prefixed CSS (`wpl-`, `--wpl-`) |
| `@white-plumeria/react` | React 19 components |
| `@white-plumeria/vue` | Vue 3 render-function components |
| `@white-plumeria/svelte` | Svelte 5 components |
| `@white-plumeria/elements` | Light-DOM custom elements for a documented subset |
| `@white-plumeria/ai` | Local planner and theme generator. No API key |
| `@white-plumeria/mcp` | Catalog MCP server. No model call |
| `@white-plumeria/cli` | `wpl init`, `add`, `doctor`, `theme` |

## Develop

```bash
pnpm install
pnpm dev
```

The docs app listens on `0.0.0.0:5173`. In this sandbox the base path is `/`. GitHub Pages uses `/White-Plumeria-UI/`.

```bash
pnpm test
pnpm --filter @white-plumeria/docs build
```

## Not done

- npm publish, and the `@white-plumeria` scope may still need to be created
- a full manual screen-reader audit
- SSR is not claimed; dialogs call `showModal()` in the browser only
- GitHub Pages is wired in `.github/workflows/pages.yml` and has not been deployed from this branch
