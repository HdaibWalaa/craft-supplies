import { cn } from "@/lib/utils";

const VARIANTS = {
  terracotta: "bg-terracotta-100 text-terracotta-800",
  sage: "bg-sage-100 text-sage-800",
  walnut: "bg-walnut-100 text-walnut-800",
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
