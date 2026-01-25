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
      className="group relative overflow-hidden rounded-xl border border-oak-border bg-oak-surface/80 backdrop-blur-sm p-6 transition-all duration-300 ease-out hover:border-primary/20 hover:bg-oak-elevated/90 hover:scale-[1.02] hover:shadow-glow-sm will-change-transform"
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
      }}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-3 text-4xl font-bold tracking-tighter text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {displayValue.toLocaleString()}
          </p>
          {trend && (
            <p
              className={`mt-2 text-sm font-medium transition-all duration-200 ${
                trend.isPositive ? 'text-success' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="rounded-lg border border-oak-border bg-primary/5 p-3 transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:shadow-glow-sm group-hover:scale-110 will-change-transform">
          <Icon className="h-6 w-6 text-primary transition-all duration-300 group-hover:rotate-[3deg]" />
        </div>
      </div>
    </div>
  );
}
