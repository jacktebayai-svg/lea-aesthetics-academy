import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth/auth-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'LEA Aesthetics - All-in-One Platform',
    template: '%s | LEA Aesthetics'
  },
  description: 'Complete practitioner and educator platform for aesthetic professionals',
  keywords: ['aesthetics', 'beauty', 'training', 'booking', 'education', 'clinic management'],
  authors: [{ name: 'LEA Aesthetics' }],
  creator: 'LEA Aesthetics',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://leaaesthetics.com',
    title: 'LEA Aesthetics - All-in-One Platform',
    description: 'Complete practitioner and educator platform for aesthetic professionals',
    siteName: 'LEA Aesthetics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEA Aesthetics - All-in-One Platform',
    description: 'Complete practitioner and educator platform for aesthetic professionals',
    creator: '@leaaesthetics',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
