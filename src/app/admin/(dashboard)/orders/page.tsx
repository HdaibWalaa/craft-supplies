import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Orders" };

const STATUS_VARIANT = {
  PENDING: "ink",
  PAID: "sage",
  PROCESSING: "terracotta",
  SHIPPED: "terracotta",
  DELIVERED: "sage",
  CANCELLED: "red",
  REFUNDED: "red",
} as const;

const STATUSES = Object.keys(STATUS_VARIANT) as (keyof typeof STATUS_VARIANT)[];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where: Prisma.OrderWhereInput =
    status && STATUSES.includes(status as keyof typeof STATUS_VARIANT)
      ? { status: status as keyof typeof STATUS_VARIANT }
      : {};

  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${!status ? "bg-terracotta-600 text-cream-50" : "bg-cream-100 text-ink-600"}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? "bg-terracotta-600 text-cream-50" : "bg-cream-100 text-ink-600"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink-200/70 bg-cream-50">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-cream-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-terracotta-700 hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-ink-600">{o.guestEmail ?? "Registered customer"}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[o.status]}>{o.status}</Badge>
                </td>
                <td className="px-4 py-3 font-medium text-ink-800">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? <p className="p-8 text-center text-ink-400">No orders found.</p> : null}
      </div>
    </div>
  );
}
