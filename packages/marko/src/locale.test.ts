import { formatDate, formatNumber, parseIsoDate } from '@white-plumeria/core';
import { render } from '@marko/testing-library';
import { describe, expect, it } from 'vitest';
import Sample from './locale-sample.marko';
import Dialog from './tags/wpl-dialog.marko';

describe('Marko provider locale', () => {
  it('uses Persian labels inside the provider and does not leak them', async () => {
    const first = await render(Dialog, { title: 'Sample' });
    expect(first.container.textContent).toContain('Close');

    const fa = await render(Sample);
    expect(fa.container.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('در حال بارگذاری');
    expect(fa.container.textContent).toContain('بستن');
    expect(fa.container.textContent).toContain('قبلی');
    expect(fa.container.textContent).toContain('باز کردن منو');
    expect(fa.container.querySelector('.wpl-search input')?.getAttribute('placeholder')).toBe('جستجو');
    expect(fa.container.querySelector('.wpl-search-clear')?.getAttribute('aria-label')).toBe('پاک کردن');
    expect(fa.container.querySelector('.wpl-steps')?.getAttribute('aria-label')).toBe('مراحل');
    expect(fa.container.querySelector('.wpl-field button')?.getAttribute('aria-label')).toBe('نمایش رمز');
    expect(fa.container.querySelector('.wpl-field button')?.getAttribute('aria-pressed')).toBe('false');
    expect(fa.container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('کیفیت: 3 از 5');
    expect(fa.container.querySelector('.wpl-slider')?.getAttribute('aria-valuetext')).toBe(
      formatNumber(40, 'fa'),
    );
    expect(fa.container.querySelector('.wpl-chart-table td')?.textContent).toBe(formatNumber(12, 'fa'));
    expect(fa.container.querySelector('.wpl-field-hint')?.textContent).toContain(
      formatDate(parseIsoDate('2026-10-12') ?? new Date(), 'fa'),
    );
    expect(fa.container.querySelector('[data-wpl-locale]')?.getAttribute('data-wpl-locale')).toBe(
      'fa',
    );

    const en = await render(Dialog, { title: 'Sample' });
    expect(en.container.textContent).toContain('Close');
    expect(en.container.textContent).not.toContain('بستن');
  });
});
