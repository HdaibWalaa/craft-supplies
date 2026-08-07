import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-200/70 bg-cream-50 shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    />
  );
}
