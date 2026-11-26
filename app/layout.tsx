import type { Metadata } from 'next';
import { DM_Sans, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
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

const description =
  'Acorta tus URLs de forma gratuita. Crea enlaces cortos personalizados y obtén estadísticas.';
const title = `${SITE_NAME} | Acortador de URLs`;

export const metadata: Metadata = {
  title: title,
  description: description,
  metadataBase: new URL(SITE_ORIGIN),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_ORIGIN,
    title: title,
    description: description,
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
    title: title,
    description: description,
    images: ['/og-image.jpg'],
    creator: '@dieguedev',
  },
  alternates: {
    canonical: SITE_ORIGIN,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} antialiased relative`}
      >
        <Header />
        {children}
        <Toaster />
      </body>
      <GoogleAnalytics gaId="G-B4ES60755M" />
    </html>
  );
}
