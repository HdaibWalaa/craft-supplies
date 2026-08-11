import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { auth } from "@/auth";
import { fetchOrders } from "@/lib/api/orders";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Orders" };

const STATUS_VARIANT = {
  pending: "ink", paid: "sage", processing: "terracotta", shipped: "terracotta", delivered: "sage", cancelled: "red", refunded: "red",
} as const;

export default async function OrdersPage() {
  const session = await auth();
  const orders = session ? await fetchOrders() : [];

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <Package className="h-10 w-10 text-ink-300" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">No orders yet</h1>
        <p className="mt-2 text-ink-500">Once you place an order, it&apos;ll show up here.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">My Orders</h1>

      <div className="mt-8 flex flex-col gap-4">
        {orders.map((order) => (
          <details key={order.id} className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink-900">{order.orderNumber}</p>
                <p className="text-xs text-ink-400">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
              <span className="font-semibold text-ink-900">{formatPrice(order.total)}</span>
            </summary>
            <ul className="mt-4 flex flex-col gap-2 border-t border-ink-200 pt-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-ink-700">
                    {item.productName} <span className="text-ink-400">&times; {item.quantity}</span>
                    <span className="block text-xs text-ink-400">{item.variantName}</span>
                  </span>
                  <span className="text-ink-800">{formatPrice(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
