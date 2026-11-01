import { getClientManifest } from '@qwik.dev/core';
import { renderToStream, type RenderToStreamOptions } from '@qwik.dev/core/server';
import clientManifest from '../dist/q-manifest.json';
import Root from './root';

const runtime = globalThis as typeof globalThis & { __QWIK_MANIFEST__?: unknown };
runtime.__QWIK_MANIFEST__ ??= clientManifest;

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    manifest: opts.manifest ?? getClientManifest(),
    containerAttributes: {
      lang: 'en',
      'data-wpl-theme': 'white',
      'data-wpl-scheme': 'light',
      ...opts.containerAttributes,
    },
  });
}
