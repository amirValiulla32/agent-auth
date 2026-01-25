'use client';

import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { useScrollDetection } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

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
        "sticky top-0 z-10 flex items-center justify-between border-b px-8 py-6 transition-all duration-300",
        "bg-oak-deep/90 backdrop-blur-xl",
        isScrolled
          ? "border-primary/15 shadow-lg shadow-primary/5"
          : "border-oak-border"
      )}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 relative transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </div>
  );
}
