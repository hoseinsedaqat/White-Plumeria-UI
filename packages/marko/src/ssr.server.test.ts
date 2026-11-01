import { describe, expect, it } from 'vitest';
import Sample from './locale-sample.marko';
import Button from './tags/wpl-button.marko';
import Dialog from './tags/wpl-dialog.marko';
import Provider from './tags/wpl-provider.marko';

describe('Marko server render', () => {
  it('renders a button to HTML', async () => {
    const html = await Button.render({ label: 'Save changes', variant: 'primary' });
    expect(html).toContain('Save changes');
    expect(html).toContain('wpl-btn-primary');
    expect(html).not.toContain('undefined');
  });

  it('renders the provider shell', async () => {
    const html = await Provider.render({ theme: 'ivory', persist: false });
    expect(html).toContain('data-wpl-provider');
    expect(html).toContain('wpl-toast-region');
  });

  it('renders Persian labels from the provider locale and leaves the next render in English', async () => {
    const html = String(await Sample.render({}));
    expect(html).toContain('بستن');
    expect(html).toContain('قبلی');
    expect(html).toContain('data-wpl-locale=fa');
    const english = String(await Dialog.render({ title: 'Sample' }));
    expect(english).toContain('Close');
    expect(english).not.toContain('بستن');
  });
});
