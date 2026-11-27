import type { Metadata } from 'next';
import { DM_Sans, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { Header } from '@/app/_components/header';
import { Toaster } from '@/components/ui/toast';
import { SITE_NAME, SITE_ORIGIN } from '@/lib/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  const title = t('title', { site: SITE_NAME });
  const description = t('description');

  return {
    title,
    description,
    metadataBase: new URL(SITE_ORIGIN),
    openGraph: {
      type: 'website',
      locale: t('ogLocale'),
      url: SITE_ORIGIN,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: '/og-image.jpg',
          width: 1080,
          height: 1080,
          alt: '',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
      creator: '@dieguedev',
    },
    alternates: {
      canonical: SITE_ORIGIN,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const t = await getTranslations('Ui.toast');

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} antialiased relative`}
      >
        <NextIntlClientProvider>
          <Header />
          {children}
          <Toaster closeLabel={t('close')} />
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-B4ES60755M" />
    </html>
  );
}
