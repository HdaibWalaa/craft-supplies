import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseJsonObject } from "@/lib/data";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  if (!order) notFound();

  const address = parseJsonObject(order.shippingAddress);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">{order.orderNumber}</h1>
          <p className="text-sm text-ink-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink-900">Items</h2>
          <ul className="mt-3 flex flex-col divide-y divide-ink-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <span className="text-ink-700">
                  {item.productName} <span className="text-ink-400">&times; {item.quantity}</span>
                  <span className="block text-xs text-ink-400">{item.variantName}</span>
                </span>
                <span className="font-medium text-ink-800">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-ink-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="text-ink-800">{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discountTotal > 0 ? (
              <div className="flex justify-between text-sage-700">
                <dt>Discount {order.discountCode ? `(${order.discountCode})` : ""}</dt>
                <dd>-{formatPrice(order.discountTotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-500">Shipping ({order.shippingMethod})</dt>
              <dd className="text-ink-800">{formatPrice(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Tax</dt>
              <dd className="text-ink-800">{formatPrice(order.taxTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-semibold text-ink-900">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Customer</h2>
            <p className="mt-2 text-sm text-ink-700">{order.user?.name ?? address.fullName}</p>
            <p className="text-sm text-ink-500">{order.user?.email ?? order.guestEmail}</p>
          </div>
          <div className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Shipping Address</h2>
            <p className="mt-2 text-sm text-ink-700">{address.fullName}</p>
            <p className="text-sm text-ink-500">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
            </p>
            <p className="text-sm text-ink-500">
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="text-sm text-ink-500">{address.country}</p>
          </div>
          <div className="rounded-3xl border border-ink-200/70 bg-cream-50 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Payment</h2>
            <p className="mt-2 text-sm text-ink-700 capitalize">{order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
