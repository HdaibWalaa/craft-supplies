import Link from "@/routing/Link";
import { CheckCircle2 } from "lucide-react";
import { fetchCheckoutOrder } from "@/lib/api/checkout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getTranslations } from "@/lib/i18n/server";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string; token?: string }> }) {
  const [{ locale, t }] = await Promise.all([getTranslations()]);
  const { order: orderNumber, token } = await searchParams;
  const order = orderNumber && token ? await fetchCheckoutOrder(orderNumber, token).catch(() => null) : null;
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-14 w-14 text-sage-600" />
      <h1 className="mt-5 font-display text-3xl font-semibold text-ink-900">{t("orderReceived")}</h1>
      <p className="mt-2 text-ink-600">{t("orderPendingReview")}</p>
      {order ? <div className="mt-6 rounded-3xl border border-ink-200/70 p-6 text-left"><p className="font-medium text-ink-900">Order {order.orderNumber}</p><p className="mt-1 text-sm text-ink-500">Confirmation will be sent to {order.email}.</p><ul className="mt-4 border-t border-ink-200 pt-4">{order.items.map((item) => <li key={item.id} className="flex justify-between py-1 text-sm"><span>{item.productName} × {item.quantity}</span><span>{formatPrice(item.subtotal, locale)}</span></li>)}</ul><p className="mt-3 flex justify-between border-t border-ink-200 pt-3 font-semibold"><span>Total</span><span>{formatPrice(order.total, locale)}</span></p></div> : null}
      <Button asChild className="mt-7"><Link href="/shop">Continue shopping</Link></Button>
    </div>
  );
}
