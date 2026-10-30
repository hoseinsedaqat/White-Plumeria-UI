import { describe, expect, it } from 'vitest';
import Button from './tags/wpl-button.marko';
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
});
