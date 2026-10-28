import type { Locale } from './theme.ts';

export function intlLocale(locale: Locale, calendar?: 'gregory' | 'persian'): string {
  const base = locale === 'fa' ? 'fa-IR' : 'en-US';
  if (!calendar) return base;
  return `${base}-u-ca-${calendar}`;
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatDate(
  date: Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  calendar: 'gregory' | 'persian' = 'gregory',
): string {
  return new Intl.DateTimeFormat(intlLocale(locale, calendar), {
    ...options,
    calendar,
  }).format(date);
}

export function formatDateTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const messages = {
  en: {
    required: 'required',
    close: 'Close',
    loading: 'Loading',
    dismiss: 'Dismiss',
    openMenu: 'Open menu',
    previous: 'Previous',
    next: 'Next',
    pagination: 'Pagination',
    breadcrumb: 'Breadcrumb',
    dialog: 'Dialog',
    selected: 'Selected',
    noResults: 'No matching results',
    clear: 'Clear',
    search: 'Search',
    fileRejected: 'File was rejected',
    sample: 'Sample data',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    today: 'Today',
    chooseDate: 'Choose date',
    increase: 'Increase',
    decrease: 'Decrease',
    expand: 'Expand',
    collapse: 'Collapse',
    sort: 'Sort',
    page: 'Page',
    of: 'of',
    rows: 'rows',
    empty: 'Nothing to show yet',
    command: 'Command palette',
    notifications: 'Notifications',
  },
  fa: {
    required: 'الزامی',
    close: 'بستن',
    loading: 'در حال بارگذاری',
    dismiss: 'بستن',
    openMenu: 'باز کردن منو',
    previous: 'قبلی',
    next: 'بعدی',
    pagination: 'صفحه‌بندی',
    breadcrumb: 'مسیر',
    dialog: 'گفتگو',
    selected: 'انتخاب‌شده',
    noResults: 'نتیجه‌ای پیدا نشد',
    clear: 'پاک کردن',
    search: 'جستجو',
    fileRejected: 'پرونده پذیرفته نشد',
    sample: 'دادهٔ نمونه',
    copy: 'کپی',
    copied: 'کپی شد',
    copyFailed: 'کپی ناموفق بود',
    today: 'امروز',
    chooseDate: 'انتخاب تاریخ',
    increase: 'افزایش',
    decrease: 'کاهش',
    expand: 'باز کردن',
    collapse: 'بستن',
    sort: 'مرتب‌سازی',
    page: 'صفحه',
    of: 'از',
    rows: 'ردیف',
    empty: 'چیزی برای نمایش نیست',
    command: 'پالت فرمان',
    notifications: 'اعلان‌ها',
  },
} as const;

export type MessageKey = keyof (typeof messages)['en'];

export function message(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}

export { messages };
