import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20 hover:brightness-105 hover:shadow-emerald-500/30",
        DEFAULT:
          "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20 hover:brightness-105 hover:shadow-emerald-500/30",
        gradient:
          "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20 hover:brightness-105 hover:shadow-emerald-500/30",
        secondary:
          "bg-surface border border-border/80 text-foreground hover:bg-surface-elevated shadow-xs",
        destructive:
          "bg-rose-500/15 text-rose-400 border border-rose-500/25 shadow-xs hover:bg-rose-500/25",
        outline:
          "border border-border/80 bg-surface/50 text-foreground shadow-xs hover:bg-surface-elevated",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
        link: "text-emerald-400 underline-offset-4 hover:underline",
        emerald:
          "bg-emerald-500 text-slate-950 font-semibold shadow-sm hover:bg-emerald-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        DEFAULT: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
