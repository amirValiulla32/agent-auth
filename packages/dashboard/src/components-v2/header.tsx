'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { useScrollDetection } from "@/lib/animation-utils";
import { useAlerts } from "@/lib/hooks/use-data-provider";
import { cn } from "@/lib/utils";

interface HeaderV2Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function HeaderV2({ title, description, action }: HeaderV2Props) {
  const router = useRouter();
  const isScrolled = useScrollDetection(10);
  const { alerts } = useAlerts();
  const openCount = alerts.filter((a) => a.status === 'open').length;

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between border-b bg-[#090c0a]/95 backdrop-blur-xl px-8 py-6 transition-all duration-300",
        isScrolled
          ? "border-white/[0.08] shadow-lg shadow-black/20"
          : "border-white/[0.06]"
      )}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white/95">{title}</h1>
        {description && (
          <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg text-white/50 hover:text-white/95 hover:bg-white/5 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/alerts')}
          className="h-10 w-10 rounded-lg text-white/50 hover:text-white/95 hover:bg-white/5 relative transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Bell className="h-5 w-5" />
          {openCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white">
              {openCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </div>
  );
}
