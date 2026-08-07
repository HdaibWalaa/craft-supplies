import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, ShoppingCart, Package, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart, type RevenuePoint } from "@/components/admin/RevenueChart";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview" };

const STATUS_VARIANT = {
  PENDING: "ink",
  PAID: "sage",
  PROCESSING: "terracotta",
  SHIPPED: "terracotta",
  DELIVERED: "sage",
  CANCELLED: "red",
  REFUNDED: "red",
} as const;

export default async function AdminOverviewPage() {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [revenueAgg, orderCount, productCount, lowStockVariants, recentOrders, recentOrdersForChart] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.productVariant.findMany({
        where: { stock: { gt: 0 } },
        include: { product: { select: { name: true, slug: true } } },
      }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.order.findMany({
        where: { createdAt: { gte: fourteenDaysAgo }, status: { notIn: ["CANCELLED"] } },
        select: { total: true, createdAt: true },
      }),
    ]);

  const lowStock = lowStockVariants.filter((v) => v.stock <= v.lowStockAt);

  const byDay = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    byDay.set(d.toDateString(), 0);
  }
  for (const o of recentOrdersForChart) {
    const key = o.createdAt.toDateString();
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + o.total);
  }
  const chartData: RevenuePoint[] = Array.from(byDay.entries()).map(([date, revenue]) => ({
    date,
    label: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    revenue: Math.round(revenue * 100) / 100,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Overview</h1>
        <Link
          href="/admin/homepage"
          className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-600 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-terracotta-700"
        >
          <ImageIcon className="h-4 w-4" /> Manage Homepage
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(revenueAgg._sum.total ?? 0)} icon={DollarSign} />
        <StatCard label="Orders" value={String(orderCount)} icon={ShoppingCart} />
        <StatCard label="Products" value={String(productCount)} icon={Package} />
        <StatCard
          label="Low Stock Items"
          value={String(lowStock.length)}
          icon={AlertTriangle}
          tone={lowStock.length > 0 ? "warning" : "default"}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-ink-200/70 bg-cream-50 p-5 shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-semibold text-ink-900">Revenue, Last 14 Days</h2>
        <div className="mt-2">
          <RevenueChart data={chartData} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-terracotta-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 flex flex-col divide-y divide-ink-200">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-cream-100"
              >
                <span className="font-medium text-ink-800">{o.orderNumber}</span>
                <Badge variant={STATUS_VARIANT[o.status]}>{o.status}</Badge>
                <span className="text-ink-700">{formatPrice(o.total)}</span>
              </Link>
            ))}
            {recentOrders.length === 0 ? <p className="py-6 text-center text-sm text-ink-400">No orders yet.</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">Low Stock</h2>
          <div className="mt-3 flex flex-col divide-y divide-ink-200">
            {lowStock.slice(0, 6).map((v) => (
              <Link
                key={v.id}
                href={`/admin/products/${v.productId}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-cream-100"
              >
                <span className="text-ink-800">
                  {v.product.name} <span className="text-ink-400">&middot; {v.name}</span>
                </span>
                <span className="font-medium text-terracotta-700">{v.stock} left</span>
              </Link>
            ))}
            {lowStock.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">Everything is well stocked.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
