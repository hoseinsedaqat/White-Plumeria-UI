# @white-plumeria/cli

Command name: `wpl`.

```bash
wpl init
wpl add button --framework vue
wpl doctor
wpl theme ivory
```

`add` installs by package name. It does not copy component source unless `--copy` is passed, and even then it writes a re-export. The package is not on npm yet; the printed commands are the intended API.
