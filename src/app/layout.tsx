import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'わく☆とれ - タスク管理アプリ',
  description: 'Trello連携タスク管理アプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Klee+One:wght@400;600&family=Noto+Sans+JP:wght@400;500;700&family=Orbitron:wght@500;700&family=Shippori+Mincho:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
