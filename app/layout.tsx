import { ClerkProvider } from '@clerk/nextjs';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import type React from 'react';
import { Suspense } from 'react';

import '@vercel/analytics/next';

import ConvexClientProvider from '@/components/ConvexClientProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';

import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Preuniversitario Astral - Excelencia Académica Virtual',
  description:
    'Plataforma educativa premium para preparación preuniversitaria con clases virtuales interactivas, profesores expertos y tecnología avanzada.',
  generator: 'v0.app',
  metadataBase: new URL('https://preuastral.cl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Preuniversitario Astral - Excelencia Académica Virtual',
    description:
      'Plataforma educativa premium para preparación preuniversitaria con clases virtuales interactivas, profesores expertos y tecnología avanzada.',
    url: 'https://preuastral.cl',
    siteName: 'Preuniversitario Astral',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preuniversitario Astral - Excelencia Académica Virtual',
    description:
      'Plataforma educativa premium para preparación preuniversitaria con clases virtuales interactivas, profesores expertos y tecnología avanzada.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}
    >
      <body className="font-sans antialiased overscroll-none">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ClerkProvider>
              <ConvexClientProvider>
                <Suspense fallback={null}>{children}</Suspense>
              </ConvexClientProvider>
            </ClerkProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
