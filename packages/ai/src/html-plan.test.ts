import { describe, expect, it } from 'vitest';
import { planFromPrompt } from './provider.ts';
import { validateGeneratedCode } from './validate.ts';

const prompts = [
  'Build a finance dashboard with stat cards and an alert',
  'A signup form with an email field',
  'Settings for reduced motion',
  'An empty state',
  'A dialog to discard a draft',
  'A price range slider',
  'A number field for guests',
  'A date range from and to',
  'A calendar date picker',
  'A button to save changes and a badge',
];

describe('css planner', () => {
  it('emits catalog markup for every layout and rejects invented classes', () => {
    for (const prompt of prompts) {
      const plan = planFromPrompt({ prompt });
      const code = plan.code.html.files[0]?.contents ?? '';
      expect(plan.validation.html.ok, `${prompt}: ${plan.validation.html.errors.join(' ')}`).toBe(true);
      expect(code).not.toContain('data-component');
      expect(code).not.toContain('wpl-root');
      expect(code).toContain('wpl-');
    }
  });

  it('nests a finance grid and uses a real button', () => {
    const dashboard = planFromPrompt({ prompt: 'Build a finance dashboard' });
    const html = dashboard.code.html.files[0]?.contents ?? '';
    expect(html).toMatch(/<div class="wpl-grid wpl-grid-3">\n {2}<article class="wpl-card wpl-stat">/);
    expect(html).toContain('<header class="wpl-page-header">');
    expect(html).toContain('<figure class="wpl-chart">');
    expect(html).toContain('class="wpl-alert wpl-alert-info"');
    expect(dashboard.code.html.notes.join(' ')).toContain('Tailwind is not required');

    const general = planFromPrompt({ prompt: 'A button to save changes and a badge' });
    const snippet = general.code.html.files[0]?.contents ?? '';
    expect(snippet).toContain('<button class="wpl-btn wpl-btn-primary" type="button">Save changes</button>');
    expect(snippet).toContain('<span class="wpl-badge wpl-badge-primary">Catalog</span>');
    expect(snippet).not.toContain('\\n');

    const settings = planFromPrompt({ prompt: 'Settings for reduced motion' });
    expect(settings.code.html.files[0]?.contents).toContain(
      '<button class="wpl-switch" type="button" role="switch" aria-checked="false">',
    );
    const empty = planFromPrompt({ prompt: 'An empty state' });
    expect(empty.code.html.files[0]?.contents).toContain('<div class="wpl-empty">');
    expect(empty.code.html.files[0]?.contents).toContain(
      '<button class="wpl-btn wpl-btn-primary" type="button">New invoice</button>',
    );
    const dialog = planFromPrompt({ prompt: 'A dialog to discard a draft' });
    expect(dialog.code.html.files[0]?.contents).toContain('<dialog class="wpl-dialog">');
    const range = planFromPrompt({ prompt: 'A price range slider' });
    expect(range.code.html.files[0]?.contents).toContain('class="wpl-range"');
    expect(range.code.html.files[0]?.contents).toContain('--wpl-range-start: 16%');
    const guests = planFromPrompt({ prompt: 'A number field for guests' });
    expect(guests.code.html.files[0]?.contents).toContain('class="wpl-number"');
  });

  it('rejects an unknown class and a host package import', () => {
    expect(validateGeneratedCode('<div class="wpl-not-a-class">x</div>', 'html').ok).toBe(false);
    expect(validateGeneratedCode('<button class="btn btn-primary">Save</button>', 'html').ok).toBe(false);
    const host = validateGeneratedCode(
      'import { Button } from "@white-plumeria/next";',
      'react',
    );
    expect(host.ok).toBe(false);
    expect(host.errors.join(' ')).toContain('@white-plumeria/next is not a package.');
  });

});
