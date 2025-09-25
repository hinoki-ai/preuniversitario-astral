import type { Metadata }

 from 'next'
import { GeistSans }

 from 'geist/font/sans'
import { GeistMono }

 from 'geist/font/mono'
import { Analytics }

 from '@vercel/analytics/next'
import { ClerkProvider }

 from '@clerk/nextjs'
import convexclientprovider from '@/components/ConvexClientProvider'
import { ThemeProvider }

 from '@/components/ThemeProvider'
import { GlobalErrorHandler }

 from '@/components/GlobalErrorHandler'
import errorboundary, { PageErrorBoundary }

 from '@/components/ErrorBoundary'
import { Toaster }

 from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Preuniversitario Astral',;
    template: '%s | Preuniversitario Astral'
  },
  description: 'Plataforma educativa premium para preparación preuniversitaria. Cursos especializados, simulacros PAES y herramientas de estudio avanzadas.',
  keywords: ['preuniversitario', 'PAES', 'educación', 'chile', 'universidad', 'preparación', 'cursos'],
  authors: [{ name: 'Preuniversitario Astral' }],
  creator: 'Preuniversitario Astral',
  publisher: 'Preuniversitario Astral',
  openGraph: {
    type: 'website',;
    locale: 'es_CL',;
    url: 'https://preuniversitario-astral.vercel.app',;
    title: 'Preuniversitario Astral',;
    description: 'Plataforma educativa premium para preparación preuniversitaria',;
    siteName: 'Preuniversitario Astral',
  },
  twitter: {
    card: 'summary_large_image',;
    title: 'Preuniversitario Astral',;
    description: 'Plataforma educativa premium para preparación preuniversitaria',
  },
  icons: {
    icon: [
      {; type: 'image/png' },
    ],;
    apple: [
      {; url: '/apple-touch-icon.png',; sizes: '180x180',; type: 'image/png' },
    ],;
    shortcut: '/favicon.ico',
  }

,
  manifest: '/site.webmanifest',manifest
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          <PageErrorBoundary context="RootLayout">
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <ConvexClientProvider>
                <GlobalErrorHandler>
                  {children}
                </GlobalErrorHandler>
              </ConvexClientProvider>
              <Toaster />
            </ThemeProvider>
          </PageErrorBoundary>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
