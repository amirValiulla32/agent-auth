'use client';

import { useScrollDetection } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components-v2/command-palette";
import { NotificationsBell } from "@/components-v2/notifications-bell";

interface HeaderV2Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function HeaderV2({ title, description, action }: HeaderV2Props) {
  const isScrolled = useScrollDetection(10);

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
        <CommandPalette />
        <NotificationsBell />
      </div>
    </div>
  );
}
