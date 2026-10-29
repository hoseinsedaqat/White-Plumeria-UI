# Changelog

## Unreleased

- RangeSlider selects a numeric start and end. A thumb stops at the other thumb instead of jumping under the pointer.
- Public logo in `apps/docs/public/brand`, matching favicon, and a five-petal `Mark` in React, Vue, and Svelte.
- Dialog and drawer open and close with a short fade. The drawer slides from the logical side. Menus, popovers, tooltips, and toasts rise in. Reduced motion removes those transitions.
- Homepage preview window stays inside the viewport when the page is at the top.
- DataTable keeps sorting, filtering, and paging inside its frame, stacks narrow rows, and reports sort changes.
- Navbar uses one collapsing menu contract in React, Vue, and Svelte.
- DateRangePicker selects a start and end date. Stored values stay Gregorian ISO dates.
- DatePicker and DateRangePicker can show a 24-hour time. The value is `HH:mm`, with no seconds and no timezone name. Same-day times are ordered.
- Button sizes `xs` and `xl`, appearances `soft` and `dash`, and status variants `success`, `warning`, and `info`
- Steps, Carousel (image and content slider, distinct from the range Slider), PasswordField, OtpField, Rating, and Kbd
- Carousel slides accept `src`, `alt`, and `caption`. The docs slider shows one picture at a time.
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
