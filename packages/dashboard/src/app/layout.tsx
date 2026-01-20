import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SidebarV2 } from '@/components-v2/sidebar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Agent Auth Platform',
  description: 'AI Agent Permission & Observability Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-[#141414]">
          <SidebarV2 />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
