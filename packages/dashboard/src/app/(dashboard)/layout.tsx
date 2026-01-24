import { SidebarV2 } from '@/components-v2/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#141414]">
      <SidebarV2 />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
