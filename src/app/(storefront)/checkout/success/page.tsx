import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseJsonObject } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  const address = parseJsonObject(order.shippingAddress);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <CheckCircle2 className="mx-auto h-14 w-14 text-sage-600" />
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink-900">Order Confirmed!</h1>
      <p className="mt-2 text-ink-600">
        Thanks for your order — a confirmation email is on its way to {order.guestEmail ?? "your inbox"}.
      </p>
      <p className="mt-1 text-sm text-ink-400">Order number: {order.orderNumber}</p>

      <div className="mt-8 rounded-3xl border border-ink-200/70 bg-cream-50 p-6 text-left shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-semibold text-ink-900">Order Details</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-ink-700">
                {item.productName} <span className="text-ink-400">&times; {item.quantity}</span>
                <span className="block text-xs text-ink-400">{item.variantName}</span>
              </span>
              <span className="font-medium text-ink-800">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-ink-200 pt-3 text-base">
          <span className="font-semibold text-ink-900">Total</span>
          <span className="font-semibold text-ink-900">{formatPrice(order.total)}</span>
        </div>

        <div className="mt-6 border-t border-ink-200 pt-4 text-sm text-ink-600">
          <p className="font-medium text-ink-800">Shipping to</p>
          <p>{address.fullName}</p>
          <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
          <p>{address.city}, {address.state} {address.postalCode}</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/account/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  );
}
