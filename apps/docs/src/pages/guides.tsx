import { brand, installCommand, themeFlashScript } from '@white-plumeria/core';
import { CodeBlock } from '../copy.tsx';

const pages: Record<string, { title: string; body: string; code?: string }> = {
  '/start': {
    title: 'Quick start',
    body: 'Install the styles and one adapter. The core package comes with the adapter. You do not need Tailwind.',
    code: `${installCommand(['styles', 'react'], 'npm')}\n\nimport { Button } from "@white-plumeria/react";\nimport "@white-plumeria/styles";\n\nexport function Example() {\n  return <Button>Save changes</Button>;\n}`,
  },
  '/install': {
    title: 'Installation',
    body: 'Packages are prepared for the @white-plumeria scope. They are not published to npm yet. The commands below are the intended install API.',
    code: [
      installCommand(['styles'], 'npm'),
      installCommand(['react'], 'npm'),
      installCommand(['vue'], 'npm'),
      installCommand(['svelte'], 'npm'),
      installCommand(['elements'], 'npm'),
      installCommand(['cli'], 'npm'),
    ].join('\n'),
  },
  '/theming': {
    title: 'Theming',
    body: 'Set data-wpl-theme and data-wpl-scheme on an ancestor. Omit the scheme to follow the system. Themes: white, ivory, ink, saffron, lagoon, and blush. Custom themes override the --wpl-color-* variables. The same attributes color the documentation site and the component previews.',
    code: `<html data-wpl-theme="saffron" data-wpl-scheme="dark" lang="en" dir="ltr">\n\n${themeFlashScript}`,
  },
  '/direction': {
    title: 'Direction',
    body: 'This documentation site is English and left to right. Components use CSS logical properties, so a host page can set dir="rtl" without flipping the whole product with a transform. Directional icons opt in with wpl-icon-dir. Dates stored by DatePicker and DateRangePicker are Gregorian ISO strings.',
  },
  '/accessibility': {
    title: 'Accessibility',
    body: 'The target is WCAG 2.2 AA: native controls where they are the right tool, a visible focus ring, named icon buttons, dialog focus restore, and form errors tied to inputs. Automated tests cover the critical paths. A full manual screen-reader audit is not complete and is not claimed as complete.',
  },
  '/changelog': {
    title: 'Changelog',
    body: '0.1.0 is the first implementation in this repository. See CHANGELOG.md for what shipped and what did not. Packages are not published.',
  },
  '/contributing': {
    title: 'Contributing',
    body: 'Add a component by updating the catalog, CSS, every adapter you claim to support, a live demo, and a behavior test. Do not add a catalog entry for a component that is not implemented.',
  },
  '/security': {
    title: 'Security',
    body: 'Report vulnerabilities through GitHub private security advisories. Do not open a public issue for a secret or an exploit. The static site has no model key. Generated code is not evaluated in the preview.',
  },
};

export function GuidePage({ path }: { path: string }) {
  const page = pages[path];
  if (!page) return null;
  return (
    <article className="docs-article">
      <p className="docs-kicker">{brand.version}</p>
      <h1 className="docs-title">{page.title}</h1>
      <p className="docs-lede">{page.body}</p>
      {page.code ? <CodeBlock code={page.code} /> : null}
    </article>
  );
}
