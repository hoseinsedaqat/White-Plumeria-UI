import { describe, expect, it } from 'vitest';
import { acceptIndexDocument } from '../apps/example-nuxt/desk-routes';

describe('Nuxt desk routes', () => {
  it('keeps / and also accepts the index.html file the frame opens', () => {
    const pages = [{ path: '/', name: 'index' }];
    expect(acceptIndexDocument(pages)).toEqual([
      { path: '/', name: 'index', alias: ['/index.html'] },
    ]);
  });

  it('keeps an alias that is already there', () => {
    const pages = [{ path: '/', alias: '/other' as const }];
    acceptIndexDocument(pages);
    expect(pages[0]?.alias).toEqual(['/other', '/index.html']);
  });

  it('does not add the file route twice', () => {
    const pages = [{ path: '/', alias: ['/index.html'] }];
    acceptIndexDocument(pages);
    expect(pages[0]?.alias).toEqual(['/index.html']);
  });
});
