import { cn } from "@/lib/utils";

const VARIANTS = {
  terracotta: "bg-accent-soft text-accent-foreground",
  sage: "bg-muted text-primary",
  walnut: "bg-secondary text-secondary-foreground",
  ink: "bg-ink-100 text-ink-700",
  red: "bg-red-100 text-red-700",
} as const;

export function Badge({
  variant = "terracotta",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof VARIANTS }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
