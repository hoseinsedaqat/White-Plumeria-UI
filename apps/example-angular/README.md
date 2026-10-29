# Angular example

```bash
pnpm --filter @white-plumeria/angular build
pnpm --filter @white-plumeria/example-angular dev
```

The app listens on `0.0.0.0:5177`. It imports the built `@white-plumeria/angular` package, not a copied component. A published install would use that package and `@white-plumeria/styles`. Those packages are not on npm yet.
