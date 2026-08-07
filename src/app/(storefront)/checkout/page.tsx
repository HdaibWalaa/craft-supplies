import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCart, getCartTotals } from "@/lib/cart";
import { getAppliedDiscountCode } from "@/app/actions/discount";
import { validateDiscountCode } from "@/lib/discount";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, session] = await Promise.all([getCart(), auth()]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const { subtotal, itemCount } = getCartTotals(cart);
  const appliedCode = await getAppliedDiscountCode();

  let discountAmount = 0;
  if (appliedCode) {
    const result = await validateDiscountCode(appliedCode, subtotal);
    if (result.valid) discountAmount = result.amount;
  }

  let defaultAddress = null;
  if (session?.user) {
    defaultAddress = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink-900">Checkout</h1>
      <CheckoutForm
        defaultEmail={session?.user?.email ?? undefined}
        defaultAddress={defaultAddress}
        isLoggedIn={!!session?.user}
        subtotal={subtotal}
        discountAmount={discountAmount}
        discountCode={discountAmount > 0 ? appliedCode : null}
        itemCount={itemCount}
      />
    </div>
  );
}
