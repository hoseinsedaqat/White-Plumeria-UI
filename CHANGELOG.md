# Changelog

## Unreleased

- Button sizes `xs` and `xl`, appearances `soft` and `dash`, and status variants `success`, `warning`, and `info`
- Steps, Carousel (content slider, distinct from the range Slider), PasswordField, OtpField, Rating, and Kbd
- These are in the catalog and the React, Vue, and Svelte adapters. They are not published to npm.

## 0.1.0

First implementation in this repository. Not published to npm.

Shipped:

- Tokens and six themes (white, ivory, ink, saffron, lagoon, blush), light and dark. `white` is the default.
- Prefixed CSS and a scoped reset
- Catalog and React, Vue, and Svelte adapters
- Light-DOM custom elements for a documented subset
- Docs site with search, theme and locale switch, playground, local AI planner, and theme lab
- Local MCP tools and the `wpl` CLI
- Tests for calendar conversion, table query, button loading, switches, elements, CLI, and docs navigation

Not shipped:

- npm publish
- a completed manual screen-reader audit
- SSR/hydration tests
- GitHub Pages deployment from this branch
