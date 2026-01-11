import { RootProvider } from 'fumadocs-ui/provider/next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import type { ReactNode } from 'react';
import './globals.css';
import ThemeProvider from '@/providers/theme-provider';

export const metadata = {
  title: {
    default: 'Misque - Islamic Libraries for JavaScript',
    template: '%s | Misque',
  },
  description:
    'Open-source JavaScript libraries for Quran, Prayer Times, Hijri Calendar, Qibla, and more. Built with TypeScript for modern applications.',
  keywords: [
    'Quran API',
    'Prayer Times',
    'Hijri Calendar',
    'Qibla Direction',
    'Islamic JavaScript',
    'Muslim Developer',
    'TypeScript',
  ],
  authors: [{ name: 'Misque' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Misque',
    title: 'Misque - Islamic Libraries for JavaScript',
    description:
      'Open-source JavaScript libraries for Quran, Prayer Times, Hijri Calendar, Qibla, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Misque - Islamic Libraries for JavaScript',
    description:
      'Open-source JavaScript libraries for Quran, Prayer Times, Hijri Calendar, Qibla, and more.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="dark" enableSystem>
          <RootProvider>{children}</RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
