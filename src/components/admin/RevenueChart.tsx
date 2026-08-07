"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";

export type RevenuePoint = { date: string; label: string; revenue: number };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: RevenuePoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-ink-200 bg-cream-50 px-3 py-2 text-xs shadow-[var(--shadow-card-hover)]">
      <p className="font-medium text-ink-800">{point.label}</p>
      <p className="mt-0.5 text-ink-500">{formatPrice(point.revenue)}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1652f" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#d1652f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e8e5e1" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#85786a", fontSize: 11 }}
          axisLine={{ stroke: "#e8e5e1" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#85786a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#d1652f", strokeWidth: 1, strokeDasharray: "3 3" }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#d1652f"
          strokeWidth={2}
          fill="url(#revenueFill)"
          dot={false}
          activeDot={{ r: 4, fill: "#d1652f", stroke: "#fffdfa", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
