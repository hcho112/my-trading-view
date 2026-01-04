import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NEAR Trading Dashboard | Real-Time Volume & Price Analytics',
  description:
    'Track NEAR Protocol trading volume across 70+ exchanges with real-time price charts. Built with Next.js, TradingView Lightweight Charts, and MongoDB.',
  keywords: [
    'NEAR Protocol',
    'cryptocurrency',
    'trading dashboard',
    'volume analytics',
    'exchange comparison',
    'TradingView',
    'crypto charts',
    'NEAR price',
  ],
  authors: [{ name: 'Your Name', url: 'https://yourportfolio.com' }],
  creator: 'Your Name',

  // Open Graph for social sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'NEAR Trading Dashboard',
    description: 'Real-time NEAR Protocol volume & price analytics across 70+ exchanges',
    type: 'website',
    locale: 'en_US',
    siteName: 'NEAR Trading Dashboard',
  },

  // Twitter/X Card
  twitter: {
    card: 'summary_large_image',
    title: 'NEAR Trading Dashboard',
    description: 'Real-time NEAR Protocol volume & price analytics',
    creator: '@yourusername',
  },

  // Additional meta
  robots: {
    index: true,
    follow: true,
  },
};

// Viewport configuration (Next.js 14+ pattern)
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
