/**
 * Empty State Component
 * Displays helpful message when no data is available
 */

'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

/**
 * Empty state component for displaying no data scenarios
 *
 * @example
 * ```tsx
 * import { Plus } from 'lucide-react';
 *
 * <EmptyState
 *   icon={Plus}
 *   title="No agents yet"
 *   description="Get started by creating your first AI agent."
 *   actionLabel="Create Agent"
 *   onAction={() => setCreateDialogOpen(true)}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-oak-border p-8 text-center animate-in fade-in-50 bg-oak-surface/30">
      {Icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 border border-primary/10 transition-all duration-300 hover:bg-primary/10 hover:border-primary/20 hover:shadow-glow-sm">
          <Icon className="h-10 w-10 text-primary transition-transform duration-300 hover:scale-110" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex gap-2">
          {actionLabel && onAction && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
