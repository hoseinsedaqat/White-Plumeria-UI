import { brand, installCommand, themeFlashScript } from '@white-plumeria/core';
import { CodeBlock } from '../copy.tsx';

const pages: Record<string, { title: string; body: string; code?: string }> = {
  '/start': {
    title: 'Quick start',
    body: 'Packages are not on npm. Clone the repository and start the docs site. The npm command below is the intended install, and it does not work today.',
    code: `git clone https://github.com/hoseinsedaqat/White-Plumeria-UI.git
cd White-Plumeria-UI
corepack pnpm install
corepack pnpm dev

# Intended install, once published. It fails today.
${installCommand(['styles', 'react'], 'npm')}

import { Button, WhitePlumeriaProvider } from "@white-plumeria/react";
import "@white-plumeria/styles";

export function Example() {
  return (
    <WhitePlumeriaProvider>
      <Button>Save changes</Button>
    </WhitePlumeriaProvider>
  );
}`,
  },
  '/install': {
    title: 'Installation',
    body: 'These are the intended install commands. They do not work until @white-plumeria is published. Always install @white-plumeria/styles with an adapter. Today, clone the repository and run corepack pnpm install, then corepack pnpm dev.',
    code: [
      installCommand(['styles', 'react'], 'npm'),
      installCommand(['styles', 'vue'], 'pnpm'),
      installCommand(['styles', 'svelte'], 'yarn'),
      installCommand(['styles', 'angular'], 'npm'),
      installCommand(['styles', 'solid'], 'npm'),
      installCommand(['styles', 'preact'], 'npm'),
      installCommand(['styles', 'qwik'], 'npm'),
      installCommand(['styles', 'lit'], 'npm'),
      installCommand(['styles', 'alpine'], 'npm'),
      installCommand(['styles', 'marko'], 'npm'),
      installCommand(['styles', 'ember'], 'npm'),
      installCommand(['styles', 'elements'], 'npm'),
    ].join('\n'),
  },
  '/theming': {
    title: 'Theming',
    body: 'Set data-wpl-theme and data-wpl-scheme on an ancestor. Omit the scheme to follow the system. Themes: white, ivory, ink, saffron, lagoon, and blush. Custom themes override the --wpl-color-* variables. In these docs the page chrome stays on White, and only the component preview takes the selected theme, so a color change does not blend the page into the sample.',
    code: `<html data-wpl-theme="saffron" data-wpl-scheme="dark" lang="en" dir="ltr">\n\n${themeFlashScript}`,
  },
  '/direction': {
    title: 'Direction',
    body: 'This documentation site stays English, and the page chrome stays left to right. The theme menu sets direction and reduced motion on component previews. Components use CSS logical properties, so a host page can set dir="rtl" without flipping the whole product with a transform. Directional icons opt in with wpl-icon-dir. Dates stored by DatePicker and DateRangePicker are Gregorian ISO strings. Optional times are 24-hour HH:mm values and do not include seconds. RangeSlider fill starts at the inline start, so a host dir="rtl" moves the track with the native range control.',
  },
  '/accessibility': {
    title: 'Accessibility',
    body: 'The target is WCAG 2.2 AA: native controls where they are the right tool, a visible focus ring, named icon buttons, dialog focus restore, and form errors tied to inputs. Dialogs, drawers, menus, and toasts use a short transition. prefers-reduced-motion and data-wpl-motion="reduce" remove it. The theme menu can set that attribute. Automated tests cover the critical paths. A full manual screen-reader audit is not complete and is not claimed as complete.',
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
