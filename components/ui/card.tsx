import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "elevated" | "hero";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", style, ...props }, ref) => {
    const variantStyles = {
      default: "rounded-[20px] border border-border/80 bg-card text-card-foreground shadow-xs",
      surface: "rounded-[20px] border border-border/80 bg-surface text-foreground shadow-xs",
      elevated: "rounded-[20px] border border-border/80 bg-surface-elevated text-foreground shadow-md",
      hero: "rounded-[28px] border border-border/80 bg-card text-card-foreground shadow-md relative overflow-hidden",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-200",
          variantStyles[variant],
          className
        )}
        style={{
          boxShadow:
            variant === "hero"
              ? "0 4px 20px -2px rgba(0, 0, 0, 0.2), var(--inner-highlight)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), var(--inner-highlight)",
          ...style,
        }}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base sm:text-lg font-bold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs sm:text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 sm:p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 sm:p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
