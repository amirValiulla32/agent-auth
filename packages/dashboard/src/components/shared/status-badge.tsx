import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'error';
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = {
    active: {
      variant: 'default' as const,
      label: 'Active',
      dotColor: 'bg-green-500',
      pulse: true,
    },
    inactive: {
      variant: 'secondary' as const,
      label: 'Inactive',
      dotColor: 'bg-gray-400',
      pulse: false,
    },
    error: {
      variant: 'destructive' as const,
      label: 'Error',
      dotColor: 'bg-red-500',
      pulse: true,
    },
  };

  const { variant, label, dotColor, pulse } = config[status];

  return (
    <Badge variant={variant} className={cn("flex items-center gap-1.5", className)}>
      {showDot && (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            dotColor,
            pulse && "animate-pulse"
          )}
        />
      )}
      {label}
    </Badge>
  );
}
