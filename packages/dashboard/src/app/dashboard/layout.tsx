'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import { SidebarV2 } from '@/components-v2/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="flex h-screen bg-[#090c0a] items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#166534] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#090c0a]">
      <SidebarV2 />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
