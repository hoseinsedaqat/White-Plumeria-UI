import { brand, installCommand, themeFlashScript } from '@white-plumeria/core';
import { useWhitePlumeria } from '@white-plumeria/react';
import { CodeBlock } from '../copy.tsx';

const pages: Record<string, { title: string; titleFa: string; body: string; bodyFa: string; code?: string }> = {
  '/start': {
    title: 'Quick start',
    titleFa: 'شروع سریع',
    body: 'Install the styles and one adapter. The core package is pulled in by the adapter. You do not need Tailwind.',
    bodyFa: 'استایل و یک آداپتور را نصب کنید. هسته همراه آداپتور می‌آید. تیلویند لازم نیست.',
    code: `${installCommand(['styles', 'react'], 'npm')}\n\nimport { Button } from "@white-plumeria/react";\nimport "@white-plumeria/styles";`,
  },
  '/install': {
    title: 'Installation',
    titleFa: 'نصب',
    body: 'Packages are prepared for the @white-plumeria scope. They are not published to npm yet: the scope has to be created and trusted publishing configured. Commands below are the intended API.',
    bodyFa: 'بسته‌ها برای اسکوپ @white-plumeria آماده‌اند اما هنوز روی npm منتشر نشده‌اند. دستورها API مورد نظر هستند.',
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
    titleFa: 'تم',
    body: 'Set data-wpl-theme and data-wpl-scheme on an ancestor. Omit the scheme to follow the system. Themes: ivory, ink, saffron, lagoon, blush. Custom themes override the --wpl-color-* variables.',
    bodyFa: 'data-wpl-theme و data-wpl-scheme را روی یک والد بگذارید. بدون scheme، سیستم عامل دنبال می‌شود.',
    code: `<html data-wpl-theme="saffron" data-wpl-scheme="dark" lang="fa" dir="rtl">\n\n${themeFlashScript}`,
  },
  '/rtl': {
    title: 'RTL and Persian',
    titleFa: 'راست‌به‌چپ و فارسی',
    body: 'Direction is set with the dir attribute, not a global scaleX. Logical properties handle spacing. Directional icons opt in with wpl-icon-dir. Persian digits come from Intl with the fa locale. The date picker stores Gregorian ISO dates and can display a Persian calendar.',
    bodyFa: 'جهت با ویژگی dir است، نه وارونه‌سازی کل صفحه. تاریخ ذخیره‌شده ISO میلادی است و نمایش می‌تواند خورشیدی باشد.',
  },
  '/accessibility': {
    title: 'Accessibility',
    titleFa: 'دسترس‌پذیری',
    body: 'The target is WCAG 2.2 AA for the shipped components: native controls where they are the right tool, visible focus, named icon buttons, dialog focus restore, and form errors tied to inputs. Automated tests cover the critical paths. A full manual screen-reader audit of every component is still outstanding and is not claimed as complete.',
    bodyFa: 'هدف WCAG 2.2 AA است. ممیزی کامل دستی با صفحه‌خوان برای همهٔ کامپوننت‌ها هنوز انجام نشده و ادعای تکمیل آن نمی‌شود.',
  },
  '/changelog': {
    title: 'Changelog',
    titleFa: 'تغییرات',
    body: '0.1.0 is the first implementation in this repository. See CHANGELOG.md for the honest list of what shipped and what did not.',
    bodyFa: '۰.۱.۰ اولین پیاده‌سازی در این مخزن است. فهرست صادقانه در CHANGELOG.md است.',
  },
  '/contributing': {
    title: 'Contributing',
    titleFa: 'مشارکت',
    body: 'Add a component by updating the catalog, CSS, every adapter you claim to support, a demo, and a test. Do not add a catalog entry for a component that is not implemented.',
    bodyFa: 'کامپوننت جدید باید در کاتالوگ، CSS، آداپتورها، دمو و تست باشد. ورودی کاتالوگ بدون پیاده‌سازی نگذارید.',
  },
  '/security': {
    title: 'Security',
    titleFa: 'امنیت',
    body: 'Report vulnerabilities through GitHub private security advisories. Do not open a public issue for a secret or an exploit. The static site has no model key. Generated code is not evaluated in the preview.',
    bodyFa: 'آسیب‌پذیری را از طریق توصیهٔ امنیتی خصوصی گیت‌هاب گزارش کنید. سایت ایستا کلید مدل ندارد.',
  },
};

export function GuidePage({ path }: { path: string }) {
  const { locale } = useWhitePlumeria();
  const page = pages[path];
  if (!page) return null;
  return (
    <article>
      <p className="docs-kicker">{brand.version}</p>
      <h1 className="docs-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
        {locale === 'fa' ? page.titleFa : page.title}
      </h1>
      <p className="docs-lede">{locale === 'fa' ? page.bodyFa : page.body}</p>
      {page.code ? <CodeBlock code={page.code} /> : null}
    </article>
  );
}
