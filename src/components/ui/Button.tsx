import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-sage-900 shadow-sm",
  secondary:
    "border border-border bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-cream-400 shadow-sm",
  outline:
    "border border-primary text-primary bg-transparent hover:bg-muted-soft active:bg-muted",
  ghost: "text-foreground bg-transparent hover:bg-muted-soft active:bg-muted",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
} as const;

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
  icon: "h-10 w-10",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-ink-200 disabled:text-ink-500 disabled:shadow-none cursor-pointer",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
