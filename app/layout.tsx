import type { Metadata } from 'next';
import { DM_Sans, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Header } from '@/components/shared/header/header';

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
const title = 'diegue.link | Acortador de URLs';

export const metadata: Metadata = {
  title: title,
  description: description,
  metadataBase: new URL('https://diegue.link'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://diegue.link',
    title: title,
    description: description,
    siteName: 'diegue.link',
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
    canonical: 'https://diegue.link',
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
      </body>
      <GoogleAnalytics gaId="G-B4ES60755M" />
    </html>
  );
}
