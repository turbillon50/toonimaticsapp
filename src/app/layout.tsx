import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/context'
import SplashWrapper from '@/components/layout/SplashWrapper'

export const metadata: Metadata = {
  title: 'Toonimatics',
  description: 'Plataforma artística colaborativa para creadores latinoamericanos.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-512.png' },
  openGraph: {
    title: 'Toonimatics',
    description: 'Plataforma colaborativa para artistas creativos',
    images: ['/hf/hero1.webp'],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Toonimatics' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#F8F8F8' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      </head>
      <body>
        <AppProvider>
          <SplashWrapper />
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
