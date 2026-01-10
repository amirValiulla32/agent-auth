'use client';

import { LucideIcon } from "lucide-react";

interface StatsCardV2Props {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCardV2({ title, value, icon: Icon, trend }: StatsCardV2Props) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/8 bg-[#1f1f1f] p-6 transition-all duration-200 hover:border-white/15 hover:bg-[#2C2C2E] hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">{title}</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-white/95">{value.toLocaleString()}</p>
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.isPositive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="rounded-lg border border-white/8 bg-white/5 p-3 transition-all duration-200 group-hover:bg-white/10 group-hover:border-white/15">
          <Icon className="h-6 w-6 text-white/95" />
        </div>
      </div>
    </div>
  );
}
