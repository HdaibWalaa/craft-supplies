import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/80 bg-card text-card-foreground shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    />
  );
}
