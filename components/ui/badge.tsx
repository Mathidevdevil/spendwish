import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        DEFAULT:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-xs",
        default:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-xs",
        secondary:
          "border-border/80 bg-surface-elevated text-foreground",
        destructive:
          "border-rose-500/20 bg-rose-500/10 text-rose-400 shadow-xs",
        outline: "border-border/80 text-muted-foreground",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-semibold",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-400 font-semibold",
        expense:
          "border-rose-500/20 bg-rose-500/10 text-rose-400 font-semibold",
        income:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-semibold",
        info:
          "border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-semibold",
      },
    },
    defaultVariants: {
      variant: "DEFAULT",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
