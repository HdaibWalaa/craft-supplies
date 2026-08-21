"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LocaleProvider";

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
  const { t } = useI18n();
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
      <span className="sr-only">{t("ratingOutOfFive", { rating: rating.toFixed(1) })}</span>
      {count !== undefined ? (
        <span className="text-xs text-ink-500">({count})</span>
      ) : null}
    </div>
  );
}
