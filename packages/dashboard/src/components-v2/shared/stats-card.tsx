'use client';

import { LucideIcon } from "lucide-react";
import { useCountUp, usePrefersReducedMotion } from "@/lib/animation-utils";
import { useEffect, useState } from "react";

interface StatsCardV2Props {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatsCardV2({ title, value, icon: Icon, trend, delay = 0 }: StatsCardV2Props) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const displayValue = useCountUp(value, 1200, !prefersReducedMotion && hasAnimated);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-white/8 bg-[#1f1f1f] p-6 transition-all duration-300 ease-out hover:border-white/15 hover:bg-[#2C2C2E] hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5 will-change-transform"
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
      }}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">{title}</p>
          <p className="mt-3 text-4xl font-bold tracking-tighter text-white/95" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {displayValue.toLocaleString()}
          </p>
          {trend && (
            <p
              className={`mt-2 text-sm font-medium transition-all duration-200 ${
                trend.isPositive ? 'text-[#34D399]' : 'text-[#F87171]'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="rounded-lg border border-white/8 bg-white/5 p-3 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/15 group-hover:scale-110 will-change-transform">
          <Icon className="h-6 w-6 text-white/95 transition-transform duration-300 group-hover:rotate-3" />
        </div>
      </div>
    </div>
  );
}
