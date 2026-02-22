'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'critical' | 'warn' | 'info' | 'active' | 'disabled' | 'rate_limited' | 'running' | 'finished' | 'failed' | 'open' | 'acknowledged' | 'resolved' | 'dev' | 'prod';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/20',
  warn: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  active: 'bg-green-500/15 text-green-400 border-green-500/20',
  disabled: 'bg-white/5 text-white/40 border-white/10',
  rate_limited: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  running: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  finished: 'bg-green-500/15 text-green-400 border-green-500/20',
  failed: 'bg-red-500/15 text-red-400 border-red-500/20',
  open: 'bg-red-500/15 text-red-400 border-red-500/20',
  acknowledged: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/15 text-green-400 border-green-500/20',
  dev: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  prod: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

const LABELS: Partial<Record<BadgeVariant, string>> = {
  rate_limited: 'Rate Limited',
};

interface SeverityBadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function SeverityBadge({ variant, label, className }: SeverityBadgeProps) {
  const displayLabel = label || LABELS[variant] || variant.charAt(0).toUpperCase() + variant.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border',
        VARIANT_STYLES[variant] || VARIANT_STYLES.info,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
