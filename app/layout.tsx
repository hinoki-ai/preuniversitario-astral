import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import dynamic from "next/dynamic"
import ConvexClientProvider from "@/components/ConvexClientProvider"
import "./globals.css"

const ClerkProvider = dynamic(() => import("@clerk/nextjs").then((mod) => mod.ClerkProvider), {
  ssr: false,
  loading: () => null,
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Preuniversitario Astral - Excelencia Académica Virtual",
  description:
    "Plataforma educativa premium para preparación preuniversitaria con clases virtuales interactivas, profesores expertos y tecnología avanzada.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}
    >
      <body className="font-sans antialiased overscroll-none">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClerkProvider>
            <ConvexClientProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Analytics />
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
