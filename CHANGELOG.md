# Changelog

## Unreleased

- The homepage centers a lone call-to-action, and the footer names the GitHub profile, the repository, and the docs paths. Packages are still not published.
- The docs theme menu sets direction and reduced motion on component previews. The page chrome stays English and left to right.
- Grid column count follows the grid width, not the viewport. A narrow grid stacks on a wide page. It is not a masonry layout.
- Notification follows the status color of its variant in every adapter. It stays on the page, and the close button appears only when a dismiss handler is passed. It is not a toast.
- Docs previews for list, timeline, tree, table, chart, empty state, and page header show a finished sample instead of one lonely row. ResponsiveLayout stacks at 40rem of its own width, not 64rem of the viewport.
- Docs previews sit on the theme background, so tracks, skeletons, and badges stay visible. Navbar menus stay open after the toggle, and a narrow layout shows its sidebar from its own width.
- ToggleGroup is a joined single-choice control in every adapter. Arrow keys follow reading direction and skip disabled choices. It is not RadioGroup, and it is not published.
- Carousel pictures fill the frame. The slide track is sized by the viewport, not by the image, so a photo is visible instead of an empty box.
- NumberField is a numeric stepper in every adapter. The value snaps to the step, the buttons stop at the bounds, and a wheel event blurs the field. It is not published.
- README leads with a working clone setup, the intended install commands, and a per-adapter quick start. Packages are still not published.
- `@white-plumeria/angular` is an Angular 22 adapter for the same catalog. Native controls stay on the real element (`button wplButton`). Composites use `wpl-*` elements. It is not published to npm.
- ContextMenu opens one submenu level from a right-click or Shift+F10. Escape closes that level before the menu.
- DropdownMenu opens one submenu level. The inline-end arrow opens it, and Escape closes that level before the root menu.
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
