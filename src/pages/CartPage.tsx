import type { Metadata } from "@/types/metadata";
import Link from "@/routing/Link";
import { ShoppingBag } from "lucide-react";
import { getCart, getCartTotals } from "@/lib/cart";
import { getAppliedDiscountCode } from "@/actions/discount";
import { validateDiscountCode } from "@/lib/discount";
import { computeOrderTotals } from "@/lib/pricing";
import { CartItemRow } from "@/components/CartItemRow";
import { DiscountCodeForm } from "@/components/DiscountCodeForm";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const [cart, { locale, t }] = await Promise.all([getCart(), getTranslations()]);
  const { subtotal, itemCount } = getCartTotals(cart);
  const appliedCode = await getAppliedDiscountCode();

  let discountAmount = 0;
  if (appliedCode) {
    const result = await validateDiscountCode(appliedCode, subtotal);
    if (result.valid) discountAmount = result.amount;
  }

  const shipping = 0;
  const { taxTotal: tax, total } = computeOrderTotals({ subtotal, discountAmount, shippingCost: shipping });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="h-12 w-12 text-ink-300" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">{t("cartEmpty")}</h1>
        <p className="mt-2 text-ink-500">{t("cartEmptyDescription")}</p>
        <Button asChild className="mt-6">
          <Link href="/shop">{t("startShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">{t("yourCart", { count: itemCount })}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="h-fit rounded-3xl border border-border/80 bg-secondary/55 p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">{t("orderSummary")}</h2>

          <div className="mt-4">
            <DiscountCodeForm appliedCode={appliedCode} />
          </div>

          <dl className="mt-5 flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("subtotal")}</dt>
              <dd className="font-medium text-ink-800">{formatPrice(subtotal, locale)}</dd>
            </div>
            {discountAmount > 0 ? (
              <div className="flex justify-between text-sage-700">
                <dt>{t("discount")}</dt>
                <dd>-{formatPrice(discountAmount, locale)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("shipping")}</dt>
              <dd className="font-medium text-ink-800">—</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("estimatedTax")}</dt>
              <dd className="font-medium text-ink-800">{formatPrice(tax, locale)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-ink-200 pt-3 text-base">
              <dt className="font-semibold text-ink-900">{t("total")}</dt>
              <dd className="font-semibold text-ink-900">{formatPrice(total, locale)}</dd>
            </div>
          </dl>

          <Button asChild size="lg" className="mt-5 w-full">
            <Link href="/checkout">{t("proceedCheckout")}</Link>
          </Button>
          <Link href="/shop" className="mt-3 block text-center text-sm text-primary hover:underline">
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
