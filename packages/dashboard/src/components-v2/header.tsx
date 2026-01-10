'use client';

import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";

interface HeaderV2Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function HeaderV2({ title, description, action }: HeaderV2Props) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#141414]/95 backdrop-blur-xl px-8 py-6">
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
          className="h-10 w-10 rounded-lg text-white/50 hover:text-white/95 hover:bg-white/5 transition-all duration-200"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg text-white/50 hover:text-white/95 hover:bg-white/5 relative transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#34D399]" />
        </Button>
      </div>
    </div>
  );
}
