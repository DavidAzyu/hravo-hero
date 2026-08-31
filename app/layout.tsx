import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// The site's real public URL. Set NEXT_PUBLIC_SITE_URL in .env.local (local
// dev) and in your Vercel/Hosting dashboard env vars (production). The
// fallback below is only used so the build never breaks.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hravo-hero.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'HRAVO Hero | Metamorphosis',
  description: 'Honda-inspired hero landing page with a bold Mizo tagline.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'HRAVO Hero',
    title: 'HRAVO Hero | Metamorphosis',
    description: 'Honda-inspired hero landing page with a bold Mizo tagline.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'HRAVO Hero | Metamorphosis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HRAVO Hero | Metamorphosis',
    description: 'Honda-inspired hero landing page with a bold Mizo tagline.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
