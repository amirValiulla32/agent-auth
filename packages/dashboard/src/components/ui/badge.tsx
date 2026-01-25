import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
        secondary:
          "border-oak-border bg-oak-surface text-muted-foreground hover:bg-oak-elevated",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
        outline:
          "border-oak-border bg-transparent text-foreground hover:bg-oak-surface",
        success:
          "border-success/30 bg-success/10 text-success hover:bg-success/15 hover:shadow-glow-success",
        warning:
          "border-warning/30 bg-warning/10 text-warning hover:bg-warning/15",
        active:
          "border-primary/30 bg-primary/10 text-primary shadow-glow-sm",
        inactive:
          "border-oak-border bg-oak-surface text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
