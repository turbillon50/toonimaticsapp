import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toonimatics — Plataforma Artística Colaborativa',
  description: 'La plataforma donde artistas, directores, músicos y creadores se conectan, colaboran y monetizan su trabajo.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-512.png',
  },
  openGraph: {
    title: 'Toonimatics',
    description: 'Plataforma colaborativa para artistas creativos',
    images: ['/og-image.jpg'],
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Space Grotesk', system-ui" }}>
        {children}
      </body>
    </html>
  )
}
