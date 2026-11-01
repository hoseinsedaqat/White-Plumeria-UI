import type { ReactNode } from 'react';

export const metadata = {
  title: 'Next desk · White Plumeria',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-wpl-theme="white" data-wpl-scheme="light">
      <body>{children}</body>
    </html>
  );
}
