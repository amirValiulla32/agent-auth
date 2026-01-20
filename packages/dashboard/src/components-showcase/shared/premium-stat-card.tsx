'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  iconColor?: string;
  suffix?: string;
  sparklineData?: number[];
}

export function PremiumStatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor = 'emerald',
  suffix,
  sparklineData,
}: PremiumStatCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-400 to-cyan-400',
    purple: 'from-purple-400 to-pink-400',
    blue: 'from-blue-400 to-cyan-400',
    orange: 'from-orange-400 to-red-400',
  }[iconColor] || 'from-emerald-400 to-cyan-400';

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-white/5">
      {/* Background gradient effect */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-10"
           style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/60">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              {suffix && <span className="text-lg text-white/40">{suffix}</span>}
            </div>
          </div>

          {/* Icon */}
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110',
            colorClasses
          )}>
            <Icon className="h-6 w-6 text-[#141414]" />
          </div>
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={cn(
              'text-sm font-medium',
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-white/40">vs last month</span>
          </div>
        )}

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 h-8">
            <svg className="h-full w-full" preserveAspectRatio="none">
              <path
                d={generateSparklinePath(sparklineData)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-emerald-400/60"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function generateSparklinePath(data: number[]): string {
  if (data.length === 0) return '';

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 100;
  const height = 100;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}
