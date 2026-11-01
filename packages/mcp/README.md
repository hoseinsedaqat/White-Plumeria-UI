# @white-plumeria/mcp

A local MCP server over the White Plumeria catalog. It does not call a model and does not read an API key.

```bash
npx white-plumeria-mcp
```

The package is not published yet. From this repository, after `pnpm --filter @white-plumeria/mcp build`:

```bash
node packages/mcp/dist/bin.js
```

Tools: `search_components`, `get_component_docs`, `get_component_props`, `get_usage_example`, `get_design_tokens`, `generate_component_example`, `get_framework_installation`, `check_component_availability`.

`get_component_docs` returns the catalog `wpl-` classes and the HTML example. Do not invent a class. Packages are not on npm.

Stdout is the protocol channel. Diagnostics go to stderr. One server instance is created per connection.
