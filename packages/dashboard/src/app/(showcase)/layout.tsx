import { ShowcaseSidebar } from '@/components-showcase/layout/showcase-sidebar';
import { ShowcaseHeader } from '@/components-showcase/layout/showcase-header';

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#141414]">
      <ShowcaseSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ShowcaseHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
