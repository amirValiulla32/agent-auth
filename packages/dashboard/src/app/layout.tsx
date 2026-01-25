import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SidebarV2 } from '@/components-v2/sidebar'
import { AuroraBackground } from '@/components-v2/aurora-background'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'OakAuth - Agent Permission Platform',
  description: 'AI Agent Permission & Observability Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="relative flex h-screen bg-oak-deep">
          <AuroraBackground />
          <SidebarV2 />
          <main className="relative flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
