import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <Icon className={cn("h-4 w-4", tone === "warning" ? "text-terracotta-600" : "text-ink-400")} />
      </div>
      <p className={cn("mt-2 font-display text-2xl font-semibold", tone === "warning" ? "text-terracotta-700" : "text-ink-900")}>
        {value}
      </p>
    </div>
  );
}
