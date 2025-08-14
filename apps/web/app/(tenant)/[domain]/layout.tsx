import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import '../../globals.css'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Lea's Aesthetics Master Suite",
  description: "An all-in-one system for Lea's Aesthetics Clinical Academy, unifying client bookings and student education into a single, seamless, and luxurious experience.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
