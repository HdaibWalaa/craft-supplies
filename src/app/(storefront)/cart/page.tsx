import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCart, getCartTotals } from "@/lib/cart";
import { getAppliedDiscountCode } from "@/app/actions/discount";
import { validateDiscountCode } from "@/lib/discount";
import { FREE_SHIPPING_THRESHOLD, computeOrderTotals } from "@/lib/pricing";
import { CartItemRow } from "@/components/CartItemRow";
import { DiscountCodeForm } from "@/components/DiscountCodeForm";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const cart = await getCart();
  const { subtotal, itemCount } = getCartTotals(cart);
  const appliedCode = await getAppliedDiscountCode();

  let discountAmount = 0;
  if (appliedCode) {
    const result = await validateDiscountCode(appliedCode, subtotal);
    if (result.valid) discountAmount = result.amount;
  }

  const { shippingCost: shipping, taxTotal: tax, total } = computeOrderTotals({
    subtotal,
    discountAmount,
    shippingMethod: "standard",
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="h-12 w-12 text-ink-300" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Your cart is empty</h1>
        <p className="mt-2 text-ink-500">Looks like you haven&apos;t added any supplies yet.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Your Cart ({itemCount})</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="h-fit rounded-3xl border border-ink-200/70 bg-cream-50 p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">Order Summary</h2>

          <div className="mt-4">
            <DiscountCodeForm appliedCode={appliedCode} />
          </div>

          <dl className="mt-5 flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-medium text-ink-800">{formatPrice(subtotal)}</dd>
            </div>
            {discountAmount > 0 ? (
              <div className="flex justify-between text-sage-700">
                <dt>Discount</dt>
                <dd>-{formatPrice(discountAmount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-500">Shipping</dt>
              <dd className="font-medium text-ink-800">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Estimated Tax</dt>
              <dd className="font-medium text-ink-800">{formatPrice(tax)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-ink-200 pt-3 text-base">
              <dt className="font-semibold text-ink-900">Total</dt>
              <dd className="font-semibold text-ink-900">{formatPrice(total)}</dd>
            </div>
          </dl>

          {subtotal < FREE_SHIPPING_THRESHOLD ? (
            <p className="mt-3 text-xs text-ink-500">
              Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
            </p>
          ) : null}

          <Button asChild size="lg" className="mt-5 w-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
          <Link href="/shop" className="mt-3 block text-center text-sm text-terracotta-700 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
