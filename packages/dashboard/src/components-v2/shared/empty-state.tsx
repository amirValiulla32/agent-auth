'use client';

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateV2Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateV2({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateV2Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-white/5 p-6 mb-6">
        <Icon className="h-12 w-12 text-white/40" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 max-w-md mb-8 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="rounded-xl bg-[#3a6ef2] text-white hover:bg-[#3a6ef2]/90 shadow-lg shadow-[#3a6ef2]/20"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
