import { describe, expect, it } from 'vitest';
import { message, messages } from './i18n.ts';

describe('messages', () => {
  it('keeps a Persian string for every key, including the date and time errors', () => {
    expect(message('fa', 'invalidDate')).toBe('تاریخ را به شکل ISO بنویسید: YYYY-MM-DD.');
    expect(message('fa', 'invalidTime')).toBe('ساعت را ۲۴ساعته بنویسید: HH:mm.');
    for (const key of Object.keys(messages.en) as (keyof typeof messages.en)[]) {
      expect(messages.fa[key], key).not.toBe(messages.en[key]);
    }
  });
});
