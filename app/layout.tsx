import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { config } from '@/lib/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: config.app.name,
  description: config.app.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
