import { SidebarV2 } from '@/components-v2/sidebar'
import { AuroraBackground } from '@/components-v2/aurora-background'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex h-screen bg-oak-deep">
      <AuroraBackground />
      <SidebarV2 />
      <main className="relative flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
