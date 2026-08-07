import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  count,
  size = "sm",
  className,
  filledClassName = "fill-terracotta-500 text-terracotta-500",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
  filledClassName?: string;
}) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(starSize, filled ? filledClassName : "text-ink-200")}
            />
          );
        })}
      </div>
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
      {count !== undefined ? (
        <span className="text-xs text-ink-500">({count})</span>
      ) : null}
    </div>
  );
}
